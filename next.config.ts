import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/seo/redirect-map";
import { loadCsvRedirects } from "./lib/seo/redirect-csv";
const config: NextConfig = {
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  output: "standalone",
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [32, 48, 64, 80, 96, 128, 256, 384],
  },
  async redirects() {
    // docs/redirect-map.csv is owner-maintained; redirects defined in code win on conflict.
    const known = new Set(legacyRedirects.map(({ source }) => source));
    return [
      ...legacyRedirects.map(({ source, destination }) => ({
        source,
        destination,
        statusCode: 301 as const,
      })),
      ...loadCsvRedirects().filter(({ source }) => !known.has(source)),
    ];
  },
  outputFileTracingExcludes: {
    "/*": [
      "./.env",
      "./.env.*",
      "./.local/**",
      "./.npm-cache/**",
      "./uploads/**",
      "./docs/**",
      "./tests/**",
      "./.next-test/**",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};
export default config;
