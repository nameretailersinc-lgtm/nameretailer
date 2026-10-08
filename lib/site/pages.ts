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
    title: "Explore publications from more than one angle.",
    label: "Marketplace directory",
    active: "marketplace",
    image: "/15_laptop_dashboard_illustration.png",
    description:
      "Find the relevant marketplace view without navigating a long stack of overlapping menus. Every link below uses the same active catalog.",
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
        href: "/products/?minDa=1",
      },
      {
        title: "Traffic",
        description:
          "Sort by supplied traffic estimates, highest first. Missing estimates are not invented.",
        href: "/products/?sort=trafficDesc",
      },
      {
        title: "Prices",
        description: "Compare USD placement prices, lowest first.",
        href: "/products/?sort=priceAsc",
      },
      {
        title: "Placements up to $50",
        description: "Apply a real maximum USD placement price filter.",
        href: "/products/?maxPrice=50",
      },
      {
        title: "All publications",
        description:
          "Start with the complete active catalog and choose your own filters.",
        href: "/products/",
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
        body: "Compare publications, prepare your placement brief and save selections in your private cart. Billing review is available; final order submission and Stripe/PayPal payments are not connected. Saving a draft is not an order or reservation.",
      },
    ],
    links: [
      {
        title: "Browse publications",
        description: "Compare the active catalog using real listing data.",
        href: "/products/",
      },
      {
        title: "Understand the process",
        description: "See what works today and what comes next.",
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
        title: "What to expect from this preview",
        body: "Email links open your email application. This page does not submit or store a contact form. There is no promised response time, order confirmation or payment collection in this preview.",
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
        description: "Understand prices, metrics and the current preview.",
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
        body: "Click Buy now to inspect the current placement and writing options. Sign in, add your destination URL and keyword, then provide an article brief or your own article text/file. The server recalculates prices and flags changed or unavailable products.",
      },
      {
        title: "04 · Review before ordering",
        body: "Review the saved brief in your cart, then prepare billing details in checkout review. Stripe and PayPal are selected but not connected; order submission and tracking remain unavailable. Saving a draft does not reserve a price or guarantee a placement. Agree content, disclosure and delivery terms before a future purchase.",
      },
    ],
    links: [
      {
        title: "Explore the catalog",
        description: "Find publications that fit your topic and budget.",
        href: "/products/",
      },
      {
        title: "Read the buying checklist",
        description: "Review the draft audience, metrics and scope guide.",
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
        body: "Clear filters if the catalog has no matching results. Only reviewed active inventory appears publicly; imported drafts stay in the admin workspace.",
      },
      {
        title: "Account access",
        body: "Register with your email and a strong password, then sign in explicitly. Use the password-reset page if needed. Email ownership verification is not yet implemented; reset delivery requires configured production email.",
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
        body: "Contact the team to discuss audience, topic, language, links and editorial requirements. This preview does not accept briefs, collect files, issue custom quotes or create orders.",
      },
    ],
    links: [
      {
        title: "Compare placements",
        description: "Browse actual active publication listings.",
        href: "/products/",
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
        body: "The available draft covers audience relevance, metric sources, content scope and paid-link disclosure. It remains marked as a draft until owner and editorial review.",
      },
      {
        title: "No invented publishing history",
        body: "The original site's articles and author information have not yet been migrated into this preview. We do not create publication dates, author identities or customer case studies to fill the gap.",
      },
    ],
    links: [
      {
        title: "Draft buying guide",
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
        href: "/products/",
      },
    ],
  },
  policies: {
    title: "Policies need clear, approved terms.",
    label: "Policy readiness",
    active: "help",
    image: "/01_guest_post_checklist.png",
    description:
      "This is a rebuild status page, not a substitute for approved legal, privacy or commercial policies.",
    sections: [
      {
        title: "Commercial policies pending",
        body: "Terms of service, refund and replacement rules, delivery commitments, billing and payment methods require owner approval before checkout can open. No purchase or payment is accepted here.",
      },
      {
        title: "Privacy documentation pending",
        body: "A final privacy and cookie notice must describe the deployed site's actual data handling, processors, retention and user rights. This page does not provide legal advice or claim that those notices are complete.",
      },
      {
        title: "Questions and requests",
        body: "Contact info@nameretailer.com for policy or account questions. Copyright, DMCA and community processes have not yet been approved for the rebuild.",
      },
    ],
    links: [
      {
        title: "Contact the team",
        description: "Ask for approved policy or commercial information.",
        href: "/contact/",
      },
      {
        title: "Preview questions",
        description: "Understand the boundaries of this rebuild.",
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

export const commonQuestions = [
  [
    "Why can the catalog show no publications?",
    "Only active products from completed imports appear. Drafts remain private. Clear filters to distinguish a narrow search from an empty active catalog.",
  ],
  [
    "Do I need an account to browse?",
    "No. You can browse, filter, shortlist and inspect publication options without signing in. Sign in to save your private planning cart.",
  ],
  [
    "What does the placement price include?",
    "Placement and article writing are separate. Available 500-, 750- and 1,000-word writing add-ons have their own prices. Missing or zero-priced source tiers are unavailable, not free.",
  ],
  [
    "Are the metrics independently verified?",
    "The current imported metrics are owner-supplied. Provider and observation dates are unavailable unless explicitly supplied. Missing values are shown as unavailable; activating a listing does not verify its metrics or promise rankings.",
  ],
  [
    "Does saving a cart place an order?",
    "No. Saving does not reserve inventory, a price or a publication. Checkout, payment and order tracking are not yet enabled in this rebuild.",
  ],
  [
    "Which free tools work now?",
    "Writing, image, unit conversion and markup tools work in your browser. AMP uses the official validator on this server; Domain Rating lookup uses owner-supplied catalog records. Backlinks use your CSV report, keyword ideas are local brainstorming, and outreach planning does not create external links.",
  ],
  [
    "How can I contact the team?",
    "Email info@nameretailer.com. Do not send passwords or payment details. Response times are not promised in this preview.",
  ],
] as const;
