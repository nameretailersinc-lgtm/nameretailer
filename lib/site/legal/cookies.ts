import type { PolicyBlock } from "@/components/site/policy-blocks";

/**
 * Owner-approved 2026-10-09: the Cookie Policy published on the previous site
 * (Wayback snapshot 2026-05-16). Sections 1, 2, 5 (browser settings), 6 and 7
 * keep the archived wording. Sections 3 and 4 are replaced with the cookies this
 * site actually sets, because the archived list (PHPSESSID, Google Analytics,
 * Google Ads, YouTube, Facebook) described the old WordPress site. The archived
 * ad opt-out links were dropped for the same reason. An email address was added
 * to Contact Us. Keep sections 3 and 4 in step with the code (lib/auth.ts,
 * lib/security/registration.ts, components/site/analytics.tsx).
 */
export const cookiesLastUpdated = "2026-10-09";
export const cookiePolicy: PolicyBlock[] = [
  {
    type: "p",
    text: "Welcome to Name Retailer.com, We are committed to protecting your privacy and ensuring transparency regarding how we use cookies and similar technologies on our website www.nameretailer.com . This Cookie Policy explains what cookies are, how we use them, and how you can control your cookie preferences.",
  },
  {
    type: "p",
    text: "By using our Website, you consent to the use of cookies as outlined in this policy. If you do not agree with the use of cookies, you may disable them through your browser settings, but this may impact the functionality of the Website.",
  },
  { type: "h2", text: "2. What Are Cookies?" },
  {
    type: "p",
    text: "Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They help improve your browsing experience by remembering your preferences and actions over time.",
  },
  {
    type: "p",
    text: "Cookies can be session cookies, which are deleted when you close your browser, or persistent cookies, which remain on your device until they expire or you delete them manually.",
  },
  { type: "h2", text: "3. How We Use Cookies" },
  { type: "p", text: "We use cookies for the following purposes:" },
  {
    type: "ul",
    items: [
      "Essential Cookies – These cookies are necessary for the Website to function properly. They keep you signed in to your account and protect sign-in and registration forms against forged requests. Without them, signing in and registering will not work.",
      "Third-Party Cookies – Some articles embed videos from YouTube (in its privacy-enhanced mode) or Vimeo. Those services may set their own cookies when you play a video.",
    ],
  },
  {
    type: "p",
    text: "We do not use advertising or marketing cookies. Browsing the marketplace without an account sets no cookies from Name Retailer. If we enable Google Analytics, it runs with cookie storage turned off and does not set analytics cookies; we will update this policy before that changes.",
  },
  { type: "h2", text: "4. Types of Cookies We Use" },
  {
    type: "p",
    text: "Below is a breakdown of the specific cookies we use:",
  },
  {
    type: "table",
    caption: "Cookies set by nameretailer.com",
    columns: ["Cookie", "Type", "Purpose", "Duration"],
    rows: [
      [
        "__Secure-next-auth.session-token",
        "Essential",
        "Keeps you signed in to your account",
        "8 hours",
      ],
      [
        "__Host-next-auth.csrf-token",
        "Essential",
        "Protects the sign-in form against forged requests",
        "Session",
      ],
      [
        "__Secure-next-auth.callback-url",
        "Essential",
        "Returns you to the page you were on after signing in",
        "Session",
      ],
      [
        "__Host-nr-registration",
        "Essential",
        "Protects the account registration form against forged requests",
        "1 hour",
      ],
    ],
  },
  { type: "h2", text: "5. How to Control Cookies" },
  {
    type: "p",
    text: "You have the right to accept or reject cookies. Here’s how you can manage them:",
  },
  { type: "h3", text: "Browser Settings" },
  {
    type: "p",
    text: "Most browsers allow you to block or delete cookies through their settings. Here are links to manage cookies in popular browsers:",
  },
  {
    type: "links",
    items: [
      [
        "Google Chrome – Manage Cookies",
        "https://support.google.com/chrome/answer/95647",
      ],
      [
        "Mozilla Firefox – Manage Cookies",
        "https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences",
      ],
      [
        "Safari – Manage Cookies",
        "https://support.apple.com/en-gb/guide/safari/sfri11471/mac",
      ],
      [
        "Microsoft Edge – Manage Cookies",
        "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
      ],
    ],
  },
  { type: "h2", text: "6. Updates to This Cookie Policy" },
  {
    type: "p",
    text: "We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. When we do, we will revise the “Last Updated” date at the top of this page. We encourage you to review this policy periodically.",
  },
  { type: "h2", text: "7. Contact Us" },
  {
    type: "p",
    text: "If you have any questions about this Cookie Policy, please contact us at:",
  },
  { type: "p", text: "Name Retailer" },
  { type: "p", text: "Email: info@nameretailer.com" },
  { type: "p", text: "Website: www.nameretailer.com" },
];
