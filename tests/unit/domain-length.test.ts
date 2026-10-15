import { expect, it } from "vitest";
import { domainLength } from "@/lib/tools/domain-length";
it("counts labels, case-normalizes and removes a final root dot", () => {
  expect(domainLength(" Shop.Example.COM. ")).toMatchObject({
    ascii: "shop.example.com",
    asciiCharacters: 16,
    withinLimits: true,
  });
});
it("measures IDNs in ASCII rather than treating Unicode length as DNS length", () => {
  expect(domainLength("bücher.de")).toMatchObject({
    ascii: "xn--bcher-kva.de",
    displayCharacters: 9,
    asciiCharacters: 16,
  });
});
it("checks label and full hostname boundaries independently", () => {
  expect(domainLength("a".repeat(63) + ".com").withinLimits).toBe(true);
  expect(domainLength("a".repeat(64) + ".com").withinLimits).toBe(false);
  const name = [
    "a".repeat(63),
    "b".repeat(63),
    "c".repeat(63),
    "d".repeat(61),
  ].join(".");
  expect(domainLength(name).asciiCharacters).toBe(253);
  expect(domainLength(name).withinLimits).toBe(true);
  expect(domainLength(name + "d").withinLimits).toBe(false);
});
it.each([
  "",
  "https://example.com",
  "example.com/path",
  "127.0.0.1",
  "0x7f000001",
  "example..com",
  "-bad.com",
  "a_b.com",
  "user@example.com",
  "example.com:443",
  "example%2ecom",
  "example.com?x",
  "example.com#x",
  "localhost",
])("rejects ambiguous or invalid input %s", (value) => {
  expect(() => domainLength(value)).toThrow();
});
