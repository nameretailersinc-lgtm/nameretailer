import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  CircleDollarSign,
  Crown,
  FileText,
  Globe2,
  Tag,
  Users,
} from "lucide-react";
import {
  informationPages,
  type InformationPage,
  type SiteSection,
} from "@/lib/site/pages";
import { breadcrumbSchema, serializeJsonLd } from "@/lib/seo/json-ld";
import { SiteFooter, SiteHeader } from "./chrome";
const artworkDimensions: Record<string, { width: number; height: number }> = {
  "/01_guest_post_checklist.png": { width: 730, height: 550 },
  "/02_content_metrics_panel.png": { width: 745, height: 550 },
  "/03_listing_browser_panel.png": { width: 880, height: 405 },
  "/15_laptop_dashboard_illustration.png": { width: 485, height: 340 },
};
const informationLinkIcons = [
  ChartNoAxesColumnIncreasing,
  Crown,
  Globe2,
  CircleDollarSign,
  Tag,
  FileText,
];

export function InformationShell({
  path,
  title,
  label,
  description,
  active,
  image,
  imageDimensions,
  imageAlt = "",
  className = "",
  parent,
  children,
}: {
  path: string;
  title: string;
  label: string;
  description: string;
  active: SiteSection;
  image: string;
  imageDimensions?: { width: number; height: number };
  imageAlt?: string;
  className?: string;
  /** Optional intermediate breadcrumb: [label, href]. */
  parent?: [string, string];
  children: React.ReactNode;
}) {
  return (
    <div className={`reference-site reference-information ${className}`}>
      <SiteHeader active={active} />
      <main id="main" className="reference-container" tabIndex={-1}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              breadcrumbSchema([
                ["Home", "/"],
                ...(parent ? [parent] : []),
                [label, path],
              ]),
            ),
          }}
        />
        <nav className="reference-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          {parent && (
            <>
              <Link href={parent[1]}>{parent[0]}</Link>
              <span aria-hidden="true">›</span>
            </>
          )}
          <span aria-current="page">{label}</span>
        </nav>
        <section className="reference-page-hero">
          <div>
            <p className="reference-pill">{label}</p>
            <h1>
              {title.includes(" by ") ? (
                <>
                  {title.slice(0, title.indexOf(" by ") + 4)}
                  <span>{title.slice(title.indexOf(" by ") + 4)}</span>
                </>
              ) : (
                title
              )}
            </h1>
            <p className="reference-lead">{description}</p>
          </div>
          <Image
            src={image}
            {...(imageDimensions || artworkDimensions[image])}
            alt={imageAlt}
            sizes={
              imageDimensions
                ? "256px"
                : "(max-width:800px) calc(100vw - 48px), (max-width:1280px) 45vw, 540px"
            }
            preload
          />
        </section>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
export function InformationPageView({ page }: { page: InformationPage }) {
  return (
    <InformationShell
      {...page}
      path={`/${Object.entries(informationPages).find(([, value]) => value === page)?.[0] || ""}/`}
    >
      <div className="reference-information-sections">
        {page.sections.map((section) => (
          <section className="reference-card" key={section.title}>
            <span className="information-section-icon" aria-hidden="true">
              {section.title.toLowerCase().includes("audience") ? (
                <Users size={28} />
              ) : (
                <BookOpen size={28} />
              )}
            </span>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
      <section className="reference-information-next" aria-label="Next steps">
        <p className="eyebrow">Explore more</p>
        <h2>
          {page.active === "marketplace"
            ? "Find the right list for your needs"
            : "Keep exploring"}
        </h2>
        <div className="reference-three-grid">
          {page.links.map((link, index) => {
            const Icon =
              informationLinkIcons[index % informationLinkIcons.length];
            return (
              <article className="reference-card" key={link.href}>
                <span className="information-link-icon" aria-hidden="true">
                  <Icon size={28} />
                </span>
                <h3>{link.title}</h3>
                <p>{link.description}</p>
                <Link href={link.href}>
                  Continue <ChevronRight size={15} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </InformationShell>
  );
}
