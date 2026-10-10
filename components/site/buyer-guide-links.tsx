import Link from "next/link";
import { buyerGuides } from "@/lib/site/buyer-guides";
export function BuyerGuideLinks() {
  return (
    <section className="reference-card">
      <h2>Guest-post buying questions</h2>
      <p>
        <Link href="/guest-post-prices/">
          Dated guest post prices by niche, DA and country
        </Link>
      </p>
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
