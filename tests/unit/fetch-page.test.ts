import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";

const mocks = vi.hoisted(() => ({ resolve4: vi.fn(), send: vi.fn() }));
vi.mock("@/lib/api", () => ({
  ApiError: class extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
    }
  },
}));
vi.mock("node:dns/promises", () => ({
  Resolver: class {
    resolve4 = mocks.resolve4;
    cancel() {}
  },
}));
vi.mock("node:https", () => ({ request: mocks.send }));
vi.mock("node:http", () => ({ request: mocks.send }));
import { fetchPage, pageUrl, publicIPv4 } from "@/lib/tools/fetch-page";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.resolve4.mockResolvedValue(["93.184.216.34"]);
});

function reply(
  status: number,
  headers: Record<string, string>,
  content = "<h1>Example</h1>",
) {
  mocks.send.mockImplementationOnce((_url, options, callback) => {
    expect(options.family).toBe(4);
    options.lookup("example.com", {}, (error: unknown, address: string) => {
      expect(error).toBeNull();
      expect(address).toBe("93.184.216.34");
    });
    const req = new EventEmitter() as EventEmitter & { end: () => void };
    req.end = () => {
      const res = Object.assign(new PassThrough(), {
        statusCode: status,
        headers,
      });
      callback(res);
      if (!res.destroyed) res.end(content);
    };
    return req;
  });
}

describe("public page fetch", () => {
  it.each(["93.184.216.34", "192.0.78.24", "203.0.178.81"])(
    "allows public address %s",
    (address) => expect(publicIPv4(address)).toBe(true),
  );
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.100.100.200",
    "0.0.0.0",
    "198.18.0.1",
    "224.0.0.1",
    "168.63.129.16",
    "::1",
    "::ffff:127.0.0.1",
  ])("rejects restricted address %s", (address) =>
    expect(publicIPv4(address)).toBe(false),
  );
  it.each([
    "file:///etc/passwd",
    "http://localhost",
    "http://127.1/",
    "http://2130706433/",
    "http://[::1]/",
    "http://user:pass@example.com/",
    "https://example.com:8080/",
  ])("rejects unsupported URL %s", (url) =>
    expect(() => pageUrl(url)).toThrow(),
  );
  it("fetches HTML with a pinned public address", async () => {
    reply(200, { "content-type": "text/html; charset=utf-8" });
    await expect(fetchPage("https://example.com/#section")).resolves.toEqual({
      html: "<h1>Example</h1>",
      url: "https://example.com/",
    });
  });
  it("blocks private DNS results before making a request", async () => {
    mocks.resolve4.mockResolvedValue(["10.0.0.1"]);
    await expect(fetchPage("https://example.com/")).rejects.toThrow(
      "publicly accessible",
    );
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("validates redirected destinations before fetching", async () => {
    reply(302, { location: "http://internal.example.com/" });
    mocks.resolve4
      .mockResolvedValueOnce(["93.184.216.34"])
      .mockResolvedValueOnce(["169.254.169.254"]);
    await expect(fetchPage("https://example.com/")).rejects.toThrow(
      "publicly accessible",
    );
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });
  it("follows relative redirects", async () => {
    reply(301, { location: "/final/" });
    reply(200, { "content-type": "text/html" });
    await expect(fetchPage("https://example.com/")).resolves.toMatchObject({
      url: "https://example.com/final/",
    });
  });
  it("rejects non-HTML responses", async () => {
    reply(200, { "content-type": "application/json" });
    await expect(fetchPage("https://example.com/")).rejects.toThrow(
      "must return",
    );
  });
  it("rejects oversized pages", async () => {
    reply(200, { "content-type": "text/html" }, "a".repeat(1_000_001));
    await expect(fetchPage("https://example.com/")).rejects.toThrow("1 MB");
  });
  it("reports upstream HTTP failures", async () => {
    reply(403, { "content-type": "text/html" });
    await expect(fetchPage("https://example.com/")).rejects.toThrow("HTTP 403");
  });
});
