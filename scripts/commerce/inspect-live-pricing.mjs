/** Read-only inspection: no browser JS execution, cookies, authentication or forms. */
import { createHash } from "node:crypto";
const homepage = "https://nameretailer.com/";
const response = await fetch(homepage, {
  redirect: "error",
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Homepage GET returned ${response.status}`);
const html = await response.text();
const scripts = [
  ...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi),
].map((match) => new URL(match[1].replaceAll("&amp;", "&"), homepage).href);
const sameOriginPluginScripts = [
  ...new Set(
    scripts.filter(
      (url) =>
        new URL(url).origin === new URL(homepage).origin &&
        /custom.filters\/filter\.js/i.test(url),
    ),
  ),
];
const detailLinks = [
  ...new Set(
    [
      ...html.matchAll(
        /(?:href|data-url)=["']([^"']*link-details[^"']*)["']/gi,
      ),
    ].map((match) => match[1]),
  ),
];
console.log(
  JSON.stringify(
    {
      homepage,
      status: response.status,
      scripts: sameOriginPluginScripts,
      detailSample: detailLinks.slice(0, 1),
    },
    null,
    2,
  ),
);
function inspect(source, text) {
  const needles =
    /function\s+setupContentLengthSlider|function\s+setupPricingHandler|function\s+openArticleModal|articlePrice=parseFloat|articlePrice2=parseFloat|articlePrice3=parseFloat|Link \+ Article|Without Article|With Article|write\s*(?:an?\s*)?article|provide\s*(?:an?\s*)?article|writing|contentLength===750|Article_Price_3|article_option/gi;
  const seen = new Set();
  for (const match of text.matchAll(needles)) {
    const position = match.index;
    const lineStart = text.lastIndexOf("\n", position) + 1;
    const lineEnd = text.indexOf("\n", position);
    const snippet = text
      .slice(
        Math.max(lineStart, position - 200),
        Math.min(lineEnd < 0 ? text.length : lineEnd, position + 1000),
      )
      .trim();
    if (!seen.has(snippet)) {
      console.log(JSON.stringify({ source, match: match[0], snippet }));
      seen.add(snippet);
    }
    if (seen.size >= 20) break;
  }
}
inspect(homepage, html);
for (const url of sameOriginPluginScripts.slice(0, 1)) {
  const asset = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  if (!asset.ok) {
    console.log(JSON.stringify({ source: url, status: asset.status }));
    continue;
  }
  const javascript = await asset.text();
  console.log(
    JSON.stringify({
      source: url,
      status: asset.status,
      sha256: createHash("sha256").update(javascript).digest("hex"),
    }),
  );
  inspect(url, javascript);
  console.log(
    JSON.stringify(
      {
        source: url,
        labelLines: javascript
          .split("\n")
          .filter((line) =>
            /option-title|modal-subtitle|We handle|placeholder|upload-file|content_length|special-requirements/.test(
              line,
            ),
          )
          .slice(0, 20)
          .map((line) => line.trim().slice(0, 1600)),
      },
      null,
      2,
    ),
  );
}
for (const url of detailLinks.slice(0, 1)) {
  const target = new URL(url, homepage);
  if (target.origin !== new URL(homepage).origin) continue;
  const detail = await fetch(target, {
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
  console.log(
    JSON.stringify({
      detail: target.href,
      status: detail.status,
      location: detail.headers.get("location"),
    }),
  );
  if (detail.ok) inspect(target.href, await detail.text());
  if (
    detail.status === 301 &&
    detail.headers.get("location") === `${target.href}/`
  ) {
    const normalized = `${target.href}/`;
    const slashDetail = await fetch(normalized, {
      redirect: "manual",
      signal: AbortSignal.timeout(30000),
    });
    console.log(
      JSON.stringify({
        detail: normalized,
        status: slashDetail.status,
        location: slashDetail.headers.get("location"),
      }),
    );
    if (slashDetail.ok) inspect(normalized, await slashDetail.text());
  }
}
