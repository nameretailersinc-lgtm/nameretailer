import Link from "next/link";
import { InformationShell } from "@/components/site/information-page";
export const metadata = {
  title: "Name Retailer page directory",
  description:
    "Find the rebuild's working marketplace, resource, company, support and account destinations.",
  robots: { index: false, follow: false },
};
const groups = [
  [
    "Marketplace",
    [
      ["Home", "/"],
      ["Publications", "/products/"],
      ["Marketplace views", "/guest-post-marketplace/"],
      ["Domain Rating", "/guest-post-by-dr/"],
      ["Services", "/services/"],
      ["How it works", "/how-it-works/"],
    ],
  ],
  [
    "Resources",
    [
      ["Free tools", "/seo-tools/"],
      ["Word counter", "/word-counter/"],
      ["Guides", "/guides/"],
      ["Draft buying guide", "/how-to-buy-links/"],
      ["SEO, AEO & GEO journal", "/blog/"],
    ],
  ],
  [
    "Company and support",
    [
      ["About", "/about/"],
      ["Contact", "/contact/"],
      ["FAQ", "/faq/"],
      ["Help center", "/help-center/"],
      ["Policy readiness", "/policies/"],
    ],
  ],
  [
    "Your account",
    [
      ["Account", "/my-account/"],
      ["Planning cart", "/cart/"],
      ["Forgot password", "/my-account/forgot-password/"],
    ],
  ],
] as const;
export default function Page() {
  return (
    <InformationShell
      title="Find your next destination."
      label="Page directory"
      description="These destinations exist in the rebuild. This human-readable directory is not a public SEO sitemap or a migration redirect map."
      active="help"
      image="/03_listing_browser_panel.png"
    >
      <div className="reference-information-sections">
        {groups.map(([title, links]) => (
          <section className="reference-card" key={title}>
            <h2>{title}</h2>
            <ul>
              {links.map(([name, href]) => (
                <li key={href}>
                  <Link href={href}>{name}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </InformationShell>
  );
}
