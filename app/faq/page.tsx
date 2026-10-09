import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import { InformationShell } from "@/components/site/information-page";
import { buyerQuestions } from "@/lib/site/faq";
import {
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
      path="/faq/"
      title="A few useful answers."
      label="Frequently asked questions"
      description="Answers about placement prices, supplied metrics, sponsored disclosure, accounts and placement requests."
      active="help"
      image="/01_guest_post_checklist.png"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            jsonLdGraph(
              faqPageNode(
                buyerQuestions.map((item) => [
                  item.question,
                  `${item.answer} ${item.detail}`,
                ]),
              ),
            ),
          ),
        }}
      />
      <section
        className="reference-tool-faq reference-information-next"
        aria-label="Marketplace questions"
      >
        {buyerQuestions.map(({ question, answer, detail }) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
            <p>{detail}</p>
          </details>
        ))}
      </section>
    </InformationShell>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const facets = facetMetadata("/faq/", await searchParams);
  return pageMetadata(
    {
      ...baseMetadata,
      alternates: facets.alternates,
      robots: {
        ...(facets.robots as object),
        ...(baseMetadata.robots as object),
      },
    },
    "/faq/",
  );
}
