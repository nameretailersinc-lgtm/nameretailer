import { describe, expect, it } from "vitest";
import {
  normalizeProductDomain,
  parseUsdCents,
  validateProduct,
} from "@/lib/commerce/validation";

const product = () => ({
  externalId: null,
  domain: "https://publisher.com",
  language: "English",
  country: "United States",
  category: "Technology",
  priceCents: 101,
  currency: "USD",
  status: "draft",
  metrics: {
    da: null,
    dr: 51,
    tf: null,
    ur: null,
    traffic: null,
    referringDomains: null,
    backlinks: null,
    spamScore: null,
  },
  linkType: "",
  turnaround: "",
  requirements: "",
});

describe("publisher URL identities", () => {
  it("normalizes legacy HTTP, www and case without discarding meaningful paths", () => {
    expect(normalizeProductDomain(" HTTP://WWW.Publisher.COM/News/ ")).toBe(
      "https://publisher.com/News/",
    );
    expect(normalizeProductDomain("publisher.com/")).toBe(
      "https://publisher.com",
    );
    expect(normalizeProductDomain("publisher.com/News/%61")).toBe(
      "https://publisher.com/News/a",
    );
  });
  it("supports IDN domains using canonical ASCII DNS labels", () => {
    expect(normalizeProductDomain("https://bücher.de")).toBe(
      "https://xn--bcher-kva.de",
    );
  });
  it.each([
    "https://user:password@publisher.com",
    "https://publisher.com?source=1",
    "https://publisher.com/#fragment",
    "httpd://publisher.com",
    "javascript:alert(1)",
    "ftp://publisher.com",
    "//publisher.com",
    "https:///publisher.com",
    "https://publisher.com:443/",
    "https://127.0.0.1",
    "https://2130706433",
    "https://0x7f000001",
    "https://[::1]",
    "http://localhost",
    "https://machine.local",
    "https://machine.internal",
    "https://machine.localhost",
    "https://publisher.com\\@evil.com",
    "https://publisher.com\n",
    "https://publisher.com/A/../B",
    "https://publisher.com/%2e%2e/B",
    "https://publisher.com/%",
    "https://publisher.com/%0A",
    "https://publisher.com/%5c",
    "https://bad_label.com",
    "https://-invalid.com",
    "https://publisher.com.",
    "https://publisher.123",
  ])("rejects ambiguous or unsafe identity %s", (url) => {
    // Leading/trailing whitespace is deliberately trimmed; embedded controls are rejected.
    const candidate = url.endsWith("\n") ? `${url}path` : url;
    expect(() => normalizeProductDomain(candidate)).toThrow();
  });
});

describe("exact USD prices", () => {
  it.each([
    ["0.01", 1],
    ["0.29", 29],
    ["430.92", 43092],
    ["100", 10000],
    ["1.2", 120],
    ["001.05", 105],
  ])("converts %s exactly", (input, cents) => {
    expect(parseUsdCents(input)).toBe(cents);
  });
  it.each([
    "0",
    "0.00",
    "-1",
    "+1",
    "1e2",
    ".5",
    "1.",
    "1.234",
    "$12",
    "1,000.00",
    "Infinity",
    "90071992547410.00",
  ])("rejects unsupported %s", (input) => {
    expect(() => parseUsdCents(input)).toThrow();
  });
});

describe("product input validation", () => {
  it("keeps unavailable metrics distinct from real manual zero values", () => {
    const input = product();
    input.metrics.dr = 0;
    expect(validateProduct(input).metrics.dr).toBe(0);
    expect(validateProduct(input).metrics.traffic).toBeNull();
  });
  it("requires positive integer cents and bounded integer scores/counts", () => {
    expect(() => validateProduct({ ...product(), priceCents: 0 })).toThrow();
    expect(() =>
      validateProduct({ ...product(), priceCents: 100.1 }),
    ).toThrow();
    expect(() =>
      validateProduct({
        ...product(),
        metrics: { ...product().metrics, dr: 101 },
      }),
    ).toThrow();
    expect(() =>
      validateProduct({
        ...product(),
        metrics: { ...product().metrics, traffic: -1 },
      }),
    ).toThrow();
  });
  it("rejects HTML and source injection but treats formula-looking text as inert plain text", () => {
    expect(() =>
      validateProduct({
        ...product(),
        requirements: '<img src=x onerror="alert(1)">',
      }),
    ).toThrow();
    expect(() =>
      validateProduct({ ...product(), source: { token: "private" } }),
    ).toThrow();
    expect(
      validateProduct({
        ...product(),
        requirements: '=HYPERLINK("https://evil.com")',
      }).requirements,
    ).toBe('=HYPERLINK("https://evil.com")');
  });
});
