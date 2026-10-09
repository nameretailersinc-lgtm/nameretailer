import { canonicalOrigin } from "./origin";
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}
export function breadcrumbSchema(items: Array<[name: string, path: string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: canonicalOrigin + path,
    })),
  };
}
export function itemListNode(items: ReadonlyArray<{ domain: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: new URL(item.domain).hostname.replace(/^www\./, ""),
      url: item.domain,
    })),
  };
}
export function organizationNode() {
  // TODO(owner): approved legal identity and real sameAs profiles; do not guess.
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${canonicalOrigin}/#organization`,
    name: "Name Retailer",
    url: `${canonicalOrigin}/`,
    logo: `${canonicalOrigin}/logo.jpg`,
    email: "info@nameretailer.com",
    contactPoint: { "@type": "ContactPoint", email: "info@nameretailer.com" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "26 - G Hamriyah Freezone",
      addressLocality: "Sharjah",
      addressCountry: "AE",
    },
  };
}
export function websiteNode() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${canonicalOrigin}/#website`,
    name: "Name Retailer",
    url: `${canonicalOrigin}/`,
    publisher: { "@id": `${canonicalOrigin}/#organization` },
  };
}
export function toolBreadcrumbs(tool: {
  slug: string;
  title: string;
  group: string;
}) {
  return breadcrumbSchema([
    ["Home", "/"],
    ["Tools", "/seo-tools/"],
    [
      tool.group,
      `/seo-tools/#${tool.group.toLowerCase().replaceAll(" ", "-")}`,
    ],
    [tool.title, `/${tool.slug}/`],
  ]);
}
