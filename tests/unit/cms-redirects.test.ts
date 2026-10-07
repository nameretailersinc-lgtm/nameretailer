import { describe, it, expect } from "vitest";
import {
  isProtectedRedirectPath,
  normalizeRedirectPath,
  parseRedirectCsv,
  redirectTargetPath,
  validateRedirects,
} from "@/lib/cms/redirects";
import { validateRecord } from "@/lib/cms/validation";
import type { RecordInput } from "@/lib/cms/types";
const redirect = (source: string, target: string): RecordInput => ({
  title: source,
  slug: "test-only",
  status: "draft",
  data: { source, target, statusCode: 301, enabled: false },
});
describe("stored redirect configuration (never activation)", () => {
  it("normalizes case, trailing slash and canonical target URLs", () => {
    expect(normalizeRedirectPath("/Old-Guide")).toBe("/old-guide/");
    expect(redirectTargetPath("https://nameretailer.com/New-Guide/")).toBe(
      "/new-guide/",
    );
    expect(normalizeRedirectPath("/")).toBe("/");
  });
  it.each([
    "/../admin",
    "/safe/%2E%2E/admin",
    "/%252f%252fexample.invalid",
    "//example.invalid",
    "/unsafe\\path",
    "/test?q=1",
    "/test#fragment",
    "/bad%zz",
    "https://attacker.invalid/",
  ])("rejects unsafe source %s", (source) =>
    expect(() => normalizeRedirectPath(source)).toThrow(),
  );
  it.each([
    "https://attacker.invalid/",
    "http://nameretailer.com/new/",
    "https://nameretailer.com/new/?token=secret",
    "https://nameretailer.com/new/#fragment",
    "https://user:pass@nameretailer.com/new/",
  ])("rejects unsafe target %s", (target) =>
    expect(() => redirectTargetPath(target)).toThrow(),
  );
  it("protects customer, payment, auth, API, media, admin and discovery routes in either direction", () => {
    for (const source of [
      "/admin/",
      "/api/account/",
      "/checkout/",
      "/cart/",
      "/my-account/",
      "/media/file.webp",
      "/custom-login/",
      "/link-details/buyer/",
      "/product/link-purchase/",
      "/design-system/",
      "/robots.txt",
      "/sitemap.xml",
      "/llms.txt",
      "/llms-full.txt",
    ]) {
      expect(isProtectedRedirectPath(source)).toBe(true);
      expect(() => validateRedirects([redirect(source, "/public/")])).toThrow(
        /cannot be managed/,
      );
      expect(() => validateRedirects([redirect("/public/", source)])).toThrow(
        /cannot be managed/,
      );
    }
    expect(isProtectedRedirectPath("/administrator-guide/")).toBe(false);
  });
  it("rejects self redirects, duplicates, loops and chains across disabled rows", () => {
    expect(() => validateRedirects([redirect("/a/", "/a/")])).toThrow(/differ/);
    expect(() =>
      validateRedirects([redirect("/a/", "/b/"), redirect("/A", "/c/")]),
    ).toThrow(/Duplicate/);
    expect(() =>
      validateRedirects([redirect("/a/", "/b/"), redirect("/b/", "/a/")]),
    ).toThrow(/loop/);
    expect(() =>
      validateRedirects([redirect("/a/", "/b/"), redirect("/b/", "/c/")]),
    ).toThrow(/chains/);
    expect(() =>
      validateRedirects([redirect("/a/", "/c/"), redirect("/b/", "/c/")]),
    ).not.toThrow();
  });
  it("keeps all imported redirects disabled and derives stable unique slugs from source", () => {
    const one = parseRedirectCsv(
      "source,target,statusCode\r\n/one/,/final/,301\r\n/two/,/final/,302",
    );
    const later = parseRedirectCsv(
      "source,target,statusCode\n/three/,/final/,301",
    );
    expect(new Set([...one, ...later].map((r) => r.slug)).size).toBe(3);
    expect(one[0].slug).toBe(
      parseRedirectCsv("source,target,statusCode\n/one/,/final/,301")[0].slug,
    );
    expect(one.every((r) => r.data.enabled === false)).toBe(true);
  });
  it("parses BOM, quoted commas, escaped quotes and embedded newlines atomically", () => {
    const rows = parseRedirectCsv(
      '\uFEFFsource,target,statusCode,title\r\n/one/,/final/,301,"A comma, and ""quote""\nnext line"',
    );
    expect(rows[0].title).toBe('A comma, and "quote"\nnext line');
    expect(() =>
      parseRedirectCsv(
        "source,target,statusCode\n/good/,/final/,301\n/bad/,/final/,999",
      ),
    ).toThrow(/row 3/);
  });
  it("rejects activation, malformed CSV and the migration proposal format", () => {
    for (const csv of [
      "source,target,statusCode,enabled\n/a/,/b/,301,true",
      "old_url,new_url,status,reason,source\n/a/,/b/,301,test,crawl",
      "source,target,statusCode\n/a/,/b/,301,extra",
      "source,source,statusCode\n/a/,/b/,301",
      'source,target,statusCode\n/a/,/b/,301\n"unclosed',
    ])
      expect(() => parseRedirectCsv(csv)).toThrow();
    expect(() =>
      validateRecord("redirects", {
        ...redirect("/a/", "/b/"),
        data: { ...redirect("/a/", "/b/").data, enabled: true },
      }),
    ).toThrow(/Phase 4/);
  });
});
