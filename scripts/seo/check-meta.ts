import assert from "node:assert/strict";
import { withProductionServer, pageHtml } from "./server";
import { publicRoutes } from "./routes";
import { bodyText } from "../../lib/cms/content";
await withProductionServer(async (base) => {
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  for (const path of await publicRoutes(base)) {
    const html = await pageHtml(base, path);
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const description = html.match(
      /<meta name="description" content="([^"]*)"/s,
    )?.[1];
    assert(title && description, `${path}: missing metadata`);
    assert(
      bodyText(title).length <= 60,
      `${path}: title too long (${bodyText(title).length})`,
    );
    assert(
      bodyText(description).length <= 155,
      `${path}: description too long (${bodyText(description).length})`,
    );
    assert(
      !titles.has(title),
      `${path}: duplicate title with ${titles.get(title)}`,
    );
    assert(
      !descriptions.has(description),
      `${path}: duplicate description with ${descriptions.get(description)}`,
    );
    titles.set(title, path);
    descriptions.set(description, path);
    assert.equal(
      [...html.matchAll(/<link rel="canonical"/g)].length,
      1,
      `${path}: must have one canonical`,
    );
    for (const key of [
      "og:title",
      "og:description",
      "og:image",
      "og:image:alt",
    ])
      assert.equal(
        [...html.matchAll(new RegExp(`<meta property="${key}"`, "g"))].length,
        1,
        `${path}: missing/duplicate ${key}`,
      );
    assert(
      html.includes(`property="og:title" content="${title}"`),
      `${path}: OG title differs`,
    );
    assert(
      html.includes(`name="twitter:title" content="${title}"`),
      `${path}: Twitter title differs`,
    );
    assert(
      html.includes(`property="og:description" content="${description}"`),
      `${path}: OG description differs`,
    );
    assert(
      html.includes(`name="twitter:description" content="${description}"`),
      `${path}: Twitter description differs`,
    );
  }
  console.log(
    `${titles.size} pages have unique metadata, canonicals and matching social tags.`,
  );
});
