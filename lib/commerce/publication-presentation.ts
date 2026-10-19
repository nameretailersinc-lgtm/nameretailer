import type { PublicProduct } from "./types";
import { concise } from "../seo/page-metadata";

export const publicationUsd = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export const publicationNumber = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-US")
    : "";
export const publicationDate = (value?: string | null) =>
  value && Number.isFinite(Date.parse(value))
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : "";

/** No text spinning: statements depend on actual fields, scope and reviewed evidence. */
export function publicationPresentation(product: PublicProduct) {
  const url = new URL(product.domain);
  const host = url.hostname.replace(/^www\./, "");
  const section = url.pathname !== "/" ? url.pathname : "";
  const identity = host + section;
  const content = product.publicationContent;
  const name = content?.publisherName || host;
  const label = section ? `${name} — ${section}` : name;
  const metrics = [
    product.metrics.dr != null ? `DR ${product.metrics.dr}` : null,
    product.metrics.da != null ? `DA ${product.metrics.da}` : null,
    product.metrics.traffic != null
      ? `traffic estimate ${publicationNumber(product.metrics.traffic)}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");
  const classification = [
    product.category && `topic: ${product.category}`,
    product.language && `language: ${product.language}`,
    product.country && `listing country: ${product.country}`,
  ]
    .filter(Boolean)
    .join("; ");
  const summary = `${section ? `The ${section} section of ${host}` : host} has a listed placement price of ${publicationUsd(product.priceCents)}.${classification ? ` Catalogue ${classification}.` : ""}${metrics ? ` Supplied metrics: ${metrics}.` : ""}`;
  const description = concise(
    `${identity}: ${publicationUsd(product.priceCents)} placement. ${content?.description || [classification, metrics, product.turnaround && `stated turnaround: ${product.turnaround}`].filter(Boolean).join(". ")}`,
    155,
  );
  const missing = [
    !content?.description &&
      "A source-backed description of the publication and its editorial scope",
    !content?.audienceDetails && "Audience geography and readership evidence",
    !content?.editorialGuidelines &&
      !content?.contentRequirements &&
      !product.requirements &&
      "Editorial guidelines and submission requirements",
    product.metrics.traffic == null &&
      "A traffic estimate for the relevant domain or section",
    !content?.metricsSource &&
      "The traffic provider, channel and measurement period",
    !content?.metricsMeasuredAt &&
      !product.metricsUpdatedAt &&
      "A metric measurement date",
    !product.linkType && "Link and disclosure terms",
    !product.turnaround && "A stated delivery estimate",
    !content?.priceIncludes &&
      "Confirmed placement inclusions and revision scope",
    !content?.priceExcludes &&
      "Confirmed exclusions and any additional charges",
  ].filter((value): value is string => !!value);
  const questions: Array<[string, string]> = [
    [
      `What is the listed placement price for ${identity}?`,
      `Placement is ${publicationUsd(product.priceCents)}.${product.writingOptions?.length ? ` Separate writing: ${product.writingOptions.map((option) => `${option.words} words at ${publicationUsd(option.priceCents)}`).join(", ")}.` : ""}${content?.priceIncludes ? ` ${content.priceIncludes}` : ""}`,
    ],
    ...(section
      ? [
          [
            `Does this listing cover all of ${host}?`,
            `This listing identifies ${product.domain}. It is a section-specific placement record; its terms must not be assumed to apply to the entire website.`,
          ] as [string, string],
        ]
      : []),
    ...(product.turnaround
      ? [
          [
            `What turnaround is stated for ${identity}?`,
            `${product.turnaround} is the supplied estimate. Confirm timing for your actual brief.`,
          ] as [string, string],
        ]
      : []),
    ...(product.linkType
      ? [
          [
            `What link terms are supplied for ${identity}?`,
            `Supplied terms: “${product.linkType}”. Confirm actual link attributes and paid-content disclosure.`,
          ] as [string, string],
        ]
      : []),
    ...(content?.audienceDetails
      ? [
          [
            `What audience information is documented for ${identity}?`,
            content.audienceDetails,
          ] as [string, string],
        ]
      : []),
  ];
  const customQuestions =
    content?.faqs?.map(({ question, answer }): [string, string] => [
      question,
      answer,
    ]) || [];
  const customKeys = new Set(
    customQuestions.map(([question]) => question.toLowerCase()),
  );
  return {
    host,
    section,
    identity,
    name,
    label,
    summary,
    description,
    title: `${identity} Guest Post: ${product.category || "Price & Terms"}`,
    missing,
    questions: [
      ...customQuestions,
      ...questions.filter(
        ([question]) => !customKeys.has(question.toLowerCase()),
      ),
    ],
  };
}

/** A research brief, never an invented publisher description or an indexing verdict. */
export function publicationEditorialBrief(
  product: PublicProduct,
  now = Date.now(),
) {
  const view = publicationPresentation(product);
  const content = product.publicationContent;
  const recheckAfterDays = 180;
  const evidenceAgeDays = content
    ? Math.max(0, Math.floor((now - Date.parse(content.checkedAt)) / 86400000))
    : null;
  return {
    listingUrl: product.domain,
    knownFacts: view.summary,
    missingInformation: view.missing,
    editorialStatus: !content
      ? "needs-editorial-review"
      : evidenceAgeDays !== null && evidenceAgeDays > recheckAfterDays
        ? "source-recheck-recommended"
        : "reviewed-source-recorded",
    recheckAfterDays,
    evidenceAgeDays,
    note: "The recheck interval is an internal maintenance prompt, not evidence that facts are false or a Google indexing threshold. Confirm claims against the cited evidence before publishing.",
  };
}

export function publicationPriceComparison(
  price: number,
  median: number | null,
) {
  if (median === null || median <= 0) return null;
  const change = Math.round((price / median - 1) * 100);
  if (change === 0) return "at the median";
  return `${Math.abs(change)}% ${change > 0 ? "above" : "below"} the median`;
}
