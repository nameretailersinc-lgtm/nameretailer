"""Read-only loopback HTML audit of publication samples and the full guide corpus."""
import argparse
import concurrent.futures
from collections import Counter, defaultdict
import datetime
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


def plain(value):
    return re.sub(r"\s+", " ", value).strip()


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.main = False
        self.heading = None
        self.headings = []
        self.text = []
        self.canonical = self.robots = self.description = self.lead = None
        self.title = []
        self.in_title = False
        self.paragraph = None
        self.paragraphs = []
        self.links = []
        self.schema = None
        self.schemas = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("script", "style"): self.skip += 1
        if tag == "script" and attrs.get("type") == "application/ld+json": self.schema = []
        if tag == "main": self.main = True
        if tag == "title": self.in_title = True
        if tag == "link" and attrs.get("rel") == "canonical": self.canonical = attrs.get("href")
        if tag == "meta" and attrs.get("name") == "robots": self.robots = attrs.get("content")
        if tag == "meta" and attrs.get("name") == "description": self.description = attrs.get("content")
        if self.main and tag in ("h1", "h2", "h3"): self.heading = [tag, ""]
        if self.main and tag == "p": self.paragraph = {"text": [], "lead": "reference-lead" in attrs.get("class", "").split()}
        if self.main and tag == "a" and attrs.get("href"): self.links.append(attrs["href"])

    def handle_endtag(self, tag):
        if tag == "script" and self.schema is not None:
            self.schemas.append("".join(self.schema)); self.schema = None
        if tag in ("script", "style"): self.skip = max(0, self.skip - 1)
        if tag == "main": self.main = False
        if tag == "title": self.in_title = False
        if self.heading and tag == self.heading[0]:
            self.heading[1] = plain(self.heading[1]); self.headings.append(self.heading); self.heading = None
        if tag == "p" and self.paragraph is not None:
            value = plain(" ".join(self.paragraph["text"]))
            self.paragraphs.append(value)
            if self.paragraph["lead"]: self.lead = value
            self.paragraph = None

    def handle_data(self, value):
        if self.schema is not None: self.schema.append(value)
        if self.skip: return
        if self.in_title: self.title.append(value)
        if self.main:
            self.text.append(value)
            if self.heading: self.heading[1] += value
            if self.paragraph is not None: self.paragraph["text"].append(value)


def normalize_slots(value, row):
    tokens = [row.get(key, "") for key in ("domain", "category", "country", "language")]
    if row.get("domain"): tokens.append(urlparse(row["domain"]).hostname.removeprefix("www."))
    value = value.lower()
    for token in sorted(set(filter(None, tokens)), key=len, reverse=True): value = value.replace(token.lower(), "{slot}")
    return plain(re.sub(r"\$?\d[\d,.]*", "{number}", value))


def shingles(value):
    tokens = re.findall(r"\w+", value.lower())
    return {tuple(tokens[i:i + 5]) for i in range(max(0, len(tokens) - 4))}


def distribution(values):
    values = sorted(values)
    if not values: return None
    return {"min": values[0], "median": values[len(values) // 2], "p90": values[int((len(values) - 1) * .9)], "max": values[-1]}


def duplicates(rows, key):
    groups = defaultdict(list)
    for row in rows:
        if row.get(key): groups[row[key]].append(row["path"])
    return [{"value": value, "pages": len(paths), "examplePaths": paths[:5]} for value, paths in groups.items() if len(paths) > 1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", choices=["before", "after"], required=True)
    parser.add_argument("--kind", choices=["publication", "guide"], default="publication")
    parser.add_argument("--base", default="http://127.0.0.1:3253")
    args = parser.parse_args()
    base = urlparse(args.base)
    if base.scheme not in ("http", "https") or base.hostname not in ("127.0.0.1", "localhost", "::1") or base.username or base.password or base.path not in ("", "/") or base.query or base.fragment:
        raise SystemExit("Use an isolated loopback server origin.")
    args.base = args.base.rstrip("/")
    manifest = json.loads(Path(f"reports/{args.kind}-content-audit.json").read_text(encoding="utf-8"))
    private_text = {}

    def inspect(row):
        path = row["path"]
        prefix = "/publication/" if args.kind == "publication" else "/guides/"
        if not path or not path.startswith(prefix) or "?" in path or "#" in path or "\\" in path: return {"path": path, "error": "InvalidManifestPath"}
        try:
            with urlopen(Request(args.base + path, headers={"User-Agent": "Googlebot"}), timeout=60) as response:
                html = response.read().decode("utf-8"); status = response.status
            page = Page(); page.feed(html)
            text = plain(" ".join(page.text))
            schema_types = []; schema_errors = 0
            for raw in page.schemas:
                try:
                    node = json.loads(raw)
                    nodes = node if isinstance(node, list) else node.get("@graph", [node])
                    for item in nodes:
                        types = item.get("@type", [])
                        schema_types.extend(types if isinstance(types, list) else [types])
                except (ValueError, AttributeError): schema_errors += 1
            result = {
                "path": path, "status": status, "title": plain("".join(page.title)), "description": page.description,
                "canonical": page.canonical, "robots": page.robots, "expectedMetricEligible": row.get("currentEligible"),
                "headings": page.headings, "h1Count": sum(tag == "h1" for tag, _ in page.headings), "lead": page.lead,
                "mainWords": len(re.findall(r"\b\w+\b", text)), "mainHash": hashlib.sha256(text.encode()).hexdigest(),
                "descriptionSlotNormalized": normalize_slots(page.description or "", row), "leadSlotNormalized": normalize_slots(page.lead or "", row),
                "canonicalMatchesExpected": page.canonical == "https://nameretailer.com" + path,
                "titleMatchesSource": plain("".join(page.title)) == row.get("currentTitle", row.get("metadataTitle")),
                "descriptionMatchesSource": page.description == row.get("currentDescription", row.get("metadataDescription")),
                "schemaTypes": schema_types, "schemaParseErrors": schema_errors,
                "internalLinks": sorted(set(link for link in page.links if link.startswith("/") and not link.startswith("//"))),
                "externalLinkCount": len(set(link for link in page.links if link.startswith("https://"))),
            }
            private_text[path] = {"text": text, "paragraphs": page.paragraphs}
            return result
        except HTTPError as error: return {"path": path, "status": error.code, "error": "HTTPError"}
        except Exception as error: return {"path": path, "error": type(error).__name__}

    rows = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for row in pool.map(inspect, manifest["sample"]):
            rows.append(row)
            if len(rows) % 25 == 0: print(f"{args.kind}: audited {len(rows)}/{len(manifest['sample'])} rendered pages", flush=True)
    successful = [row for row in rows if row.get("status") == 200 and row.get("h1Count") == 1]
    sets = [shingles(private_text[row["path"]]["text"]) for row in successful]
    similarities = [len(sets[a] & sets[b]) / (len(sets[a] | sets[b]) or 1) for a in range(len(sets)) for b in range(a + 1, len(sets))]
    paragraph_paths = defaultdict(set); heading_paths = defaultdict(set)
    for row in successful:
        for paragraph in private_text[row["path"]]["paragraphs"]:
            if len(paragraph) >= 40: paragraph_paths[paragraph].add(row["path"])
        for tag, heading in row["headings"]:
            if tag != "h1": heading_paths[heading].add(row["path"])
    def repeated(values):
        return [{"text": value, "pages": len(paths), "examplePaths": sorted(paths)[:3]} for value, paths in sorted(values.items(), key=lambda item: -len(item[1])) if len(paths) > 1]
    summary = {
        "requested": len(rows), "http200WithOneH1": len(successful),
        "httpStatusCounts": dict(Counter(str(row.get("status", "error")) for row in rows)),
        "canonicalMismatches": [row["path"] for row in successful if not row["canonicalMatchesExpected"]],
        "sourceTitleMismatches": [row["path"] for row in successful if not row["titleMatchesSource"]],
        "sourceDescriptionMismatches": [row["path"] for row in successful if not row["descriptionMatchesSource"]],
        "robotsCounts": dict(Counter(row["robots"] for row in successful)),
        "schemaTypePageCounts": dict(Counter(kind for row in successful for kind in set(row["schemaTypes"]))),
        "schemaParseErrors": sum(row["schemaParseErrors"] for row in successful), "wordCounts": distribution([row["mainWords"] for row in successful]),
        "similarity": {
            "methodology": "Exact values, supplied-slot normalization and pairwise five-word-shingle set Jaccard of main HTML text. Header/footer/scripts excluded; main breadcrumbs, shared help and related lists retained. Lexical repetition is not search quality or semantic intent. Compare the separate authored-only guide source analysis.",
            "pairCount": len(similarities), "mainTextFiveWordJaccard": distribution(similarities),
            "exactDuplicateTitles": duplicates(successful, "title"), "exactDuplicateDescriptions": duplicates(successful, "description"),
            "slotNormalizedDescriptions": duplicates(successful, "descriptionSlotNormalized"), "slotNormalizedLeads": duplicates(successful, "leadSlotNormalized"),
            "repeatedHeadings": repeated(heading_paths), "mostRepeatedParagraphs": repeated(paragraph_paths)[:15],
        },
    }
    result = {"checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "scope": "Read-only existing local production-build HTML; no deployed indexing or ranking evidence. Source comparison flags metadata drift from the audited repository.", "manifestAuditedAt": manifest["auditedAt"], "summary": summary, "rows": rows, "errors": sum("error" in row for row in rows)}
    Path(f"reports/{args.kind}-html-{args.phase}.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"kind": args.kind, "pages": len(rows), "errors": result["errors"], "summary": {key: value for key, value in summary.items() if key != "similarity"}}), flush=True)
    return 1 if result["errors"] or len(successful) != len(rows) else 0


if __name__ == "__main__":
    raise SystemExit(main())
