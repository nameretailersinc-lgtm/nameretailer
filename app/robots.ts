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
];

// Public filter URLs must be crawlable for bots to see their noindex and clean
// canonical. Blocking them here can leave discovered URLs indexed without content.
// The shared facetMetadata policy prevents indexing arbitrary combinations.

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
