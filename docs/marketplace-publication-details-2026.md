# Marketplace publication details and shortlist inspection

October 18, 2026. This phase continues the authorized marketplace improvements after [filter validation and search recovery](marketplace-recovery-2026.md). Work is confined to the publication dialog, shortlist inspection actions, their styles and browser regressions. Concurrent navigation/content changes are preserved.

## Resulting behavior

The prior publication dialog closed when users clicked its own empty padding, because its handler treated any click directly on the dialog element as a backdrop click. That bug was reproduced at 375px and 1280px. The background also remained scrollable; the mobile reproduction confirmed the document overflow remained `visible` while details were open.

The dialog now dismisses on a pointer gesture that both starts and ends outside its bounding rectangle. Interior padding clicks and drags beginning inside the dialog leave it open. Escape and the close button continue to work. Opening details locks background scrolling, preserves the previous root/body overflow, gutter and body padding, and compensates for the removed scrollbar. Closing restores those exact inline values and returns focus to the opener with `preventScroll`.

Each selected publication now has a **View details** action in both homepage and metric/range shortlists. It opens the same details dialog from the selected snapshot without navigating away or clearing the comparison. Closing returns focus to that particular action and leaves the shortlist count unchanged. Publication/profile links and the existing plan-placement destination remain intact. Shortlisted values remain snapshots, not reservations or refreshed quotations.

The dialog adds a concise explanation that its metrics and terms are supplied, with a link to the existing methodology. This helps users distinguish displayed listing values from confirmed availability, writing costs and editorial requirements. Dark-appearance QA found an existing low-contrast placement price; the price and the new source link now use the dialog's accessible light green in that appearance.

## Files and checks

Application changes: `components/marketplace/marketplace.tsx` and `app/products.css`. Browser regression: `tests/e2e/marketplace-publication-dialog.spec.ts`. Installed Next.js client-component and Link documentation was reviewed before changes. No routing, schema, metadata, publication indexability, product API, account, order, payment or catalogue data change is included.

The separate `.next-seo` production build includes TypeScript, static generation and secure standalone packaging. The unit suite passed **57 files / 579 tests** after the dialog and comparison changes. The final CSS correction affects only dark-dialog colors. Focused ESLint and browser outcomes are recorded in [the validation report](../reports/marketplace-publication-details-validation.json).

The final combined browser run passed **14 tests / 0 failed**: seven publication-dialog scenarios and all seven prior filter/recovery scenarios. Main dialog axe checks passed in light appearance at 375/1280px and dark appearance at 375px. The initial run exposed the dark-price contrast issue and an overly strict test assumption about native dialog focus moving to browser chrome; both were resolved before this final combined run.

Browser coverage includes interior clicks, Escape, close buttons, a real backdrop click, a drag from the interior to the backdrop, focus restoration, saved scroll styles, shortlist preservation on `/` and `/guest-post-by-dr/`, placement/source destinations, mobile overflow and light/dark dialog axe checks. Native modal keyboard navigation can transfer focus to browser chrome, leaving `document.activeElement` as body; the test permits that browser behavior and separately confirms that background page controls cannot receive focus while the modal is open. No custom keyboard trap is introduced.

All tests use read-only catalogue access and local comparison state. Payment/mail delivery, real publication fulfillment, field performance and Google indexing are outside this validation. No deployment, push or merge was performed. The development server and the other agent's build are preserved; this task's isolated QA server is stopped after verification.
