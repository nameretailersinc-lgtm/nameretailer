# Performance verification

Mobile Lighthouse CI covers home, the directory hub, technology and the budget directory, with three runs per URL. The median budgets are LCP ≤ 2,500 ms, CLS ≤ 0.1 and TBT ≤ 200 ms. TBT is a lab responsiveness proxy, not INP. Actual INP ≤ 200 ms requires interaction/field measurements and cannot be asserted from a Lighthouse navigation audit. Review Search Console/CrUX after deployment; no field result is invented here.

Run npm run measure:performance against a running production build with SEO_BASE_URL. PLAYWRIGHT_CHROME_PATH can select a locally installed Chrome. Run the build separately first, and preserve Lighthouse reports as evidence. Cache warming and a local server reduce network/TTFB variance; local results are not a production guarantee.

The rich placement editor is loaded only when its dialog is needed. First listing rows remain server rendered and hydrate from the same response. Tables are paginated (20 by default, at most 50 rows) rather than rendering the entire catalogue; virtualizing that short HTML table would remove crawlable rows without a demonstrated benefit. Images have fixed dimensions and slot-appropriate sizes, AVIF/WebP are enabled, device widths are capped at 1,920, and next/font supplies critical local font preloads. Below-fold decorative images use lazy loading. A catalogue query cache and timeouts bound repeated rendering work.

Record the actual lab results and any unresolved budget failures in SEO_CHANGELOG.md. GA4 and Search Console access are required to verify production measurement, consent and field Core Web Vitals.
