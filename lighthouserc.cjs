const base = (process.env.SEO_BASE_URL || "http://127.0.0.1:3215").replace(/\/$/, "");
module.exports = {
  ci: {
    assert:{assertions:{'largest-contentful-paint':['error',{maxNumericValue:2500,aggregationMethod:'median'}],'cumulative-layout-shift':['error',{maxNumericValue:0.1,aggregationMethod:'median'}],'total-blocking-time':['error',{maxNumericValue:200,aggregationMethod:'median'}]}},
    collect: {
      url: [
        `${base}/`,
        `${base}/guest-posting-sites-under-50/`,
        `${base}/technology-guest-posting-sites/`,
        `${base}/guest-posting-sites/`,
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
