import { createHash } from "node:crypto";
import { ZodError } from "zod";
import type { ImportIssue, ProductImportAnalysis, ProductInput } from "./types";
import {
  normalizeProductDomain,
  parseUsdCents,
  validateProduct,
} from "./validation";

export const PRODUCT_CSV_MAX_BYTES = 32 * 1024 * 1024;
export const PRODUCT_CSV_MAX_ROWS = 100000;
export const PRODUCT_CSV_HEADERS = [
  "id",
  "domain",
  "language",
  "Price",
  "Country",
  "da",
  "tf",
  "traffic",
  "referring_domains",
  "backlinks",
  "dr",
  "Article_Price",
  "Article_Price_2",
  "Article_Price_3",
  "ur",
  "Category",
  "date_added",
  "link_type",
  "Special_Requirements",
  "SpamScore",
  "Linktype",
  "TAT",
  "Title",
  "Description",
  "Keywords",
] as const;
const placeholder = [
  "1",
  "domain",
  "language",
  "0.00",
  "Country",
  "0",
  "0",
  "0",
  "0",
  "0",
  "0",
  "0.00",
  "0.00",
  "0.00",
  "0",
  "Category",
  "0000-00-00 00:00:00",
  "link_type",
  "Special_Requirements",
  "0",
  "Linktype",
  "TAT",
  "Title",
  "Description",
  "Keywords",
];

/** Strict RFC 4180 records, including embedded CRLF and escaped double quotes. */
export function* parseProductCsv(csv: string): Generator<string[]> {
  let field = "",
    row: string[] = [],
    quoted = false,
    closed = false;
  const input = csv.startsWith("\ufeff") ? csv.slice(1) : csv;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else field += ch;
      continue;
    }
    if (ch === '"') {
      if (field || closed)
        throw new Error("Unexpected quote in an unquoted CSV field.");
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
      closed = false;
    } else if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      if (row.length !== 1 || row[0] !== "") yield row;
      row = [];
      field = "";
      closed = false;
    } else {
      if (closed)
        throw new Error("Unexpected characters after a quoted CSV field.");
      field += ch;
    }
  }
  if (quoted) throw new Error("Unterminated quoted CSV field.");
  if (field || row.length || closed) {
    row.push(field);
    yield row;
  }
}

function metric(value: string, maximum: number): number | null {
  const raw = value.trim();
  if (!raw) return null;
  if (!/^\d+$/.test(raw))
    throw new Error("Metrics must be nonnegative decimal integers.");
  const number = Number(raw);
  if (!Number.isSafeInteger(number) || number > maximum)
    throw new Error(`Metric exceeds its supported range (maximum ${maximum}).`);
  return number === 0 ? null : number;
}

export function analyzeProductCsv(csv: string): ProductImportAnalysis {
  const result: ProductImportAnalysis = {
    rows: 0,
    valid: 0,
    skipped: 0,
    errors: 0,
    warnings: 0,
    issues: [],
    products: [],
    sha256: createHash("sha256").update(csv, "utf8").digest("hex"),
    issueCounts: {},
    fatal: false,
  };
  const issueCounts = result.issueCounts;
  const issue = (
    row: number,
    code: string,
    message: string,
    warning = false,
  ) => {
    if (warning) result.warnings++;
    else result.errors++;
    issueCounts[code] = (issueCounts[code] ?? 0) + 1;
    if (
      ["headers", "csv-syntax", "file-size", "row-limit", "columns"].includes(
        code,
      )
    )
      result.fatal = true;
    if (result.issues.length < 100)
      result.issues.push({ row, code, message } satisfies ImportIssue);
  };
  if (Buffer.byteLength(csv, "utf8") > PRODUCT_CSV_MAX_BYTES) {
    issue(0, "file-size", "CSV exceeds the 32 MiB limit.");
    return result;
  }
  const ids = new Map<string, number>(),
    domains = new Map<string, number>();
  const duplicateIds = new Set<string>(),
    duplicateDomains = new Set<string>();
  const hosts = new Set<string>();
  let headers: string[] | undefined;
  let unknownMetrics = 0,
    unavailableDates = 0,
    repeatedHosts = 0;
  try {
    for (const values of parseProductCsv(csv)) {
      if (!headers) {
        headers = values;
        if (
          new Set(headers).size !== headers.length ||
          headers.length !== PRODUCT_CSV_HEADERS.length ||
          PRODUCT_CSV_HEADERS.some((header) => !headers!.includes(header))
        ) {
          issue(
            1,
            "headers",
            "CSV must contain each of the 25 expected legacy columns exactly once.",
          );
          return result;
        }
        continue;
      }
      result.rows++;
      const row = result.rows + 1;
      if (result.rows > PRODUCT_CSV_MAX_ROWS) {
        issue(row, "row-limit", "CSV exceeds the 100,000 data-row limit.");
        break;
      }
      if (values.length !== headers.length) {
        issue(
          row,
          "columns",
          `Expected ${headers.length} columns; found ${values.length}.`,
        );
        continue;
      }
      const source = Object.fromEntries(
        headers.map((header, index) => [header, values[index]]),
      );
      if (
        PRODUCT_CSV_HEADERS.every(
          (header, index) => source[header] === placeholder[index],
        )
      ) {
        result.skipped++;
        continue;
      }
      const before = result.errors;
      let externalId = source.id.trim();
      if (!/^\d{1,128}$/.test(externalId) || BigInt(externalId || "0") <= 0n)
        issue(row, "id", "Legacy ID must be a positive decimal integer.");
      else {
        externalId = BigInt(externalId).toString();
        if (ids.has(externalId)) {
          issue(row, "duplicate-id", `Repeated legacy ID ${externalId}.`);
          if (!duplicateIds.has(externalId))
            issue(
              ids.get(externalId)!,
              "duplicate-id",
              `Legacy ID ${externalId} is repeated later; all conflicting rows are excluded.`,
            );
          duplicateIds.add(externalId);
        } else ids.set(externalId, row);
      }
      let domain = "",
        priceCents = 0;
      try {
        domain = normalizeProductDomain(source.domain);
        const hostname = new URL(domain).hostname;
        if (hosts.has(hostname)) repeatedHosts++;
        hosts.add(hostname);
        if (domains.has(domain)) {
          issue(
            row,
            "duplicate-domain",
            `Repeated canonical publisher URL ${domain}.`,
          );
          if (!duplicateDomains.has(domain))
            issue(
              domains.get(domain)!,
              "duplicate-domain",
              `Publisher URL ${domain} is repeated later; all conflicting rows are excluded.`,
            );
          duplicateDomains.add(domain);
        } else domains.set(domain, row);
      } catch (error) {
        issue(row, "domain", (error as Error).message);
      }
      try {
        priceCents = parseUsdCents(source.Price);
      } catch (error) {
        issue(row, "price", (error as Error).message);
      }
      const metrics = {} as ProductInput["metrics"];
      const mapping = {
        da: "da",
        dr: "dr",
        tf: "tf",
        ur: "ur",
        traffic: "traffic",
        referringDomains: "referring_domains",
        backlinks: "backlinks",
        spamScore: "SpamScore",
      } as const;
      for (const key of Object.keys(mapping) as Array<keyof typeof mapping>) {
        try {
          metrics[key] = metric(
            source[mapping[key]],
            ["traffic", "referringDomains", "backlinks"].includes(key)
              ? Number.MAX_SAFE_INTEGER
              : 100,
          );
          if (metrics[key] === null) unknownMetrics++;
        } catch (error) {
          issue(row, "metric", `${mapping[key]}: ${(error as Error).message}`);
        }
      }
      if (!source.date_added.trim() || source.date_added.startsWith("0000-"))
        unavailableDates++;
      else if (!Number.isFinite(Date.parse(source.date_added)))
        unavailableDates++;
      const primaryType = source.Linktype.trim(),
        secondaryType = source.link_type.trim();
      if (
        primaryType &&
        secondaryType &&
        primaryType.toLowerCase() !== secondaryType.toLowerCase()
      )
        issue(
          row,
          "link-type-conflict",
          "Linktype and link_type differ; Linktype retained as owner-supplied display text, not a guarantee.",
          true,
        );
      if (result.errors !== before) continue;
      try {
        const product = validateProduct({
          externalId,
          domain,
          priceCents,
          currency: "USD",
          status: "draft",
          metrics,
          language: source.language,
          country: source.Country,
          category: source.Category,
          linkType: primaryType || secondaryType,
          turnaround: source.TAT,
          requirements: source.Special_Requirements,
        });
        result.products.push({ ...product, source });
        result.valid++;
      } catch (error) {
        const message =
          error instanceof ZodError
            ? error.issues
                .map((item) => `${item.path.join(".")}: ${item.message}`)
                .join("; ")
            : "Invalid product data.";
        issue(row, "product", message);
      }
    }
  } catch (error) {
    issue(result.rows + 2, "csv-syntax", (error as Error).message);
  }
  if (!headers) issue(1, "headers", "CSV is empty.");
  result.products = result.products.filter(
    (product) =>
      !duplicateIds.has(product.externalId!) &&
      !duplicateDomains.has(product.domain),
  );
  result.valid = result.products.length;
  if (unknownMetrics)
    issue(
      0,
      "unknown-metrics",
      `${unknownMetrics} empty or zero metric cells normalize to unavailable; raw values remain private.`,
      true,
    );
  if (unavailableDates)
    issue(
      0,
      "invalid-dates",
      `${unavailableDates} source dates are missing or invalid and are not publication or measurement dates.`,
      true,
    );
  if (repeatedHosts)
    issue(
      0,
      "repeated-hosts",
      `${repeatedHosts} publisher URLs repeat an already listed hostname; distinct safe paths are preserved, not merged.`,
      true,
    );
  return result;
}
