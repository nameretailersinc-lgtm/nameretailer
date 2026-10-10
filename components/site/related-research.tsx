import Link from "next/link";
const links = [
  ["Guest posting sites by niche and country", "/guest-posting-sites/"],
  ["Dated guest post price distributions", "/guest-post-prices/"],
  ["How to evaluate a publication", "/guides/vet-a-guest-post-site/"],
] as const;
export function RelatedResearch() {
  return (
    <section className="reference-card">
      <h2>Apply this guidance to your publication research</h2>
      <ul>
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
