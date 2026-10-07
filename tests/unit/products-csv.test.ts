import { describe, expect, it } from "vitest";
import {
  analyzeProductCsv,
  parseProductCsv,
  PRODUCT_CSV_HEADERS,
  PRODUCT_CSV_MAX_BYTES,
  PRODUCT_CSV_MAX_ROWS,
} from "@/lib/commerce/csv";

function record(changes: Record<string, string> = {}) {
  return {
    id: "2",
    domain: "https://publisher.com/",
    language: "English",
    Price: "430.92",
    Country: "United States",
    da: "53",
    tf: "0",
    traffic: "0",
    referring_domains: "0",
    backlinks: "0",
    dr: "71",
    Article_Price: "12.00",
    Article_Price_2: "20.00",
    Article_Price_3: "30.00",
    ur: "0",
    Category: "Agriculture",
    date_added: "0000-00-00 00:00:00",
    link_type: "",
    Special_Requirements: "",
    SpamScore: "1",
    Linktype: "01 DoFollow link",
    TAT: "6 days",
    Title: "Private advertising copy",
    Description: "Legacy description",
    Keywords: "",
    ...changes,
  } as Record<string, string>;
}
const quoted = (value: string) => `"${value.replaceAll('"', '""')}"`;
function file(
  rows: Record<string, string>[],
  headers: readonly string[] = PRODUCT_CSV_HEADERS,
) {
  return [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => quoted(row[header] ?? "")).join(","),
    ),
  ].join("\r\n");
}
const placeholder = record({
  id: "1",
  domain: "domain",
  language: "language",
  Price: "0.00",
  Country: "Country",
  da: "0",
  dr: "0",
  Category: "Category",
  link_type: "link_type",
  Special_Requirements: "Special_Requirements",
  SpamScore: "0",
  Linktype: "Linktype",
  TAT: "TAT",
  Title: "Title",
  Description: "Description",
  Keywords: "Keywords",
  Article_Price: "0.00",
  Article_Price_2: "0.00",
  Article_Price_3: "0.00",
});

describe("legacy CSV parser", () => {
  it("preserves quoted commas, escaped quotes, CRLF and final empty fields", () => {
    expect([
      ...parseProductCsv(
        '\ufeffa,b,c\r\n"one,two","say ""hello""\r\nnext",\r\n',
      ),
    ]).toEqual([
      ["a", "b", "c"],
      ["one,two", 'say "hello"\r\nnext', ""],
    ]);
  });
  it.each(['a,b\n"unfinished,b', 'a,b\nnot"quoted,b', 'a,b\n"done"oops,b'])(
    "rejects malformed quoting",
    (csv) => {
      expect(() => [...parseProductCsv(csv)]).toThrow();
    },
  );
  it("accepts UTF-8 BOM and alternate header order", () => {
    const result = analyzeProductCsv(
      `\ufeff${file([record()], [...PRODUCT_CSV_HEADERS].reverse())}`,
    );
    expect(result.valid).toBe(1);
    expect(result.errors).toBe(0);
  });
  it("rejects duplicate, missing, unexpected and wrong-case headers", () => {
    expect(
      analyzeProductCsv(
        file([record()], [...PRODUCT_CSV_HEADERS.slice(0, -1), "Title"]),
      ).issueCounts.headers,
    ).toBe(1);
    expect(
      analyzeProductCsv(file([record()], PRODUCT_CSV_HEADERS.slice(1))).errors,
    ).toBe(1);
    expect(
      analyzeProductCsv(
        file([record()], [...PRODUCT_CSV_HEADERS.slice(0, -1), "keywords"]),
      ).errors,
    ).toBe(1);
  });
  it("rejects inconsistent row sizes without losing subsequent valid rows", () => {
    const csv = `${file([])}\r\nwrong,size\r\n${file([record()]).split("\r\n")[1]}`;
    const result = analyzeProductCsv(csv);
    expect(result.rows).toBe(2);
    expect(result.valid).toBe(1);
    expect(result.issueCounts.columns).toBe(1);
    expect(result.fatal).toBe(true);
  });
});

describe("legacy product normalization", () => {
  it("imports actual placement price exactly, privately preserves all 25 source fields and forces draft", () => {
    const source = record({
      Description: "<script>alert(1)</script>\r\n=SUM(1,2)",
      Title: "Unverified guaranteed rankings",
    });
    const result = analyzeProductCsv(file([source]));
    expect(result.valid).toBe(1);
    expect(result.products[0].priceCents).toBe(43092);
    expect(result.products[0].status).toBe("draft");
    expect(result.products[0].source).toEqual(source);
    expect(result.products[0]).not.toHaveProperty("description");
    expect(result.products[0]).not.toHaveProperty("createdAt");
  });
  it("skips only the complete exact header placeholder", () => {
    const result = analyzeProductCsv(file([placeholder, record()]));
    expect(result.rows).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.valid).toBe(1);
    expect(result.errors).toBe(0);
    expect(
      analyzeProductCsv(file([{ ...placeholder, Title: "Altered" }])).skipped,
    ).toBe(0);
  });
  it("uses human-readable Linktype, retains alternate raw field, and marks conflicts", () => {
    const result = analyzeProductCsv(file([record({ link_type: "dofollow" })]));
    expect(result.products[0].linkType).toBe("01 DoFollow link");
    expect(result.products[0].source.link_type).toBe("dofollow");
    expect(result.issueCounts["link-type-conflict"]).toBe(1);
    expect(
      analyzeProductCsv(file([record({ Linktype: "", link_type: "nofollow" })]))
        .products[0].linkType,
    ).toBe("nofollow");
  });
  it("turns zero/empty legacy metrics into null and does not invent metric/source dates", () => {
    const result = analyzeProductCsv(
      file([record({ tf: "", TAT: "", Linktype: "" })]),
    );
    expect(result.products[0].metrics.tf).toBeNull();
    expect(result.products[0].metrics.traffic).toBeNull();
    expect(result.products[0].turnaround).toBe("");
    expect(result.products[0].linkType).toBe("");
    expect(result.issueCounts["invalid-dates"]).toBe(1);
  });
  it("excludes both conflicting canonical publisher URL rows, even different legacy IDs", () => {
    const result = analyzeProductCsv(
      file([record(), record({ id: "3", domain: "http://WWW.publisher.com" })]),
    );
    expect(result.valid).toBe(0);
    expect(result.products).toEqual([]);
    expect(result.issueCounts["duplicate-domain"]).toBe(2);
    expect(result.fatal).toBe(false);
  });
  it("excludes all duplicate IDs including leading-zero forms", () => {
    const result = analyzeProductCsv(
      file([
        record(),
        record({ id: "002", domain: "otherpublisher.com" }),
        record({ id: "4", domain: "uniquepublisher.com" }),
      ]),
    );
    expect(result.valid).toBe(1);
    expect(result.products[0].externalId).toBe("4");
    expect(result.issueCounts["duplicate-id"]).toBe(2);
  });
  it("preserves distinct same-host paths without merging them", () => {
    const result = analyzeProductCsv(
      file([
        record({ domain: "publisher.com/News" }),
        record({ id: "3", domain: "publisher.com/news" }),
      ]),
    );
    expect(result.valid).toBe(2);
    expect(result.errors).toBe(0);
    expect(result.issueCounts["repeated-hosts"]).toBe(1);
  });
  it.each<Array<Record<string, string>>[number]>([
    { Price: "0.00" },
    { Price: "1.234" },
    { dr: "101" },
    { traffic: "-1" },
    { da: "NaN" },
    { backlinks: "9007199254740992" },
    { id: "0" },
    { domain: "https://publisher.com?tracking=1" },
    { Special_Requirements: "<script>x</script>" },
  ])("excludes invalid row %j", (changes) => {
    const result = analyzeProductCsv(file([record(changes)]));
    expect(result.valid).toBe(0);
    expect(result.errors).toBeGreaterThan(0);
  });
  it("caps issue details but counts every error", () => {
    const result = analyzeProductCsv(
      file(
        Array.from({ length: 130 }, (_, index) =>
          record({
            id: String(index + 2),
            domain: `publisher${index}.com`,
            Price: "0",
          }),
        ),
      ),
    );
    expect(result.issueCounts.price).toBe(130);
    expect(result.errors).toBe(130);
    expect(result.issues).toHaveLength(100);
  });
  it("hashes exact upload bytes rather than normalized fields", () => {
    const csv = file([record()]);
    expect(analyzeProductCsv(csv).sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(analyzeProductCsv(`${csv}\r\n`).sha256).not.toBe(
      analyzeProductCsv(csv).sha256,
    );
  });
  it("reports empty and malformed files as fatal structural issues", () => {
    expect(analyzeProductCsv("").issueCounts.headers).toBe(1);
    expect(
      analyzeProductCsv(`${file([record()])}\r\n"unterminated`).issueCounts[
        "csv-syntax"
      ],
    ).toBe(1);
    expect(
      analyzeProductCsv(`${file([record()])}\r\n"unterminated`).fatal,
    ).toBe(true);
  });
  it("bounds upload bytes and rows independently of issue-detail limits", () => {
    const large = analyzeProductCsv("x".repeat(PRODUCT_CSV_MAX_BYTES + 1));
    expect(large.fatal).toBe(true);
    expect(large.issueCounts["file-size"]).toBe(1);
    const many = analyzeProductCsv(
      `${file([])}\n${"x\n".repeat(PRODUCT_CSV_MAX_ROWS + 1)}`,
    );
    expect(many.fatal).toBe(true);
    expect(many.issueCounts["row-limit"]).toBe(1);
    expect(many.issues.length).toBeLessThanOrEqual(100);
  });
});
