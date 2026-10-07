import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, UsersRound } from "lucide-react";
import type { SiteSection } from "@/lib/site/pages";
import { SiteNavigation } from "./navigation";
export function SiteBrand({ preload = false }: { preload?: boolean }) {
  return (
    <Link
      className="marketplace-brand"
      href="/home/"
      aria-label="Name Retailer home"
    >
      <span className="marketplace-logo-mark" aria-hidden="true">
        <Image
          className="marketplace-logo-image"
          src="/logo.jpg"
          width={1799}
          height={1498}
          sizes="80px"
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
  return (
    <p className="marketplace-trust-note">
      <UsersRound size={19} aria-hidden="true" />
      Trusted by 10,000+ marketers     </p>
  );
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
          <Link href="/products/">Browse publications</Link>
          <Link href="/guest-post-marketplace/">Marketplace views</Link>
          <Link href="/guest-post-by-dr/">Domain rating</Link>
          <Link href="/products/?sort=priceAsc">Compare prices</Link>
          <Link href="/cart/">Your planning cart</Link>
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
          <Link href="/policies/">Policy readiness</Link>
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
          <p className="reference-small">
            Newsletter signup and approved policies remain pending.
          </p>
        </div>
      </div>
      <div className="reference-footer-bottom">
        <span>© {new Date().getUTCFullYear()} Name Retailer</span>
        <Link href="/site-map/">Page directory</Link>
        <span>Preview · No orders or payments taken.</span>
      </div>
    </footer>
  );
}
