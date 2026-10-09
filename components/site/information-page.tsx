import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { informationPages, type InformationPage, type SiteSection } from "@/lib/site/pages";
import { breadcrumbSchema, serializeJsonLd } from "@/lib/seo/json-ld";
import { SiteFooter, SiteHeader } from "./chrome";
const artworkDimensions: Record<string, { width: number; height: number }> = {
  "/01_guest_post_checklist.png": { width: 730, height: 550 },
  "/02_content_metrics_panel.png": { width: 745, height: 550 },
  "/03_listing_browser_panel.png": { width: 880, height: 405 },
  "/15_laptop_dashboard_illustration.png": { width: 485, height: 340 },
};

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(breadcrumbSchema([["Home","/"],...(parent ? [parent] : []),[label,path]]))}} />
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
            <h1>{title}</h1>
            <p className="reference-lead">{description}</p>
          </div>
          <Image
            src={image}
            {...(imageDimensions || artworkDimensions[image])}
            alt={imageAlt}
            sizes={imageDimensions ? "256px" : "(max-width:800px) 100vw, 45vw"}
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
    <InformationShell {...page} path={`/${Object.entries(informationPages).find(([,value])=>value === page)?.[0] || ""}/`}>
      <div className="reference-information-sections">
        {page.sections.map((section) => (
          <section className="reference-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
      <section className="reference-information-next" aria-label="Next steps">
        <p className="eyebrow">Explore more</p>
        <div className="reference-three-grid">
          {page.links.map((link) => (
            <article className="reference-card" key={link.href}>
              <h2>{link.title}</h2>
              <p>{link.description}</p>
              <Link href={link.href}>
                Continue <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </InformationShell>
  );
}
