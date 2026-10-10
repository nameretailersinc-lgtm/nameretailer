import { buyerQuestions } from "./faq";
export type SiteSection =
  | "home"
  | "marketplace"
  | "tools"
  | "guides"
  | "about"
  | "help"
  | "account"
  | "cart";
export type InformationPage = {
  title: string;
  label: string;
  description: string;
  active: SiteSection;
  image: string;
  sections: Array<{ title: string; body: string }>;
  links: Array<{ title: string; description: string; href: string }>;
};
export const informationPages = {
  "guest-post-marketplace": {
    title: "Guest post sites by DA, DR, traffic and price",
    label: "Marketplace directory",
    active: "marketplace",
    image: "/15_laptop_dashboard_illustration.png",
    description:
      "Go straight to the slice of the catalogue you need: Domain Authority bands, Domain Rating bands, traffic tiers and price brackets, each a live list of active publications.",
    sections: [
      {
        title: "Audience before scores",
        body: "Start with topic, country and language. Supplied scores and traffic estimates can help comparison, but do not establish audience fit, editorial quality or guaranteed results.",
      },
      {
        title: "One catalog, useful views",
        body: "The original site's DA, DR, traffic and price menu groups now link to bounded catalog views at their legacy range URLs. Those pages keep their range when you sort, paginate or reset additional filters. Metrics remain supplied estimates; missing values are not treated as zero. Other legacy migration and redirects remain separate work.",
      },
    ],
    links: [
      {
        title: "Domain Rating",
        description:
          "Review supplied DR alongside placement and audience details.",
        href: "/guest-post-by-dr/",
      },
      {
        title: "Domain Authority",
        description:
          "Show listings with a supplied DA score of at least 1; missing scores remain excluded.",
        href: "/?minDa=1",
      },
      {
        title: "Traffic",
        description:
          "Sort by supplied traffic estimates, highest first. Missing estimates are not invented.",
        href: "/?sort=trafficDesc",
      },
      {
        title: "Prices",
        description: "Compare USD placement prices, lowest first.",
        href: "/?sort=priceAsc",
      },
      {
        title: "Placements up to $50",
        description: "Apply a real maximum USD placement price filter.",
        href: "/?maxPrice=50",
      },
      {
        title: "All publications",
        description:
          "Start with the complete active catalog and choose your own filters.",
        href: "/",
      },
    ],
  },
  about: {
    title: "A marketplace built around your next placement.",
    label: "About Name Retailer",
    description:
      "Name Retailer brings guest-post publications, optional article writing and practical content tools together. Compare your options with the audience and placement details in view.",
    active: "about",
    image: "/03_listing_browser_panel.png",
    sections: [
      {
        title: "Start with the publication",
        body: "Browse by topic, country, language and budget. Read the site's content and requirements before deciding whether it is suitable for your campaign.",
      },
      {
        title: "Keep content and placement separate",
        body: "Placement prices are shown in USD. Where available, 500-, 750- and 1,000-word writing options are priced separately. A missing writing option is not a free service.",
      },
      {
        title: "Plan with clear expectations",
        body: "Compare publications, prepare your placement brief and save selections in your private cart. Billing review is available; online ordering and payment are unavailable. Saving a plan is not an order or reservation.",
      },
    ],
    links: [
      {
        title: "Browse publications",
        description: "Compare the active catalog using real listing data.",
        href: "/",
      },
      {
        title: "Understand the process",
        description:
          "Understand publication research, briefs and saved placement plans.",
        href: "/how-it-works/",
      },
      {
        title: "Contact Name Retailer",
        description: "Ask about publication fit, writing or placement scope.",
        href: "/contact/",
      },
    ],
  },
  contact: {
    title: "Let's talk about your next placement.",
    label: "Contact Name Retailer",
    active: "help",
    image: "/01_guest_post_checklist.png",
    description:
      "Share the publication, topic and content requirements you have in mind. Contact the team directly for questions about the marketplace or your account.",
    sections: [
      {
        title: "Email the team",
        body: "info@nameretailer.com — include the publication URL, your topic, preferred language and the placement or writing questions you would like answered. Never email your password or payment details.",
      },
      {
        title: "Our address",
        body: "26 - G Hamriyah Freezone, Sharjah, United Arab Emirates.",
      },
      {
        title: "Contact and ordering",
        body: "Email links open your email application. This page does not submit or store a contact form. Online ordering and payment are unavailable. Contact the team with publication questions.",
      },
    ],
    links: [
      {
        title: "Send an email",
        description:
          "Contact info@nameretailer.com using your own email application.",
        href: "mailto:info@nameretailer.com",
      },
      {
        title: "Help center",
        description:
          "Find guidance for browsing, accounts and saved placements.",
        href: "/help-center/",
      },
      {
        title: "Common questions",
        description: "Understand publication prices, metrics and saved plans.",
        href: "/faq/",
      },
    ],
  },
  "how-it-works": {
    title: "From finding a site to preparing a plan.",
    label: "How it works",
    active: "guides",
    image: "/01_guest_post_checklist.png",
    description:
      "Browse first, compare with context, then prepare your content and save your selections. You do not need an account to explore the catalog.",
    sections: [
      {
        title: "01 · Find relevant publications",
        body: "Use topic, country, language, price and domain-metric filters. Only active listings from completed imports are displayed. An empty result can mean no approved inventory is currently active.",
      },
      {
        title: "02 · Compare the details",
        body: "Shortlist up to four publications. Keep missing metrics separate from zero and consider each publication's content, scope and requirements, not only a score.",
      },
      {
        title: "03 · Prepare and save",
        body: "Click Add to plan to inspect the current placement and writing options. Sign in, add your destination URL and keyword, then provide an article brief or your own article text/file. The server recalculates prices and flags changed or unavailable products.",
      },
      {
        title: "04 · Review before ordering",
        body: "Review the saved brief in your cart, then prepare billing details in checkout review. Ordering, payment and order tracking are not available yet. Saving a plan does not reserve a price or guarantee a placement. Agree content, disclosure and delivery terms before a future purchase.",
      },
    ],
    links: [
      {
        title: "Explore the catalog",
        description: "Find publications that fit your topic and budget.",
        href: "/",
      },
      {
        title: "Read the buying checklist",
        description: "Review audience, metrics and placement scope.",
        href: "/how-to-buy-links/",
      },
      {
        title: "Review your planning cart",
        description: "Sign in to manage saved selections.",
        href: "/cart/",
      },
    ],
  },
  "help-center": {
    title: "Help for a clearer next step.",
    label: "Help center",
    active: "help",
    image: "/01_guest_post_checklist.png",
    description:
      "Find the right place to browse, manage your account, review saved placements or ask the team a question.",
    sections: [
      {
        title: "Finding a publication",
        body: "Clear filters if the catalog has no matching results. Only active publications appear in the catalogue.",
      },
      {
        title: "Account access",
        body: "Register with your email and a strong password, then sign in explicitly. Use the password-reset page if needed. Use your account to manage private placement plans. Password reset messages are sent through the configured email service.",
      },
      {
        title: "Changes to saved placements",
        body: "Refresh your planning cart to review current prices. A changed or unavailable selection blocks the total until you review it. Your cart is private, but does not reserve inventory or take payment.",
      },
    ],
    links: [
      {
        title: "Manage your account",
        description: "Sign in, register or edit your profile name.",
        href: "/my-account/",
      },
      {
        title: "Reset a password",
        description: "Request a reset without sharing your password.",
        href: "/my-account/forgot-password/",
      },
      {
        title: "Ask the team",
        description: "Send publication or account questions by email.",
        href: "/contact/",
      },
    ],
  },
  services: {
    title: "Content and placement, with a clear scope.",
    label: "Services",
    active: "about",
    image: "/03_listing_browser_panel.png",
    description:
      "Explore guest-post publication options and optional article writing. Review the individual listing before choosing the service you need.",
    sections: [
      {
        title: "Guest-post placements",
        body: "Compare publications by relevance, classification, supplied metrics and USD placement price. A listed metric is not a ranking promise or evidence of editorial review.",
      },
      {
        title: "Optional article writing",
        body: "Imported listings can offer separately priced 500-, 750- and 1,000-word writing options. Only available, valid tiers are selectable. Placement-only selections do not include article writing.",
      },
      {
        title: "Questions about a custom brief",
        body: "Contact the team to discuss audience, topic, language, links and editorial requirements. Ask the team about the available content services and their scope.",
      },
    ],
    links: [
      {
        title: "Compare placements",
        description: "Browse actual active publication listings.",
        href: "/",
      },
      {
        title: "Prepare your text",
        description: "Count words and characters locally in your browser.",
        href: "/word-counter/",
      },
      {
        title: "Discuss your brief",
        description: "Contact the team before assuming a service is included.",
        href: "/contact/",
      },
    ],
  },
  guides: {
    title: "Practical guides for your next move.",
    label: "Guides",
    active: "guides",
    image: "/01_guest_post_checklist.png",
    description:
      "Browse the complete SEO, AEO, GEO, content, marketplace and measurement article library, with search, topic filters and pagination.",
    sections: [
      {
        title: "A buyer's checklist",
        body: "The buying guide covers audience relevance, metric sources, content scope and paid-link disclosure.",
      },
      {
        title: "No invented publishing history",
        body: "The journal contains practical articles on guest posts, content, SEO and measurement. Read the stated sources and dates alongside each article.",
      },
    ],
    links: [
      {
        title: "Buying guide",
        description: "Review the questions to ask before a placement.",
        href: "/how-to-buy-links/",
      },
      {
        title: "How it works",
        description: "Understand browsing and private placement planning.",
        href: "/how-it-works/",
      },
      {
        title: "Common questions",
        description: "Read practical answers about the current marketplace.",
        href: "/faq/",
      },
    ],
  },
  blog: {
    title: "The Name Retailer journal.",
    label: "The Name Retailer journal",
    active: "guides",
    image: "/03_listing_browser_panel.png",
    description:
      "Explore 60 new practical SEO, AEO, GEO, content and marketplace guides. The legacy article archive remains a separate migration task.",
    sections: [
      {
        title: "New original guides",
        body: "The journal includes 60 practical guides with direct answers, examples and checklists.",
      },
      {
        title: "Put the guidance into practice",
        body: "Use the working tools and active publication catalog alongside the guides. Supplied metrics remain labeled; no tool result or article promises rankings, AI citations or business growth.",
      },
    ],
    links: [
      {
        title: "Explore guides",
        description:
          "Find the available buying checklist and process information.",
        href: "/guides/",
      },
      {
        title: "Use the word counter",
        description: "Prepare your text without uploading it.",
        href: "/word-counter/",
      },
      {
        title: "Browse publications",
        description: "Explore the active marketplace catalog.",
        href: "/",
      },
    ],
  },
  policies: {
    title: "Policies that apply to Name Retailer.",
    label: "Policy information",
    active: "help",
    image: "/01_guest_post_checklist.png",
    description:
      "The refund, privacy and cookie policies are published. Contact Name Retailer to confirm the terms of a proposed placement request.",
    sections: [
      {
        title: "Terms and refund policy",
        body: "The refund policy is published: a refund is issued if the site owner rejects your request within 1 business day, and orders are final once the link is approved. Confirm the terms of any removal or replacement request with the team. Online ordering and payment are unavailable.",
      },
      {
        title: "Privacy and cookies",
        body: "The privacy policy explains how Name Retailer Inc collects, uses and protects personal data and how to ask for it to be deleted. The cookie policy lists the cookies this site sets: essential sign-in and form-security cookies, plus optional analytics only after consent.",
      },
      {
        title: "Questions and requests",
        body: "Contact info@nameretailer.com for policy or account questions. Ask the team about copyright or community questions.",
      },
    ],
    links: [
      {
        title: "Refund policy",
        description: "When an order is refunded and how to ask for one.",
        href: "/refund-policy/",
      },
      {
        title: "Privacy policy",
        description: "How personal data is collected, used and protected.",
        href: "/privacy/",
      },
      {
        title: "Cookie policy",
        description: "The cookies this site sets and how to control them.",
        href: "/cookies/",
      },
      {
        title: "Contact the team",
        description: "Ask for approved policy or commercial information.",
        href: "/contact/",
      },
      {
        title: "Buyer questions",
        description:
          "Understand prices, metric sources and ordering availability.",
        href: "/faq/",
      },
    ],
  },
} satisfies Record<string, InformationPage>;

export const toolGroups = [
  {
    title: "Writing and text",
    tools: [
      "Word counter",
      "Text case converter",
      "Reverse text",
      "Keyword density checker",
      "Base64 encode / decode",
    ],
  },
  {
    title: "Images",
    tools: [
      "JPG to PNG converter",
      "Image to WebP converter",
      "WebP to PNG converter",
      "Resize image",
      "Compress image",
      "Rotate image",
      "Crop image",
      "Image to black and white",
      "Image alt checker",
    ],
  },
  {
    title: "Units and values",
    tools: [
      "HEX to RGB",
      "PX to REM",
      "Length converter",
      "Temperature converter",
      "File size converter",
    ],
  },
  {
    title: "Markup and sharing",
    tools: [
      "Twitter card generator",
      "Open Graph generator",
      "Schema markup validator",
      "Schema generator",
      "AMP validator",
    ],
  },
  {
    title: "Provider-dependent SEO tools",
    tools: [
      "Competitor backlink analyzer",
      "Keyword suggestion tool",
      "Bulk Domain Rating checker",
      "Backlink generator",
    ],
  },
] as const;

// TODO(owner): confirm delivery/refund/replacement commitments; see OWNER_DECISIONS.md.
export const commonQuestions = buyerQuestions.map(
  (item) => [item.question, `${item.answer} ${item.detail}`] as const,
);
