import { canonicalOrigin } from "./origin";
import { organization } from '../config/organization';
import {
  publicationHost,
  publicationPath,
} from "../commerce/publication-pages";
import { authorByName, authorPath } from "../site/authors";
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
/** Item URLs match the internal detail links shown in the marketplace. */
export function itemListNode(
  items: ReadonlyArray<Parameters<typeof publicationPath>[0]>,
) {
  const listed = items.flatMap((item) => {
    const path = publicationPath(item);
    return path
      ? [
          {
            name: publicationHost(item.domain, false)!,
            url: canonicalOrigin + path,
          },
        ]
      : [];
  });
  if (!listed.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: listed.length,
    itemListElement: listed.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
export function organizationNode() {
  // TODO(owner): approved legal identity and real sameAs profiles; do not guess.
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${canonicalOrigin}/#organization`,
    name: organization.name,
    // Owner-confirmed 2026-10-09; the data controller named in the privacy policy.
    legalName: organization.legalName,
    url: `${canonicalOrigin}/`,
    logo: organization.logo,
    email: organization.email,
    contactPoint: { "@type": "ContactPoint", email: organization.email },
    ...(organization.sameAs.length ? {sameAs:organization.sameAs} : {}),
    address: {
      "@type": "PostalAddress",
      ...organization.address,
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
/** Article markup only for approved guides with owner-supplied author and publication date. */
export function buyerGuideArticleNode(guide: {
  slug: string;
  title: string;
  approved: boolean;
  author?: string;
  publishedAt?: string;
  updatedAt: string;
  image: string;
}) {
  if (
    !guide.approved ||
    !guide.author ||
    !guide.publishedAt ||
    !Number.isFinite(Date.parse(guide.publishedAt))
  )
    return null;
  const url = `${canonicalOrigin}/guides/${guide.slug}/`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: guide.title,
    mainEntityOfPage: url,
    author: {
      "@type": "Person",
      name: guide.author,
      url:
        canonicalOrigin +
        (authorByName(guide.author)
          ? authorPath(authorByName(guide.author)!)
          : "/about/"),
    },
    publisher: { "@id": `${canonicalOrigin}/#organization` },
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    image: canonicalOrigin + guide.image,
  };
}
