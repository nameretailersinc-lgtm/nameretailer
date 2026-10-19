"""Inspect local API response shapes, sitemap membership and detail-route controls."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import datetime
import json
from pathlib import Path
import runpy
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET
Page = runpy.run_path(str(Path(__file__).with_name("audit-publication-html.py")))["Page"]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://127.0.0.1:3253")
    args = parser.parse_args()
    base = urlparse(args.base)
    if base.scheme not in ("http", "https") or base.hostname not in ("127.0.0.1", "localhost", "::1") or base.username or base.password or base.path not in ("", "/") or base.query or base.fragment:
        raise SystemExit("Use a loopback origin.")
    base = args.base.rstrip("/")
    publications = json.loads(Path("reports/publication-content-audit.json").read_text(encoding="utf-8"))
    guides = json.loads(Path("reports/guide-content-audit.json").read_text(encoding="utf-8"))
    listing = publications["sample"][0]
    if not re_full_id(listing["id"]):
        raise SystemExit("Invalid listing ID.")

    def inspect_api(path):
        try:
            with urlopen(base + path, timeout=45) as response:
                data = json.load(response)
                product = data.get("product")
                if not product and isinstance(data.get("data"), list):
                    product = next(iter(data["data"]), None)
                return {"path": path, "status": response.status, "topLevelKeys": sorted(data),
                        "productKeys": sorted(product) if product else [],
                        "privateFieldsExposed": [key for key in ("source", "externalId", "importId", "publicationContent") if product and key in product],
                        "sourceColumnNames": sorted(product.get("source", {})) if product else [],
                        "cacheControl": response.headers.get("Cache-Control")}
        except HTTPError as error:
            return {"path": path, "status": error.code}
        except Exception as error:
            return {"path": path, "error": type(error).__name__}

    paths = ["/api/products/?q=001success.net&pageSize=1", "/api/mobile/products/?q=001success.net&pageSize=1",
             f"/api/mobile/products/{listing['id']}/", f"/api/products/{listing['id']}/options/", "/api/admin/products/"]
    with ThreadPoolExecutor(max_workers=3) as pool:
        api = {"checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "scope": "Read-only local build API shapes. Raw supplier values and credentials are never persisted.", "endpoints": list(pool.map(inspect_api, paths))}
    Path("reports/publication-api-audit.json").write_text(json.dumps(api, indent=2) + "\n", encoding="utf-8")

    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    out = {"checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "scope": "Read-only local build XML and query/404 controls; no production indexing assertion.", "sitemaps": [], "controls": []}
    urls = []
    try:
        with urlopen(base + "/sitemap.xml", timeout=60) as response:
            root = ET.fromstring(response.read()); out["indexStatus"] = response.status
        for node in root.findall("s:sitemap/s:loc", ns):
            path = urlparse(node.text).path
            if not path.startswith("/sitemaps/"):
                raise ValueError("Unexpected sitemap path")
            with urlopen(base + path, timeout=60) as response:
                part = ET.fromstring(response.read())
                found = [node.text for node in part.findall("s:url/s:loc", ns)]
                urls.extend(found)
                out["sitemaps"].append({"path": path, "status": response.status, "contentType": response.headers.get("Content-Type"), "urls": len(found)})
        out["publicationUrls"] = sum("/publication/" in urlparse(url).path for url in urls)
        out["guideUrls"] = sum(urlparse(url).path.startswith("/guides/") and urlparse(url).path != "/guides/" for url in urls)
        out["duplicateUrls"] = len(urls) - len(set(urls))
        out["guideUrlsMissingFromXml"] = [row["path"] for row in guides["sample"] if row["approved"] and "https://nameretailer.com" + row["path"] not in urls]
        out["sampleProfileSitemapMismatches"] = [row["path"] for row in publications["sample"] if row["currentEligible"] != ("https://nameretailer.com" + row["path"] in urls)]
    except HTTPError as error:
        out["error"] = "HTTPError"
        out["failedHttpStatus"] = error.code
    except Exception as error:
        out["error"] = type(error).__name__
    for path in ["/guides/guest-posting-for-beginners/?q=audit", "/publication/001success-net/?q=audit", "/guides/nonexistent-phase1-audit/", "/publication/not-a-real-phase1-audit/"]:
        try:
            with urlopen(Request(base + path, headers={"User-Agent": "Googlebot"}), timeout=45) as response:
                page = Page(); page.feed(response.read().decode("utf-8"))
                out["controls"].append({"path": path, "status": response.status, "robots": page.robots, "canonical": page.canonical})
        except HTTPError as error:
            out["controls"].append({"path": path, "status": error.code})
        except Exception as error:
            out["controls"].append({"path": path, "error": type(error).__name__})
    Path("reports/detail-sitemap-audit.json").write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"api": api, "sitemap": out}, indent=2))
    return int("error" in out or any("error" in row for row in api["endpoints"] + out["controls"]))


def re_full_id(value):
    import re
    return bool(re.fullmatch(r"[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}", value, re.I))


if __name__ == "__main__":
    raise SystemExit(main())
