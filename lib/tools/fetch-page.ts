import { Resolver } from "node:dns/promises";
import { request } from "node:https";
import { request as httpRequest } from "node:http";
import { isIP } from "node:net";
import { ApiError } from "@/lib/api";

export function publicIPv4(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const [a, b, c] = address.split(".").map(Number);
  return !(
    address === "168.63.129.16" ||
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 &&
      (b === 168 ||
        (b === 0 && (c === 0 || c === 2)) ||
        (b === 88 && c === 99))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113)
  );
}

export function pageUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new ApiError(
      422,
      "Enter a full public URL starting with https:// or http://.",
    );
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    isIP(url.hostname.replace(/^\[|\]$/g, "")) ||
    !url.hostname.includes(".") ||
    url.hostname.endsWith(".")
  ) {
    throw new ApiError(
      422,
      "Use a public website domain with a standard HTTP or HTTPS port and no login details.",
    );
  }
  url.hash = "";
  return url;
}

export async function fetchPage(input: string) {
  if (input.length > 2048)
    throw new ApiError(422, "Use a URL shorter than 2,048 characters.");
  let url = pageUrl(input);
  const signal = AbortSignal.timeout(15000);
  for (let hop = 0; hop < 4; hop++) {
    const resolver = new Resolver({ timeout: 3000, tries: 1 });
    const cancel = () => resolver.cancel();
    signal.addEventListener("abort", cancel, { once: true });
    let addresses: string[];
    try {
      signal.throwIfAborted();
      addresses = await resolver.resolve4(url.hostname);
    } catch {
      throw new ApiError(
        422,
        "This website could not be resolved to a public IPv4 address.",
      );
    } finally {
      signal.removeEventListener("abort", cancel);
    }
    if (
      !addresses.length ||
      addresses.some((address) => !publicIPv4(address))
    ) {
      throw new ApiError(
        422,
        "Only publicly accessible websites can be checked.",
      );
    }
    const result = await new Promise<{ html?: string; location?: string }>(
      (resolve, reject) => {
        const send = url.protocol === "https:" ? request : httpRequest;
        const req = send(
          url,
          {
            signal,
            family: 4,
            // Pin the verified address; a second DNS lookup must not bypass validation.
            lookup: (_hostname, _options, callback) =>
              callback(null, addresses[0], 4),
            headers: {
              Accept: "text/html,application/xhtml+xml",
              "Accept-Encoding": "identity",
              "User-Agent": "NameRetailer-ReadinessChecker/1.0",
            },
          },
          (response) => {
            const status = response.statusCode || 0;
            if (
              [301, 302, 303, 307, 308].includes(status) &&
              response.headers.location
            ) {
              const location = response.headers.location;
              response.destroy();
              resolve({ location });
              return;
            }
            if (status < 200 || status >= 300) {
              response.destroy();
              reject(
                new ApiError(
                  422,
                  `The website returned HTTP ${status}. Try pasting its HTML instead.`,
                ),
              );
              return;
            }
            if (
              !/^(text\/html|application\/xhtml\+xml)(?:;|$)/i.test(
                response.headers["content-type"] || "",
              ) ||
              (response.headers["content-encoding"] &&
                response.headers["content-encoding"] !== "identity")
            ) {
              response.destroy();
              reject(
                new ApiError(
                  422,
                  "The URL must return uncompressed HTML. Try pasting the page HTML instead.",
                ),
              );
              return;
            }
            const chunks: Buffer[] = [];
            let bytes = 0;
            response.on("data", (chunk: Buffer) => {
              bytes += chunk.length;
              if (bytes > 1_000_000) {
                response.destroy();
                reject(
                  new ApiError(
                    413,
                    "This page exceeds the 1 MB limit. Paste a smaller HTML source instead.",
                  ),
                );
                return;
              }
              chunks.push(chunk);
            });
            response.on("error", () =>
              reject(
                new ApiError(
                  502,
                  "The website response was interrupted. Please try again.",
                ),
              ),
            );
            response.on("end", () =>
              resolve({ html: Buffer.concat(chunks).toString("utf8") }),
            );
          },
        );
        req.on("error", () =>
          reject(
            new ApiError(
              502,
              "The page could not be fetched or timed out. Try pasting its HTML instead.",
            ),
          ),
        );
        req.end();
      },
    );
    if (result.location) {
      url = pageUrl(new URL(result.location, url).href);
      continue;
    }
    return { html: result.html || "", url: url.href };
  }
  throw new ApiError(
    422,
    "The page redirects too many times. Enter the final page URL.",
  );
}
