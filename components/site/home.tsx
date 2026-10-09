import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Columns3,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "./chrome";
const benefits = [
  [
    "02_icon_higher_rankings.png",
    170,
    170,
    "Relevant publications",
    "Start with audience fit, topic and editorial context.",
  ],
  [
    "03_icon_more_traffic.png",
    180,
    170,
    "Audience context",
    "Compare supplied metrics without treating a score as a guarantee.",
  ],
  [
    "04_icon_more_sales.png",
    185,
    170,
    "Clear placement pricing",
    "See placement and available writing charges separately.",
  ],
  [
    "05_icon_long_term_growth.png",
    200,
    170,
    "Thoughtful planning",
    "Keep requirements and expectations together before an order.",
  ],
] as const;
const features = [
  [
    "06_icon_search.png",
    130,
    127,
    "Find a publication",
    "Filter by topic, language, country and budget.",
    "/",
  ],
  [
    "07_icon_content_document.png",
    135,
    130,
    "Prepare your content",
    "Check words, characters and estimated reading time locally.",
    "/word-counter/",
  ],
  [
    "08_icon_aeo_geo.png",
    140,
    128,
    "Content with context",
    "Use the buying checklist to consider scope and disclosure.",
    "/how-to-buy-links/",
  ],
  [
    "09_icon_link_building.png",
    140,
    130,
    "Compare publications",
    "Shortlist up to four sites and consider the whole picture.",
    "/#shortlist",
  ],
  [
    "10_icon_local_seo.png",
    140,
    130,
    "Explore audiences",
    "Look for publications that match your geography and language.",
    "/#inventory",
  ],
  [
    "11_icon_seo_audit.png",
    126,
    130,
    "Review domain metrics",
    "Treat DR as a comparison tool, not a quality certification.",
    "/guest-post-by-dr/",
  ],
] as const;
export function HomeLanding() {
  return (
    <div className="reference-site reference-home">
      <SiteHeader active="home" />
      <main id="main" tabIndex={-1}>
        <section className="reference-home-hero reference-container">
          <div>
            <p className="reference-pill">The guest-post marketplace</p>
            <h1>
              Find the right publication for your next <span>placement.</span>
            </h1>
            <p className="reference-lead">
              Find publications that fit your topic, audience and budget.
              Compare the details, prepare your content and plan your next
              placement with context.
            </p>
            <div className="reference-actions">
              <Link className="button button-primary" href="/">
                Browse publications{" "}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link className="button button-secondary" href="#process">
                See how it works
              </Link>
            </div>
            <div className="reference-hero-points">
              {[
                [
                  SlidersHorizontal,
                  "Relevant audiences",
                  "Filter by topic and country",
                ],
                [Columns3, "Clear comparisons", "Put the details side by side"],
                [FileText, "Placement planning", "Review writing and scope"],
              ].map(([Icon, title, text]) => {
                const Mark = Icon as typeof SlidersHorizontal;
                return (
                  <div key={String(title)}>
                    <span>
                      <Mark size={19} aria-hidden="true" />
                    </span>
                    <p>
                      <strong>{String(title)}</strong>
                      <small>{String(text)}</small>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="reference-home-art">
            <Image
              src="/01_hero_analytics_illustration.png"
              width={700}
              height={475}
              sizes="(max-width: 800px) calc(100vw - 40px), 52vw"
              alt=""
            />
            <p>Decorative illustration · not measured client results</p>
          </div>
        </section>
        <section className="reference-trust-band">
          <p className="eyebrow">
            Compare publications. Prepare content. Save a plan.
          </p>
          <p>Guest-post placements, with room to compare the details.</p>
        </section>
        <section className="reference-section reference-container">
          <div className="reference-section-heading">
            <div>
              <p className="eyebrow">Why choose the marketplace</p>
              <h2>A clearer way to plan your next placement</h2>
              <p>
                Bring audience, content, metrics and budget into the same
                conversation.
              </p>
            </div>
            <Link className="button button-secondary" href="/how-to-buy-links/">
              Read the buying guide{" "}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="reference-four-grid">
            {benefits.map(([image, width, height, title, text]) => (
              <article className="reference-card" key={title}>
                <Image
                  src={`/${image}`}
                  width={width}
                  height={height}
                  alt=""
                  sizes="64px"
                  className="reference-benefit-art"
                />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          className="reference-section reference-service-band"
          id="explore"
        >
          <div className="reference-container">
            <div className="reference-section-heading">
              <div>
                <p className="eyebrow">Explore Name Retailer</p>
                <h2>Everything starts with the right context</h2>
                <p>
                  Browse publications, prepare your content and compare the
                  placement details.
                </p>
              </div>
              <Link className="button button-secondary" href="/">
                Explore the marketplace{" "}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <div className="reference-three-grid">
              {features.map(([image, width, height, title, text, href]) => (
                <article
                  className="reference-card reference-feature"
                  key={title}
                >
                  <Image
                    src={`/${image}`}
                    width={width}
                    height={height}
                    sizes="58px"
                    alt=""
                  />
                  <div>
                    <h3>
                      <Link href={href}>{title}</Link>
                    </h3>
                    <p>{text}</p>
                  </div>
                  <Link
                    href={href}
                    className="reference-feature-arrow"
                    aria-label={`Explore: ${title}`}
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="reference-process" id="process">
          <div className="reference-container">
            <div className="reference-section-heading">
              <div>
                <p className="eyebrow">How it works</p>
                <h2>A simple, considered process</h2>
                <p>Browse freely and save a plan when you are ready.</p>
              </div>
              <Link className="button button-secondary" href="/">
                Start comparing <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <ol>
              {[
                ["Find", "Choose your audience, topic and budget."],
                ["Compare", "Review metrics, relevance and editorial context."],
                [
                  "Prepare",
                  "Select placement only or an available writing add-on.",
                ],
                [
                  "Save a plan",
                  "Save your cart. No order, reservation or payment is made.",
                ],
              ].map(([title, text], index) => (
                <li key={title}>
                  <span>
                    {index === 0 ? (
                      <SlidersHorizontal />
                    ) : index === 1 ? (
                      <Columns3 />
                    ) : index === 2 ? (
                      <FileText />
                    ) : (
                      <Check />
                    )}
                  </span>
                  <div>
                    <small>0{index + 1}</small>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="reference-section reference-container">
          <div className="reference-section-heading">
            <div>
              <p className="eyebrow">Different briefs, different audiences</p>
              <h2>Plan for the audience you want to reach</h2>
              <p>Illustrative use cases, not published customer outcomes.</p>
            </div>
          </div>
          <div className="reference-three-grid">
            {[
              [
                "12_case_study_ecommerce.png",
                305,
                "E-commerce",
                "Give useful product expertise a relevant home.",
              ],
              [
                "13_case_study_saas.png",
                310,
                "Software & technology",
                "Consider technical depth and reader expectations.",
              ],
              [
                "14_case_study_local_business.png",
                320,
                "Local audiences",
                "Review geography and language alongside topic fit.",
              ],
            ].map(([image, width, title, text]) => (
              <article className="reference-use-case" key={String(title)}>
                <Image
                  src={`/${image}`}
                  width={Number(width)}
                  height={190}
                  sizes="(max-width: 800px) 100vw, 33vw"
                  alt=""
                />
                <div>
                  <p className="reference-pill">{String(title)}</p>
                  <h3>{String(text)}</h3>
                  <Link href="/">
                    Explore publications{" "}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="reference-mountain-cta">
          <Image src="/27_mountain_banner.png" fill sizes="100vw" alt="" />
          <div className="reference-container">
            <div>
              <p className="eyebrow">Plan your next placement</p>
              <h2>A clearer brief. A better conversation.</h2>
              <p>
                Discuss your topic, intended audience and placement
                requirements.
              </p>
            </div>
            <a
              className="button button-secondary"
              href="mailto:info@nameretailer.com"
            >
              Ask a placement question{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
