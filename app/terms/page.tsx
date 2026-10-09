import Link from "next/link";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import { InformationShell } from "@/components/site/information-page";
// TODO(owner): publish approved terms of service. The previous site never had
// a terms page, so there is nothing to restore. Do not draft legal terms.
// Indexed at the owner's request (2026-10-09).
const baseMetadata: Metadata = {
  title: "Terms of Service",
  description:
    "Name Retailer's terms of service are not yet published. The refund, privacy and cookie policies that apply to the marketplace today.",
  alternates: { canonical: "https://nameretailer.com/terms/" },
};
export default function Page() {
  return (
    <InformationShell
      path="/terms/"
      title="Terms of Service"
      label="Terms of service"
      description="Our terms of service are not yet published. The policies below apply to the marketplace today."
      active="help"
      image="/01_guest_post_checklist.png"
    >
      <section className="reference-card">
        <h2>Policies that apply now</h2>
        <ul>
          <li>
            <Link href="/refund-policy/">Refund Policy</Link>: when a guest post
            order is refunded and how to request a refund.
          </li>
          <li>
            <Link href="/privacy/">Privacy Policy</Link>: how we collect, use
            and protect your personal data.
          </li>
          <li>
            <Link href="/cookies/">Cookie Policy</Link>: the cookies this site
            sets and how to control them.
          </li>
        </ul>
      </section>
      <section className="reference-card">
        <h2>Questions</h2>
        <p>
          Contact{" "}
          <a href="mailto:info@nameretailer.com">info@nameretailer.com</a> for
          questions about terms before you order.
        </p>
      </section>
    </InformationShell>
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const facets = facetMetadata("/terms/", await searchParams);
  return pageMetadata(
    {
      ...baseMetadata,
      alternates: facets.alternates,
      robots: facets.robots,
    },
    "/terms/",
  );
}
