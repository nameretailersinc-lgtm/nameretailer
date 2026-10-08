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
      { userAgent: "*", allow: "/", disallow: privatePaths },
      { userAgent: aiCrawlers, allow: "/", disallow: privatePaths },
    ],
    sitemap: `${canonicalOrigin}/sitemap.xml`,
    host: canonicalOrigin,
  };
}
