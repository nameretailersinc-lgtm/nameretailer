import {validateJsonLd} from "../../lib/seo/validate-jsonld";
import assert from "node:assert/strict";
import { withProductionServer, pageHtml, visibleHtml } from "./server";
import { publicRoutes } from "./routes";
import { bodyText } from "../../lib/cms/content";
type Node = Record<string, unknown>;
function nodes(value: unknown): Node[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== "object") return [];
  const node = value as Node;
  return [node, ...Object.values(node).flatMap(nodes)];
}
const text = (html: string) => bodyText(html).replace(/\s+/g, " ").trim();
await withProductionServer(async (base) => {
  let pages = 0;
  for (const path of await publicRoutes(base)) {
    const html = await pageHtml(base, path);
    const visible = visibleHtml(html);
    const main =
      visible.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || visible;
    const content = text(main);
    const schemas = [
      ...html.matchAll(
        /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ].flatMap((match) => { const value=JSON.parse(match[1]);assert.deepEqual(validateJsonLd(value,path),[],`${path}: invalid JSON-LD`);return nodes(value); });
    assert(
      schemas.some(
        (node) =>
          node["@type"] === "Organization" &&
          String(node["@id"]).endsWith("#organization"),
      ),
      `${path}: missing organization`,
    );
    const breadcrumbs = schemas.filter(
      (node) => node["@type"] === "BreadcrumbList",
    );
    const trail = main.match(
      /<nav\b[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/,
    )?.[1];
    if (trail) {
      assert.equal(
        breadcrumbs.length,
        1,
        `${path}: must have one breadcrumb schema`,
      );
      const visibleNames = [
        ...trail
          .replace(/<span\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g, "")
          .matchAll(/<(?:a|span)\b[^>]*>([\s\S]*?)<\/(?:a|span)>/g),
      ]
        .map((match) => text(match[1]))
        .filter(Boolean);
      const items = breadcrumbs[0].itemListElement as Node[];
      assert.deepEqual(
        items.map((item) => item.name),
        visibleNames,
        `${path}: breadcrumb differs from visible trail`,
      );
      for (const [index, item] of items.entries())
        assert.equal(item.position, index + 1);
    }
    for (const node of schemas) {
      const type = node["@type"];
      assert(
        !["Review", "AggregateRating"].includes(String(type)),
        `${path}: unsupported review/rating markup`,
      );
      if (type === "WebSite")
        assert.equal(node.url, "https://nameretailer.com/", `${path}: inconsistent WebSite URL`);
      if (type === "ItemList") {
        const items = node.itemListElement as Node[];
        assert.equal(
          node.numberOfItems,
          items.length,
          `${path}: ItemList count must equal visible items`,
        );
        for (const [index, item] of items.entries()) {
          assert.equal(item.position, index + 1);
          assert(
            content.includes(String(item.name)),
            `${path}: list name absent from visible content`,
          );
          assert(
            (main.includes(`href="${String(item.url).replaceAll("&", "&amp;")}"`) || main.includes(`href="${new URL(String(item.url)).pathname}"`)),
            `${path}: ItemList URL absent from visible links`,
          );
        }
      }
      if (type === "Question") {
        const answer = node.acceptedAnswer as Node;
        assert(
          content.includes(text(String(node.name))),
          `${path}: FAQ question absent`,
        );
        assert(
          answer && content.includes(text(String(answer.text))),
          `${path}: FAQ answer absent`,
        );
      }
      if (type === "BlogPosting" || type === "Article") {
        for (const key of [
          "headline",
          "author",
          "publisher",
          "image",
          "datePublished",
          "dateModified",
        ])
          assert(node[key], `${path}: Article missing ${key}`);
        assert(
          content.includes(String(node.headline)),
          `${path}: headline absent`,
        );
        for (const key of ["datePublished", "dateModified"])
          assert(
            html.includes(`dateTime="${node[key]}"`) ||
              html.includes(`datetime="${node[key]}"`),
            `${path}: schema date not visibly rendered`,
          );
      }
    }
    pages++;
  }
  console.log(
    `${pages} pages have valid JSON-LD and matching breadcrumbs, lists, FAQ answers and article fields.`,
  );
});
