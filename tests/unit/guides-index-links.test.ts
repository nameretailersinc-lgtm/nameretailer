import { createElement } from "react";
import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AllBuyerGuides } from "@/components/site/buyer-guide-links";
import { buyerGuides } from "@/lib/site/buyer-guides";

it("links every approved guide with a server-rendered anchor, matching the sitemap set", () => {
  const html = renderToStaticMarkup(createElement(AllBuyerGuides));
  const approved = buyerGuides.filter((guide) => guide.approved);
  expect(approved.length).toBeGreaterThan(0);
  for (const guide of approved)
    expect(html).toMatch(new RegExp(`href="/guides/${guide.slug}/?"`));
});
