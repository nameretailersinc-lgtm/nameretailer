# Performance measurement

Run `npm run build`, then `npm run measure:performance`. The command obtains the official Lighthouse CI CLI through npm, starts the production app locally, and collects three mobile runs each for the homepage, a price directory, a buyer-guide draft and a blog article. Chrome and npm registry access are required. Use `CHROME_PATH` or `PLAYWRIGHT_CHROME_PATH` if Chrome is not discovered automatically.

The configuration is in `lighthouserc.cjs`. Confirm the selected blog URL exists in the deployed CMS; choose another actual published article if necessary. Set `SEO_BASE_URL` to measure an already running preview or deployed site instead of starting a local server. Use only public pages and do not add account cookies.

Raw HTML/JSON reports remain locally in `.lighthouseci/`. The reporter writes the measured LCP milliseconds, TBT milliseconds and CLS, with actual collection timestamps, to `.local/performance.json`. Both artifact directories are ignored by Git. Reports are not uploaded. No baseline score is asserted until measurements are collected under repeatable conditions.

TBT is a lab proxy for responsiveness, not a measurement of field INP. Compare three-run distributions using the same Chrome version, hardware, throttling and catalogue state; review field INP through Search Console/CrUX when available. A local MongoDB request or cold image optimization can affect results.

`npm run check:hygiene` checks raw production HTML for language, one main H1, heading-level skips, missing image alt attributes, excessive image widths and multiple image preloads. Source checks require explicit alt and sizes on Next images. Editorial review must confirm that informative alt text describes the actual image; decorative artwork intentionally has empty alt. Images are limited to a 1920px generated width and AVIF/WebP formats. Only hero artwork is preloaded, using the installed Next 16 `preload` API (the old `priority` prop is deprecated).

Configuration reference: [Lighthouse CI documentation](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md).
