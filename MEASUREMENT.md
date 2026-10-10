# Measurement setup and event definitions

GA4 is enabled only by a valid NEXT_PUBLIC_GA4_ID and explicit analytics consent. Google scripts are absent before acceptance and on decline. Revoke through /cookies/. The choice persists in local storage until changed/cleared. Advertising consent stays denied. No form input, email, name, search query, account identifier or query string is sent by custom events. Disable automatic enhanced-measurement events in the GA4 web-stream settings to keep collection limited to these explicit events and sanitized page views.

| Event | Trigger |
| --- | --- |
| publication_view | A public internal publication route is viewed with consent |
| add_to_plan | Existing cart PUT succeeds; this is a plan, not a purchase |
| shortlist | An item is actually added/removed; capacity failures emit nothing |
| filter_use | A user changes a filter; only allowed field names, no values |
| sign_up | Registration endpoint accepts the request (202). Its privacy-preserving API does not disclose whether a new account was created; registration_state=request_accepted. Do not count this as verified new customers. |
| contact_submit | Hook exported for confirmed form delivery. Contact currently uses email links; no fake submission is emitted. |

The contact-submit hook requires a real delivery handler before it can be connected. Changing the existing account API to expose account creation or adding a contact backend is outside this request’s contract restrictions; see TODO_CONTENT.md. No auth, cart behavior or API contracts were modified.

Set GOOGLE_SITE_VERIFICATION (existing layout support) from Search Console and submit /sitemap.xml after deployment. Verify canonical selection, exclusions, coverage, consent behavior and received events in the owner’s accounts. No tokens or property access are invented. Search Console field Core Web Vitals/CrUX, including INP, require deployed traffic.

Run npm run report:daily-health against SEO_BASE_URL for a dated status/sitemap/redirect report. Schedule it in the deployment system; no external monitoring account or scheduler is assumed.
