import type { BuyerGuide } from "./buyer-guides";

// No invented author or historical publication dates. The task authorizes these new guides.
export const domainGuides: BuyerGuide[] = [
  {
    slug: "choose-a-domain-name",
    title: "How to choose a domain name for a business",
    description:
      "Build a memorable business domain shortlist, test names with customers, compare extensions and check registration before you commit.",
    answer:
      "Choose a domain people can say, spell and recognize as your business. Build a shortlist, test it aloud without showing the spelling, compare suitable extensions, and verify registration and relevant name rights before paying. A domain name is your web address; a business name identifies your business and may follow separate local rules.",
    approved: false,
    updatedAt: "2026-10-19",
    sourcesCheckedAt: "2026-10-19",
    questions: [
      {
        title: "Start with the audience and the next three years",
        body: "Write down who you serve, what you sell and which markets you expect to enter. A name tied to one product or city can become awkward when the business expands. For an online store, test the name on a mobile checkout, packaging and an order-confirmation email. Use a fictional working label such as Example Workshop during planning; example.com is an illustrative domain, not a suggested purchase.",
      },
      {
        title: "Build and score a small shortlist",
        body: "List ten ideas using a distinctive word, a meaningful word pair or your existing business name. Score each from 1 to 5 for spoken clarity, spelling, relevance and room to expand. This is a planning rubric, not a valuation or ranking score. Ask three people to type the name after hearing it once, then ask them to recall it later. A shorter abbreviation is not useful if nobody can remember what it means.",
      },
      {
        title: "Compare startup and ecommerce needs",
        body: "A startup name should leave room for a product pivot; an ecommerce name should remain clear when spoken in customer support or printed on a parcel. Avoid substituting digits or unusual spellings solely to obtain a shorter address. Try a descriptive modifier if your exact business name is taken, but do not choose a name that could be confused with an established brand.",
      },
      {
        title: "Choose an extension for the audience",
        body: "Compare recognition, eligibility, renewal terms and how the extension fits your organization. .com, .net and .org have different audience associations, but an extension alone does not make a business trustworthy. Country-code domains may suit a local audience and can have registration restrictions. Verify those with the relevant registry or registrar. Do not create country versions unless you can maintain genuinely useful local content.",
      },
      {
        title: "Verify the shortlist before buying",
        body: "Check a registrar for current availability, then separately check relevant business registries, trademark resources and social handles. One check cannot replace the others. Do not interpret an empty DNS response or a missing website as proof that the domain is available. Compare first-year and renewal costs, account ownership and recovery options before payment.",
      },
    ],
    table: {
      columns: ["Test", "Pass condition", "Warning sign"],
      rows: [
        [
          "Say and spell",
          "A listener types the intended name",
          "Repeated spelling explanations",
        ],
        [
          "Recall",
          "Readers remember it later",
          "Confusion with another business",
        ],
        [
          "Expansion",
          "Works beyond the first product",
          "Locks the business into a narrow offer",
        ],
        [
          "Control",
          "Business controls the registrar account",
          "An agency is the only account holder",
        ],
      ],
    },
    checklist: [
      "Spoken and written clarity tested with real listeners",
      "Room to expand beyond the first product or city",
      "Extension fits audience expectations and renewal budget",
      "Registrar availability, business registries and trademark records checked separately",
    ],
    related: [
      ["Check domain character length", "/domain-length-checker/"],
      [
        "Register and connect your domain",
        "/guides/buy-and-register-a-domain-name/",
      ],
      [
        "Understand domains, SEO and migrations",
        "/guides/domain-name-seo-and-migrations/",
      ],
    ],
    sources: [
      [
        "Shopify: choosing a domain name",
        "https://www.shopify.com/blog/choose-domain-name",
      ],
      [
        "ICANN: domain registration process",
        "https://www.icann.org/resources/pages/domain-name-registration-process-2023-11-02-en",
      ],
    ],
  },
  {
    slug: "buy-and-register-a-domain-name",
    title: "How to buy and register a domain name",
    description:
      "A beginner checklist for domain registration: verify availability, compare renewal terms, secure account ownership and connect website and email records.",
    answer:
      "Choose a suitable name, verify its current availability with a registrar, review the registration and renewal terms, and register it in an account you control. Then configure your website and email records. A domain registration is separate from hosting and from registering a business name.",
    approved: false,
    updatedAt: "2026-10-19",
    sourcesCheckedAt: "2026-10-19",
    questions: [
      {
        title: "Check availability at the point of purchase",
        body: "Enter the exact domain at your chosen registrar. An unregistered name may still be reserved, restricted or premium-priced. A registered name may be offered for resale under separate terms. Confirm the exact spelling, ASCII form for an internationalized name, term length and checkout total before paying. This website does not check registration availability.",
      },
      {
        title: "Compare the total cost rather than the introductory offer",
        body: "Record the first-year charge, annual renewal, transfer charge, taxes, currency and optional services separately. Use a simple worksheet: three-year budget = initial registration + two renewals + required extras + applicable taxes. Obtain every input from the registrar’s current quote; there is no universal annual domain price. Resale prices and registry premium renewals can differ substantially from ordinary registrations.",
      },
      {
        title: "Keep registration under your control",
        body: "Use accurate contact details and an account owned by the business or intended registrant. Enable strong authentication and save recovery information securely. If a developer registers the name for you, agree who controls the account and how access is handed over. Complete any verification requested by the registrar and record the renewal date.",
      },
      {
        title: "Connect hosting and email deliberately",
        body: "Save the DNS records supplied by your website host and email provider before making changes. Website records and email records serve different purposes; changing nameservers without recreating mail records can interrupt delivery. Keep a copy of the old configuration, follow the providers’ setup instructions and test both website access and email after the change.",
      },
      {
        title: "Plan renewals and future transfers",
        body: "Set a renewal reminder and keep the payment method and contact address current. Before transferring to another registrar, check eligibility and locks with both providers, obtain the required authorization information securely and preserve your DNS configuration. Transfer restrictions vary with the domain and its recent history; use ICANN’s transfer guidance and the registrar’s current terms instead of assuming all names can move immediately.",
      },
    ],
    checklist: [
      "Exact spelling and multi-year renewal costs confirmed at the registrar",
      "Registrant account owned directly by the business with two-factor authentication",
      "Existing DNS and mail records backed up before changing nameservers",
      "Renewal date, payment method and transfer lock rules documented",
    ],
    related: [
      [
        "Choose a business domain shortlist",
        "/guides/choose-a-domain-name/",
      ],
      [
        "Plan domain SEO and URL migrations",
        "/guides/domain-name-seo-and-migrations/",
      ],
      ["Explore the domain planning hub", "/domain-names/"],
    ],
    sources: [
      [
        "ICANN: domain registration process",
        "https://www.icann.org/resources/pages/domain-name-registration-process-2023-11-02-en",
      ],
      [
        "ICANN: transferring your domain",
        "https://www.icann.org/resources/pages/name-holder-faqs-2017-10-10-en",
      ],
    ],
  },
  {
    slug: "domain-name-seo-and-migrations",
    title: "Domain names, SEO and website migrations",
    description:
      "Separate domain naming decisions from SEO claims, and plan a domain migration with URL mapping, permanent redirects, canonicals and monitoring.",
    answer:
      "A domain name can help users understand and remember a website, but it cannot guarantee Google rankings. When changing a domain, preserve useful content and map each old URL to its genuinely equivalent new URL. Update internal links, canonicals and sitemaps, then monitor crawling and search performance.",
    approved: false,
    updatedAt: "2026-10-19",
    sourcesCheckedAt: "2026-10-19",
    questions: [
      {
        title: "Do keywords in a domain guarantee rankings?",
        body: "No. Google considers words in domain names among many relevance factors and has systems that prevent exact-match domains receiving excessive credit. Choose a name for recognition and clarity. Adding keywords, buying an old domain or choosing a particular generic extension is not a substitute for useful content, crawlable pages and a website people trust.",
      },
      {
        title: "Compare extensions without an automatic SEO winner",
        body: "Choose between .com, .net, .org and other generic extensions based on audience expectations, organizational fit, registration conditions and long-term costs. Google can return useful pages on newer generic extensions. Country-code domains can communicate geographic targeting, so evaluate them separately when your audience is international. Do not buy multiple extensions simply to expect duplicate sites to rank.",
      },
      {
        title: "Create a URL migration worksheet",
        body: "Export the old URLs from the CMS, sitemaps, logs, analytics and backlink records. Give each URL one decision: retain, redirect to an equivalent page, or return a real 404/410 when removed without a replacement. Record its new destination, reason and validation status. For example, /old-guide/ should redirect to the replacement guide that answers the same question, rather than an unrelated homepage.",
      },
      {
        title: "Update all URL signals together",
        body: "Use server-side permanent redirects for equivalent replacements and point directly to the final destination. Update internal links, canonical annotations, sitemap entries and applicable structured data URLs. Test a sample before expanding the change, then validate the full mapping for loops, chains and incorrect targets. Keep new canonical pages accessible to crawlers and remove staging noindex rules deliberately.",
      },
      {
        title: "Measure the migration rather than promise recovery",
        body: "Check old and new responses, sitemap fetches and server logs. Use Search Console to inspect indexing, selected canonicals and performance on both properties where authorized. Separate site-wide trends from individual URL problems and compare like-for-like time periods. Rankings can fluctuate while URLs are reprocessed; sitemap submission does not ensure indexing and no fixed recovery date can be promised.",
      },
      {
        title: "Check a previously used domain before purchase",
        body: "Review archived website snapshots, available registration events and independent backlink evidence. Registration creation dates do not establish when a website first published content, and re-registration may reset recorded history. RDAP provides registration data, not a complete ownership or website timeline. A clean archive snapshot cannot rule out every past issue. Treat automated value estimates as assumptions rather than an offer or guarantee.",
      },
    ],
    checklist: [
      "Complete old-to-new URL mapping sheet with one-hop permanent redirects",
      "Internal links, canonical tags, sitemaps and structured data updated to new URLs",
      "Noindex rules removed on approved public destination pages",
      "Search Console verified on both old and new properties for post-move monitoring",
    ],
    related: [
      [
        "Canonical URL checklist for a site move",
        "/blog/a-canonical-url-checklist-for-a-rebuilt-website/",
      ],
      [
        "Choose a domain name for a business",
        "/guides/choose-a-domain-name/",
      ],
      [
        "Buy and register a domain name",
        "/guides/buy-and-register-a-domain-name/",
      ],
    ],
    sources: [
      [
        "Google: ranking systems and exact-match domains",
        "https://developers.google.com/search/docs/appearance/ranking-systems-guide",
      ],
      [
        "Google: site moves with URL changes",
        "https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes",
      ],
      [
        "Google: top-level domains in Search",
        "https://developers.google.com/search/help/site-position-in-search-faq",
      ],
      ["ICANN: RDAP", "https://www.icann.org/rdap"],
    ],
  },
];
