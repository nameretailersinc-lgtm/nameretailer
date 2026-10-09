import { readFileSync } from "node:fs";
import { join } from "node:path";

export type CsvRedirect = {
  source: string;
  destination: string;
  statusCode: 301 | 302 | 307 | 308;
};

const allowed = new Set([301, 302, 307, 308]);

function parseLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      cells.push(cell);
      cell = "";
    } else cell += char;
  }
  cells.push(cell);
  return cells.map((value) => value.trim());
}

/**
 * Reads docs/redirect-map.csv (old_url,new_url,status,notes). Rows with an empty
 * new_url are ignored: unmapped URLs must return a real 404, never a guess. Only
 * path-style sources and same-site destinations are accepted.
 */
export function loadCsvRedirects(
  file = join(process.cwd(), "docs", "redirect-map.csv"),
): CsvRedirect[] {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return [];
  }
  const [header, ...rows] = text.split(/\r?\n/).filter((line) => line.trim());
  if (!header || parseLine(header).join() !== "old_url,new_url,status,notes")
    throw new Error("docs/redirect-map.csv: unexpected header row.");
  const seen = new Set<string>();
  const result: CsvRedirect[] = [];
  for (const row of rows) {
    const [source, destination, status] = parseLine(row);
    if (!source || !destination) continue;
    const statusCode = Number(status || 301);
    if (!allowed.has(statusCode))
      throw new Error(
        `docs/redirect-map.csv: ${source}: invalid status ${status}`,
      );
    if (!source.startsWith("/") || source.startsWith("//"))
      throw new Error(
        `docs/redirect-map.csv: ${source}: source must be a path`,
      );
    if (!/^(\/(?!\/)|https:\/\/nameretailer\.com\/)/.test(destination))
      throw new Error(
        `docs/redirect-map.csv: ${source}: destination must be on-site`,
      );
    if (source === destination || seen.has(source)) continue;
    seen.add(source);
    result.push({
      source,
      destination,
      statusCode: statusCode as CsvRedirect["statusCode"],
    });
  }
  return result;
}
