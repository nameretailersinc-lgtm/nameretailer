#!/usr/bin/env python3
"""
Derive audit metrics from docs/data/crawl.json (written by crawl.py).

Outputs
  docs/existing-site-audit.csv   one row per crawled URL, all audit fields + recommendation/reason
  docs/data/audit-derived.json   aggregates used by docs/existing-site-audit.md
                                 (duplicates, near-duplicates, inbound links, orphans, sitemap
                                 problems, broken/redirecting internal links, risky claims,
                                 segment inventory estimates)

Recommendations come from scripts/audit/decisions.py (hand-written, reviewed judgement).
Anything not listed there falls back to a rule-based default so re-runs never crash.

Usage: python scripts/audit/analyze.py [--crawl docs/data/crawl.json]
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import urllib.parse
from collections import Counter, defaultdict
from itertools import combinations

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from decisions import DECISIONS, PAGE_TYPE_OVERRIDES  # type: ignore
except Exception:  # pragma: no cover
    DECISIONS, PAGE_TYPE_OVERRIDES = {}, {}
from crawl import classify  # noqa: E402

SITE = "https://nameretailer.com"
RISKY_CLAIMS = [
    (r"google[- ]safe", "Google-safe claim"),
    (r"guarantee[ds]?", "guarantee claim"),
    (r"penalty[- ]?(proof|free|safe)", "penalty-proof claim"),
    (r"zero risk|no risk|risk[- ]free|poses zero risk", "no-risk claim"),
    (r"100\s?% (safe|white[- ]hat|manual|natural)", "100% claim"),
    (r"white[- ]hat", "white-hat claim on paid links"),
    (r"safe(ly)? (for|to) (your )?seo|seo[- ]safe", "SEO-safe claim"),
    (r"56,?000\+?", "unverified inventory size claim"),
    (r"within weeks|instant(ly)? (rank|boost)|rank(ing)? (improvements?|boost) (within|in) \w+", "ranking-speed promise"),
    (r"no\.?\s?1|#1|number one", "superlative (#1) claim"),
    (r"since 20\d\d", "founding-year claim (unverified)"),
    (r"verified traffic|real traffic|genuine editorial", "verification claim (needs evidence)"),
]


def path_of(u: str) -> str:
    return urllib.parse.urlsplit(u).path or "/"


def rel(u: str) -> str:
    p = urllib.parse.urlsplit(u)
    return (p.path or "/") + (("?" + p.query) if p.query else "")


def norm_text(s: str | None) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def template_sig(s: str | None) -> str:
    s = norm_text(s)
    s = re.sub(r"\d[\d,.]*k?", "#", s)
    s = re.sub(r"\s*[|\-–]\s*name retailer.*$", "", s)
    return s


def shingles(text: str, k: int = 5) -> set:
    w = re.findall(r"[a-z0-9']+", text.lower())
    return {" ".join(w[i:i + k]) for i in range(max(0, len(w) - k + 1))}


def jacc(a: set, b: set) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--crawl", default="docs/data/crawl.json")
    ap.add_argument("--csv", default="docs/existing-site-audit.csv")
    ap.add_argument("--derived", default="docs/data/audit-derived.json")
    args = ap.parse_args()
    data = json.load(open(args.crawl, encoding="utf-8"))
    pages: dict = data["pages"]
    sm_urls: dict = data["sitemap_urls"]

    # ---- resolve redirects (url -> final url)
    final = {u: (p.get("final_url") or u) for u, p in pages.items()}

    def resolve(u):
        return final.get(u, u)

    html_pages = {u: p for u, p in pages.items() if "links" in p}
    # ---- page types
    for u, p in pages.items():
        path = path_of(u)
        listing = p.get("listing")
        pt = classify(path, p.get("sitemap") == "post-sitemap.xml", listing, p.get("is_tool_widget", False))
        if re.match(r"^/\d{4}/\d{2}/\d{2}/$", path) or path.startswith("/author/"):
            pt = "blog-index"
        if path.startswith("/custom-login"):
            pt = "account/commerce"
        p["page_type"] = PAGE_TYPE_OVERRIDES.get(path, pt)

    # ---- inbound links
    inbound = defaultdict(lambda: {"content": set(), "widget": set(), "nav": set(), "comments": set(), "other": set()})
    broken, to_redirect, link_details_links = [], [], set()
    outlinks_all_internal = defaultdict(set)
    for src, p in html_pages.items():
        s_final = resolve(src)
        for l in p["links"]:
            if not l["internal"]:
                continue
            tgt_raw = l["url"]
            if path_of(tgt_raw).startswith("/link-details/"):
                link_details_links.add(tgt_raw.rstrip("/") + "/")
            tgt = resolve(tgt_raw)
            if tgt == s_final:
                continue
            inbound[tgt][l["zone"]].add(s_final)
            outlinks_all_internal[s_final].add(tgt)
            tp = pages.get(tgt_raw)
            if tp is not None:
                if tp.get("final_status") and tp["final_status"] >= 400:
                    broken.append({"source": rel(src), "target": rel(tgt_raw), "status": tp["final_status"], "zone": l["zone"]})
                elif tp.get("redirect_chain"):
                    to_redirect.append({"source": rel(src), "target": rel(tgt_raw), "final": rel(tp["final_url"]), "zone": l["zone"]})

    # ---- duplicates
    def groups(field):
        g = defaultdict(list)
        for u, p in html_pages.items():
            if p.get("final_status") != 200 or p.get("redirect_chain"):
                continue
            v = p.get(field)
            if isinstance(v, list):
                v = v[0] if v else ""
            v = norm_text(v)
            if v:
                g[v].append(rel(u))
        return {k: v for k, v in g.items() if len(v) > 1}

    def tgroups(field):
        g = defaultdict(list)
        for u, p in html_pages.items():
            if p.get("final_status") != 200 or p.get("redirect_chain"):
                continue
            v = p.get(field)
            if isinstance(v, list):
                v = v[0] if v else ""
            sig = template_sig(v)
            if sig:
                g[sig].append(rel(u))
        return {k: v for k, v in g.items() if len(v) > 2}

    dup_title, dup_desc, dup_h1 = groups("title"), groups("meta_description"), groups("h1")
    tpl_title, tpl_desc = tgroups("title"), tgroups("meta_description")

    # ---- near-duplicate editorial text & identical listing rows
    live = {u: p for u, p in html_pages.items() if p.get("final_status") == 200 and not p.get("redirect_chain")}
    sh = {u: shingles(p.get("editorial_text", "")) for u, p in live.items() if p.get("word_count_editorial", 0) >= 50}
    near_dups = []
    for a, b in combinations(sorted(sh), 2):
        j = jacc(sh[a], sh[b])
        if j >= 0.5:
            near_dups.append({"a": rel(a), "b": rel(b), "jaccard_5gram": round(j, 3)})
    near_dups.sort(key=lambda x: -x["jaccard_5gram"])
    rowsets = {}
    for u, p in live.items():
        lst = p.get("listing") or {}
        doms = {r.get("domain") for r in lst.get("rows", []) if r.get("domain")}
        if doms:
            rowsets[u] = doms
    same_rows = []
    for a, b in combinations(sorted(rowsets), 2):
        j = jacc(rowsets[a], rowsets[b])
        if j >= 0.6:
            same_rows.append({"a": rel(a), "b": rel(b), "jaccard_domains": round(j, 3)})
    same_rows.sort(key=lambda x: -x["jaccard_domains"])

    # ---- risky claims
    claims = defaultdict(list)
    for u, p in live.items():
        text = " ".join([p.get("title") or "", p.get("meta_description") or "", p.get("editorial_text") or ""])
        # widget text is not stored; link-details claims detected separately below
        for rx, label in RISKY_CLAIMS:
            for m in re.finditer(rx, text, flags=re.I):
                snip = text[max(0, m.start() - 70): m.end() + 70].replace("\n", " ")
                claims[rel(u)].append({"claim": label, "snippet": snip})
                break

    # ---- segment inventory estimates from pagination (last page * 30 rows)
    last_page = defaultdict(int)
    for u, v in data["skipped"].items():
        m = re.search(r"[?&](paged\w*)=(\d+)", u)
        if m:
            base = SITE + path_of(u)
            last_page[base] = max(last_page[base], int(m.group(2)))
    seg_inventory = {}
    for u, p in live.items():
        lst = p.get("listing")
        if not lst:
            continue
        doms = {r.get("domain") for r in lst.get("rows", []) if r.get("domain")}
        seg_inventory[rel(u)] = {
            "shown_total": lst.get("total_results"),
            "last_page": last_page.get(u),
            "estimated_total_from_pagination": (last_page[u] * 30) if last_page.get(u) else (len(doms) if doms else 0),
            "unique_rows_on_page1": len(doms),
            "has_filter_form": lst.get("has_filter_form"),
        }

    # ---- sitemap problems
    sm_problems = []
    for u, meta in sm_urls.items():
        p = pages.get(u)
        if not p:
            sm_problems.append({"url": rel(u), "problem": "not crawled"})
            continue
        if p.get("status") != 200:
            sm_problems.append({"url": rel(u), "problem": f"status {p.get('status')}"})
        mr = (p.get("meta_robots") or "").lower()
        if "noindex" in mr:
            sm_problems.append({"url": rel(u), "problem": "noindex"})
        can = p.get("canonical")
        if can and can.rstrip("/") != (p.get("final_url") or u).rstrip("/"):
            sm_problems.append({"url": rel(u), "problem": f"canonical -> {rel(can)}"})
    linked_not_in_sm = sorted({rel(u) for u, p in live.items() if not p.get("in_sitemap")
                               and "noindex" not in (p.get("meta_robots") or "")})

    # ---- rows
    header = ["url", "path", "page_type", "in_sitemap", "sitemap", "sitemap_lastmod", "status", "final_status",
              "final_url", "redirect_chain", "canonical", "canonical_is_self", "meta_robots", "indexable",
              "title", "title_len", "meta_description", "desc_len", "h1_count", "h1", "h2_count", "h2",
              "word_count_main", "word_count_editorial", "word_count_widget",
              "content_links_internal_count", "content_links_internal_targets", "widget_links_internal_count",
              "external_links_count", "external_links", "images_total", "images_missing_alt", "images_empty_alt",
              "jsonld_types", "listing_shown_total", "inbound_content_links", "inbound_widget_links",
              "inbound_nav_links", "orphan_status", "dup_title_with", "dup_desc_with", "dup_h1_with",
              "near_duplicate_with", "risky_claims", "issues", "recommendation", "target_url", "reason"]
    out_rows = []
    dt_index = {u: g for g in dup_title.values() for u in g}
    dd_index = {u: g for g in dup_desc.values() for u in g}
    dh_index = {u: g for g in dup_h1.values() for u in g}
    nd_index = defaultdict(list)
    for x in near_dups:
        nd_index[x["a"]].append(f"{x['b']} ({x['jaccard_5gram']})")
        nd_index[x["b"]].append(f"{x['a']} ({x['jaccard_5gram']})")
    for x in same_rows:
        nd_index[x["a"]].append(f"{x['b']} (same listing rows {x['jaccard_domains']})")
        nd_index[x["b"]].append(f"{x['a']} (same listing rows {x['jaccard_domains']})")

    orphan_list, navonly_list = [], []
    for u, p in sorted(pages.items(), key=lambda kv: (kv[1].get("page_type", ""), kv[0])):
        r = rel(u)
        path = path_of(u)
        is_live = u in live
        inc = inbound.get(u, {})
        n_c, n_w, n_n = len(inc.get("content", ())), len(inc.get("widget", ())), len(inc.get("nav", ()))
        if not is_live:
            orphan = "n/a (redirect/error)"
        elif n_c + n_w + n_n == 0:
            orphan = "orphan (no internal links)"
            orphan_list.append(r)
        elif n_c + n_w == 0:
            orphan = "nav-only"
            navonly_list.append(r)
        else:
            orphan = "linked in content"
        links = p.get("links", [])
        c_int = sorted({rel(resolve(l["url"])) for l in links if l["internal"] and l["zone"] == "content"})
        w_int = {rel(resolve(l["url"])) for l in links if l["internal"] and l["zone"] == "widget"}
        ext = sorted({l["url"] for l in links if not l["internal"] and l["zone"] in ("content", "widget")})
        imgs = [i for i in p.get("images", []) if i["zone"] in ("content", "widget")]
        mr = p.get("meta_robots") or ""
        can = p.get("canonical")
        can_self = "" if not is_live else ("missing" if not can else ("yes" if can.rstrip("/") == u.rstrip("/") else "no"))
        indexable = is_live and "noindex" not in mr.lower() and can_self in ("yes", "missing")
        issues = []
        if is_live:
            if p.get("h1") is not None and len(p["h1"]) != 1:
                issues.append(f"{len(p['h1'])} H1s")
            tl = len(p.get("title") or "")
            if tl == 0 or tl > 60 or tl < 25:
                issues.append(f"title length {tl}")
            dl = len(p.get("meta_description") or "")
            if dl == 0:
                issues.append("missing meta description")
            elif dl > 160 or dl < 70:
                issues.append(f"description length {dl}")
            if p.get("word_count_editorial", 0) < 150 and p["page_type"] not in ("legal",):
                issues.append(f"thin editorial content ({p.get('word_count_editorial', 0)} words)")
            if can_self == "no":
                issues.append(f"canonical points elsewhere ({rel(can)})")
            if r in dt_index:
                issues.append("duplicate title")
            if r in dd_index:
                issues.append("duplicate description")
            if orphan in ("orphan (no internal links)", "nav-only"):
                issues.append(orphan)
            if "[" in (p.get("editorial_text") or "") and re.search(r"\[\w+_\w+[^\]]*\]", p.get("editorial_text") or ""):
                issues.append("raw shortcode visible")
            if re.search(r"dumm?y text|lorem ipsum", p.get("editorial_text") or "", re.I):
                issues.append("placeholder text")
            lst = p.get("listing") or {}
            if lst and lst.get("has_filter_form") and not lst.get("rows"):
                issues.append("listing widget shows 0 results")
            if not p.get("in_sitemap") and indexable:
                issues.append("indexable but not in sitemap")
            if "Article" in (p.get("jsonld_types") or []) and p["page_type"] in ("tool", "marketplace-segment", "home", "service", "support", "legal", "community"):
                issues.append("Article schema on non-article page")
        elif p.get("redirect_chain"):
            issues.append(f"redirects to {rel(p['final_url'])}")
        if r in claims:
            issues.append("risky claims: " + ", ".join(sorted({c['claim'] for c in claims[r]})))
        # Prefer an exact URL decision (needed for protocol/host probes), then path.
        dec = DECISIONS.get(u) or DECISIONS.get(path) or DECISIONS.get(r)
        if dec:
            rec, target, reason = dec
        elif path.startswith("/link-details/"):
            rec, target, reason = "drop-410", "", "Per-domain page; owner decided no indexable per-domain pages"
        elif not is_live and p.get("final_url") and p.get("final_url") != u:
            target = p["final_url"]
            rec, reason = f"drop-301→{target}", "Existing URL variant should keep a direct permanent redirect"
        elif not is_live:
            rec, target, reason = "drop-410", "", "Non-live URL with no durable replacement"
        else:
            rec, target, reason = "improve", "", "No specific decision recorded; review"
        out_rows.append({
            "url": u, "path": r, "page_type": p.get("page_type"), "in_sitemap": p.get("in_sitemap"),
            "sitemap": p.get("sitemap") or "", "sitemap_lastmod": p.get("sitemap_lastmod") or "",
            "status": p.get("status"), "final_status": p.get("final_status"), "final_url": p.get("final_url"),
            "redirect_chain": " > ".join(f"{c['status']}:{rel(c['url'])}" for c in p.get("redirect_chain", [])),
            "canonical": can or "", "canonical_is_self": can_self, "meta_robots": mr, "indexable": indexable,
            "title": p.get("title") or "", "title_len": len(p.get("title") or ""),
            "meta_description": p.get("meta_description") or "", "desc_len": len(p.get("meta_description") or ""),
            "h1_count": len(p.get("h1") or []) if is_live else "", "h1": " | ".join(p.get("h1") or []),
            "h2_count": len(p.get("h2") or []) if is_live else "", "h2": " | ".join((p.get("h2") or [])[:25]),
            "word_count_main": p.get("word_count_main", ""), "word_count_editorial": p.get("word_count_editorial", ""),
            "word_count_widget": p.get("word_count_widget", ""),
            "content_links_internal_count": len(c_int) if is_live else "",
            "content_links_internal_targets": " ".join(c_int[:40]),
            "widget_links_internal_count": len(w_int) if is_live else "",
            "external_links_count": len(ext) if is_live else "", "external_links": " ".join(ext[:20]),
            "images_total": len(imgs) if is_live else "",
            "images_missing_alt": sum(1 for i in imgs if i["alt"] is None) if is_live else "",
            "images_empty_alt": sum(1 for i in imgs if i["alt"] == "") if is_live else "",
            "jsonld_types": " ".join(p.get("jsonld_types") or []),
            "listing_shown_total": (p.get("listing") or {}).get("total_results") or "",
            "inbound_content_links": n_c, "inbound_widget_links": n_w, "inbound_nav_links": n_n,
            "orphan_status": orphan,
            "dup_title_with": " ".join(x for x in dt_index.get(r, []) if x != r),
            "dup_desc_with": " ".join(x for x in dd_index.get(r, []) if x != r),
            "dup_h1_with": " ".join(x for x in dh_index.get(r, []) if x != r),
            "near_duplicate_with": "; ".join(nd_index.get(r, [])[:8]),
            "risky_claims": "; ".join(f"{c['claim']}: \"{c['snippet'][:140]}\"" for c in claims.get(r, [])[:4]),
            "issues": "; ".join(issues), "recommendation": rec, "target_url": target, "reason": reason,
        })

    os.makedirs(os.path.dirname(args.csv) or ".", exist_ok=True)
    with open(args.csv, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=header)
        w.writeheader()
        for row in out_rows:
            w.writerow(row)

    derived = {
        "counts": {
            "pages_recorded": len(pages), "live_html": len(live),
            "sitemap_urls": len(sm_urls),
            "by_page_type_live": Counter(p["page_type"] for p in live.values()),
            "by_page_type_sitemap": Counter(pages[u]["page_type"] for u in sm_urls if u in pages),
            "recommendations": Counter(r["recommendation"].split("→")[0] for r in out_rows if r["url"] in live),
            "distinct_link_details_urls_linked": len(link_details_links),
        },
        "dup_title": dup_title, "dup_desc": dup_desc, "dup_h1": dup_h1,
        "templated_titles": tpl_title, "templated_descriptions": tpl_desc,
        "near_duplicates": near_dups[:200], "same_listing_rows": same_rows[:200],
        "orphans": orphan_list, "nav_only": navonly_list,
        "broken_internal_links": broken, "internal_links_to_redirects": to_redirect,
        "sitemap_problems": sm_problems, "linked_not_in_sitemap_indexable": linked_not_in_sm,
        "risky_claims": claims, "segment_inventory": seg_inventory,
        "top_inbound_content": sorted(((rel(u), len(v["content"]), len(v["widget"]), len(v["nav"]))
                                       for u, v in inbound.items()), key=lambda x: (-x[1], -x[3]))[:40],
    }
    with open(args.derived, "w", encoding="utf-8") as fh:
        json.dump(derived, fh, ensure_ascii=False, indent=1, default=list)
    print(f"[analyze] wrote {args.csv} ({len(out_rows)} rows) and {args.derived}", file=sys.stderr)


if __name__ == "__main__":
    main()
