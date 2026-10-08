import type { MetadataRoute } from "next";
import { canonicalOrigin } from "@/lib/seo/metadata";

const privatePaths = [
  "/admin/",
  "/api/",
  "/my-account/",
  "/cart/",
  "/checkout/",
  "/design-system/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: privatePaths }],
    sitemap: `${canonicalOrigin}/sitemap.xml`,
    host: canonicalOrigin,
  };
}
