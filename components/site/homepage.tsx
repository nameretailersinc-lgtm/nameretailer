import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bitcoin,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  Check,
  CircleDollarSign,
  Columns3,
  FileText,
  Globe2,
  GraduationCap,
  HeartPulse,
  House,
  Headphones,
  ImageIcon,
  Landmark,
  Megaphone,
  Monitor,
  Plane,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sprout,
  Utensils,
  Zap,
} from "lucide-react";
import styles from "./homepage.module.css";
import type { ProductMetrics } from "@/lib/commerce/types";

export function HomepageHero() {
  return (
    <div className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.badge}>
          <span aria-hidden="true" /> Premium guest post marketplace
        </p>
        <h1 id="publication-discovery-title">
          Get Featured on
          <br />
          <span>High-Quality Websites</span>
        </h1>
        <p className={styles.lead}>
          Find relevant websites, compare publication details, and plan your
          next guest post — all in one place.
        </p>
        <div className={styles.heroActions}>
          <a className="button button-primary" href="#inventory">
            Explore Marketplace <ArrowRight size={17} aria-hidden="true" />
          </a>
          <Link className="button button-secondary" href="/how-it-works/">
            <BookOpen size={17} aria-hidden="true" /> How It Works
          </Link>
        </div>
        <div className={styles.heroFacts}>
          {[
            { Icon: Globe2, title: "DA & DR", text: "Compare site metrics" },
            {
              Icon: Columns3,
              title: "4 sites",
              text: "Side-by-side shortlists",
            },
            {
              Icon: CircleDollarSign,
              title: "USD",
              text: "Clear placement prices",
            },
          ].map(({ Icon, title, text }) => (
            <div key={title}>
              <span className={styles.factIcon}>
                <Icon size={21} aria-hidden="true" />
              </span>
              <div>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.heroArt} aria-hidden="true">
        <div className={styles.orbit} />
        <Image
          className={styles.heroImage}
          src="/01_hero_analytics_illustration.png"
          width={700}
          height={475}
          sizes="(max-width: 640px) 92vw, (max-width: 1000px) 48vw, 620px"
          alt=""
          preload
        />
        <span className={styles.rocket}>
          <Rocket size={44} strokeWidth={1.5} />
        </span>
        <div className={styles.artNote}>
          <span>
            <Check size={15} />
          </span>{" "}
          Your next placement starts here
        </div>
      </div>
    </div>
  );
}

const featuredTools = [
  {
    title: "Word Counter",
    text: "Count words & characters",
    href: "/word-counter/",
    Icon: FileText,
    tone: "blue",
  },
  {
    title: "Domain Rating",
    text: "Review domain metrics",
    href: "/bulk-domain-rating-checker/",
    Icon: ChartNoAxesColumnIncreasing,
    tone: "green",
  },
  {
    title: "Keyword Density",
    text: "Explore keyword frequency",
    href: "/keyword-density-checker/",
    Icon: Search,
    tone: "amber",
  },
  {
    title: "Image Tools",
    text: "Resize, edit & convert",
    href: "/seo-tools/#images",
    Icon: ImageIcon,
    tone: "purple",
  },
];

const publisherNiches = [
  { label: "Technology", category: "Technology", Icon: Monitor, tone: "blue" },
  { label: "Business", category: "Business", Icon: BriefcaseBusiness, tone: "green" },
  { label: "Health", category: "Health", Icon: HeartPulse, tone: "pink" },
  { label: "Finance", category: "Finance", Icon: Landmark, tone: "blue" },
  { label: "Education", category: "Education", Icon: GraduationCap, tone: "blue" },
  { label: "Lifestyle", category: "Lifestyle", Icon: Zap, tone: "amber" },
  { label: "Travel", category: "Travelling", Icon: Plane, tone: "blue" },
  { label: "Marketing", category: "Marketing", Icon: Megaphone, tone: "pink" },
  { label: "Cryptocurrency", category: "Cryptocurrency", Icon: Bitcoin, tone: "amber" },
  { label: "Real Estate", category: "Real Estate", Icon: House, tone: "purple" },
  { label: "Fashion", category: "Fashion", Icon: ShoppingBag, tone: "purple" },
  { label: "Food", category: "Food", Icon: Utensils, tone: "amber" },
];

export function HomepageSections({ metrics }: {
  metrics?: Pick<ProductMetrics, "da" | "dr" | "traffic">;
}) {
  const metric = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return (
    <div className={styles.sections}>
      <section className={styles.tools} aria-labelledby="home-tools-heading">
        <div className={styles.toolsIntro}>
          <h2 id="home-tools-heading">Powerful Tools for Better Results</h2>
          <p>
            Prepare your content, explore keywords, and get your images ready
            with useful free tools.
          </p>
          <Link className={styles.allToolsLink} href="/seo-tools/">
            Explore All Tools <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        {featuredTools.map(({ title, text, href, Icon, tone }) => (
          <Link className={styles.toolCard} href={href} key={title}>
            <span className={`${styles.toolIcon} ${styles[tone]}`}>
              <Icon size={26} aria-hidden="true" />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
            <span className={styles.toolArrow}>
              <ArrowRight size={18} aria-hidden="true" />
              <span className="screen-reader-only">Open {title}</span>
            </span>
          </Link>
        ))}
      </section>

      <section
        className={styles.benefits}
        aria-labelledby="home-benefits-heading"
      >
        <div className={styles.sectionHeading}>
          <h2 id="home-benefits-heading">Why Choose Name Retailer?</h2>
          <p>Everything you need to make a considered guest-post decision.</p>
        </div>
        <div className={styles.benefitGrid}>
          {[
            {
              Icon: Zap,
              tone: "amber",
              title: "Relevant Publications",
              text: "Find sites that fit your topic, country, and audience.",
            },
            {
              Icon: ShieldCheck,
              tone: "green",
              title: "Transparent Details",
              text: "Review placement prices, requirements, and supplied metrics.",
            },
            {
              Icon: SlidersHorizontal,
              tone: "green",
              title: "Easy Comparisons",
              text: "Filter the catalogue and compare up to four publications.",
            },
            {
              Icon: Headphones,
              tone: "green",
              title: "Dedicated Support",
              text: "Talk to our team about your content and placement needs.",
            },
          ].map(({ Icon, tone, title, text }) => (
            <article className={styles.benefitCard} key={title}>
              <span className={`${styles.benefitIcon} ${styles[tone]}`}>
                <Icon size={31} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.confidence} aria-labelledby="home-confidence-heading">
        <div className={styles.confidenceCopy}>
          <p className={styles.confidenceEyebrow}>Why choose Name Retailer</p>
          <h2 id="home-confidence-heading">Compare, Analyze and Publish with Confidence</h2>
          <p>Explore publication metrics, relevant audiences, and transparent pricing. Bring everything together for your next guest-post campaign.</p>
          <div className={styles.confidenceActions}>
            <a className="button button-primary" href="#inventory">Get Started Now <ArrowRight size={15} aria-hidden="true" /></a>
            <Link className="button button-secondary" href="/how-to-buy-links/">Learn More <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className={styles.confidenceArt}>
          <div className={styles.metricDashboard}>
            <h3>Traffic Overview</h3>
            <p><strong>{metric(metrics?.traffic)}</strong> <span>Supplied estimate</span></p>
            <div className={styles.chartBars} aria-hidden="true">
              {[16, 23, 31, 44, 56, 68, 83, 100].map(height => <span key={height} style={{height: `${height}%`}} />)}
            </div>
            <small>First displayed publication</small>
          </div>
          <dl className={styles.domainScores}>
            <div><dt>DA</dt><dd>{metric(metrics?.da)}</dd></div>
            <div><dt>DR</dt><dd>{metric(metrics?.dr)}</dd></div>
          </dl>
          <div className={styles.metricChecklist}>
            {["Publication Metrics", "Relevant Publishers", "Transparent Pricing", "Placement Planning"].map(text => <p key={text}><ShieldCheck size={17} aria-hidden="true" />{text}</p>)}
          </div>
          <Sprout className={styles.dashboardPlant} size={45} aria-hidden="true" />
        </div>
      </section>

      <section className={styles.niches} aria-labelledby="home-niches-heading">
        <div className={styles.nicheHeading}>
          <div>
            <h2 id="home-niches-heading">Browse Publishers by Niche</h2>
            <p>Find relevant websites in the most popular categories.</p>
          </div>
          <Link href="/guest-posting-sites/">View All Categories <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className={styles.nicheGrid}>
          {publisherNiches.map(({label,category,Icon,tone}) => <Link href={`/?category=${encodeURIComponent(category)}#inventory`} className={styles.nicheCard} key={label}>
            <span className={`${styles.nicheIcon} ${styles[tone]}`}><Icon size={22} aria-hidden="true" /></span>
            <span>{label}</span>
          </Link>)}
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="home-cta-heading">
        <div>
          <h2 id="home-cta-heading">Ready to Grow Your Brand?</h2>
          <p>Find your next publication and start planning your guest post.</p>
        </div>
        <div className={styles.ctaArt} aria-hidden="true">
          <ChartNoAxesColumnIncreasing size={45} />
          <Rocket size={36} />
        </div>
        <a className="button button-secondary" href="#inventory">
          Find Your Next Site <ArrowRight size={17} aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
