import Link from "next/link";
import { buyerGuides } from "@/lib/site/buyer-guides";
export function BuyerGuideLinks() {
  return (
    <section className="reference-card">
      <h2>Plan a useful guest post placement</h2>
      <p>
        <Link href="/guest-post-prices/">
          Dated guest post prices by niche, DA and country
        </Link>
      </p>
      <ul>
        {[
          ["Evaluate a publication's audience and editorial standards", "/guides/vet-a-guest-post-site/"],
          ["Understand DA, DR and traffic estimates", "/guides/da-vs-dr-and-traffic/"],
          ["Agree paid placement disclosure and link qualification", "/guides/paid-guest-posts-google-link-policies/"],
          ["Prepare your article and evidence", "/guides/write-a-guest-post/"],
        ].map(([label, href]) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
      </ul>
    </section>
  );
}

/** Plain crawlable list of every approved guide, the same set the sitemap publishes. */
export function AllBuyerGuides() {
  return (
    <section className="reference-card" aria-labelledby="all-buyer-guides">
      <h2 id="all-buyer-guides">All guest posting guides</h2>
      <ul>
        {buyerGuides
          .filter((guide) => guide.approved)
          .map((guide) => (
            <li key={guide.slug}>
              <Link href={`/guides/${guide.slug}/`}>{guide.title}</Link>
            </li>
          ))}
      </ul>
    </section>
  );
}
