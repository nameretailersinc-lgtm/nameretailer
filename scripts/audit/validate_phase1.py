"""Validate Phase 1 CSV ownership, URL destinations and unsupported metrics.

Run from the repository root: python scripts/audit/validate_phase1.py
This reads artifacts only; it does not crawl or modify the site.
"""
from __future__ import annotations

import csv
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[2]
ORIGIN = "https://nameretailer.com"
KEYWORD_COLUMNS = {
    "keyword", "cluster", "intent", "keyword_type", "target_url", "url_status",
    "merge_from", "priority", "volume", "difficulty", "data_source", "serp_notes", "notes",
}


def route(value: str) -> str:
    return urlsplit(value).path if value.startswith(("http://", "https://")) else value


def main() -> int:
    errors: list[str] = []
    required = ["existing-site-audit.md", "existing-site-audit.csv", "keyword-strategy.md", "keyword-map.csv"]
    missing = [name for name in required if not (ROOT / "docs" / name).is_file()]
    if missing:
        print("Missing Phase 1 files: " + ", ".join(missing))
        return 1
    with (ROOT / "docs/existing-site-audit.csv").open(encoding="utf-8-sig", newline="") as stream:
        audit = list(csv.DictReader(stream))
    with (ROOT / "docs/keyword-map.csv").open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if set(reader.fieldnames or []) != KEYWORD_COLUMNS:
            errors.append("Keyword CSV columns differ from the required schema")
        keywords = list(reader)

    audit_urls = [row["url"] for row in audit]
    if len(audit_urls) != len(set(audit_urls)):
        errors.append("Audit contains duplicate URL rows")
    if not audit or not keywords:
        errors.append("Audit or keyword map is empty")
    recorded = {row["path"] for row in audit}
    decisions = {row["path"]: row for row in audit}
    retained = {row["path"] for row in audit if row["recommendation"] in {"keep", "improve"}}
    new_routes = {route(row["target_url"]) for row in keywords if row["url_status"] == "new"}
    seen: dict[str, str] = {}
    for number, row in enumerate(keywords, 2):
        keyword = row.get("keyword", "").strip().casefold()
        target = row.get("target_url", "")
        path = route(target)
        if not keyword:
            errors.append(f"Keyword row {number}: empty keyword")
        elif keyword in seen:
            errors.append(f"Keyword row {number}: duplicate keyword {keyword!r}")
        seen[keyword] = target
        if target.startswith(("http://", "https://")) and not target.startswith(ORIGIN + "/"):
            errors.append(f"Keyword row {number}: foreign or noncanonical origin")
        if not re.fullmatch(r"/(?:[a-z0-9-]+/)*", path) or "?" in target or "#" in target:
            errors.append(f"Keyword row {number}: invalid canonical target {target!r}")
        if row.get("url_status") not in {"existing", "merge", "new"}:
            errors.append(f"Keyword row {number}: invalid URL status")
        if row.get("priority") not in {"P1", "P2", "P3"}:
            errors.append(f"Keyword row {number}: invalid priority")
        if path not in retained | new_routes:
            errors.append(f"Keyword row {number}: target is neither retained nor declared new: {path}")
        if row.get("url_status") == "existing" and path not in recorded:
            errors.append(f"Keyword row {number}: existing target is absent from audit: {path}")
        if row.get("volume") or row.get("difficulty"):
            errors.append(f"Keyword row {number}: metrics populated without an owner metrics export")
        if row.get("data_source") != "needs-data":
            errors.append(f"Keyword row {number}: metrics source must be needs-data until exports exist")
        for source in row.get("merge_from", "").split():
            decision = decisions.get(source)
            if not decision or route(decision["target_url"]) != path:
                errors.append(f"Keyword row {number}: merge source disagrees with audit: {source} -> {path}")
    for row in audit:
        if not row.get("reason") or "No specific decision" in row["reason"]:
            errors.append(f"Unreviewed audit decision: {row['url']}")
        if row["target_url"] and route(row["target_url"]) not in retained | new_routes:
            errors.append(f"Redirect destination is not retained or declared new: {row['url']} -> {row['target_url']}")
    if errors:
        print("\n".join(errors))
        return 1
    print(f"PASS: {len(audit)} unique audit URLs; {len(keywords)} unique keywords; "
          f"{len({route(row['target_url']) for row in keywords})} keyword destinations; "
          "all destinations retained or declared new; no invented volume/difficulty.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
