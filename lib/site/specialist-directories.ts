import type { Directory } from "./directories";

const paidLinks: [string, string] = [
  "Google guidance on qualifying paid links",
  "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links",
];

// Exact supplied country/category values were checked against the active,
// committed catalogue. Indexability remains controlled by live inventory counts.
export const specialistDirectories: Directory[] = [
  {
    slug: "guest-posting-sites-uk",
    editorialUpdatedAt: "2026-10-18",
    label: "UK publishers",
    h1: "Guest posting sites in the UK",
    metaTitle: "UK Guest Posting Sites with Prices",
    metaDescription:
      "Compare UK guest posting sites by topic, supplied metrics and USD placement prices. Check audience geography, article scope and writing costs before planning.",
    lead: "Compare guest posting sites assigned to the United Kingdom in the catalogue, with supplied metrics and USD placement prices. The listing country does not verify a UK readership or a current publishing agreement. Check audience evidence, editorial fit and availability before choosing a publication for a UK campaign.",
    filter: { country: "United Kingdom" },
    browse: [
      ["Compare all UK listings", "/?country=United%20Kingdom"],
      [
        "UK listings by lowest price",
        "/?country=United%20Kingdom&sort=priceAsc",
      ],
      ["UK business listings", "/?country=United%20Kingdom&category=Business"],
      [
        "UK technology listings",
        "/?country=United%20Kingdom&category=Technology",
      ],
    ],
    sections: [
      {
        title: "How to find UK guest posting websites for your audience",
        body: "Begin with the reader you need: a local consumer, a business owner or a technical specialist. Open the full UK list and add the appropriate category and language. Then read recent articles in the actual section where your contribution would appear. A national publication, a regional section and an external contributor network can reach different readers even when they share a domain. Confirm the proposed section and publication format before comparing quotes.",
      },
      {
        title: "What would establish a relevant UK readership?",
        body: "Ask for dated audience information showing the UK share of visits and the source of that measurement. Check whether it refers to the whole domain or the section carrying your article. A .co.uk address, British spelling, a UK country field or a large traffic estimate does not establish where readers live. If audience location is essential and no useful evidence is available, record it as unknown rather than treating the listing as a verified UK opportunity.",
      },
      {
        title: "Prepare an article for the specific UK reader",
        body: "For a hypothetical UK appointment-software campaign, a practical article about managing bookings for a local salon may fit a small-business publication better than general technology news. Use terminology, spelling and examples appropriate to that publication. If your example uses pounds, identify the currency clearly; the catalogue's placement prices remain in US dollars. Agree any location-specific claims with the editor and use current primary sources for factual statements.",
      },
      {
        title: "Compare the complete placement scope before budgeting",
        body: "Ask what the quoted price covers: writing, editing, images, revisions, publication section and expected scheduling. Check whether a placement is a new contributed article or another sponsored format. A catalogue record, including one naming a well-known domain, does not prove a direct relationship, publisher authorization or guaranteed availability. Obtain current confirmation of the specific offer before committing time or money; do not infer an endorsement from a listing.",
      },
      {
        title: "Agree disclosure and measure the actual response",
        body: "Record how readers will see the sponsorship and how paid links will be qualified. Google prefers rel=sponsored for paid placements and also accepts nofollow. Set an observable goal such as relevant referral visits or enquiries over a stated period. Keep campaign identifiers consistent and compare results with the original audience hypothesis. Publication does not guarantee indexing, a featured answer, a citation in an AI response or a ranking improvement.",
      },
    ],
    checklist: [
      "The proposed publication section fits the intended UK reader",
      "Audience-location evidence has a source, date and clear scope",
      "Writing, placement format, currency and total costs are understood",
      "Current availability and publisher authorization are confirmed",
      "Reader disclosure, paid-link qualification and measurement are agreed",
    ],
    faq: [
      [
        "Are these verified UK guest posting opportunities?",
        "No. This page matches the supplied United Kingdom field in active listings. It does not independently verify readership, publisher authorization or current acceptance. Confirm those points for your proposed placement.",
      ],
      [
        "Can I find UK guest posting websites with prices by niche?",
        "Yes. Use a marketplace link above, then add a category and price filter. The table is a limited sample ordered by supplied DR, while the marketplace lets you compare the wider matching inventory.",
      ],
      [
        "Are UK placement prices charged in pounds?",
        "Catalogue placement prices are shown in USD. If your budget uses GBP, use an exchange rate from your own payment provider at the time of budgeting, including any conversion charges.",
      ],
    ],
    related: [
      "guest-posting-sites-usa",
      "business-guest-posting-sites",
      "technology-guest-posting-sites",
    ],
    resources: [
      ["Compare placement and writing costs", "/guides/guest-post-cost/"],
      ["Evaluate each publisher", "/guides/vet-a-guest-post-site/"],
      [
        "Understand supplied traffic estimates",
        "/guides/da-vs-dr-and-traffic/",
      ],
      paidLinks,
    ],
  },
  {
    slug: "finance-guest-posting-sites",
    editorialUpdatedAt: "2026-10-18",
    label: "Finance publishers",
    h1: "Finance guest posting sites",
    metaTitle: "Finance Guest Posting Sites with Prices",
    metaDescription:
      "Compare finance guest posting sites with supplied metrics and USD prices. Review reader fit, financial evidence, editorial requirements and placement scope.",
    lead: "Finance guest posting sites in this directory carry the supplied Finance category. Compare placement prices and available metrics, then check whether recent articles serve your intended readers. Personal finance, business accounting and investing need different expertise; a category label alone does not establish a publisher's editorial standards or acceptance.",
    filter: { categories: ["Finance"] },
    browse: [
      ["Compare all finance listings", "/?category=Finance"],
      ["Finance listings by lowest price", "/?category=Finance&sort=priceAsc"],
      [
        "Finance listings assigned to the USA",
        "/?category=Finance&country=United%20States",
      ],
      [
        "Finance listings assigned to the UK",
        "/?category=Finance&country=United%20Kingdom",
      ],
    ],
    sections: [
      {
        title: "Choose finance blogs by the money question they explain",
        body: "A household budgeting article, a business cash-flow tutorial and an investment analysis have different readers and evidence requirements. Read recent pieces in the relevant section and identify the level of knowledge they assume. For a hypothetical invoicing product, an explanation of payment reconciliation may fit an accounting publication better than a consumer investing blog. This page narrows the broader business directory to Finance listings; it does not independently certify them as specialist financial publications.",
      },
      {
        title: "Review authorship, evidence and correction practices",
        body: "Check whether financial articles identify their writers and any relevant reviewer, link to the underlying evidence and distinguish observations from opinions. Look for clear dates, transparent assumptions and a way to report mistakes. A professional-looking byline or large authority score is not enough to establish expertise. If your proposed subject needs specialist review, agree who will perform it and what sources they will use before commissioning the article.",
      },
      {
        title: "Keep financial examples specific and clearly limited",
        body: "Use a defined scenario instead of a broad claim about what every reader should do. State the currency, period and assumptions behind any calculation, and label invented figures as hypothetical. Distinguish a process explanation from a recommendation about a financial product. This directory supplies publication-selection guidance, not financial advice. Source any product, tax or regulatory statement from current primary material relevant to the reader's jurisdiction and have the appropriate expert review it.",
      },
      {
        title: "Confirm restricted topics before writing a finance guest post",
        body: "Ask the editor directly whether the proposed subject, product mention and linked resource are acceptable. Credit, insurance, investing and cryptocurrency can require different editorial treatment; a broad Finance label does not establish permission for any of them. Record the proposed headline, evidence, writing responsibility, revision limits and approval process. Do not pay for a promise of acceptance or infer access to a publication solely from its appearance in the catalogue.",
      },
      {
        title:
          "Compare finance guest post costs without confusing price and trust",
        body: "Use the actual listing price as one input, then add any separate research, writing, expert review and editing charges. Keep those costs separate so you can compare offers with the same scope. Neither a high fee nor supplied DA, DR or traffic demonstrates accurate financial reporting. Agree visible sponsorship disclosure and appropriate paid-link qualification, and evaluate outcomes through actual relevant visits or enquiries rather than promised ranking credit.",
      },
    ],
    checklist: [
      "Recent articles match the exact financial subject and reader",
      "Authorship, source quality and any specialist review can be assessed",
      "Examples identify assumptions, dates, currency and limitations",
      "Restricted topics and product links are approved before writing",
      "Research, writing, review and placement costs are separated",
    ],
    faq: [
      [
        "Which finance websites are included?",
        "Only active, visible listings with the exact supplied Finance category. The broader business directory also includes Business and Career and Employment. This directory does not claim every listing is independently reviewed or currently accepting your article.",
      ],
      [
        "Can I submit investing, loan or cryptocurrency articles?",
        "The Finance category does not establish permission for those subjects. Confirm the particular topic, evidence requirements, product mentions and editorial approval with the publisher before preparing content.",
      ],
      [
        "Should I choose a finance publisher by DA or DR?",
        "Use one supplied score consistently as a comparison field, then review topic fit, recent articles and evidence standards. Neither score proves financial expertise, real readership or likely campaign results.",
      ],
    ],
    related: [
      "business-guest-posting-sites",
      "guest-posting-sites-uk",
      "real-estate-guest-posting-sites",
    ],
    resources: [
      ["Evaluate editorial quality", "/guides/vet-a-guest-post-site/"],
      ["Compare dated pricing by niche", "/guest-post-prices/"],
      [
        "Read the paid-placement policy guide",
        "/guides/paid-guest-posts-google-link-policies/",
      ],
      paidLinks,
    ],
  },
  {
    slug: "real-estate-guest-posting-sites",
    editorialUpdatedAt: "2026-10-18",
    label: "Real estate publishers",
    h1: "Real estate guest posting sites",
    metaTitle: "Real Estate Guest Posting Sites with Prices",
    metaDescription:
      "Compare real estate guest posting sites with USD prices and supplied metrics. Match property audiences, local context, source quality and editorial scope.",
    lead: "Compare real estate guest posting sites assigned to the Real Estate category, with supplied metrics and USD placement prices. Check whether each publication serves home buyers, renters, landlords or property professionals. Confirm market location, evidence standards and article availability before treating a listed website as a suitable property publishing opportunity.",
    filter: { categories: ["Real Estate"] },
    browse: [
      ["Compare all real estate listings", "/?category=Real%20Estate"],
      [
        "Real estate listings by lowest price",
        "/?category=Real%20Estate&sort=priceAsc",
      ],
      [
        "Real estate listings assigned to the USA",
        "/?category=Real%20Estate&country=United%20States",
      ],
      [
        "Real estate listings assigned to the UK",
        "/?category=Real%20Estate&country=United%20Kingdom",
      ],
    ],
    sections: [
      {
        title: "Match property guest posts to a specific reader",
        body: "Home buyers, tenants, property managers and commercial agents look for different information. Inspect the relevant publication section and several recent articles, rather than relying on a broad property label. A hypothetical maintenance-software company might explain how managers document repair requests; that belongs with an operational audience, while a first-home viewing checklist serves buyers. Choose the reader and useful outcome before comparing authority metrics or prices.",
      },
      {
        title: "Check the geography behind a real estate audience",
        body: "Property subjects often depend on a particular city, region or country. A supplied country field does not show which markets the publication covers or where its readers live. Ask about the audience for the proposed article section and inspect examples from the intended market. A broad national publication may be appropriate for general property operations, while a neighborhood service may need evidence of local readership. Record the distinction in your shortlist.",
      },
      {
        title: "Use dated, clearly defined property evidence",
        body: "For a market statistic, identify the original dataset, location, reporting period and what was measured. Asking prices, completed sale prices and rents are different observations and should not be compared as though they describe the same thing. Avoid copying an old number from another blog without checking its source. If the article discusses tenancy, financing or transaction requirements, use current primary sources for the applicable jurisdiction and obtain appropriate specialist review.",
      },
      {
        title: "Agree the article, images and destination link",
        body: "Confirm whether the editor accepts the proposed property subject, original photographs, a practical checklist and any business mention. Obtain permission for images and avoid including identifiable client or tenant information without the necessary consent. Agree which useful resource the article will link to and how sponsorship will be disclosed. An editorial mention, paid contributed article and property advert are different formats; establish which is actually being offered before writing.",
      },
      {
        title: "Build a comparable property placement budget",
        body: "Separate the supplied placement price from writing, local research, image licensing and revisions. Confirm current availability, publishing authority and the proposed section; a catalogue listing is not a guarantee of publisher authorization or acceptance. Qualify paid links appropriately and set a measurable goal such as relevant referral enquiries. A property guest post does not guarantee leads, search rankings, indexing or inclusion in an AI-generated answer.",
      },
    ],
    checklist: [
      "The reader is identified: buyer, tenant, landlord or professional",
      "The publication section covers the intended property market",
      "Statistics identify source, geography, period and measurement",
      "Image rights, privacy and specialist review are addressed",
      "Article format, total costs, availability and paid-link terms are confirmed",
    ],
    faq: [
      [
        "Does this include every home and lifestyle blog?",
        "No. This page matches the exact supplied Real Estate category. The travel and lifestyle directory separately includes Home and Family. A home-decoration blog is not automatically a real estate publication.",
      ],
      [
        "Are real estate guest posting websites verified for local reach?",
        "No. Listing country and traffic estimates do not independently verify city-level or regional readership. Ask for dated audience evidence and inspect the actual section proposed for publication.",
      ],
      [
        "Does a listing guarantee that my property article will be accepted?",
        "No. Confirm availability, editorial permission, topic restrictions and placement scope before writing or committing to a publication. Listing a domain is not evidence of endorsement by its publisher.",
      ],
    ],
    related: [
      "business-guest-posting-sites",
      "finance-guest-posting-sites",
      "travel-lifestyle-guest-posting-sites",
    ],
    resources: [
      ["Choose suitable publication candidates", "/how-to-buy-links/"],
      ["Review publisher quality in detail", "/guides/vet-a-guest-post-site/"],
      ["Plan placement and writing costs", "/guides/guest-post-cost/"],
      paidLinks,
    ],
  },
];
