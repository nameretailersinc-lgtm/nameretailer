import type { MarketplaceRange } from "../commerce/marketplace-ranges";
import type { CatalogueStatistics } from "../commerce/catalogue-statistics";

/** Range pages index only with enough listings and enough unique, data-led copy. */
export const MIN_INDEXABLE_LISTINGS = 15;
export const MIN_INDEXABLE_WORDS = 150;

type Kind = "da" | "dr" | "traffic" | "price";
const kindOf = (slug: string): Kind =>
  slug.startsWith("da-")
    ? "da"
    : slug.startsWith("dr-")
      ? "dr"
      : slug.startsWith("price-")
        ? "price"
        : "traffic";

const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
const list = (names: string[]) =>
  names.length < 2
    ? names.join("")
    : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

/** Lower bound of the band, for choosing low/mid/high guidance. */
function lowerBound(range: MarketplaceRange) {
  const key = Object.keys(range.bounds).find((name) => name.startsWith("min"));
  return key ? Number(range.bounds[key]) : 0;
}

function guidance(range: MarketplaceRange): string[] {
  const low = lowerBound(range);
  switch (kindOf(range.slug)) {
    case "da":
      return [
        "Domain Authority is Moz’s 1–100 score that predicts how likely a domain is to rank, based mainly on its link profile. It is relative and logarithmic, so moving from DA 70 to 80 is much harder than moving from 20 to 30, and it is not a Google metric.",
        low >= 60
          ? "A score this high usually takes a large link profile built over years. The higher price usually reflects that authority, so judge whether the topic and readership justify it rather than paying for the score alone."
          : low >= 30
            ? "Mid-range DA sites often combine a real readership with prices a campaign can repeat. Check recent articles for editorial standards, because the score alone does not separate an edited publication from one that accepts any submission."
            : "Low-DA sites are often newer or narrowly focused. They can suit a tightly targeted topic or a test budget, but check that the site publishes real articles and has visitors, not only a high volume of sponsored posts.",
        "Compare DA only with other DA values, never with Ahrefs’ Domain Rating, and weigh it against audience fit, language and country before shortlisting.",
      ];
    case "dr":
      return [
        "Domain Rating is Ahrefs’ 0–100 measure of the strength of a site’s backlink profile compared with every other site in Ahrefs’ index. It says nothing directly about traffic, topic or editorial quality.",
        low >= 50
          ? "DR above 50 usually means many referring domains, often including well-known sites. Expect higher placement prices and stricter editorial review, and confirm whether the publisher marks paid links as sponsored."
          : low >= 20
            ? "DR 20–50 covers most established niche blogs and regional publications. It is the band where audience relevance matters most, because many sites here have similar link strength but very different readers."
            : "DR below 20 often means a young or small site. Some are genuine niche publications, so look at their articles and traffic before ruling them in or out, and avoid treating a low score as a reason to buy in bulk.",
        "Ask when the DR value was measured. Scores change as Ahrefs recrawls the web, and listing data may lag the live value.",
        "DR is easier to raise than readership. Before you rely on it, set it beside the site’s estimated traffic and its recent articles: a strong score with little traffic, or with traffic from topics unrelated to the site, deserves a closer look before you order.",
      ];
    case "price":
      return [
        "Prices on this page are the publisher-supplied USD cost of the placement only. Article writing, where offered, is priced separately, so add it to your budget if you are not supplying the article yourself.",
        low >= 150
          ? "At this budget, compare what the higher price buys: traffic, topical authority, editorial standards or a do-follow link. A high price is not evidence of quality, so check each publication as carefully as a cheaper one."
          : low >= 50
            ? "This is the band many repeat campaigns use. It leaves room to compare several publications in the same topic and choose on audience fit rather than price alone."
            : "Lower-priced placements can work for niche topics and testing, but check recent articles for signs of a site that exists mainly to sell links, such as unrelated topics side by side or no named authors.",
        "Confirm turnaround, the number of links included and how the post will be labelled before ordering. A saved plan does not reserve a price. If a price looks out of line, compare it with the median for the same topic and authority band in the guest post cost guide before deciding.",
      ];
    default:
      return [
        "Traffic figures are supplied estimates of monthly organic visits, usually modelled from keyword rankings by a third-party tool rather than measured analytics. Treat them as an order of magnitude and ask which tool and date the figure comes from.",
        low >= 1_000_000
          ? "Sites at this scale are large publications. Placement prices tend to be higher, and an article may receive less individual attention on a busy site, so ask where it will appear and whether it will be linked from category pages."
          : low >= 100_000
            ? "This band holds many established publications with steady search visibility. Check that the traffic comes from topics related to yours; a site can rank well for subjects your readers never search."
            : "Lower estimated traffic is common for specialist or local sites. A small but relevant readership can be worth more than a large general one, so judge the audience, not just the number.",
        "Missing traffic values are excluded from these bands rather than counted as zero.",
        "Traffic is the closest of the supplied metrics to an actual audience, but it is still a model. After publication, measure the referral visits and conversions your placement sends, and use those results, not the estimate, to decide whether to order from the same publication again.",
      ];
  }
}

export function rangeCopy(
  range: MarketplaceRange,
  stats: CatalogueStatistics | null,
  catalogue: CatalogueStatistics | null,
) {
  const paragraphs: string[] = [];
  if (stats && stats.total > 0) {
    let summary = `${stats.total.toLocaleString("en-US")} active publications fall in ${range.label}.`;
    if (
      stats.minPriceCents !== null &&
      stats.maxPriceCents !== null &&
      stats.medianPriceCents !== null
    ) {
      summary += ` Their placement prices run from ${usd(stats.minPriceCents)} to ${usd(stats.maxPriceCents)}, with a median of ${usd(stats.medianPriceCents)}`;
      const median = catalogue?.medianPriceCents;
      if (median) {
        const ratio = stats.medianPriceCents / median;
        summary +=
          ratio > 0.95 && ratio < 1.05
            ? `, close to the catalogue-wide median of ${usd(median)}.`
            : ratio >= 2
              ? `, about ${ratio < 10 ? ratio.toFixed(1) : Math.round(ratio)} times the catalogue-wide median of ${usd(median)}.`
              : `, ${Math.round(Math.abs(ratio - 1) * 100)}% ${ratio > 1 ? "above" : "below"} the catalogue-wide median of ${usd(median)}.`;
      } else summary += ".";
    }
    if (stats.topTopics.length)
      summary += ` The most common topics are ${list(stats.topTopics.map((row) => row.name))}`;
    if (stats.topCountries.length)
      summary += `${stats.topTopics.length ? ", and" : " Most"} listings most often target ${list(stats.topCountries.map((row) => row.name))}.`;
    else if (stats.topTopics.length) summary += ".";
    paragraphs.push(summary);
  }
  paragraphs.push(...guidance(range));
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  return {
    heading: `About ${range.label} guest post sites`,
    paragraphs,
    indexable:
      !!stats &&
      stats.total >= MIN_INDEXABLE_LISTINGS &&
      words >= MIN_INDEXABLE_WORDS,
    description:
      stats && stats.total > 0 && stats.medianPriceCents !== null
        ? `${stats.total.toLocaleString("en-US")} guest post sites in ${range.label}, median placement ${usd(stats.medianPriceCents)}. Compare topic, country, DR, traffic and USD price before you plan a placement.`
        : `Guest post sites in ${range.label}. Compare topic, country, DR, traffic and USD price before you plan a placement.`,
  };
}
