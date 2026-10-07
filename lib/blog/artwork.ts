import type { CmsRecord } from "@/lib/cms/types";
import { isSafeUrl } from "@/lib/cms/content";

const artwork = {
  checklist: ["01", "Illustration of a publication checklist"],
  research: ["03", "Illustration of a document, search lens and questions"],
  links: ["04", "Illustration of connected chain links"],
  writing: ["06", "Illustration of a writing document and pencil"],
  technical: ["07", "Illustration of technical tools, gears and chart bars"],
  geography: ["17", "Illustration of a map and globe"],
  measurement: ["19", "Illustration of an analytics dashboard"],
  budget: ["20", "Illustration of a budget document and coins"],
  answers: ["21", "Illustration of a page with a question symbol"],
  marketplace: [
    "22",
    "Illustration of a publication storefront and shopping cart",
  ],
  evidence: ["23", "Illustration of a document under a magnifying glass"],
  safeguards: ["24", "Illustration of a web page and shield with a checkmark"],
} as const;
type Theme = keyof typeof artwork;
const rules: Array<[RegExp, Theme]> = [
  [/budget|price|pricing|packages|charges|cost/, "budget"],
  [/disclosure|noindex|robots|crawler|unsupported|approval/, "safeguards"],
  [/backlink|internal.link/, "links"],
  [/language|geograph|location/, "geography"],
  [
    /metric|traffic|analytics|measurement|baseline|growth|report|experiment|reporting/,
    "measurement",
  ],
  [
    /source|evidence|fact.check|claim|citation|observations|review.checklist/,
    "evidence",
  ],
  [/answer|question|faq|aeo|definition|follow.up/, "answers"],
  [
    /write|writing|headline|description|content.refresh|handoff|alt.text|article.structure/,
    "writing",
  ],
  [
    /canonical|sitemap|structured.data|server.render|responsive|dimension|format|page.experience|migration/,
    "technical",
  ],
  [/publication|placement|guest.post|shortlist/, "marketplace"],
  [/geo|generative|comparison|search/, "research"],
  [/content|editor|organization|brand/, "writing"],
];
/** Match by article identity/content, never its index, page or sort position. */
export function articleArtwork(article: Pick<CmsRecord, "title" | "slug">) {
  const subject = `${article.title} ${article.slug}`.toLowerCase();
  const theme =
    rules.find(([pattern]) => pattern.test(subject))?.[1] || "checklist";
  const [number, alt] = artwork[theme];
  return {
    src: `/blogs/guide_image_${number}.png`,
    alt,
    width: 256,
    height: 256,
  };
}
/** Only an in-memory fallback; preserve valid editor-selected OG images and CMS records. */
export function articleWithArtwork(article: CmsRecord): CmsRecord {
  const image = articleArtwork(article);
  const supplied = article.data.ogImage;
  return {
    ...article,
    data: {
      ...article.data,
      ogImage:
        typeof supplied === "string" && isSafeUrl(supplied)
          ? supplied
          : image.src,
    },
  };
}
