import type { CmsRecord } from "./types";

type ExportFormat = "json" | "csv" | "wxr";
function csvCell(value: unknown): string {
  let cell = typeof value === "string" ? value : JSON.stringify(value ?? "");
  // A JSON-backed CSV remains round-trippable; formula-leading plain fields are prefixed for spreadsheet safety.
  if (/^[\s]*[=+@-]/.test(cell)) cell = "'" + cell;
  return '"' + cell.replaceAll('"', '""') + '"';
}
const xmlText = (s: unknown) =>
  String(s ?? "").replace(
    /[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu,
    "",
  );
const xml = (s: unknown) =>
  xmlText(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
const cdata = (s: unknown) =>
  "<![CDATA[" + xmlText(s).replaceAll("]]>", "]]]]><![CDATA[>") + "]]>";

export function exportRecords(
  records: readonly CmsRecord[],
  format: ExportFormat,
): { body: string; contentType: string; filename: string } {
  if (format === "json")
    return {
      body: JSON.stringify(
        { format: "nameretailer-cms", version: 1, records },
        null,
        2,
      ),
      contentType: "application/json; charset=utf-8",
      filename: "nameretailer-records.json",
    };
  if (format === "csv") {
    const columns = [
      "id",
      "collection",
      "title",
      "slug",
      "status",
      "ownerId",
      "data",
      "version",
      "createdAt",
      "updatedAt",
    ] as const;
    const body = [
      columns.join(","),
      ...records.map((record) =>
        columns.map((column) => csvCell(record[column])).join(","),
      ),
    ].join("\r\n");
    return {
      body,
      contentType: "text/csv; charset=utf-8",
      filename: "nameretailer-records.csv",
    };
  }
  if (format !== "wxr") throw new Error("Unsupported export format.");
  // WXR is a content portability export, not a backup of users, secret credentials, orders or the complete CMS.
  const authors = new Map(
    records.filter((r) => r.collection === "authors").map((r) => [r.id, r]),
  );
  const content = records.filter((r) => r.collection === "content");
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:wp="http://wordpress.org/export/1.2/">\n<channel><title>Name Retailer content export</title><link>https://nameretailer.com/</link><wp:wxr_version>1.2</wp:wxr_version><wp:base_site_url>https://nameretailer.com/</wp:base_site_url><wp:base_blog_url>https://nameretailer.com/</wp:base_blog_url>\n` +
    [...authors.values()]
      .map(
        (a, i) =>
          `<wp:author><wp:author_id>${i + 1}</wp:author_id><wp:author_login>${cdata(a.slug)}</wp:author_login><wp:author_display_name>${cdata(a.data.name || a.title)}</wp:author_display_name></wp:author>`,
      )
      .join("\n") +
    "\n" +
    content
      .map((record, i) => {
        const author = authors.get(String(record.data.authorId ?? ""));
        const dateValue =
          record.status === "scheduled"
            ? record.data.scheduledAt
            : record.data.publishedAt;
        const date = typeof dateValue === "string" ? new Date(dateValue) : null;
        const valid = date && Number.isFinite(date.getTime());
        const status =
          record.status === "published"
            ? "publish"
            : record.status === "scheduled"
              ? "future"
              : record.status === "archived"
                ? "trash"
                : "draft";
        const payload = cdata(JSON.stringify(record));
        return `<item><title>${xml(record.title)}</title><link>${xml("https://nameretailer.com/" + record.slug + "/")}</link>${author ? "<dc:creator>" + cdata(author.slug) + "</dc:creator>" : ""}<content:encoded>${cdata(record.data.body)}</content:encoded><excerpt:encoded>${cdata(record.data.excerpt)}</excerpt:encoded><wp:post_id>${i + 1}</wp:post_id><wp:post_name>${cdata(record.slug)}</wp:post_name><wp:post_type>${record.data.type === "post" ? "post" : "page"}</wp:post_type><wp:status>${status}</wp:status>${valid ? "<wp:post_date_gmt>" + date.toISOString().slice(0, 19).replace("T", " ") + "</wp:post_date_gmt>" : ""}<wp:postmeta><wp:meta_key>_nameretailer_record</wp:meta_key><wp:meta_value>${payload}</wp:meta_value></wp:postmeta></item>`;
      })
      .join("\n") +
    "\n</channel></rss>";
  return {
    body,
    contentType: "application/xml; charset=utf-8",
    filename: "nameretailer-content.xml",
  };
}
