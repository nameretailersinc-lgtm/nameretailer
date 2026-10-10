import {directoryIntros} from "./directory-intros";
// Niche publisher directories. Each page server-renders live inventory for its
// filter, plus original guidance, so it stands on its own for search and
// readers instead of being a thin filtered copy of the marketplace.
export type DirectoryFilter = {
  categories?: string[];
  country?: string;
  maxPriceCents?: number;
};

export type Directory = {
  slug: string;
  label: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  lead: string;
  filter: DirectoryFilter;
  /** Marketplace views a buyer can open to filter the full inventory. */
  browse: Array<[label: string, href: string]>;
  sections: Array<{ title: string; body: string }>;
  checklist: string[];
  faq: Array<[question: string, answer: string]>;
  related: string[];
};

const category = (name: string): [string, string] => [
  name,
  `/?category=${encodeURIComponent(name)}`,
];

const directoryDefinitions: Directory[] = [
  {
    slug: "technology-guest-posting-sites",
    label: "Technology publishers",
    h1: "Technology guest posting sites",
    metaTitle: "Technology Guest Posting Sites",
    metaDescription:
      "Compare technology guest posting sites by topic, Domain Rating, traffic and price. Live publisher listings across tech, software, gadgets and internet.",
    lead: "Publishers covering technology, computing, gadgets, the internet and software, with supplied metrics and USD placement prices side by side.",
    filter: {
      categories: [
        "Technology",
        "Computers",
        "Gadgets",
        "Internet",
        "Mobile",
        "Hardware development",
      ],
    },
    browse: [
      category("Technology"),
      category("Computers"),
      category("Gadgets"),
      category("Internet"),
      category("Mobile"),
    ],
    sections: [
      {
        title: "Match the publication to the reader, not the label",
        body: "“Technology” covers very different audiences: consumer gadget reviews, IT decision-makers, developers and general internet news. A cybersecurity vendor and a phone-accessory shop both want tech placements, but they need different readers. Read three or four recent articles before shortlisting and ask whether your buyer would read them.",
      },
      {
        title: "Recency matters more in tech",
        body: "Tech content dates quickly. A site whose newest posts are a year old may not be maintained, and an article about a product version that no longer exists rarely earns ongoing traffic. Prefer publications that publish regularly and update older guides.",
      },
      {
        title: "Write for the publication’s technical depth",
        body: "Some tech publishers expect hands-on tutorials with code or benchmarks; others want accessible explainers. Agree the depth before writing so the article fits the site and is accepted without rework.",
      },
    ],
    checklist: [
      "Recent posts are on topics your customers search for",
      "The site publishes regularly and keeps guides current",
      "Sponsored posts are labelled according to the site’s policy",
      "Outbound links in existing articles are relevant, not a mix of unrelated niches",
      "DR, DA and traffic are read as supplied estimates, not guarantees",
    ],
    faq: [
      [
        "Which categories are included on this page?",
        "Technology, Computers, Gadgets, Internet, Mobile and Hardware development listings from the active inventory. Use the marketplace filters for programming, software and web-development publishers.",
      ],
      [
        "Are higher-DR technology sites always better?",
        "No. Domain Rating describes a site’s link profile as estimated by a third-party provider. Audience fit, editorial quality and whether real readers see the article matter as much for referral traffic and brand visibility.",
      ],
      [
        "Can I supply my own article?",
        "Placement terms, including whether you write the article or the publisher does, are shown on each listing. Content writing services are also available.",
      ],
    ],
    related: [
      "saas-guest-posting-sites",
      "marketing-guest-posting-sites",
      "guest-posting-sites-usa",
    ],
  },
  {
    slug: "saas-guest-posting-sites",
    label: "SaaS and software publishers",
    h1: "SaaS guest posting opportunities",
    metaTitle: "SaaS Guest Posting Sites and Opportunities",
    metaDescription:
      "Find guest posting opportunities for SaaS brands on software, programming, startup and web-development publishers, with live metrics and prices.",
    lead: "Software, programming, startup and web-development publishers suited to SaaS products that sell to technical and business buyers.",
    filter: {
      categories: [
        "Software development",
        "Programming",
        "Web-development",
        "Startups",
      ],
    },
    browse: [
      category("Software development"),
      category("Programming"),
      category("Web-development"),
      category("Startups"),
    ],
    sections: [
      {
        title: "Start from the job your product does",
        body: "SaaS buyers search for problems before products: “automate invoice reminders”, “monitor uptime”, “onboard remote staff”. Choose publications that already cover the problem space, then pitch an article that solves part of it. A placement on a site your buyers already read beats a higher metric on a general business blog.",
      },
      {
        title: "Developer and founder audiences behave differently",
        body: "Developer audiences reward specific, reproducible tutorials and penalise marketing tone. Founder and startup audiences respond to frameworks, numbers and lessons from real launches. Pick the publication by which of these audiences signs your contracts or adopts your tool.",
      },
      {
        title: "Measure more than the link",
        body: "Track referral sessions, sign-ups and branded search after publication, not just whether the link is live. Use a consistent reporting window so you can compare placements fairly.",
      },
    ],
    checklist: [
      "The publication covers the problem your product solves",
      "Readers are the people who choose or use your software",
      "The article can stand on its own without a product pitch",
      "A tracking plan exists for referral sessions and sign-ups",
      "Paid placements are disclosed in line with search-engine guidance",
    ],
    faq: [
      [
        "Is there a dedicated SaaS category?",
        "No. Publishers tag themselves by topic, so this page combines Software development, Programming, Web-development and Startups listings, which are where SaaS audiences most often read.",
      ],
      [
        "Should SaaS guest posts link to a sign-up page?",
        "A link to a genuinely useful resource, such as documentation, a template or a guide, usually fits the article better and is more likely to be accepted than a link to a pricing or sign-up page.",
      ],
      [
        "How many placements should a SaaS campaign start with?",
        "Start with a small batch of strongly matched publications, measure referral and sign-up impact over a fixed window, then expand to the publishers that performed.",
      ],
    ],
    related: [
      "technology-guest-posting-sites",
      "marketing-guest-posting-sites",
      "business-guest-posting-sites",
    ],
  },
  {
    slug: "guest-posting-sites-under-50",
    label: "Budget publishers",
    h1: "Guest posting sites under $50",
    metaTitle: "Guest Posting Sites Under $50",
    metaDescription:
      "Compare affordable guest posting sites priced under $50 USD. Check topic fit, supplied DA, DR and traffic before you add budget placements to your plan.",
    lead: "Publications with a placement price of $50 USD or less, so you can test new topics and audiences without committing a large budget.",
    filter: { maxPriceCents: 5000 },
    browse: [
      ["$0–$50 price range", "/guest-posting-sites-under-50/"],
      ["$50–$100 price range", "/price-50-01-to-100/"],
      ["Sort all by lowest price", "/?sort=priceAsc"],
    ],
    sections: [
      {
        title: "Use low prices to test, not to cut corners",
        body: "Budget placements are useful for testing a new niche, building a varied mention profile or supporting a content launch. They are not a shortcut: a cheap placement on an irrelevant or low-quality site can cost more in wasted content and risk than it saves.",
      },
      {
        title: "Check the signals price cannot show",
        body: "Look at whether the site has real readers: recent articles with comments or social shares, a clear editorial focus, an about page and contact details. Be cautious with sites that publish on every topic or list dozens of unrelated outbound links per article.",
      },
      {
        title: "Compare the total cost, not the listing price",
        body: "Factor in content writing, revisions and any extra fees for additional links or longer articles. A $40 listing that needs a $60 article costs more than a $90 listing that includes writing.",
      },
    ],
    checklist: [
      "The topic matches your audience",
      "Recent articles show real editorial activity",
      "Existing posts do not carry a crowd of unrelated outbound links",
      "Total cost includes content and extras",
      "You have a reason to test this publication specifically",
    ],
    faq: [
      [
        "Are guest posts under $50 safe to buy?",
        "Price alone does not make a placement safe or risky. Relevance, editorial standards and proper disclosure of paid links matter more. Review each site with the checklist on this page.",
      ],
      [
        "Why do some listings have no metrics?",
        "Some publishers have not supplied DA, DR or traffic. Missing values are shown as missing, never as zero, and are excluded from metric filters.",
      ],
      [
        "Does the price include the article?",
        "It depends on the listing. Check the placement terms on each publication, or add content writing as a service.",
      ],
    ],
    related: [
      "guest-posting-sites-usa",
      "business-guest-posting-sites",
      "technology-guest-posting-sites",
    ],
  },
  {
    slug: "guest-posting-sites-usa",
    label: "US publishers",
    h1: "Guest posting sites in the USA",
    metaTitle: "Guest Posting Sites in the USA",
    metaDescription:
      "Browse US guest posting sites with live DA, DR, traffic and USD prices. Compare American publishers by topic before adding placements to your plan.",
    lead: "Publications with United States in the supplied country field. Confirm audience geography with each publisher before choosing a placement.",
    filter: { country: "United States" },
    browse: [
      ["All US publishers", "/?country=United%20States"],
      ["US publishers by price", "/?country=United%20States&sort=priceAsc"],
      [
        "US publishers by traffic",
        "/?country=United%20States&sort=trafficDesc",
      ],
    ],
    sections: [
      {
        title: "Location is about readers, not hosting",
        body: "This directory filters the supplied country field to United States. The field alone does not establish hosting location or audience geography. Ask for audience evidence when geographic reach matters.",
      },
      {
        title: "Localise the article as well as the placement",
        body: "Use US spelling, dollars, US regulations and US examples. A placement on a US site with content written for another market reads as out of place and is less likely to be accepted or to convert.",
      },
      {
        title: "Follow US disclosure expectations",
        body: "US readers and regulators expect sponsored content to be clearly identified. Agree how the post will be labelled before publication.",
      },
    ],
    checklist: [
      "Your offer is available to US customers",
      "The article uses US spelling, currency and examples",
      "The publication’s topic matches your product",
      "Sponsored-content labelling is agreed",
      "Supplied traffic is treated as an estimate, not a guaranteed US audience",
    ],
    faq: [
      [
        "How is a publisher’s country decided?",
        "The country is supplied with each listing. Audience geography is not independently verified, so check the publication’s content and request audience evidence yourself.",
      ],
      [
        "Can I filter US sites by niche too?",
        "Yes. Open the US publishers view in the marketplace and add a category, language, price or metric filter.",
      ],
      [
        "Are prices shown in US dollars?",
        "Yes. All marketplace placement prices are shown in USD.",
      ],
    ],
    related: [
      "guest-posting-sites-under-50",
      "business-guest-posting-sites",
      "technology-guest-posting-sites",
    ],
  },
  {
    slug: "marketing-guest-posting-sites",
    label: "Marketing publishers",
    h1: "Marketing guest posting sites",
    metaTitle: "Marketing Guest Posting Sites",
    metaDescription:
      "Compare marketing and SEO guest posting sites by audience, Domain Rating, traffic and USD price. Live listings for agencies and marketing brands.",
    lead: "Publications about marketing, advertising, SEO and e-commerce growth, for agencies, marketing tools and brands that sell to marketers.",
    filter: { categories: ["Marketing", "E-commerce"] },
    browse: [category("Marketing"), category("E-commerce")],
    sections: [
      {
        title: "Marketing editors have seen every pitch",
        body: "Marketing publications receive more guest-post requests than almost any other niche. Original data, a specific process or a real campaign breakdown stands out; a general “10 tips” article does not.",
      },
      {
        title: "Separate audiences: practitioners and buyers",
        body: "Some marketing sites are read by hands-on marketers looking for techniques; others by founders and managers deciding what to buy. Decide which audience you need before shortlisting.",
      },
    ],
    checklist: [
      "The article offers original insight, data or process",
      "The publication’s readers are your customers",
      "Existing outbound links are relevant and limited",
      "Paid placements are labelled",
    ],
    faq: [
      [
        "Which categories are included?",
        "Marketing and E-commerce listings from the active inventory.",
      ],
      [
        "Do marketing sites accept SEO-focused articles?",
        "Many do, provided the article is genuinely useful. Check recent posts to see the depth and style the editor accepts.",
      ],
    ],
    related: [
      "saas-guest-posting-sites",
      "business-guest-posting-sites",
      "technology-guest-posting-sites",
    ],
  },
  {
    slug: "business-guest-posting-sites",
    label: "Business publishers",
    h1: "Business guest posting sites",
    metaTitle: "Business Guest Posting Sites",
    metaDescription:
      "Find business and finance guest posting sites with live DA, DR, traffic and USD prices. Compare publishers for B2B, startup and finance audiences.",
    lead: "Business, finance and career publications for B2B services, financial products and brands that reach professionals and decision-makers.",
    filter: { categories: ["Business", "Finance", "Career and Employment"] },
    browse: [
      category("Business"),
      category("Finance"),
      category("Career and Employment"),
    ],
    sections: [
      {
        title: "Credibility comes first in business and finance",
        body: "Readers make money decisions based on these articles. Cite sources, avoid exaggerated claims and make sure any financial statement is accurate and current. Publishers in finance often have stricter editorial review for that reason.",
      },
      {
        title: "Narrow “business” to a real audience",
        body: "Business is one of the broadest categories. Narrow it by who reads the site: small-business owners, finance professionals, job seekers or executives, and pick the one that buys from you.",
      },
    ],
    checklist: [
      "Claims and figures are sourced and current",
      "The site’s readers match your buyer",
      "The article meets the publisher’s editorial standards",
      "Sponsored content is disclosed",
    ],
    faq: [
      [
        "Which categories are included?",
        "Business, Finance and Career and Employment listings from the active inventory.",
      ],
      [
        "Do finance publishers have extra requirements?",
        "Often, yes. Some restrict topics such as loans, crypto or gambling. Check the requirements on each listing before you write.",
      ],
    ],
    related: [
      "marketing-guest-posting-sites",
      "saas-guest-posting-sites",
      "guest-posting-sites-usa",
    ],
  },
  {
    slug: "health-guest-posting-sites",
    label: "Health publishers",
    h1: "Health guest posting sites",
    metaTitle: "Health and Wellness Guest Posting Sites",
    metaDescription:
      "Compare health and wellness guest posting sites with live metrics and USD prices. Review editorial standards before placing health content.",
    lead: "Health, wellness, beauty and fitness publications for brands that need careful, accurate coverage in a sensitive niche.",
    filter: { categories: ["Health", "Beauty", "Sports"] },
    browse: [category("Health"), category("Beauty"), category("Sports")],
    sections: [
      {
        title: "Accuracy is not optional",
        body: "Health content can affect readers’ wellbeing, and search engines hold it to a higher standard. Support claims with reputable sources, avoid promising outcomes and have qualified people review medical statements.",
      },
      {
        title: "Check the publisher’s own standards",
        body: "Strong health publishers show who writes and reviews their articles and correct mistakes openly. Prefer them; a placement on a careless health site can damage trust in your brand.",
      },
    ],
    checklist: [
      "Medical and health claims are sourced",
      "No guaranteed results or cures are implied",
      "The publisher shows authorship and review standards",
      "The topic matches your product and audience",
    ],
    faq: [
      [
        "Which categories are included?",
        "Health, Beauty and Sports listings from the active inventory.",
      ],
      [
        "Can I place supplement or CBD content?",
        "Some publishers restrict these topics. Check each listing’s requirements before writing.",
      ],
    ],
    related: [
      "travel-lifestyle-guest-posting-sites",
      "business-guest-posting-sites",
      "guest-posting-sites-usa",
    ],
  },
  {
    slug: "travel-lifestyle-guest-posting-sites",
    label: "Travel and lifestyle publishers",
    h1: "Travel and lifestyle guest posting sites",
    metaTitle: "Travel and Lifestyle Guest Posting Sites",
    metaDescription:
      "Browse travel, lifestyle, food and home guest posting sites with live DA, DR, traffic and USD prices. Compare publishers by audience and topic.",
    lead: "Travel, lifestyle, food, fashion and home publications for consumer brands, hospitality and destination marketing.",
    filter: {
      categories: [
        "Travelling",
        "Lifestyle",
        "Food",
        "Fashion",
        "Home and Family",
      ],
    },
    browse: [
      category("Travelling"),
      category("Lifestyle"),
      category("Food"),
      category("Fashion"),
      category("Home and Family"),
    ],
    sections: [
      {
        title: "Visual, experience-led content wins",
        body: "Lifestyle readers respond to first-hand experience, good photography and practical detail: what it cost, how long it took, what you would do differently. Plan images and specifics before you write.",
      },
      {
        title: "Seasonality changes the value of a placement",
        body: "Travel and lifestyle search interest moves with the seasons. Publish ahead of the season you are targeting so the article has time to be indexed and shared.",
      },
    ],
    checklist: [
      "The article includes first-hand detail and original images",
      "Publication timing fits the season you target",
      "The site’s readers match your customers",
      "Affiliate or sponsored links are disclosed",
    ],
    faq: [
      [
        "Which categories are included?",
        "Travelling, Lifestyle, Food, Fashion and Home and Family listings from the active inventory.",
      ],
      [
        "Can I include my own photos?",
        "Ask the publication whether it accepts original images, and confirm the required dimensions and usage rights before submitting them.",
      ],
    ],
    related: [
      "health-guest-posting-sites",
      "guest-posting-sites-usa",
      "guest-posting-sites-under-50",
    ],
  },
];

export const directories = directoryDefinitions.map(directory=>({...directory,lead:directoryIntros[directory.slug] || directory.lead,faq:[...directory.faq,['Are these metrics independently verified?','No. Catalogue metrics and prices are owner-supplied. Ask for each metric’s provider and measurement date, and confirm current scope with the publisher. A listing update date does not verify its readership.'] as [string,string]]}));

export const directoryBySlug = (slug: string) =>
  directories.find((directory) => directory.slug === slug);
