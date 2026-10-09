import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import { InformationShell } from "@/components/site/information-page";
import { commonQuestions } from "@/lib/site/pages";
import {
  breadcrumbSchema,
  faqPageNode,
  jsonLdGraph,
  serializeJsonLd,
} from "@/lib/seo/structured-data";
const baseMetadata: Metadata = {
  title: "Name Retailer FAQ: Guest Post Buying Questions",
  description:
    "Answers about guest-post publication visibility, placement pricing, accounts, saved plans and how the Name Retailer marketplace works for buyers.",
};
export default function Page() {
  return (
    <InformationShell
      title="A few useful answers."
      label="Frequently asked questions"
      description="Answers about guest-post prices, publication scope, metrics, disclosure and ordering."
      active="help"
      image="/01_guest_post_checklist.png"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            jsonLdGraph(
              breadcrumbSchema([
                ["Home", "/"],
                ["FAQ", "/faq/"],
              ]),
              faqPageNode(commonQuestions),
            ),
          ),
        }}
      />
      <section
        className="reference-tool-faq reference-information-next"
        aria-label="Marketplace questions"
      >
        {commonQuestions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </InformationShell>
  );
}

export async function generateMetadata({searchParams}: {searchParams: Promise<SearchParams>}) {const facets=facetMetadata("/faq/",await searchParams);return pageMetadata({...baseMetadata, alternates: facets.alternates, robots: {...facets.robots as object,...baseMetadata.robots as object}},"/faq/");}
