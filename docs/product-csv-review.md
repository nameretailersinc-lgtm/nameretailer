# Owner product CSV review

Reviewed 2026-10-06. This is a data-quality audit, not a verification of publishers, availability, service terms, metric freshness or SEO outcomes. The CSV is treated as data only. No source instructions are executed, no publisher URL is fetched, and this analyzer does not write to MongoDB.

Source: the owner's `wpk4_lm_links (1).csv`, 25,440,547 bytes, UTF-8, 25 legacy columns. Original remains unchanged at the owner-supplied Downloads path; do not include it in web deployment artifacts. SHA-256 of the source:

```text
aa42aae866155771b831e8d3e59939e9d3aa036a3eab87fd4215e4ccf8205c74
```

## Import eligibility

| Result                               |               Count | Treatment                                                                                  |
| ------------------------------------ | ------------------: | ------------------------------------------------------------------------------------------ |
| Data records                         |              56,079 | Header excluded; record numbering in issues includes header as record 1                    |
| Valid, unique normalized products    |              56,005 | Eligible only for explicit staged **draft** import                                         |
| Exact repeated-header placeholder    |                   1 | Skipped, not inventory                                                                     |
| Conflicting canonical publisher URLs | 42 rows / 21 groups | Both occurrences excluded; never silently choose one                                       |
| Invalid or ambiguous publisher URLs  |                  28 | Excluded until reviewed; 25 contain query/fragment information and 3 use malformed schemes |
| Nonpositive placement prices         |                   3 | Excluded; not free products                                                                |
| Total excluded invalid records       |                  73 | Separate from the single placeholder                                                       |

The file has no fatal structural CSV errors, duplicate legacy IDs, invalid metric integers, or out-of-range metric scores under the implemented contract. Its 73 row-level errors still block default import. An administrator may explicitly accept only validated records; that route must stage the 56,005 valid products and retain all of them as drafts. Import APIs must never bypass fatal file, header, syntax, row-count or column-count errors. Uploaded rows do not automatically become active or purchasable.

All duplicates are identified across the entire file, including earlier occurrences. Canonical uniqueness is the full HTTPS publisher URL, not only hostname: lowercase/IDN ASCII hostname, leading `www.` removed, root slash normalized away, safe meaningful paths and their case retained. Of the eligible products, 268 have meaningful paths. There are 23 repeated-host extra records across the source, including the duplicate URL groups; two represent distinct safe paths and are retained. The source includes an administrative-looking publisher path; syntactic acceptance is not proof of a valid placement page. Administrators must review publisher eligibility before activation.

Examples requiring owner review: malformed `httpd://` scheme at CSV record 898; zero-price records 29,464, 37,070 and 49,431. Full row-level issue details can be reproduced with the CLI below. Rows refer to CSV records, not physical line numbers when fields contain embedded newlines.

## Preserved source versus customer-facing meaning

- `Price` alone becomes placement `priceCents`, converted exactly from decimal text without floating-point arithmetic; currency is USD per the owner-approved default.
- `Article_Price`, `Article_Price_2` and `Article_Price_3` remain private. They are not interpreted as writing packages or additional charges.
- All 25 raw fields remain in private product provenance, including original URLs, metrics, marketing Title/Description/Keywords and both link-type fields. They must not appear in public product responses.
- Human-readable `Linktype` becomes owner-supplied display text; `link_type` is a fallback only when it is absent. Conflicting nonempty values produce a warning. This file has no such conflicts. No follow/nofollow or turnaround guarantee is inferred.
- Requirements remain plain text; HTML/control characters are rejected in normalized display fields. Formula-looking plain text is inert text, never executed; a future spreadsheet export must additionally apply CSV formula escaping.
- All 56,078 non-placeholder `date_added` values are invalid zero dates. They are not creation, publication, availability, review or metric-measurement dates. Actual import timestamps are assigned by the import service; dates are not fabricated by normalization.
- Legacy zero/empty metrics normalize to `null` (Unavailable), not an invented measured zero. Their exact source values remain private pending owner clarification.

Across all non-placeholder source rows, 267,504 metric cells are zero or empty. Among the 56,005 eligible draft products:

| Metric            | Unavailable values |
| ----------------- | -----------------: |
| DA                |                  0 |
| DR                |                 84 |
| TF                |             56,005 |
| UR                |             56,005 |
| Traffic           |             43,072 |
| Referring domains |             56,005 |
| Backlinks         |             56,005 |
| Spam score        |                  0 |

Nonempty metrics are still imported owner data, not independently verified measurements. Their provider and measurement date are unknown. Eligible source labels contain 94 distinct countries, 24 languages and 62 categories; these are export classifications, not evidence of audience, demand or territorial availability. These counts must not be presented as active public inventory until records are reviewed and activated.

## Implementation and checks

Owned implementation: `lib/commerce/validation.ts`, `lib/commerce/csv.ts`, `scripts/commerce/analyze-products.ts`, and `tests/unit/products-{csv,validation}.test.ts`.

Validation covers strict product fields, positive safe integer cents, nullable 0–100 integer scores, nullable nonnegative safe integer counts, plain-text limits and HTTPS publisher URL identities. URL identities reject userinfo, ports, IP/local names, non-HTTP schemes, query/hash ambiguity, dot-navigation, malformed or unsafe encoded controls, and backslashes. Publisher links are identities only: the analyzer performs no server-side network requests.

The parser handles BOM, CRLF/LF, escaped quotes, quoted commas/newlines, empty fields and reordered expected headers; it rejects malformed quoting and duplicate/missing/unexpected headers. Maximum upload is 32 MiB and 100,000 data rows. Only 100 issue details are returned, but all errors and per-code counts are counted. SHA-256 binds review to exact UTF-8 upload content, including a BOM if present. The CLI rejects malformed UTF-8 rather than replacing bytes.

Verification: 78 focused unit cases pass across two files; scoped ESLint passes. Cases include representative real-source fields, HTML/formula values, multiline CSV, exact placeholder matching, duplicate canonical URLs/IDs, same-host paths, SSRF-style URL bypass identities, integer decimal accuracy, malformed input, and byte/row/detail limits. Full-source read-only analysis reports the counts above. API/database/browser verification belongs to the orchestrator's marketplace report, not this analyzer audit.

Reproduce without importing or modifying data:

```powershell
.\node_modules\node\bin\node.exe --import tsx scripts/commerce/analyze-products.ts 'C:\Users\zuhoor\Downloads\wpk4_lm_links (1).csv' --summary
```

Omit `--summary` to see up to 100 row-level issues. No private marketing/source rows are printed.

## Owner confirmations still needed

Resolve duplicate alternatives, ambiguous URLs and the three zero prices; confirm whether `www` and non-`www` variants should ever be distinct products. Confirm USD price/package meanings, actual link attributes and placement conditions, turnaround commitments, metric provider/freshness and whether zero means missing for each metric. Review publisher eligibility and administrative/article-path placements before activation. Do not describe imported listings as vetted, permanent, Google-safe or guaranteed to improve rankings without genuine substantiation.

This report neither activates migration redirects nor creates per-domain SEO pages, indexable segment pages, payment integrations or checkout. Original WordPress URLs and public SEO migration remain separate Phase 4 work.
