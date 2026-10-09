const base = (process.env.SEO_BASE_URL || "http://127.0.0.1:3215").replace(/\/$/, "");
module.exports = {
  ci: {
    collect: {
      url: [
        `${base}/`,
        `${base}/price-0-to-50/`,
        `${base}/guides/guest-post-cost/`,
        `${base}/blog/how-to-choose-a-guest-post-publication-for-your-audience/`,
      ],
      numberOfRuns: 3,
      ...(!process.env.SEO_BASE_URL ? {
        startServerCommand: "npm run start -- -p 3215 -H 127.0.0.1",
        startServerReadyPattern: "Ready",
        startServerReadyTimeout: 30000,
      } : {}),
      ...(process.env.PLAYWRIGHT_CHROME_PATH ? { chromePath: process.env.PLAYWRIGHT_CHROME_PATH } : {}),
      settings: { onlyCategories: ["performance"], formFactor: "mobile" },
    },
  },
};
