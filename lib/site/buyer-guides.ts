import type { CatalogueStatistics } from "../commerce/catalogue-statistics";
export type BuyerGuide = {
  slug: string;
  title: string;
  /** Meta description: what the reader gets, not the page template. */
  description: string;
  answer: string;
  questions: Array<{ title: string; body: string }>;
  table?: { columns: string[]; rows: string[][] };
  sources: Array<[string, string]>;
  approved: boolean;
  author?: string;
  reviewer?: string;
  publishedAt?: string;
  sourcesCheckedAt?:string;
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
  {
    slug: "guest-post-cost",
    title: "How much does a guest post cost?",
    updatedAt: "2026-10-09",
    description:
      "Guest post prices across every active listing: median cost, typical ranges by DA, DR, country and topic, and what a placement price leaves out.",
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
        body: "Publishers set their own prices. Higher authority scores and larger traffic estimates usually cost more, but the relationship is loose: two sites with the same DA can differ several-fold in price because of topic demand, editorial standards, how many links are allowed and whether the post is marked as sponsored. The tables below show the spread inside each band, so compare a quote with the typical range for similar sites rather than with the catalogue as a whole.",
      },
      {
        title: "Is article writing included in the price?",
        body: "No. The listed price is the placement only. Where a publisher offers writing, it is a separate charge for a 500-, 750- or 1,000-word article; a tier shown as unavailable is not free. If you supply your own article, budget time for the publisher’s editorial review and any requested changes.",
      },
      {
        title: "How should I read the price tables?",
        body: "Each row shows how many active listings fall in a group, the median placement price, and the middle half of prices (25th to 75th percentile). The middle range is a better guide to a normal price than the minimum or maximum, which a few outliers pull far apart. Groups with fewer than 15 listings are left out. Metrics are supplied with the listings and not independently verified.",
      },
    ],
  },
  {
    slug: "guest-post-vs-link-insertion",
    title: "Guest post vs link insertion",
    updatedAt: "2026-10-09",
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
  },
  {
    slug: "da-vs-dr-and-traffic",
    title: "DA vs DR and traffic estimates",
    updatedAt: "2026-10-09",
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
        body: "Filter by topic, country and language first, because they decide whether your audience is there at all. Then use one authority score consistently (DA or DR, not both) to narrow the list, and use traffic to rank the remaining sites. Read a few recent articles on each shortlisted site before deciding.",
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
  },
  {
    slug: "vet-a-guest-post-site",
    title: "How to vet a guest post site",
    updatedAt: "2026-10-09",
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
    ],
  },
  {
    slug: "paid-guest-posts-google-link-policies",
    title: "Paid guest posts and Google’s link policies",
    updatedAt: "2026-10-09",
    description:
      "Are paid guest posts allowed by Google? What its link-spam policy says, when to use rel=sponsored, and how to buy placements without breaking it.",
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
    ],
  },
  {slug:'guest-post-vs-sponsored-post',title:'What is a guest post vs a sponsored post?',description:'Understand contributor authorship, paid sponsorship, disclosure and link qualification, and the questions to ask before planning a publication placement.',answer:'A guest post describes an article contributed by an outside writer; a sponsored post describes a paid commercial relationship. An article can be both. If payment or another benefit is involved, agree visible disclosure and qualify paid links with sponsored or nofollow. Confirm editorial scope separately from the format’s label.',approved:true,updatedAt:'2026-10-10',sourcesCheckedAt:'2026-10-10',sources:[google,spam],questions:[{title:'Can a guest post also be sponsored?',body:'Yes. Contributor authorship and commercial sponsorship describe different things. Calling a paid article a guest post does not remove the need to discuss disclosure and paid-link qualification.'},{title:'Does sponsorship determine the writing scope?',body:'No. Confirm who writes the article, which revisions are included, how many links are allowed and whether image rights are covered. The marketplace placement price and any writing service should be checked separately.'},{title:'What should readers be told?',body:'Agree a clear sponsored-content label with the publisher when the article involves a commercial relationship. Visible disclosure helps readers understand the relationship; a link attribute communicates a different signal to search engines.'},{title:'Does either format guarantee rankings?',body:'No. Assess readership, relevance and editorial standards, and measure referral visits or enquiries after publication. A format label, authority score or paid placement does not guarantee search performance.'}],table:{columns:['Question','Guest post','Sponsored post'],rows:[['What does it describe?','An outside contributor’s article','Paid content or a commercial relationship'],['Can it involve payment?','Yes; it can also be sponsored','Sponsorship involves a commercial benefit'],['How are paid links qualified?','Sponsored or nofollow when paid','Sponsored or nofollow for paid links']]}}

];
export function costAnswer(stats: CatalogueStatistics) {
  if(!stats.updatedAt || !Number.isFinite(Date.parse(stats.updatedAt)) || stats.minPriceCents===null || stats.maxPriceCents===null || stats.medianPriceCents===null)
    return 'A guest post’s cost depends on the publication and agreed placement scope. The catalogue has no price distribution with a valid date available right now. Check each listing when inventory returns, and confirm writing costs, delivery timing and sponsored-link disclosure with the team before planning a placement.';
  const money=(value:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:3}).format(value/100);
  return `Guest-post placements range from ${money(stats.minPriceCents)} to ${money(stats.maxPriceCents)}, with a median of ${money(stats.medianPriceCents)} across ${stats.total.toLocaleString('en-US')} active publications. These figures are owner-supplied, not independently verified, as of ${stats.updatedAt.slice(0,10)}. Writing may cost extra; compare audience fit and confirm editorial scope and sponsored-link disclosure with the publisher before planning a placement.`;
}
