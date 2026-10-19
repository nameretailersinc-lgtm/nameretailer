import Link from "next/link";
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
