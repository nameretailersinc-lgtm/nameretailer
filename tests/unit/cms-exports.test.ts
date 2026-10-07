import { describe, it, expect } from "vitest";
import { exportRecords } from "@/lib/cms/exports";
import type { CmsRecord } from "@/lib/cms/types";
const record: CmsRecord = {
  id: "test-record",
  collection: "content",
  title: '=Potential formula, "quoted" & <title>',
  slug: "test-export",
  status: "draft",
  ownerId: "test-owner",
  data: {
    type: "page",
    body: "<p>Unicode Café 😀 and CDATA ]]> boundary</p>",
    excerpt: "Two\nlines",
    seoTitle: "SEO title",
  },
  version: 3,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-02T00:00:00.000Z",
};
// Small RFC4180 reader verifies exported cell data, including embedded CR/LF and quotes.
function readCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (c === '"') {
      if (quoted && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if (c === "\r" && !quoted && csv[i + 1] === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i++;
    } else cell += c;
  }
  row.push(cell);
  rows.push(row);
  return rows;
}
describe("content portability exports", () => {
  it("round-trips complete records as versioned JSON without adding credentials", () => {
    const output = exportRecords([record], "json");
    expect(output.contentType).toContain("application/json");
    expect(JSON.parse(output.body)).toEqual({
      format: "nameretailer-cms",
      version: 1,
      records: [record],
    });
    expect(output.filename).toBe("nameretailer-records.json");
  });
  it("round-trips JSON-backed CSV cells and neutralizes spreadsheet formula fields", () => {
    const output = exportRecords([record], "csv");
    const [headers, cells] = readCsv(output.body);
    const row = Object.fromEntries(
      headers.map((header, i) => [header, cells[i]]),
    );
    expect(row.title).toBe("'" + record.title);
    expect(JSON.parse(row.data)).toEqual(record.data);
    expect(row.id).toBe(record.id);
    expect(row.version).toBe("3");
    expect(output.filename).toBe("nameretailer-records.csv");
  });
  it("exports valid namespace declarations, safe XML text and split CDATA, retaining full record metadata", () => {
    const output = exportRecords([record], "wxr");
    expect(output.body).toContain("<wp:wxr_version>1.2</wp:wxr_version>");
    expect(output.body).toContain("&amp; &lt;title&gt;");
    expect(output.body).toContain("]]]]><![CDATA[>");
    const captured = output.body.match(
      /<wp:meta_value>([\s\S]*?)<\/wp:meta_value>/,
    )![1];
    const json = captured
      .replace(/^<!\[CDATA\[/, "")
      .replace(/\]\]>$/, "")
      .replaceAll("]]]]><![CDATA[>", "]]>");
    expect(JSON.parse(json)).toEqual(record);
    expect(output.body).toContain("<wp:status>draft</wp:status>");
    expect(output.filename).toBe("nameretailer-content.xml");
  });
  it("uses actual scheduled dates for WordPress future-post portability and omits non-content entries", () => {
    const scheduled = {
      ...record,
      status: "scheduled",
      data: { ...record.data, scheduledAt: "2027-01-01T12:00:00.000Z" },
    };
    const output = exportRecords(
      [scheduled, { ...record, id: "lead", collection: "leads" }],
      "wxr",
    );
    expect(output.body).toContain("<wp:status>future</wp:status>");
    expect(output.body).toContain(
      "<wp:post_date_gmt>2027-01-01 12:00:00</wp:post_date_gmt>",
    );
    expect(output.body.match(/<item>/g)).toHaveLength(1);
  });
  it("removes XML 1.0-forbidden raw controls while retaining their escaped JSON metadata", () => {
    const changed = {
      ...record,
      title: "Bad\u0000 title",
      data: { ...record.data, excerpt: "bad\u0001 control" },
    };
    const xml = exportRecords([changed], "wxr").body;
    expect(xml).not.toContain("\u0000");
    expect(xml).not.toContain("\u0001");
    expect(xml).toContain("Bad\\u0000 title");
    expect(xml).toContain("bad\\u0001 control");
  });
  it("rejects unsupported formats and never constructs filenames from untrusted titles", () => {
    expect(() => exportRecords([record], "sql" as never)).toThrow(
      /Unsupported/,
    );
    for (const format of ["json", "csv", "wxr"] as const)
      expect(
        exportRecords([{ ...record, title: "../../secret" }], format).filename,
      ).toMatch(/^nameretailer-[a-z-]+\.(json|csv|xml)$/);
  });
});
