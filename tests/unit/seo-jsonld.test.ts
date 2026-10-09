import { expect, it } from "vitest";
import {
  itemListNode,
  organizationNode,
  websiteNode,
  toolBreadcrumbs,
} from "@/lib/seo/json-ld";
it("describes only visible list items with real URLs", () => {
  const schema = itemListNode([
    { domain: "https://www.example.com/" },
    { domain: "https://example.org/" },
  ]);
  expect(schema.numberOfItems).toBe(2);
  expect(schema.itemListElement).toEqual([
    {
      "@type": "ListItem",
      position: 1,
      name: "example.com",
      url: "https://www.example.com/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "example.org",
      url: "https://example.org/",
    },
  ]);
});
it("emits supplied organization contact facts without reviews or guessed profiles", () => {
  expect(organizationNode()).toMatchObject({
    name: "Name Retailer",
    logo: "https://nameretailer.com/logo.jpg",
    contactPoint: { email: "info@nameretailer.com" },
  });
  expect(organizationNode()).not.toHaveProperty("sameAs");
  expect(organizationNode()).not.toHaveProperty("aggregateRating");
  expect(websiteNode()).not.toHaveProperty("potentialAction");
});
it("matches the four-part visible tool breadcrumb", () => {
  expect(
    toolBreadcrumbs({
      slug: "word-counter",
      title: "Word counter",
      group: "Writing and text",
    }).itemListElement.map((item) => item.name),
  ).toEqual(["Home", "Tools", "Writing and text", "Word counter"]);
});
