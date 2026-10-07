"""Read-only checks for the proposed Phase 1b exact-URL migration map.

Run from the repository root: python scripts/audit/validate_redirect_plan.py
This validates planning coverage and destinations, not approval for activation.
"""
from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[2]
ORIGIN = "https://nameretailer.com"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def main() -> int:
    audit = read_csv(ROOT / "docs/existing-site-audit.csv")
    keywords = read_csv(ROOT / "docs/keyword-map.csv")
    map_path = ROOT / "docs/redirect-map.csv"
    if not map_path.is_file():
        print("Missing docs/redirect-map.csv")
        return 1
    redirects = read_csv(map_path)
    errors: list[str] = []
    expected_columns = {"old_url", "new_url", "status", "reason", "source"}
    if not redirects or set(redirects[0]) != expected_columns:
        errors.append("Exact redirect map must contain the specified five columns")
    observed = Counter(row.get("old_url", "") for row in redirects)
    expected = {row["url"] for row in audit}
    for source in sorted(expected - observed.keys()):
        errors.append(f"Missing audit URL: {source}")
    for source in sorted(observed.keys() - expected):
        errors.append(f"Extra URL in exact map; system rules belong separately: {source}")
    for source, count in observed.items():
        if count != 1:
            errors.append(f"Audit URL appears {count} times: {source}")
    by_source = {row.get("old_url", ""): row for row in redirects}
    new_targets = {
        row["target_url"] if row["target_url"].startswith("https://") else ORIGIN + row["target_url"]
        for row in keywords if row["url_status"] == "new"
    }
    for row in redirects:
        source, target, status = row.get("old_url", ""), row.get("new_url", ""), row.get("status", "")
        if status not in {"keep", "301", "410"}:
            errors.append(f"Invalid status {status!r}: {source}")
        if not row.get("reason") or not row.get("source"):
            errors.append(f"Missing decision reason or evidence source: {source}")
        if status == "keep" and target != source:
            errors.append(f"Keep must preserve the exact URL: {source} -> {target}")
        if status == "410" and target:
            errors.append(f"410 cannot have a redirect destination: {source}")
        if status != "301":
            continue
        parsed = urlsplit(target)
        if not target.startswith(ORIGIN + "/") or parsed.path != parsed.path.lower():
            errors.append(f"Noncanonical 301 target: {target}")
        if parsed.query or parsed.fragment or not parsed.path.endswith("/"):
            errors.append(f"Exact page-map target must be a trailing-slash route without query/fragment: {target}")
        if target == source:
            errors.append(f"Self redirect: {source}")
        survivor = by_source.get(target)
        if survivor and survivor.get("status") != "keep":
            errors.append(f"Redirect chain or retired destination: {source} -> {target}")
        if not survivor and target not in new_targets:
            errors.append(f"Unknown destination: {source} -> {target}")
    if errors:
        print("\n".join(errors))
        return 1
    totals = Counter(row["status"] for row in redirects)
    print(f"PASS: {len(redirects)} audit URLs covered exactly once; "
          f"{totals['keep']} keep, {totals['301']} planned 301, {totals['410']} proposed 410; "
          "no chains, self redirects or unknown destinations. Activation gates still apply.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
