import Link from "next/link";
import { buyerGuides } from "@/lib/site/buyer-guides";
export function BuyerGuideLinks() {
  return (
    <section className="reference-card">
      <h2>Guest-post buying questions</h2>
      <ul>
        {buyerGuides.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}/`}>{guide.title}</Link>
            {!guide.approved && " — DRAFT"}
          </li>
        ))}
      </ul>
    </section>
  );
}
