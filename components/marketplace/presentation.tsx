import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  Columns3,
  FileText,
  Globe2,
  SlidersHorizontal,
} from "lucide-react";

export function MarketplaceBrand() {
  return (
    <Link
      href="/"
      className="marketplace-brand"
      aria-label="Name Retailer home"
    >
      <span className="marketplace-brand-mark" aria-hidden="true">
        n
      </span>
      <span>
        Name Retailer<small>Publication marketplace</small>
      </span>
    </Link>
  );
}

export function PublicationDesk() {
  return (
    <div className="publication-desk" aria-hidden="true">
      <svg
        className="publication-desk-leaves"
        viewBox="0 0 460 380"
        fill="none"
      >
        <path
          d="M62 309C116 223 118 152 91 74C39 111 52 166 92 197C47 174 17 189 10 220C26 239 49 247 76 246C36 249 26 283 36 304L62 309Z"
          fill="#99bbab"
        />
        <path
          d="M357 322C326 254 343 194 398 141C418 170 407 210 372 229C409 210 440 221 448 249C426 272 402 278 374 271C410 286 412 319 392 342L357 322Z"
          fill="#718e7b"
        />
        <path
          d="M61 309C91 243 104 164 91 95M362 327C346 262 369 207 398 162"
          stroke="#195844"
          strokeWidth="2"
        />
      </svg>
      <div className="publication-desk-window">
        <div className="publication-desk-toolbar">
          <i />
          <i />
          <i />
          <span />
        </div>
        <div className="publication-desk-page">
          <div className="publication-desk-title">
            <Globe2 size={21} />
            <span>Publication desk</span>
          </div>
          <div className="publication-desk-line" />
          <div className="publication-desk-line short" />
          <div className="publication-desk-row">
            <span />
            <div>
              <i />
              <i />
            </div>
          </div>
          <div className="publication-desk-row">
            <span />
            <div>
              <i />
              <i />
            </div>
          </div>
          <div className="publication-desk-row">
            <span />
            <div>
              <i />
              <i />
            </div>
          </div>
        </div>
      </div>
      <div className="publication-desk-note publication-desk-note-top">
        <SlidersHorizontal size={20} />
        <span>
          Find your audience<small>Topic · country · language</small>
        </span>
      </div>
      <div className="publication-desk-note publication-desk-note-bottom">
        <Columns3 size={20} />
        <span>
          Consider the whole picture<small>Relevance · metrics · price</small>
        </span>
      </div>
      <div className="publication-desk-tab">
        <FileText size={24} />
        <span>
          Your next
          <br />
          placement
        </span>
      </div>
    </div>
  );
}

export function MarketplaceHero({
  metricView = false,
}: {
  metricView?: boolean;
}) {
  return (
    <section className="marketplace-hero">
      <div className="marketplace-hero-copy">
        <p className="reference-pill">
          {metricView
            ? "Marketplace / Metric view"
            : "The guest-post marketplace"}
        </p>
        <h1>
          {metricView ? (
            <>
              Guest post sites by <span>Domain Rating</span>
            </>
          ) : (
            <>
              Find the right publication for your next <span>placement.</span>
            </>
          )}
        </h1>
        <p>
          {metricView
            ? "Use DR as one point of comparison. Start with a relevant audience, then review price, traffic estimates and placement details."
            : "Find publications that fit your topic, audience and budget. Put the details side by side, then make your next placement decision with context."}
        </p>
        <div className="marketplace-hero-actions">
          <a href="#inventory" className="button button-primary">
            Browse publications <ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a href="#shortlist" className="button button-secondary">
            Compare your shortlist <Columns3 size={17} aria-hidden="true" />
          </a>
        </div>
        <p className="marketplace-hero-footnote">
          Start with relevance. Use metrics as one part of the decision.
        </p>
      </div>
      <Image
        className="marketplace-hero-art"
        src={
          metricView
            ? "/15_laptop_dashboard_illustration.png"
            : "/03_listing_browser_panel.png"
        }
        width={metricView ? 485 : 880}
        height={metricView ? 340 : 405}
        sizes="(max-width: 800px) calc(100vw - 48px), (max-width: 1280px) 44vw, 540px"
        alt=""
        preload
      />
    </section>
  );
}

export function MarketplaceBenefits() {
  return (
    <section
      className="marketplace-benefits"
      aria-label="Explore the marketplace"
    >
      {[
        {
          Icon: SlidersHorizontal,
          title: "Find your audience",
          text: "Narrow publications by topic, country, language and budget.",
        },
        {
          Icon: Columns3,
          title: "Compare the details",
          text: "Keep up to four publications together in your local shortlist.",
        },
        {
          Icon: FileText,
          title: "Know what to ask",
          text: "Review placement requirements, price and metric limitations.",
        },
      ].map(({ Icon, title, text }) => (
        <article key={title}>
          <span className="marketplace-feature-icon">
            <Icon size={23} aria-hidden="true" />
          </span>
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

export function MarketplaceBuyerGuide() {
  return (
    <section
      className="marketplace-buyer-guide"
      id="buyer-guide"
      aria-labelledby="buyer-guide-heading"
    >
      <div className="marketplace-section-intro">
        <div>
          <p className="eyebrow">Before you choose</p>
          <h2 id="buyer-guide-heading">
            A thoughtful placement starts
            <br className="marketplace-desktop-break" /> with the right
            questions.
          </h2>
        </div>
        <p>
          A score is a starting point, not a quality guarantee. Review the
          publication itself and agree on the scope before ordering.
        </p>
      </div>
      <ol className="marketplace-selection-steps">
        <li>
          <span aria-hidden="true">01</span>
          <h3>Define the audience</h3>
          <p>
            Choose your topic, geography and language. Read recent articles to
            assess whether the publication fits your audience.
          </p>
        </li>
        <li>
          <span aria-hidden="true">02</span>
          <h3>Put details in context</h3>
          <p>
            Compare price and placement requirements alongside metrics. Ask
            where a metric came from and when it was measured.
          </p>
        </li>
        <li>
          <span aria-hidden="true">03</span>
          <h3>Clarify the placement</h3>
          <p>
            Agree on writing, editorial approval, link attributes, disclosure,
            turnaround and any applicable fees or recovery terms.
          </p>
        </li>
      </ol>
      <div className="marketplace-metric-callout">
        <BookOpen size={24} aria-hidden="true" />
        <div>
          <h3>Use metrics to compare, not to certify.</h3>
          <p>
            Owner-supplied scores and estimated traffic are not independently
            verified here. Missing values stay unavailable, and no ranking
            outcome is promised.
          </p>
        </div>
        <a href="#inventory">
          Review the listings <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <section
        className="marketplace-faq"
        id="marketplace-help"
        aria-labelledby="marketplace-help-heading"
      >
        <h3 id="marketplace-help-heading">A few useful details</h3>
        <details>
          <summary>Does shortlisting reserve a publication or price?</summary>
          <p>
            No. Saving or shortlisting a publication does not reserve it or lock
            its price.
          </p>
        </details>
        <details>
          <summary>Where do the publication metrics come from?</summary>
          <p>
            Metrics are supplied by the inventory owner. Their providers and
            measurement dates have not been supplied, so they are not
            independently verified or refreshed here. Legacy zero and missing
            values appear as Unavailable.
          </p>
        </details>
        <details>
          <summary>What should I confirm before a placement?</summary>
          <p>
            Confirm audience fit, editorial and writing scope, paid-link
            disclosure and attributes, final cost, delivery timing, cancellation
            and recovery terms. A publication score alone cannot answer these
            questions.
          </p>
        </details>
      </section>
    </section>
  );
}

export function MarketplaceInquiry() {
  return (
    <section
      className="marketplace-inquiry"
      id="contact"
      aria-labelledby="marketplace-contact-heading"
    >
      <div>
        <p className="eyebrow">Plan your next placement</p>
        <h2 id="marketplace-contact-heading">
          A clearer brief.
          <br />A better conversation.
        </h2>
        <p>
          Have a question about your audience, content or placement
          requirements? Get in touch with Name Retailer.
        </p>
      </div>
      <a href="mailto:info@nameretailer.com" className="button">
        Ask a placement question <ArrowUpRight size={18} aria-hidden="true" />
      </a>
      <Globe2 className="marketplace-inquiry-art" aria-hidden="true" />
    </section>
  );
}

export function MarketplaceFooter() {
  return (
    <footer className="marketplace-footer">
      <div className="marketplace-footer-grid">
        <div className="marketplace-footer-about">
          <MarketplaceBrand />
          <p>Guest-post placements, with room to compare the details.</p>
          <address>
            26 - G Hamriyah Freezone
            <br />
            Sharjah, United Arab Emirates
          </address>
        </div>
        <div>
          <h2>Marketplace</h2>
          <a href="#inventory">Browse publications</a>
          <a href="#shortlist">Your shortlist</a>
          <a href="#buyer-guide">Choosing a publication</a>
        </div>
        <div>
          <h2>Buyer essentials</h2>
          <a href="#marketplace-help">Marketplace questions</a>
          <a href="#buyer-guide">Metric context</a>
          <a href="#contact">Placement inquiries</a>
        </div>
        <div>
          <h2>Contact Name Retailer</h2>
          <a href="mailto:info@nameretailer.com">info@nameretailer.com</a>
          <p>Share your topic, intended audience and placement questions.</p>
        </div>
      </div>
      <div className="marketplace-footer-bottom">
        <p>© {new Date().getUTCFullYear()} Name Retailer</p>
      </div>
    </footer>
  );
}
