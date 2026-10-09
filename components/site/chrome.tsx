import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { SiteSection } from "@/lib/site/pages";
import { SiteNavigation } from "./navigation";
export function SiteBrand({ preload = false }: { preload?: boolean }) {
  return (
    <Link
      className="marketplace-brand"
      href="/"
      aria-label="Name Retailer home"
    >
      <span className="marketplace-logo-mark" aria-hidden="true">
        <Image
          className="marketplace-logo-image"
          src="/logo.jpg"
          width={128}
          height={107}
          alt=""
          preload={preload}
        />
      </span>
      <span className="marketplace-wordmark">
        <span>
          Name <span>Retailer</span>
        </span>
        <small>Guest-post marketplace</small>
      </span>
    </Link>
  );
}
export function TrustNote() {
  // TODO(owner): publish customer proof only when documented in OWNER_DECISIONS.md.
  return null;
}
export function SiteHeader({ active }: { active?: SiteSection }) {
  return (
    <SiteNavigation
      active={active}
      brand={<SiteBrand preload />}
      trust={<TrustNote />}
    />
  );
}
export function SiteFooter() {
  return (
    <footer className="reference-footer">
      <div className="reference-footer-grid">
        <div>
          <SiteBrand />
          <p>
            Guest-post marketplace, placement planning and useful writing tools.
          </p>
          <address>
            26 - G Hamriyah Freezone
            <br />
            Sharjah, United Arab Emirates
          </address>
        </div>
        <div>
          <h2>Marketplace</h2>
          <Link href="/">Browse publications</Link>
          <Link href="/guest-post-marketplace/">Marketplace views</Link>
          <Link href="/guest-post-by-dr/">Domain rating</Link>
          <Link href="/?sort=priceAsc">Compare prices</Link>
          <Link href="/cart/">Your planning cart</Link>
        </div>
        <div>
          <h2>Guest posting sites</h2>
          <Link href="/guest-posting-sites/">All directories</Link>
          <Link href="/technology-guest-posting-sites/">Technology</Link>
          <Link href="/saas-guest-posting-sites/">SaaS and software</Link>
          <Link href="/price-0-to-50/">Under $50</Link>
          <Link href="/guest-posting-sites-usa/">USA</Link>
        </div>
        <div>
          <h2>Resources</h2>
          <Link href="/guides/">Guides</Link>
          <Link href="/seo-tools/">Free tools</Link>
          <Link href="/blog/">SEO, AEO &amp; GEO journal</Link>
          <Link href="/faq/">Common questions</Link>
          <Link href="/how-it-works/">How it works</Link>
        </div>
        <div>
          <h2>Company</h2>
          <Link href="/about/">About</Link>
          <Link href="/services/">Services</Link>
          <Link href="/contact/">Contact</Link>
          <Link href="/help-center/">Help center</Link>
          <Link href="/policies/">Policy information</Link>
          <Link href="/terms/">Terms of service</Link>
          <Link href="/privacy/">Privacy policy</Link>
          <Link href="/cookies/">Cookie policy</Link>
          <Link href="/refund-policy/">Refund policy</Link>
        </div>
        <div>
          <h2>Stay in touch</h2>
          <p>Have a placement or content question? Contact Name Retailer.</p>
          <a
            className="reference-contact-link"
            href="mailto:info@nameretailer.com"
          >
            info@nameretailer.com <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="reference-footer-bottom">
        <span>© {new Date().getUTCFullYear()} Name Retailer</span>
        <Link href="/site-map/">Page directory</Link>
      </div>
    </footer>
  );
}
