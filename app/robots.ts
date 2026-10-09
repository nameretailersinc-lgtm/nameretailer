import type { MetadataRoute } from "next";
import { canonicalOrigin } from "@/lib/seo/metadata";

// Public inventory endpoints the marketplace fetches while rendering. Googlebot
// must be able to fetch them to render listings; they carry no private data.
const renderAllow = ["/api/products/", "/api/products/facets/"];

const privatePaths = [
  "/admin/",
  "/api/",
  "/my-account/",
  "/cart/",
  "/checkout/",
  "/design-system/",
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
