import { expect, it } from "vitest";
import {
  itemListNode,
  organizationNode,
  websiteNode,
  toolBreadcrumbs,
} from "@/lib/seo/json-ld";
const metrics = {
  da: 70,
  dr: 75,
  tf: null,
  ur: null,
  traffic: 900_000,
  referringDomains: null,
  backlinks: null,
  spamScore: 2,
};
it("uses internal listing URLs even when the listing is not indexable", () => {
  const schema = itemListNode([
    { domain: "https://www.example.com", category: "Business", metrics },
    { domain: "https://example.org", category: "General", metrics },
    {
      domain: "https://example.net",
      category: "Business",
      metrics: { ...metrics, traffic: null },
    },
  ]);
  expect(schema?.itemListElement).toEqual([
    {
      "@type": "ListItem",
      position: 1,
      name: "example.com",
      url: "https://nameretailer.com/publication/example-com/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "example.org",
      url: "https://nameretailer.com/publication/example-org/",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "example.net",
      url: "https://nameretailer.com/publication/example-net/",
    },
  ]);
  expect(
    itemListNode([{ domain: "invalid", category: "General", metrics }]),
  ).toBeNull();
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
