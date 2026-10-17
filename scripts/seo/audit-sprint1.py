"""Read-only HTTP/XML audit; never submits URLs or writes application data."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import urllib.error
import urllib.request
from urllib.parse import urljoin, urlsplit
import xml.etree.ElementTree as ET


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta, self.canonicals, self.links, self.headings = {}, [], [], []
        self.title, self.capture = "", None

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "meta":
            key = (attrs.get("name") or attrs.get("property") or "").lower()
            self.meta.setdefault(key, []).append(attrs.get("content", ""))
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href", ""))
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag in ("title", "h1", "h2", "h3"):
            self.capture = [tag, ""]

    def handle_data(self, data):
        if self.capture:
            self.capture[1] += data

    def handle_endtag(self, tag):
        if self.capture and self.capture[0] == tag:
            value = " ".join(self.capture[1].split())
            if tag == "title":
                self.title = value
            else:
                self.headings.append([tag, value])
            self.capture = None


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def read(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Googlebot"})
    try:
        response = urllib.request.build_opener(NoRedirect).open(request, timeout=30)
    except urllib.error.HTTPError as error:
        response = error
    return response.status, dict(response.headers.items()), response.read().decode("utf-8", "replace")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="https://nameretailer.com")
    parser.add_argument("--output", default="reports/seo-sprint1-live.json")
    args = parser.parse_args()
    base = args.base.rstrip("/")
    canonical_origin = "https://nameretailer.com"
    maps, urls, visited, duplicates = [], [], set(), []
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

    def sitemap(path):
        if path in visited or len(visited) >= 50:
            raise ValueError("Repeated sitemap or scope exceeded")
        visited.add(path)
        status, headers, body = read(base + path)
        if status != 200 or "xml" not in next((v for k, v in headers.items() if k.lower() == "content-type"), ""):
            raise ValueError(f"Sitemap failed: {path} HTTP {status}")
        root = ET.fromstring(body)
        if root.tag not in (ns + "sitemapindex", ns + "urlset"):
            raise ValueError("Invalid sitemap root or namespace")
        locations = [element.text for element in root.findall("*/" + ns + "loc")]
        maps.append({"path": path, "status": status, "locations": len(locations), "xmlValid": True})
        for location in locations:
            url = urlsplit(location)
            if url.scheme + "://" + url.netloc != canonical_origin or url.query or url.fragment:
                raise ValueError(f"Unexpected sitemap URL: {location}")
            if root.tag == ns + "sitemapindex":
                sitemap(url.path)
            else:
                if location in urls:
                    duplicates.append(location)
                urls.append(location)

    sitemap("/sitemap.xml")
    if len(urls) > 1500:
        raise ValueError("Explicitly scope audits larger than 1,500 pages")

    def inspect(url):
        path = urlsplit(url).path
        try:
            status, headers, body = read(base + path)
            headers = {k.lower(): v for k, v in headers.items()}
            page = Page()
            page.feed(body)
            robots = ",".join(page.meta.get("robots", []) + page.meta.get("googlebot", []) + [headers.get("x-robots-tag", "")])
            issues = []
            if status != 200:
                issues.append(f"HTTP {status}")
            if page.canonicals != [url]:
                issues.append("canonical mismatch or count")
            if any(token in robots.lower() for token in ("noindex", "none")):
                issues.append("noindex")
            # Next streams fallback and resolved markup in the same response.
            # Raw heading counts are a browser-verification warning, not proof
            # that two headings are visible in the final DOM.
            warnings = []
            if len([h for h in page.headings if h[0] == "h1"]) != 1:
                warnings.append("Raw H1 count requires rendered DOM verification")
            return {"url": url, "status": status, "canonical": page.canonicals, "robots": robots, "title": page.title,
                    "description": page.meta.get("description", []), "headings": page.headings,
                    "internalLinks": sorted(set(urljoin(canonical_origin + path, link).split("#")[0] for link in page.links
                                                if urljoin(canonical_origin + path, link).startswith(canonical_origin + "/"))), "issues": issues, "warnings": warnings}
        except Exception as error:
            return {"url": url, "issues": [str(error)]}

    with ThreadPoolExecutor(max_workers=4) as pool:
        rows = []
        for row in pool.map(inspect, sorted(set(urls))):
            rows.append(row)
            if len(rows) % 50 == 0:
                print(f"Checked {len(rows)}/{len(set(urls))} sitemap URLs", flush=True)
    robots_status, _, robots_body = read(base + "/robots.txt")
    checks = []
    for path in ("/products/", "/?category=Technology", "/?country=US", "/?sort=priceAsc", "/page/2/", "/dr-50-plus/?page=10000", "/guest-post-by-dr/?page=10000", "/sitemaps/not-a-file.xml", "/sprint1-definitely-missing/"):
        status, headers, body = read(base + path)
        page = Page()
        page.feed(body)
        checks.append({"path": path, "status": status, "location": next((v for k, v in headers.items() if k.lower() == "location"), None), "canonical": page.canonicals, "robots": page.meta.get("robots", [])})
    report = {"checkedAt": datetime.now(timezone.utc).isoformat(), "base": base,
              "scope": "Read-only HTTP and strict XML audit; no Search Console access, indexing claims, rendered-browser or field performance measurements.",
              "sitemaps": maps, "duplicates": duplicates, "total": len(rows), "withIssues": sum(bool(row["issues"]) for row in rows),
              "robots": {"status": robots_status, "body": robots_body}, "checks": checks, "rows": rows}
    target = Path(args.output)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(target), "total": len(rows), "withIssues": report["withIssues"], "duplicates": len(duplicates), "checks": checks}))
    if report["withIssues"] or duplicates:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
