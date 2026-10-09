import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/chrome";

export const metadata: Metadata = {
  title: "Page Not Found | Name Retailer",
  robots: { index: false, follow: true },
};

// Rendered with a real 404 status for unknown URLs; never redirects to the homepage.
export default function NotFound() {
  return (
    <div className="reference-site reference-information">
      <SiteHeader />
      <main id="main" className="reference-container" tabIndex={-1}>
        <section className="reference-card">
          <h1>We couldn’t find that page</h1>
          <p>
            The address may have changed or never existed. These pages are a
            good place to continue:
          </p>
          <ul>
            <li>
              <Link href="/">
                Compare guest posting sites in the marketplace
              </Link>
            </li>
            <li>
              <Link href="/guest-posting-sites/">
                Browse guest posting sites by niche, location and price
              </Link>
            </li>
            <li>
              <Link href="/guides/">Read the guest-post buying guides</Link>
            </li>
            <li>
              <Link href="/faq/">Check the frequently asked questions</Link>
            </li>
            <li>
              <Link href="/contact/">Contact the team</Link>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
