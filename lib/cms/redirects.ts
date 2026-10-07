import { createHash } from "node:crypto";
import type { CmsRecord, RecordInput } from "./types";

const protectedPrefixes = [
  "/admin",
  "/api",
  "/cart",
  "/checkout",
  "/my-account",
  "/media",
  "/custom-login",
  "/link-details",
  "/product",
  "/design-system",
];
const protectedFiles = new Set([
  "/robots.txt/",
  "/sitemap.xml/",
  "/llms.txt/",
  "/llms-full.txt/",
]);

export function normalizeRedirectPath(value: string): string {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\u0000-\u0020\u007f\\?#]/.test(value)
  )
    throw new Error(
      "Redirect source must be an absolute local path without query or fragment.",
    );
  let path = value;
  for (let i = 0; i < 4; i++) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(path);
    } catch {
      throw new Error("Redirect path contains invalid encoding.");
    }
    if (decoded === path) break;
    path = decoded;
  }
  if (
    /%|[\u0000-\u0020\u007f\\?#]/.test(path) ||
    path.startsWith("//") ||
    path.includes("//") ||
    path.split("/").some((p) => p === "." || p === "..")
  )
    throw new Error("Redirect path contains unsafe or ambiguous segments.");
  return path === "/" ? "/" : path.toLowerCase().replace(/\/+$/, "") + "/";
}

export function redirectTargetPath(value: string): string {
  let path = value;
  if (/^https?:\/\//i.test(value)) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error("Invalid redirect target.");
    }
    if (
      url.origin !== "https://nameretailer.com" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      /[\u0000-\u0020\u007f\\]/.test(value)
    )
      throw new Error(
        "Redirect targets must be local paths or canonical HTTPS Name Retailer URLs.",
      );
    path = url.pathname;
  }
  return normalizeRedirectPath(path);
}

export function isProtectedRedirectPath(value: string): boolean {
  const path = normalizeRedirectPath(value);
  return (
    protectedFiles.has(path) ||
    protectedPrefixes.some(
      (prefix) => path === prefix + "/" || path.startsWith(prefix + "/"),
    )
  );
}

export function validateRedirects(
  records: readonly (CmsRecord | RecordInput)[],
): void {
  const entries = records
    .filter((r) => !("collection" in r) || r.collection === "redirects")
    .filter((r) => r.status !== "archived");
  const graph = new Map<string, string>();
  for (const record of entries) {
    const { source, target, statusCode } = record.data;
    if (
      typeof source !== "string" ||
      typeof target !== "string" ||
      (statusCode !== 301 && statusCode !== 302)
    )
      throw new Error(
        "Each redirect requires source, target and statusCode 301 or 302.",
      );
    const from = normalizeRedirectPath(source),
      to = redirectTargetPath(target);
    if (isProtectedRedirectPath(from) || isProtectedRedirectPath(to))
      throw new Error(
        "Customer, payment, admin, API and media routes cannot be managed through SEO redirects.",
      );
    if (from === to) throw new Error("Redirect source and target must differ.");
    if (graph.has(from)) throw new Error("Duplicate redirect source.");
    graph.set(from, to);
  }
  for (const [source, target] of graph) {
    const visited = new Set([source]);
    let next: string | undefined = target;
    let steps = 0;
    while (next && graph.has(next)) {
      if (visited.has(next)) throw new Error("Redirect loop detected.");
      visited.add(next);
      steps++;
      next = graph.get(next);
    }
    if (steps)
      throw new Error(
        "Redirect chains are not allowed; point every source directly to the final destination.",
      );
  }
}

/** RFC4180-style parser: all rows validate before callers receive anything to save. */
function csvRows(csv: string): string[][] {
  if (csv.length > 2_000_000) throw new Error("Redirect CSV is too large.");
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  csv = csv.replace(/^\uFEFF/, "");
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (quoted) {
      if (c === '"' && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        closed = true;
      } else cell += c;
    } else if (c === '"') {
      if (cell || closed) throw new Error("Invalid CSV quote.");
      quoted = true;
    } else if (c === "," || c === "\n" || c === "\r") {
      row.push(cell);
      cell = "";
      closed = false;
      if (c !== ",") {
        if (c === "\r" && csv[i + 1] === "\n") i++;
        if (row.some((v) => v.trim())) rows.push(row);
        row = [];
      }
    } else {
      if (closed) throw new Error("Invalid text after CSV quote.");
      cell += c;
    }
  }
  if (quoted) throw new Error("Unclosed CSV quote.");
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}

export function parseRedirectCsv(csv: string): RecordInput[] {
  const rows = csvRows(csv);
  if (rows.length < 2)
    throw new Error("CSV needs a header and at least one redirect.");
  const headers = rows.shift()!.map((h) => h.trim());
  const allowed = new Set([
    "source",
    "target",
    "statusCode",
    "title",
    "slug",
    "status",
    "enabled",
  ]);
  if (
    new Set(headers).size !== headers.length ||
    headers.some((h) => !allowed.has(h)) ||
    !["source", "target", "statusCode"].every((h) => headers.includes(h))
  )
    throw new Error(
      "CSV columns must include source,target,statusCode; optional title,slug,status,enabled. Migration proposal CSV is not an activation import.",
    );
  if (rows.length > 1000)
    throw new Error("Import at most 1,000 redirects at once.");
  const records = rows.map((row, index): RecordInput => {
    if (row.length !== headers.length)
      throw new Error(`CSV row ${index + 2} has the wrong number of fields.`);
    const values = Object.fromEntries(
      headers.map((h, i) => [h, row[i].trim()]),
    );
    if (
      !/^(301|302)$/.test(values.statusCode) ||
      (values.enabled && values.enabled !== "false")
    )
      throw new Error(
        `CSV row ${index + 2} has an invalid status or tries to activate a redirect. Phase 3 imports disabled configuration only.`,
      );
    if (values.status && !["draft", "active"].includes(values.status))
      throw new Error(`CSV row ${index + 2} has an invalid record status.`);
    const source = normalizeRedirectPath(values.source),
      target = redirectTargetPath(values.target);
    return {
      title: values.title || source,
      slug:
        values.slug ||
        `redirect-${createHash("sha256").update(source).digest("hex").slice(0, 20)}`,
      status: values.status || "draft",
      data: {
        source,
        target,
        statusCode: Number(values.statusCode),
        enabled: false,
      },
    };
  });
  validateRedirects(records);
  return records;
}
