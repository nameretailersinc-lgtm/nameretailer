import type { MetadataRoute } from "next";
import { canonicalOrigin } from "@/lib/seo/metadata";

// Public inventory endpoints the marketplace fetches while rendering. Googlebot
// must be able to fetch them to render listings; they carry no private data.
const renderAllow = ["/api/products/", "/api/products/facets/"];

const privatePaths = [
  "/admin/",
  "/api/",
  "/my-account/",
  "/custom-login/",
  "/cart/",
  "/checkout/",
  "/design-system/",
  ...[
    "q",
    "sort",
    "pageSize",
    "category",
    "country",
    "language",
    "minDa",
    "maxDa",
    "minDr",
    "maxDr",
    "minTraffic",
    "maxTraffic",
    "minPrice",
    "maxPrice",
  ].map((key) => `/*?*${key}=`),
];

// Search and answer-engine crawlers that fetch pages to cite them.
const aiCrawlers = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  // Optional owner choice: add specific AI crawler disallows here. Default is allow.
  return {
    rules: [
      { userAgent: "*", allow: ["/", ...renderAllow], disallow: privatePaths },
      {
        userAgent: aiCrawlers,
        allow: ["/", ...renderAllow],
        disallow: privatePaths,
      },
    ],
    sitemap: `${canonicalOrigin}/sitemap.xml`,
  };
}
