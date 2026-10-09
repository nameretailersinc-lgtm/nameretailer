import type { Metadata } from "next";
import { canonicalOrigin } from "./metadata";
const plain = (text: string) => text.replace(/\s+/g, " ").trim();
export function concise(text: string, limit: number) {
  const value = plain(text);
  return value.length <= limit ? value : value.slice(0, limit - 1).replace(/\s+\S*$/, "").trimEnd() + "…";
}
/** Complete route-level sharing fields; do not inherit homepage claims. */
export function pageMetadata(base: Metadata, path: string): Metadata {
  const raw = typeof base.title === "string" ? base.title : base.title && "absolute" in base.title ? base.title.absolute : "Name Retailer";
  const title = concise(String(raw), 60);
  const description = concise(base.description || "", 155);
  const canonical = base.alternates?.canonical || canonicalOrigin + path;
  const images = base.openGraph && "images" in base.openGraph && base.openGraph.images ? base.openGraph.images : [{url: `${canonicalOrigin}/01_hero_analytics_illustration.png`, width: 700, height: 475, alt: `${title} — Name Retailer`}];
  return {...base, title: {absolute: title}, description, alternates: {...base.alternates, canonical}, openGraph: {...base.openGraph, title, description, url: String(canonical), siteName: "Name Retailer", type: base.openGraph && "type" in base.openGraph ? base.openGraph.type : "website", images}, twitter: {...base.twitter, card: "summary_large_image", title, description, images: base.twitter && "images" in base.twitter && base.twitter.images ? base.twitter.images : [`${canonicalOrigin}/01_hero_analytics_illustration.png`]}};
}
