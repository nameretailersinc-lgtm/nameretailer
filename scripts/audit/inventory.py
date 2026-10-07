#!/usr/bin/env python3
"""
Inventory aggregates for segment-page decisions and original-data content.

Source priority
  1. docs/data/listings.csv (owner's full listings export) if it exists.
     Column names are auto-detected (niche/category, country, language, da, dr, price, traffic,
     link_type, tat). Unknown columns are ignored.
  2. Otherwise the listing rows visible on the live site, taken from docs/data/crawl.json
     (page 1 of every crawled segment page, de-duplicated by domain) plus only the segment
     totals the site itself explicitly prints ("Showing Results 1 - 30 of N"). Pagination
     links are recorded but are not converted into totals because page sizes vary.
     This is a small, biased SAMPLE: it must be re-checked against the CSV.

Output: docs/data/inventory-summary.json (+ a readable summary on stdout).
Usage:  python scripts/audit/inventory.py [--csv docs/data/listings.csv] [--crawl docs/data/crawl.json]
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import statistics
from collections import Counter, defaultdict

DA_BANDS = [(0, 9), (10, 19), (20, 29), (30, 39), (40, 49), (50, 59), (60, 69), (70, 79), (80, 89), (90, 100)]
DR_BANDS = [(0, 19), (20, 29), (30, 39), (40, 49), (50, 59), (60, 69), (70, 100)]
PRICE_BANDS = [(0, 50), (50, 100), (100, 150), (150, 200), (200, 500), (500, 10**9)]
TRAFFIC_BANDS = [(0, 999), (1000, 9999), (10000, 49999), (50000, 99999), (100000, 499999), (500000, 10**12)]

ALIASES = {
    "domain": ["domain", "url", "site", "website"],
    "niche": ["niche", "category", "categories", "niches"],
    "country": ["country", "geo", "location"],
    "language": ["language", "lang"],
    "da": ["da", "moz_da", "domain_authority"],
    "dr": ["dr", "ahrefs_dr", "domain_rating"],
    "tf": ["tf", "trust_flow", "majestic_tf"],
    "price": ["price", "price_usd", "cost", "sale_price"],
    "traffic": ["traffic", "organic_traffic", "monthly_traffic"],
    "link_type": ["link_type", "linktype", "link"],
    "tat": ["tat", "turnaround", "turnaround_time"],
    "spam": ["spam", "spam_score"],
}


def num(v):
    if v is None:
        return None
    s = str(v).strip().replace(",", "").replace("$", "")
    if not s or s in ("-",):
        return None
    if s.lower().startswith("below"):
        return 0.0
    m = re.match(r"^([\d.]+)\s*([kKmM]?)\+?%?$", s)
    if not m:
        return None
    x = float(m.group(1))
    return x * {"k": 1e3, "m": 1e6}.get(m.group(2).lower(), 1)


def band(x, bands):
    if x is None:
        return None
    for lo, hi in bands:
        if lo <= x <= hi or (lo <= x < hi + 1):
            return f"{lo}-{hi}" if hi < 10**9 else f"{lo}+"
    return None


def med(xs):
    xs = [x for x in xs if x is not None]
    return round(statistics.median(xs), 2) if xs else None


def summarise(rows: list[dict]) -> dict:
    out = {"n": len(rows)}
    for dim in ("niche", "country", "language", "link_type"):
        out[f"by_{dim}"] = Counter((r.get(dim) or "unknown").strip() for r in rows).most_common()
    for dim, bands in (("da", DA_BANDS), ("dr", DR_BANDS), ("price", PRICE_BANDS), ("traffic", TRAFFIC_BANDS)):
        out[f"by_{dim}_band"] = Counter(band(num(r.get(dim)), bands) or "unknown" for r in rows).most_common()
    # original-data candidates: median price by DR band / DA band / niche / country / language
    for dim, bands in (("dr", DR_BANDS), ("da", DA_BANDS), ("traffic", TRAFFIC_BANDS)):
        g = defaultdict(list)
        for r in rows:
            b = band(num(r.get(dim)), bands)
            if b:
                g[b].append(num(r.get("price")))
        out[f"median_price_by_{dim}_band"] = {k: {"n": len(v), "median_usd": med(v)} for k, v in sorted(g.items(), key=lambda kv: float(kv[0].split('-')[0].rstrip('+')))}
    for dim in ("niche", "country", "language"):
        g = defaultdict(list)
        for r in rows:
            g[(r.get(dim) or "unknown").strip()].append(num(r.get("price")))
        out[f"median_price_by_{dim}"] = {k: {"n": len(v), "median_usd": med(v)} for k, v in sorted(g.items(), key=lambda kv: -len(kv[1]))}
    # niche x country/language matrix for combined-page decisions (top cells only)
    cells = Counter(((r.get("niche") or "?").strip(), (r.get("language") or "?").strip()) for r in rows)
    out["niche_x_language_top"] = [[a, b, c] for (a, b), c in cells.most_common(40)]
    return out


def from_csv(path: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8-sig") as fh:
        rd = csv.DictReader(fh)
        cols = {c.lower().strip().replace(" ", "_"): c for c in rd.fieldnames or []}
        mapping = {}
        for key, al in ALIASES.items():
            for a in al:
                if a in cols:
                    mapping[key] = cols[a]
                    break
        rows = []
        for r in rd:
            rows.append({k: r.get(src) for k, src in mapping.items()})
    return rows, mapping


def from_crawl(path: str):
    d = json.load(open(path, encoding="utf-8"))
    seen = {}
    seg = {}
    for u, p in d["pages"].items():
        lst = p.get("listing")
        if not lst:
            continue
        seg[u] = {"shown_total": lst.get("total_results"), "rows": len({r.get('domain') for r in lst.get('rows', [])})}
        for r in lst.get("rows", []):
            dom = r.get("domain")
            if dom and dom not in seen:
                rr = dict(r)
                rr["niche"] = rr.pop("category", None)
                # monthly-* pages render DA/DR columns wrongly ("Below 500"); drop those metrics
                if "/monthly" in u:
                    rr["da"], rr["dr"] = None, None
                seen[dom] = rr
            elif dom and "/monthly" not in u:
                # prefer metrics from a correctly rendered page
                for k in ("da", "dr"):
                    if seen[dom].get(k) is None and r.get(k):
                        seen[dom][k] = r.get(k)
    last_page = defaultdict(int)
    for u in d["skipped"]:
        m = re.search(r"[?&](paged\w*)=(\d+)", u)
        if m:
            base = u.split("?")[0]
            last_page[base] = max(last_page[base], int(m.group(2)))
    for u in seg:
        seg[u]["last_page"] = last_page.get(u)
        seg[u]["estimated_total"] = None
        seg[u]["estimation_limitation"] = (
            "No total inferred from pagination: observed page sizes vary; use explicit shown_total "
            "or the owner's full listings CSV."
        )
    return list(seen.values()), seg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", default="docs/data/listings.csv")
    ap.add_argument("--crawl", default="docs/data/crawl.json")
    ap.add_argument("--out", default="docs/data/inventory-summary.json")
    args = ap.parse_args()
    if os.path.exists(args.csv):
        rows, mapping = from_csv(args.csv)
        res = {"source": args.csv, "source_type": "owner listings CSV (full inventory)",
               "column_mapping": mapping, "summary": summarise(rows)}
    else:
        rows, seg = from_crawl(args.crawl)
        res = {"source": args.crawl, "source_type":
               "SAMPLE: unique listing rows visible on page 1 of crawled segment pages (biased; re-check against listings.csv)",
               "summary": summarise(rows), "segment_totals_from_site": seg}
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(res, fh, ensure_ascii=False, indent=1)
    s = res["summary"]
    print(f"source: {res['source_type']}  n={s['n']}")
    for k in ("by_niche", "by_country", "by_language", "by_da_band", "by_dr_band", "by_price_band", "by_traffic_band"):
        print(k, s[k][:25])
    for k in ("median_price_by_dr_band", "median_price_by_da_band", "median_price_by_traffic_band"):
        print(k, s[k])


if __name__ == "__main__":
    main()
