#!/usr/bin/env python3
"""
nameretailer.com audit crawler (Python 3.10+ standard library only).

What it does
  1. Reads robots.txt, sitemap_index.xml and every child sitemap.
  2. Crawls sitemap URLs plus internal links found on crawled pages (breadth-first).
  3. For every URL records status, redirects, canonical, robots, title, description,
     headings, boilerplate-free word counts, links by page zone, images, JSON-LD types,
     marketplace listing rows (if any) and a heuristic page type.
  4. Writes one JSON file (default docs/data/crawl.json). Derived metrics and
     recommendations are produced by scripts/audit/analyze.py.

Politeness / safety
  - Descriptive User-Agent, >= 1 s between requests, hard cap on URLs (default 300).
  - Respects robots.txt Disallow (with * and $ wildcards).
  - Never logs in, never submits forms, never requests /cart/, /checkout/,
    /my-account/ or ?add-to-cart= URLs. Query-string URLs are recorded but not crawled.
  - Per-domain /link-details/<domain> URLs are only sampled (default 5).

Usage
  python scripts/audit/crawl.py [--max 300] [--delay 1.0] [--out docs/data/crawl.json]
                                [--cache DIR] [--link-details-sample 5]
  --cache DIR stores raw responses so a re-run can re-parse without re-fetching.
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter, deque
from datetime import datetime, timezone
from html.parser import HTMLParser

SITE = "https://nameretailer.com"
HOST = "nameretailer.com"
UA = ("NameRetailerAuditBot/1.0 (site-owner commissioned SEO audit; "
      "contact info@nameretailer.com; 1 req/s)")

NEVER_FETCH = [re.compile(p) for p in (
    r"^/cart(/|$)", r"^/checkout(/|$)", r"^/my-account(/|$)", r"add-to-cart=",
    r"^/wp-admin", r"^/wp-login", r"^/xmlrpc", r"^/wp-json", r"^/wp-content/",
    r"^/wp-includes/", r"/feed/?$", r"^/wp-comments-post", r"^/\?s=", r"^/search/",
)]
ASSET_EXT = re.compile(r"\.(jpe?g|png|gif|webp|avif|svg|ico|css|js|pdf|zip|xml|txt|mp4|mp3|woff2?|ttf|eot|json)$", re.I)
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}
SKIP_TEXT = {"script", "style", "noscript", "template", "svg", "iframe", "select", "option", "textarea", "button"}
BLOCK = {"p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "td", "th", "dt", "dd", "blockquote",
         "figcaption", "caption", "label", "div", "section", "article", "summary", "pre", "tr"}
# Class names that mark interactive widgets (listing table, filters, tool UIs).
WIDGET_CLASS = re.compile(r"(^|\s)(elementor-widget-shortcode|lm-[\w-]+|custom-filter[\w-]*|tk-dropzone|tk-opts|"
                          r"tk-btns|tk-result|tk-related|tk-filelist|tk-pb|tk-toast|tk-tool|tk-panel|tk-io|tk-input|"
                          r"tk-output|tk-grid|tk-form|tk-row|tk-card|tk-res[\w-]*)(\s|$)")


# --------------------------------------------------------------------------- HTTP
class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: D401
        return None


_opener = urllib.request.build_opener(_NoRedirect)
_last_request = [0.0]
REQUEST_LOG: list[dict] = []


def _cache_path(cache_dir: str | None, url: str) -> str | None:
    if not cache_dir:
        return None
    return os.path.join(cache_dir, hashlib.sha1(url.encode()).hexdigest() + ".json")


def http_get(url: str, delay: float, cache_dir: str | None = None) -> dict:
    """Single GET without following redirects. Returns dict(status, headers, body, elapsed)."""
    cp = _cache_path(cache_dir, url)
    if cp and os.path.exists(cp):
        with open(cp, encoding="utf-8") as fh:
            d = json.load(fh)
        d["from_cache"] = True
        return d
    wait = delay - (time.time() - _last_request[0])
    if wait > 0:
        time.sleep(wait)
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5",
        "Accept-Encoding": "gzip",
        "Accept-Language": "en",
    })
    t0 = time.time()
    status, headers, body, err = None, {}, b"", None
    try:
        resp = _opener.open(req, timeout=40)
        status, headers, body = resp.status, dict(resp.headers.items()), resp.read()
    except urllib.error.HTTPError as e:
        status, headers = e.code, dict(e.headers.items()) if e.headers else {}
        try:
            body = e.read()
        except Exception:  # pragma: no cover
            body = b""
    except Exception as e:  # network error
        err = repr(e)
    _last_request[0] = time.time()
    elapsed = round(time.time() - t0, 3)
    hl = {k.lower(): v for k, v in headers.items()}
    if hl.get("content-encoding", "").lower() == "gzip" and body:
        try:
            body = gzip.decompress(body)
        except Exception:
            pass
    charset = "utf-8"
    m = re.search(r"charset=([\w-]+)", hl.get("content-type", ""))
    if m:
        charset = m.group(1)
    text = body.decode(charset, errors="replace")
    d = {"url": url, "status": status, "headers": hl, "body": text, "elapsed": elapsed,
         "error": err, "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    REQUEST_LOG.append({"url": url, "status": status, "elapsed": elapsed})
    if cp:
        os.makedirs(cache_dir, exist_ok=True)
        with open(cp, "w", encoding="utf-8") as fh:
            json.dump(d, fh)
    d["from_cache"] = False
    return d


def fetch_follow(url: str, delay: float, cache_dir: str | None, max_hops: int = 6) -> dict:
    chain = []
    cur = url
    for _ in range(max_hops):
        r = http_get(cur, delay, cache_dir)
        chain.append({"url": cur, "status": r["status"]})
        if r["status"] in (301, 302, 303, 307, 308) and r["headers"].get("location"):
            nxt = urllib.parse.urljoin(cur, r["headers"]["location"])
            if not is_internal(nxt) or blocked_reason(nxt):
                r["chain"] = chain
                r["final_url"] = nxt
                r["final_not_fetched"] = True
                return r
            cur = nxt
            continue
        r["chain"] = chain
        r["final_url"] = cur
        return r
    r["chain"] = chain
    r["final_url"] = cur
    r["redirect_loop"] = True
    return r


# --------------------------------------------------------------------------- robots
class Robots:
    def __init__(self, text: str):
        self.rules: list[tuple[bool, str]] = []  # (allow, pattern)
        self.sitemaps: list[str] = []
        groups, cur_agents, cur_rules, last_was_agent = [], [], [], False
        for raw in text.splitlines():
            line = raw.split("#", 1)[0].strip()
            if not line or ":" not in line:
                continue
            k, v = [x.strip() for x in line.split(":", 1)]
            k = k.lower()
            if k == "user-agent":
                if not last_was_agent and cur_agents:
                    groups.append((cur_agents, cur_rules))
                    cur_agents, cur_rules = [], []
                cur_agents.append(v.lower())
                last_was_agent = True
                continue
            last_was_agent = False
            if k in ("allow", "disallow"):
                if v:
                    cur_rules.append((k == "allow", v))
            elif k == "sitemap":
                self.sitemaps.append(v)
        if cur_agents:
            groups.append((cur_agents, cur_rules))
        for agents, rules in groups:
            if "*" in agents or "nameretailerauditbot" in agents:
                self.rules.extend(rules)

    @staticmethod
    def _match(pattern: str, path: str) -> bool:
        rx = "^" + re.escape(pattern).replace(r"\*", ".*")
        if rx.endswith(r"\$"):
            rx = rx[:-2] + "$"
        return re.match(rx, path) is not None

    def allowed(self, url: str) -> bool:
        p = urllib.parse.urlsplit(url)
        path = (p.path or "/") + (("?" + p.query) if p.query else "")
        best = None
        for allow, pat in self.rules:
            if self._match(pat, path):
                if best is None or len(pat) > len(best[1]) or (len(pat) == len(best[1]) and allow):
                    best = (allow, pat)
        return True if best is None else best[0]


# --------------------------------------------------------------------------- URL helpers
def is_internal(url: str) -> bool:
    h = urllib.parse.urlsplit(url).netloc.lower()
    return h in (HOST, "www." + HOST)


def normalize(url: str, base: str | None = None) -> str | None:
    if base:
        url = urllib.parse.urljoin(base, url)
    url = url.strip()
    p = urllib.parse.urlsplit(url)
    if p.scheme not in ("http", "https"):
        return None
    netloc = p.netloc.lower()
    return urllib.parse.urlunsplit((p.scheme.lower(), netloc, p.path or "/", p.query, ""))


def blocked_reason(url: str) -> str | None:
    p = urllib.parse.urlsplit(url)
    pq = (p.path or "/") + (("?" + p.query) if p.query else "")
    for rx in NEVER_FETCH:
        if rx.search(pq):
            return "never-fetch (account/cart/checkout/admin/asset path)"
    if ASSET_EXT.search(p.path):
        return "asset"
    return None


# --------------------------------------------------------------------------- HTML tree
class Node:
    __slots__ = ("tag", "attrs", "children", "parent")

    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.children, self.parent = tag, attrs, [], parent

    def cls(self) -> str:
        return self.attrs.get("class") or ""


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", {}, None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, {k: (v if v is not None else "") for k, v in attrs}, self.cur)
        self.cur.children.append(node)
        if tag not in VOID:
            self.cur = node

    def handle_startendtag(self, tag, attrs):
        node = Node(tag, {k: (v if v is not None else "") for k, v in attrs}, self.cur)
        self.cur.children.append(node)

    def handle_endtag(self, tag):
        n = self.cur
        while n is not None and n.tag != tag:
            n = n.parent
        if n is not None and n.parent is not None:
            self.cur = n.parent

    def handle_data(self, data):
        if data:
            self.cur.children.append(data)


def parse_html(text: str) -> Node:
    tb = TreeBuilder()
    try:
        tb.feed(text)
        tb.close()
    except Exception:
        pass
    return tb.root


def iter_nodes(node: Node):
    stack = [node]
    while stack:
        n = stack.pop()
        if isinstance(n, Node):
            yield n
            stack.extend(reversed([c for c in n.children if isinstance(c, Node)]))


def text_of(node, skip=SKIP_TEXT) -> str:
    out = []

    def rec(n):
        if isinstance(n, str):
            out.append(n)
            return
        if n.tag in skip:
            return
        for c in n.children:
            rec(c)
        if n.tag in BLOCK or n.tag == "br":
            out.append(" ")
    rec(node)
    return re.sub(r"\s+", " ", "".join(out)).strip()


def find_all(node: Node, pred):
    return [n for n in iter_nodes(node) if pred(n)]


WORD_RX = re.compile(r"[A-Za-z0-9À-ɏЀ-ӿ]+(?:['’][A-Za-z]+)?")


def count_words(s: str) -> int:
    return len(WORD_RX.findall(s))


# --------------------------------------------------------------------------- page extraction
def zone_flags(n: Node, inherited: dict) -> dict:
    f = dict(inherited)
    c = n.cls()
    et = n.attrs.get("data-elementor-type", "")
    if n.tag == "header" or et == "header" or "elementor-location-header" in c:
        f["header"] = True
    if n.tag == "footer" or et == "footer" or "elementor-location-footer" in c:
        f["footer"] = True
    if n.tag == "nav" or n.attrs.get("role") == "navigation":
        f["nav"] = True
    if n.tag == "main":
        f["main"] = True
    if n.attrs.get("id") == "comments" or "comments-area" in c or "comment-respond" in c:
        f["comments"] = True
    if WIDGET_CLASS.search(c):
        f["widget"] = True
    if n.tag in ("form",):
        f["form"] = True
    return f


def zone_name(f: dict) -> str:
    if f.get("header") or f.get("footer") or f.get("nav"):
        return "nav"
    if f.get("comments"):
        return "comments"
    if f.get("main"):
        return "widget" if f.get("widget") else "content"
    return "other"


def extract_blocks_links_images(root: Node, has_main: bool):
    """Walk the tree once; collect text blocks, links and images with their zone."""
    blocks: list[tuple[str, str]] = []  # (zone, text)
    links: list[dict] = []
    images: list[dict] = []
    headings: list[dict] = []

    def rec(n: Node, flags: dict, buf: list):
        f = zone_flags(n, flags)
        if not has_main and not (f.get("header") or f.get("footer")):
            f["main"] = True  # fallback: whole body minus header/footer counts as main
        z = zone_name(f)
        if n.tag in SKIP_TEXT:
            if n.tag == "select":
                pass
            return
        if n.tag == "a" and n.attrs.get("href") is not None:
            links.append({"href": n.attrs.get("href"), "zone": z, "text": text_of(n)[:120],
                          "rel": n.attrs.get("rel", ""), "class": n.cls()[:80]})
        if n.tag == "img":
            images.append({"src": n.attrs.get("data-src") or n.attrs.get("src", ""),
                           "alt": n.attrs.get("alt"), "zone": z})
        if n.tag in ("h1", "h2", "h3"):
            headings.append({"level": n.tag, "text": text_of(n)[:200], "zone": z})
        is_block = n.tag in BLOCK
        mybuf = [] if is_block else buf
        for c in n.children:
            if isinstance(c, str):
                mybuf.append(c)
            else:
                rec(c, f, mybuf)
        if is_block:
            t = re.sub(r"\s+", " ", "".join(mybuf)).strip()
            if t:
                blocks.append((z, t))
            buf.append(" ")

    body = next((n for n in iter_nodes(root) if n.tag == "body"), root)
    tail: list = []
    rec(body, {}, tail)
    t = re.sub(r"\s+", " ", "".join(tail)).strip()
    if t:
        blocks.append(("other", t))
    return blocks, links, images, headings


def jsonld_types(root: Node, summary: dict | None = None) -> tuple[list[str], list[str]]:
    types, errors = [], []

    def walk(o):
        if isinstance(o, dict):
            t = o.get("@type")
            if isinstance(t, list):
                types.extend(str(x) for x in t)
            elif t:
                types.append(str(t))
            if summary is not None:
                tt = t if isinstance(t, str) else (t[0] if isinstance(t, list) and t else "")
                if tt in ("Article", "BlogPosting", "NewsArticle"):
                    for k in ("headline", "datePublished", "dateModified"):
                        if o.get(k):
                            summary.setdefault("article_" + k, o.get(k))
                if tt == "Person" and o.get("name"):
                    summary.setdefault("person_names", [])
                    if o["name"] not in summary["person_names"]:
                        summary["person_names"].append(o["name"])
                if tt == "Organization":
                    for k in ("name", "sameAs", "address", "email", "telephone"):
                        if o.get(k):
                            summary.setdefault("org_" + k, o.get(k))
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    for n in iter_nodes(root):
        if n.tag == "script" and "ld+json" in n.attrs.get("type", ""):
            raw = "".join(c for c in n.children if isinstance(c, str)).strip()
            if not raw:
                continue
            try:
                walk(json.loads(raw))
            except Exception as e:
                errors.append(str(e)[:120])
    seen, out = set(), []
    for t in types:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out, errors


def extract_listing(root: Node) -> dict | None:
    rows = find_all(root, lambda n: n.tag == "tr" and "lm-desktop-row" in n.cls())
    total = None
    for n in iter_nodes(root):
        if "stats-value" in n.cls():
            m = re.search(r"of\s+([\d,]+)", text_of(n))
            if m:
                total = int(m.group(1).replace(",", ""))
            break
    has_filter = any("lm-filter-form" in n.cls() or n.attrs.get("id") == "custom-filter-form" for n in iter_nodes(root))
    if not rows and total is None and not has_filter:
        return None
    out = []
    for r in rows:
        cells = [c for c in r.children if isinstance(c, Node) and c.tag == "td"]
        d = {}
        a = next((n for n in iter_nodes(r) if n.tag == "a" and "url-link" in n.cls()), None)
        if a is not None:
            d["domain"] = re.sub(r"^https?://(www\.)?", "", text_of(a)).strip("/").lower()
            d["details_href"] = a.attrs.get("href", "")
        for n in iter_nodes(r):
            c = n.cls()
            if "detail-badge" in c:
                for k in ("category", "language", "country"):
                    if k in c.split():
                        d[k] = text_of(n)
        vals = [text_of(c) for c in cells]
        if len(vals) >= 8:
            d["da"], d["dr"], d["traffic"], d["spam"], d["link_type"], d["tat"], d["price"] = vals[1:8]
        out.append(d)
    return {"total_results": total, "rows_on_page": len(out), "has_filter_form": has_filter, "rows": out}


def classify(path: str, in_post_sitemap: bool, listing: dict | None, is_tool: bool) -> str:
    slug = path.strip("/")
    if slug == "":
        return "home"
    if slug.startswith(("my-account", "cart", "checkout", "product/", "link-details")):
        return "account/commerce"
    if slug in ("blog",) or slug.startswith(("category/", "tag/", "author/", "blog/page")):
        return "blog-index"
    if in_post_sitemap:
        return "blog-post"
    seg = re.compile(r"^(da\d+toda\d+(-sites)?|dr-.*|price-.*|monthly(-.*)?|permanent|trust-flow-.*|"
                     r"guest-posts?-by-.*|backlinks-.*|\d+k-to-\d+k|above-500k|zero-to-50k-traffic|products)$")
    if seg.match(slug) or (listing and listing.get("total_results") is not None):
        return "marketplace-segment"
    if is_tool or slug == "seo-tools":
        return "tool"
    legal = {"terms-privacy", "cookie-policy", "copyright-policy", "dmca-compliance-policy", "user-agreement",
             "refund-policy"}
    support = {"help-center", "faq", "customer-support-2", "payment-methods", "invoices-billing", "contact-us",
               "how-it-works"}
    community = {"user-reviews", "networking-opportunities", "writers-community", "community-guidelines",
                 "top-blogging-forums-to-join-and-grow-your-blogging-journey"}
    service = {"content-writing-services", "content-marketing-services", "seo-optimized-blog-posts",
               "social-media-promotion", "buy-blog-posts", "guests-blogging-services", "plagiarism-checking",
               "proofreading-editing", "request-a-custom-blog-post", "exclusive-content", "niche-blog-posts"}
    if slug in legal:
        return "legal"
    if slug in support:
        return "support"
    if slug in community:
        return "community"
    if slug in service:
        return "service"
    return "other"


def analyze_page(url: str, resp: dict) -> dict:
    html = resp.get("body") or ""
    root = parse_html(html)
    head = next((n for n in iter_nodes(root) if n.tag == "head"), root)
    title_node = next((n for n in iter_nodes(head) if n.tag == "title"), None)
    title = text_of(title_node, skip=set()) if title_node is not None else ""

    def meta(name=None, prop=None):
        for n in iter_nodes(root):
            if n.tag != "meta":
                continue
            if name and n.attrs.get("name", "").lower() == name:
                return n.attrs.get("content", "")
            if prop and n.attrs.get("property", "").lower() == prop:
                return n.attrs.get("content", "")
        return None
    canonical = None
    for n in iter_nodes(root):
        if n.tag == "link" and "canonical" in n.attrs.get("rel", "").lower().split():
            canonical = n.attrs.get("href")
            break
    has_main = any(n.tag == "main" for n in iter_nodes(root))
    blocks, links, images, headings = extract_blocks_links_images(root, has_main)
    all_h1 = [h for h in headings if h["level"] == "h1"]
    ld_summary: dict = {}
    types, ld_err = jsonld_types(root, ld_summary)
    listing = extract_listing(root)
    is_tool = any("tk-wrap" in n.cls() for n in iter_nodes(root))
    # resolve links
    out_links = []
    for l in links:
        href = (l["href"] or "").strip()
        if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
            continue
        absu = normalize(href, url)
        if not absu:
            continue
        l2 = dict(l)
        l2["url"] = absu
        l2["internal"] = is_internal(absu)
        l2.pop("href", None)
        out_links.append(l2)
    return {
        "title": title,
        "meta_description": meta(name="description"),
        "meta_robots": meta(name="robots"),
        "canonical": canonical,
        "og_title": meta(prop="og:title"),
        "og_image": meta(prop="og:image"),
        "og_type": meta(prop="og:type"),
        "h1": [h["text"] for h in all_h1],
        "h1_zones": [h["zone"] for h in all_h1],
        "h2": [h["text"] for h in headings if h["level"] == "h2" and h["zone"] in ("content", "widget")],
        "h3_count": sum(1 for h in headings if h["level"] == "h3" and h["zone"] in ("content", "widget")),
        "jsonld_types": types,
        "jsonld_errors": ld_err,
        "jsonld_summary": ld_summary,
        "links": out_links,
        "images": images,
        "_blocks": blocks,
        "listing": listing,
        "is_tool_widget": is_tool,
        "html_bytes": len(html.encode("utf-8", errors="ignore")),
    }


# --------------------------------------------------------------------------- sitemaps
def parse_sitemap(xml_text: str) -> tuple[list[dict], list[dict]]:
    """Returns (child_sitemaps, urls)."""
    try:
        root = ET.fromstring(xml_text.encode("utf-8"))
    except ET.ParseError:
        return [], []
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    kids = [{"loc": (s.findtext("sm:loc", namespaces=ns) or "").strip(),
             "lastmod": s.findtext("sm:lastmod", namespaces=ns)} for s in root.findall("sm:sitemap", ns)]
    urls = [{"loc": (u.findtext("sm:loc", namespaces=ns) or "").strip(),
             "lastmod": u.findtext("sm:lastmod", namespaces=ns),
             "images": len(u.findall("{http://www.google.com/schemas/sitemap-image/1.1}image"))}
            for u in root.findall("sm:url", ns)]
    return kids, urls


# --------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--max", type=int, default=300)
    ap.add_argument("--delay", type=float, default=1.0)
    ap.add_argument("--out", default="docs/data/crawl.json")
    ap.add_argument("--cache", default=None)
    ap.add_argument("--link-details-sample", type=int, default=5)
    ap.add_argument("--extra", nargs="*", default=[], help="extra paths to probe (e.g. /sitemap.xml)")
    args = ap.parse_args()
    if args.delay < 1.0:
        sys.exit("delay must be >= 1.0 s (politeness rule)")

    started = datetime.now(timezone.utc).isoformat(timespec="seconds")
    print(f"[crawl] start {started}", file=sys.stderr)
    rob_resp = http_get(SITE + "/robots.txt", args.delay, args.cache)
    robots = Robots(rob_resp["body"] if rob_resp["status"] == 200 else "")

    # --- sitemaps
    sitemap_urls: dict[str, dict] = {}
    sitemap_files = []
    todo = list(robots.sitemaps) or [SITE + "/sitemap_index.xml"]
    seen_sm = set()
    while todo:
        sm = todo.pop(0)
        if sm in seen_sm:
            continue
        seen_sm.add(sm)
        r = http_get(sm, args.delay, args.cache)
        kids, urls = parse_sitemap(r["body"]) if r["status"] == 200 else ([], [])
        sitemap_files.append({"sitemap": sm, "status": r["status"], "children": len(kids), "urls": len(urls),
                              "lastmod_children": {k["loc"]: k["lastmod"] for k in kids}})
        for k in kids:
            todo.append(k["loc"])
        name = sm.rsplit("/", 1)[-1]
        for u in urls:
            loc = normalize(u["loc"])
            if loc:
                sitemap_urls.setdefault(loc, {"sitemap": name, "lastmod": u["lastmod"], "images": u["images"]})

    # --- probes (non-crawl checks)
    probes = {}
    for p in ["/sitemap.xml", "/product-sitemap.xml", "/llms.txt", "/this-page-should-not-exist-audit-404/",
              "/?p=1", "/feed/"] + args.extra:
        u = SITE + p
        if robots.allowed(u):
            r = fetch_follow(u, args.delay, args.cache)
            probes[p] = {"status": r["status"], "final_url": r["final_url"], "chain": r["chain"],
                         "content_type": r["headers"].get("content-type")}
        else:
            probes[p] = {"status": None, "note": "disallowed by robots.txt"}

    # --- crawl
    queue = deque()
    queued = set()

    def enqueue(u, source):
        if u in queued:
            return
        queued.add(u)
        queue.append((u, source))
    enqueue(SITE + "/", "seed")
    for u in sitemap_urls:
        enqueue(u, "sitemap")

    pages: dict[str, dict] = {}
    skipped: dict[str, dict] = {}
    link_details_seen = 0
    fetched = 0
    while queue and fetched < args.max:
        url, source = queue.popleft()
        if not is_internal(url):
            continue
        br = blocked_reason(url)
        if br:
            skipped.setdefault(url, {"reason": br, "source": source})
            continue
        if not robots.allowed(url):
            skipped.setdefault(url, {"reason": "robots.txt disallow", "source": source})
            continue
        parts = urllib.parse.urlsplit(url)
        if parts.query and source != "sitemap":
            skipped.setdefault(url, {"reason": "query-string URL (recorded, not crawled)", "source": source})
            continue
        if parts.path.startswith("/link-details/"):
            if link_details_seen >= args.link_details_sample:
                skipped.setdefault(url, {"reason": "link-details sample cap reached", "source": source})
                continue
            link_details_seen += 1
        r = fetch_follow(url, args.delay, args.cache)
        fetched += 1
        ctype = r["headers"].get("content-type", "")
        rec = {
            "url": url, "discovered_via": source,
            "in_sitemap": url in sitemap_urls,
            "sitemap": sitemap_urls.get(url, {}).get("sitemap"),
            "sitemap_lastmod": sitemap_urls.get(url, {}).get("lastmod"),
            "status": r["chain"][0]["status"], "final_status": r["status"],
            "redirect_chain": r["chain"] if len(r["chain"]) > 1 else [],
            "final_url": r["final_url"], "content_type": ctype, "elapsed_s": r["elapsed"],
            "x_robots_tag": r["headers"].get("x-robots-tag"), "error": r.get("error"),
            "last_modified_header": r["headers"].get("last-modified"),
        }
        if r["status"] == 200 and "html" in ctype and not r.get("final_not_fetched"):
            a = analyze_page(r["final_url"], r)
            rec.update(a)
            for l in a["links"]:
                if l["internal"]:
                    nu = l["url"]
                    enqueue(nu, url)
        pages[url] = rec
        print(f"[crawl] {fetched:3d} {rec['status']} {url}", file=sys.stderr)

    # --- boilerplate removal (text blocks present on > 80% of HTML pages) and word counts
    html_pages = [p for p in pages.values() if "_blocks" in p]
    freq = Counter()
    for p in html_pages:
        freq.update({t.lower() for z, t in p["_blocks"] if z in ("content", "widget", "other")})
    threshold = 0.8 * max(1, len(html_pages))
    boiler = {t for t, c in freq.items() if c > threshold}
    for p in html_pages:
        main_txt, edit_txt, nav_words, widget_words = [], [], 0, 0
        for z, t in p["_blocks"]:
            if z == "nav":
                nav_words += count_words(t)
                continue
            if z in ("comments", "other"):
                continue
            if t.lower() in boiler:
                continue
            main_txt.append(t)
            if z == "content":
                edit_txt.append(t)
            else:
                widget_words += count_words(t)
        p["word_count_main"] = sum(count_words(t) for t in main_txt)
        p["word_count_editorial"] = sum(count_words(t) for t in edit_txt)
        p["word_count_widget"] = widget_words
        p["word_count_nav_boilerplate"] = nav_words
        p["editorial_text"] = " ".join(edit_txt)
        del p["_blocks"]

    out = {
        "meta": {
            "site": SITE, "started": started,
            "finished": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "user_agent": UA, "delay_s": args.delay, "max_urls": args.max,
            "requests_made": len(REQUEST_LOG), "pages_recorded": len(pages),
            "boilerplate_blocks_removed": sorted(boiler)[:200],
            "boilerplate_threshold": ">80% of HTML pages",
            "notes": [
                "word_count_main = <main> text minus header/footer/nav, comments and >80% boilerplate blocks",
                "word_count_editorial = word_count_main minus interactive widgets (listing table, filters, tool UI)",
                "link zones: nav = header/footer/nav; content = editorial main; widget = listing/tool UI inside main",
            ],
        },
        "robots_txt": rob_resp["body"] if rob_resp["status"] == 200 else None,
        "robots_rules": [{"allow": a, "pattern": p} for a, p in robots.rules],
        "sitemap_files": sitemap_files,
        "sitemap_urls": sitemap_urls,
        "probes": probes,
        "pages": pages,
        "skipped": skipped,
    }
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print(f"[crawl] wrote {args.out}: {len(pages)} pages, {len(skipped)} skipped, "
          f"{len(REQUEST_LOG)} requests", file=sys.stderr)


if __name__ == "__main__":
    main()
