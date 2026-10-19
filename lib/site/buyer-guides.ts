import type { CatalogueStatistics } from "../commerce/catalogue-statistics";
import { domainGuides } from "./domain-guides";
import { guestPostingGuides } from "./guest-posting-guides";
export type BuyerGuide = {
  slug: string;
  title: string;
  /** Meta description: what the reader gets, not the page template. */
  description: string;
  answer: string;
  questions: Array<{ title: string; body: string }>;
  steps?: string[];
  checklist?: string[];
  templates?: Array<{ title: string; text: string }>;
  faq?: Array<[question: string, answer: string]>;
  table?: { columns: string[]; rows: string[][] };
  related?: Array<[label: string, path: string]>;
  sources: Array<[string, string]>;
  approved: boolean;
  author?: string;
  reviewer?: string;
  publishedAt?: string;
  sourcesCheckedAt?: string;
  /** Date this guide's content last changed (ISO); drives dateModified and the sitemap. */
  updatedAt: string;
};
const google = [
  "Google: qualifying paid links",
  "https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links",
] as [string, string];
const spam = [
  "Google: link-spam policies",
  "https://developers.google.com/search/docs/essentials/spam-policies#link-spam",
] as [string, string];
const dr = [
  "Ahrefs: Domain Rating",
  "https://ahrefs.com/seo/glossary/domain-rating",
] as [string, string];
const da = [
  "Moz: authority scoring guide",
  "https://moz-static.s3.amazonaws.com/products/landing-pages/announcements/Authority_Scoring_Guide.pdf",
] as [string, string];
const traffic = [
  "Ahrefs: organic traffic estimation",
  "https://help.ahrefs.com/en/articles/1863206-what-is-organic-traffic-in-ahrefs-and-how-do-we-calculate-it",
] as [string, string];
// Content approved by owner 2026-10-09; author and original publication date supplied by owner. No reviewer published.
// Sections marked "expanded 2026-10-09" were added in the SEO audit pass and need the author's review.
export const buyerGuides: BuyerGuide[] = [
  ...domainGuides,
  ...guestPostingGuides,
  {
    slug: "guest-post-cost",
    title: "How much does a guest post cost?",
    updatedAt: "2026-10-18",
    sourcesCheckedAt: "2026-10-18",
    description:
      "Understand guest post costs, placement versus writing charges and a worked budget example. Compare dated catalogue price ranges and publisher scope.",
    answer: "",
    approved: true,
    author: "Zuhoor Uddin",
    publishedAt: "2026-07-02",
    sources: [google, spam],
    questions: [
      {
        title: "What do the catalogue prices show?",
        body: "The snapshot below covers active publications and their supplied USD placement prices. It excludes writing and other costs not included in the placement field. A catalogue update date does not establish when a publisher measured its metrics.",
      },
      {
        title: "What should I include in my budget?",
        body: "Compare the placement price with available writing options, then ask the team about the agreed scope and delivery timing. A saved plan does not reserve inventory or a price.",
      },
      // expanded 2026-10-09
      {
        title: "Why do guest post prices vary so much?",
        body: "A placement price describes one listing’s offered scope. Publishers with similar scores can serve different readers and have different writing, review, link and availability terms. The catalogue distribution does not establish what caused a price difference. Compare publications covering the same topic and language, then confirm the scope directly. Do not infer a ranking benefit or an editorial quality certification from a higher price.",
      },
      {
        title: "Is article writing included in the price?",
        body: "No. The listed price is the placement only. Where a publisher offers writing, it is a separate charge for a 500-, 750- or 1,000-word article; a tier shown as unavailable is not free. If you supply your own article, budget time for the publisher’s editorial review and any requested changes.",
      },
      {
        title: "How should I read the price tables?",
        body: "Each row shows how many active listings fall in a group, the median placement price, and the middle half of prices (25th to 75th percentile). The middle range is a better guide to a normal price than the minimum or maximum, which a few outliers pull far apart. Groups with fewer than 15 listings are left out. Metrics are supplied with the listings and not independently verified.",
      },
      {
        title: "Worked example: a placement price is not the total budget",
        body: "For illustration only, suppose a placement is quoted at $45, writing at $20 and your separate editing allowance is $10. Your working total is $75 before any other applicable charges. These are hypothetical inputs, not Name Retailer prices, publisher quotes or a market average. Replace each amount with an actual agreed figure, and do not count an unavailable writing option as free. Compare this total, rather than the $45 headline, against your budget.",
      },
      {
        title: "How do I compare affordable guest posting websites?",
        body: "Set a placement ceiling, then keep only publications relevant to your audience. A directory of guest posting sites under $50 is a price filter, not a quality certification or an all-in package. Read recent articles, confirm language and audience location, and inspect available traffic evidence. A cheaper site that reaches the wrong readers may be unsuitable even if its supplied authority score is higher. Save several candidates and settle missing scope or price details before committing.",
      },
      {
        title: "How does guest post cost compare with niche edit cost?",
        body: "A new guest post and a link insertion are different scopes, so their prices are not interchangeable. A new article may require writing and editorial review; an insertion requires a genuinely relevant existing page and the publisher’s agreement to edit it. This catalogue does not establish that both formats are offered. Ask for separate current quotes and paid-link terms, then compare only the options actually available. Neither format guarantees rankings or link equity.",
      },
    ],
    table: {
      columns: [
        "Illustrative budget item",
        "Hypothetical amount",
        "Replace with",
      ],
      rows: [
        ["Placement", "$45", "Current publisher placement quote"],
        ["Writing", "$20", "Available agreed writing charge, if needed"],
        ["Editing allowance", "$10", "Your own editorial budget"],
        [
          "Illustrative total",
          "$75",
          "Actual confirmed costs plus any applicable charges",
        ],
      ],
    },
    related: [
      ["Compare free and paid contributions", "/guides/free-vs-paid-guest-posting/"],
      ["Compare guest post pricing by niche", "/guest-post-prices/"],
      [
        "Guest posting sites with placement prices up to $50",
        "/guest-posting-sites-under-50/",
      ],
      [
        "Use the existing guest-post budget worksheet",
        "/blog/a-practical-guest-post-budget-worksheet/",
      ],
      [
        "Compare guest posts and link insertions",
        "/guides/guest-post-vs-link-insertion/",
      ],
    ],
  },
  {
    slug: "guest-post-vs-link-insertion",
    title: "Guest post vs link insertion",
    updatedAt: "2026-10-19",
    sourcesCheckedAt: "2026-10-19",
    description:
      "Guest post or link insertion? How the two formats differ in content, indexing, disclosure and price, and what to confirm with a publisher before choosing.",
    answer:
      "A guest post adds a new article to a publication; a link insertion adds a link to an existing article. Compare the surrounding content, editorial scope and disclosure before choosing a format. Confirm which format the publisher offers and what the quoted price covers, rather than assuming either option is included.",
    approved: true,
    author: "Zuhoor Uddin",
    publishedAt: "2026-07-02",
    sources: [google, spam],
    questions: [
      {
        title: "How do the formats differ?",
        body: "A new article needs a content brief and editorial review. An insertion needs an existing page with a relevant context. Publication listings do not establish that both formats are offered.",
      },
      {
        title: "What should I confirm before choosing?",
        body: "Ask about the exact page or article scope, disclosure, link qualification, price and delivery timing. Check the publisher’s actual content and ask which terms apply.",
      },
      // expanded 2026-10-09
      {
        title: "When does a link insertion make more sense?",
        body: "An insertion can suit you when an existing article already covers your topic closely and has been published long enough to be indexed. The surrounding text was written for the original article, so the link should add something a reader of that article would want; an unrelated link dropped into an old post serves neither the reader nor you.",
      },
      {
        title: "When is a new guest post the better choice?",
        body: "A new article lets you shape the topic, angle and supporting sources, and it is easier to label clearly as sponsored. It needs more work: a brief, a manuscript that meets the publisher’s guidelines, and editorial review. Choose it when no existing article fits or when you want the content itself to inform readers.",
      },
      {
        title: "Do both formats need sponsored disclosure?",
        body: 'Yes. Paying for a link is a paid placement whether the article is new or old. Google asks for paid links to be qualified with rel="sponsored" (or nofollow), and readers should be able to tell the content is sponsored. Confirm both before ordering either format.',
      },
    ],
    table: {
      columns: ["Format", "Content", "Confirm"],
      rows: [
        ["Guest post", "New article", "Writing and editorial scope"],
        ["Link insertion", "Existing article", "Page context and availability"],
      ],
    },
    related: [
      ["Compare guest post costs and budgets", "/guides/guest-post-cost/"],
      [
        "Understand paid-link qualification",
        "/guides/paid-guest-posts-google-link-policies/",
      ],
      ["Evaluate a guest post publisher", "/guides/vet-a-guest-post-site/"],
    ],
  },
  {
    slug: "da-vs-dr-and-traffic",
    title: "DA vs DR and traffic estimates",
    updatedAt: "2026-10-18",
    sourcesCheckedAt: "2026-10-18",
    description:
      "DA vs DR explained: who publishes each score, what it measures, why they disagree, and how to read traffic estimates when comparing guest post sites.",
    answer:
      "DA and DR are different third-party scores: Moz supplies Domain Authority and Ahrefs supplies Domain Rating. Traffic estimates are another signal and should be read with their provider, method and observation date. Use these measures to compare publications alongside audience relevance and editorial quality, while keeping missing values separate from zero.",
    approved: true,
    author: "Zuhoor Uddin",
    publishedAt: "2026-07-02",
    sources: [da, dr, traffic],
    questions: [
      {
        title: "Are DA and DR interchangeable?",
        body: "They come from different providers and models. Compare each score within its own system. Neither score establishes that a publication will reach your audience.",
      },
      {
        title: "How should I read catalogue traffic?",
        body: "Ask for the provider and measurement date. The catalogue’s supplied traffic figures are not independently verified analytics. Ahrefs’ organic estimate uses keyword positions, search-volume estimates and estimated click-through rates; that does not identify the provider of an unspecified catalogue field.",
      },
      // expanded 2026-10-09
      {
        title: "Why can a site have a high DA but a low DR?",
        body: "Moz and Ahrefs crawl the web separately, count links differently and scale their scores differently. A site can look strong in one index and weaker in the other, especially if many of its links come from sources one crawler sees and the other does not. A large gap between the two is a reason to look at the site’s links and content more closely, not a reason to trust whichever score is higher.",
      },
      {
        title: "Can authority scores be inflated?",
        body: "Yes. Both scores depend on links, and links can be bought or built to raise a score without the site gaining readers. Signs to check: a high score with little organic traffic, traffic from topics unrelated to the site, or a sharp recent jump in score. Treat these as questions to ask, not proof of manipulation.",
      },
      {
        title: "Which metric should I filter by first?",
        body: "Start with topic and language, and use the listing country to narrow your research. Those fields do not prove that your audience visits the site. Compare DA with DA and DR with DR; neither is a Google ranking score. Then review the traffic source, date and topic mix before using it to rank candidates. Read recent articles and confirm actual audience geography rather than assuming a large number means useful readers.",
      },
      {
        title: "Does a traffic figure mean organic search traffic?",
        body: "Not necessarily. Organic search visits, total website visits and page views describe different things. An unlabeled supplied traffic figure does not identify the channel, reporting window or measurement method. Ask whether it is a third-party estimate or first-party analytics, whether it covers the root domain or a section, and which dates it covers. Ahrefs’ organic estimate uses search positions, search volumes and click-through-rate assumptions; it is not a direct count from a publisher’s analytics.",
      },
      {
        title: "What evidence should I request from a publisher?",
        body: "Ask for the metric provider, the observation date, the domain or section measured, the date range and the audience breakdown relevant to your campaign. Where a publisher supplies an analytics or Search Console export, confirm what it measures and whether sensitive data can be redacted. Compare like-for-like periods and channels. A screenshot alone is not independent verification, and a catalogue update date records the listing change rather than proving the metric was measured then.",
      },
      {
        title: "Example: compare relevance before headline numbers",
        body: "Imagine two hypothetical publishers: one has a larger supplied traffic estimate but mostly covers unrelated entertainment topics; another has a smaller estimate and recent software tutorials relevant to your product. The larger number alone cannot decide a SaaS placement. Check both sources and dates, relevant pages, audience location and editorial requirements before choosing. This example explains a decision process; it is not a comparison of actual publishers or a prediction of results.",
      },
    ],
    table: {
      columns: ["Measure", "Provider", "Interpretation"],
      rows: [
        ["DA", "Moz", "Relative authority score"],
        ["DR", "Ahrefs", "Relative backlink-profile strength"],
        [
          "Traffic estimate",
          "Confirm with supplier",
          "Estimate with method and date",
        ],
      ],
    },
    related: [
      ["Evaluate guest post publishers", "/guides/vet-a-guest-post-site/"],
      [
        "Compare guest posting sites by supplied Domain Rating",
        "/guest-post-by-dr/",
      ],
      ["Review listing and metric methodology", "/methodology/"],
      ["Run the traffic-evidence workflow", "/guides/check-guest-post-website-traffic/"],
    ],
  },
  {
    slug: "vet-a-guest-post-site",
    title: "How to evaluate guest post publishers",
    updatedAt: "2026-10-18",
    sourcesCheckedAt: "2026-10-18",
    description:
      "A practical checklist to vet a guest post site: recent content, topic fit, link and disclosure terms, metric sources and the warning signs of a link farm.",
    answer:
      "Vet a guest-post site by checking its recent articles, topic relevance, editorial contacts and proposed placement scope. Compare supplied prices and metrics only after the publication makes sense for your audience. Ask for metric sources and dates, agree paid-link disclosure, and record questions about delivery and replacement terms before committing to an order.",
    approved: true,
    author: "Zuhoor Uddin",
    publishedAt: "2026-07-02",
    sources: [dr, google, spam],
    questions: [
      {
        title: "What should I inspect on the publication?",
        body: "Read recent articles and their sources. Check whether the proposed topic fits the publication, and ask who will review it. Confirm the article or page scope and the applicable terms.",
      },
      {
        title: "Which catalogue fields can help my shortlist?",
        body: "Use topic, country, language, price and supplied metrics as comparison fields. Country alone does not verify audience geography, and an unavailable metric is not evidence of zero performance.",
      },
      // expanded 2026-10-09
      {
        title: "What are the warning signs of a link farm?",
        body: "Be cautious when a site publishes on many unrelated topics side by side, has no named authors or editorial contact, shows many outbound commercial links in each article, or has recent posts that read as written only to carry a link. A “write for us” page that accepts any topic is another signal. None of these alone proves a problem, but several together should take a site off your shortlist.",
      },
      {
        title: "How can I check the traffic is real?",
        body: "Ask the publisher which tool supplied the figure and when it was measured, then look at whether the site ranks for searches related to its own topic. A site whose estimated traffic comes from unrelated keywords, or that fell sharply recently, may not reach the audience the number suggests.",
      },
      {
        title: "What should I agree before paying?",
        body: "Agree the article scope or target page, the number and type of links, the sponsored label and link attribute, the expected publication date, and what happens if the post is removed or edited later. Keep that agreement in writing with the order.",
      },
      {
        title: "How do I assess topical relevance?",
        body: "Read several recent articles in the publication section where your piece would appear. Note the reader, topic depth, author expertise and the kinds of sources used. Then write one sentence explaining why that reader would need your article. A broad category match is only a starting point: a consumer gadget blog and a technical software publication may both be labeled Technology while serving very different audiences. If the proposed angle feels out of place, revise it or choose another publisher.",
      },
      {
        title: "A practical publisher review record",
        body: "For each candidate, record the date you checked it, relevant article URLs, topic and language fit, metric source and date, the supplied placement price, writing scope and unanswered questions. Mark each item confirmed, unconfirmed or unsuitable; do not turn missing evidence into a passing score. If a crucial item remains unconfirmed, ask the publisher before proceeding. Keep this record with your brief so a colleague or client can understand why the site stayed on the shortlist.",
      },
      {
        title: "When should I reject or pause a listing?",
        body: "Pause if the publisher cannot explain the proposed article location, price inclusions or paid-link qualification. Reject a candidate when its content is irrelevant to the audience you need, its stated restrictions conflict with your brief, or it cannot meet your essential editorial requirements. A high DA or DR does not resolve these problems. Record the reason and compare another candidate rather than inventing verification or treating a metric threshold as approval.",
      },
    ],
    related: [
      [
        "Follow the guest posting website selection workflow",
        "/how-to-buy-links/",
      ],
      [
        "Understand DA, DR and supplied traffic evidence",
        "/guides/da-vs-dr-and-traffic/",
      ],
      [
        "Review paid-link qualification",
        "/guides/paid-guest-posts-google-link-policies/",
      ],
      ["Browse publishers by industry", "/guest-posting-sites/"],
      ["Use the final publishing checklist", "/guides/guest-posting-checklist/"],
    ],
  },
  {
    slug: "paid-guest-posts-google-link-policies",
    title: "Paid guest posts and Google’s link policies",
    updatedAt: "2026-10-18",
    sourcesCheckedAt: "2026-10-18",
    description:
      "Compare ordinary, nofollow and sponsored guest post links, understand Google's paid-link requirements and check the published markup against agreed terms.",
    answer:
      "Paid guest posts need appropriate link qualification. Google recommends rel=" +
      '"sponsored"' +
      " for advertising and paid placements and also accepts nofollow. Its spam policies address links created primarily to manipulate rankings. Confirm the publisher’s disclosure and link markup before placement, and do not treat payment or a metric score as a promise of search performance.",
    approved: true,
    author: "Zuhoor Uddin",
    publishedAt: "2026-07-02",
    sources: [google, spam],
    questions: [
      {
        title: "How should a paid link be marked?",
        body: 'Agree sponsored-content disclosure with the publisher. Google recommends rel="sponsored" for paid links; nofollow remains acceptable. The article’s visible disclosure and the link’s attribute address different parts of the placement.',
      },
      {
        title: "What should I ask the publisher?",
        body: "Ask how the content will be labelled and how the link will be qualified. Record the agreed scope before ordering. Search performance cannot be guaranteed by payment, format or supplied metrics.",
      },
      // expanded 2026-10-09
      {
        title: "Is buying a guest post against Google’s rules?",
        body: 'Paying for a placement is not forbidden in itself; sponsored content is a normal form of advertising. Google’s link-spam policy targets paid links that pass ranking credit, meaning links without rel="sponsored" or nofollow. A clearly labelled sponsored article with a qualified link is within the policy; an unlabelled paid link intended to raise rankings is not.',
      },
      {
        title: "What happens if a paid link is not qualified?",
        body: "Google says it may ignore links it identifies as link spam, and sites that buy or sell links that pass ranking credit can receive manual actions, which are reported in Search Console. An unqualified paid link carries risk for both the publisher and the buyer and may deliver no ranking value at all.",
      },
      {
        title: "Then what is the value of a sponsored guest post?",
        body: "Its value is the audience: referral visits, brand exposure to the publication’s readers, and content that answers their questions. Choose publications your customers already read, measure referral traffic and conversions from each placement, and judge the next order on those results rather than on authority scores.",
      },
      {
        title: "How do I check the live link attributes?",
        body: "Inspect the actual link element on the published page and compare its href and rel values with the agreement. A visible Sponsored label does not itself add a rel attribute to a link. Conversely, a sponsored attribute does not explain the commercial relationship to readers. If the markup or disclosure differs, ask the editor to correct the specific issue and retain the response. Do not infer attributes from a catalogue label alone.",
      },
    ],
    table: {
      columns: ["Link treatment", "Meaning", "Paid placement use"],
      rows: [
        ["No qualifying rel (often called dofollow)", "Ordinary unqualified link; dofollow is not a required HTML attribute", "Does not identify the paid relationship"],
        ["rel=nofollow", "Qualifies the link", "Accepted by Google for paid links"],
        ["rel=sponsored", "Identifies advertising or a paid placement", "Google's recommended value for paid links"],
        ["Reader-facing disclosure", "Explains the relationship in visible text", "Discuss separately from HTML attributes"],
      ],
    },
    related: [["Compare free and paid guest posting", "/guides/free-vs-paid-guest-posting/"], ["Check before and after publication", "/guides/guest-posting-checklist/"], ["Measure reader outcomes", "/guides/measure-guest-posting-results/"]],
  },
  {
    slug: "guest-post-vs-sponsored-post",
    title: "What is a guest post vs a sponsored post?",
    description:
      "Understand contributor authorship, paid sponsorship, disclosure and link qualification, and the questions to ask before planning a publication placement.",
    answer:
      "A guest post describes an article contributed by an outside writer; a sponsored post describes a paid commercial relationship. An article can be both. If payment or another benefit is involved, agree visible disclosure and qualify paid links with sponsored or nofollow. Confirm editorial scope separately from the format’s label.",
    approved: true,
    updatedAt: "2026-10-19",
    sourcesCheckedAt: "2026-10-19",
    sources: [google, spam],
    questions: [
      {
        title: "Can a guest post also be sponsored?",
        body: "Yes. Contributor authorship and commercial sponsorship describe different things. Calling a paid article a guest post does not remove the need to discuss disclosure and paid-link qualification.",
      },
      {
        title: "Does sponsorship determine the writing scope?",
        body: "No. Confirm who writes the article, which revisions are included, how many links are allowed and whether image rights are covered. The marketplace placement price and any writing service should be checked separately.",
      },
      {
        title: "What should readers be told?",
        body: "Agree a clear sponsored-content label with the publisher when the article involves a commercial relationship. Visible disclosure helps readers understand the relationship; a link attribute communicates a different signal to search engines.",
      },
      {
        title: "Example: comparing an editorial pitch and a sponsored quote",
        body: "Suppose a fictional logistics software team pitches a practical freight-documentation checklist to an industry trade journal. If the editor accepts it purely on editorial merit with no payment or commercial exchange, it is an unpaid guest contribution. If another publication charges a placement fee to publish the tutorial, the article is both a contributed guest post and a sponsored placement. In the second case, the team records the fee, agrees visible sponsorship labelling and confirms rel=\"sponsored\" or nofollow before submitting the manuscript.",
      },
      {
        title: "Does either format guarantee rankings?",
        body: "No. Assess readership, relevance and editorial standards, and measure referral visits or enquiries after publication. A format label, authority score or paid placement does not guarantee search performance.",
      },
    ],
    steps: [
      "Identify whether money, products or another commercial benefit is part of the arrangement.",
      "Confirm who writes, edits and approves the article regardless of whether the publisher calls it a guest post or a sponsored post.",
      "Agree visible reader disclosure and HTML link qualification (rel=\"sponsored\" or nofollow) for any paid placement.",
      "Inspect the live published article and record referral visits or enquiries over a defined period.",
    ],
    checklist: [
      "Authorship and writing responsibilities are documented",
      "Commercial exchange is identified honestly",
      "Visible reader disclosure is agreed with the editor",
      "Paid outbound links use rel=\"sponsored\" or rel=\"nofollow\"",
      "Placement and writing fees are compared separately",
    ],
    faq: [
      [
        "Is a paid guest post the same as a sponsored post?",
        "When a guest post involves payment or another commercial benefit for placement, it is a sponsored placement. Both visible reader disclosure and paid-link qualification apply.",
      ],
      [
        "Do unpaid guest posts need rel=\"sponsored\"?",
        "Google recommends rel=\"sponsored\" for links that are advertisements or paid placements. For unpaid contributions, editors still control which links are editorially justified and how outbound links are formatted.",
      ],
    ],
    table: {
      columns: ["Question", "Guest post", "Sponsored post"],
      rows: [
        [
          "What does it describe?",
          "An outside contributor’s article",
          "Paid content or a commercial relationship",
        ],
        [
          "Can it involve payment?",
          "Yes; it can also be sponsored",
          "Sponsorship involves a commercial benefit",
        ],
        [
          "How are paid links qualified?",
          "Sponsored or nofollow when paid",
          "Sponsored or nofollow for paid links",
        ],
      ],
    },
    related: [
      [
        "Compare free and paid guest posting",
        "/guides/free-vs-paid-guest-posting/",
      ],
      [
        "Read Google's paid-link policy guide",
        "/guides/paid-guest-posts-google-link-policies/",
      ],
      ["Compare guest post costs", "/guides/guest-post-cost/"],
      ["Browse the guest post marketplace", "/"],
    ],
  },
];
export function costAnswer(stats: CatalogueStatistics) {
  if (
    !stats.updatedAt ||
    !Number.isFinite(Date.parse(stats.updatedAt)) ||
    stats.minPriceCents === null ||
    stats.maxPriceCents === null ||
    stats.medianPriceCents === null
  )
    return "A guest post’s cost depends on the publication and agreed placement scope. The catalogue has no price distribution with a valid date available right now. Check each listing when inventory returns, and confirm writing costs, delivery timing and sponsored-link disclosure with the team before planning a placement.";
  const money = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 3,
    }).format(value / 100);
  return `Guest-post placements range from ${money(stats.minPriceCents)} to ${money(stats.maxPriceCents)}, with a median of ${money(stats.medianPriceCents)} across ${stats.total.toLocaleString("en-US")} active listings. These are supplied placement prices, not completed transactions or campaign quotes. Writing may cost extra. Compare relevant publishers and confirm editorial scope, availability and paid-link disclosure before planning a placement.`;
}
