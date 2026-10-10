import { DataDisclosure, validAsOf } from "@/components/site/data-disclosure";
import { connection } from "next/server";
import { Marketplace } from "./marketplace";
import { SiteHeader, SiteFooter } from "@/components/site/chrome";
import {
  HomepageHero,
  HomepageCatalogHeading,
  HomepageSections,
} from "@/components/site/homepage";
import { publicProductPage } from "@/lib/commerce/public-page";
import {
  marketplaceQuery,
  searchQuery,
  type SearchParams,
} from "@/lib/commerce/marketplace-query";
import type { MarketplaceRange } from "@/lib/commerce/marketplace-ranges";
import { catalogueSummary } from "@/lib/commerce/catalogue-summary";
import { DirectorySummary } from "@/components/site/directory-summary";
import { rangeCopy } from "@/lib/site/range-copy";
import { websiteNode, serializeJsonLd } from "@/lib/seo/json-ld";
export async function ServerMarketplace({
  searchParams,
  range,
  metricView,
  children,
}: {
  searchParams: Promise<SearchParams>;
  range?: MarketplaceRange;
  metricView?: boolean;
  children?: React.ReactNode;
}) {
  await connection();
  const query = marketplaceQuery(searchQuery(await searchParams), range);
  // Fresh request-time inventory, with the existing active/committed visibility rules.
  const [initialPage, stats, catalogue] = await Promise.all([
    publicProductPage(query.toString()),
    catalogueSummary(
      range ? new URLSearchParams(range.bounds).toString() : "",
    ).catch(() => null),
    range ? catalogueSummary("").catch(() => null) : null,
  ]);
  const copy = range ? rangeCopy(range, stats, catalogue) : null;
  const homePage = !range && !metricView;
  return (
    <Marketplace
      range={range}
      metricView={metricView}
      initialPage={initialPage}
      initialQuery={query.toString()}
      catalogueAsOf={validAsOf(stats?.updatedAt) ? stats?.updatedAt : undefined}
      presentation={{
        header: <SiteHeader active={homePage ? "home" : "marketplace"} />,
        footer: <SiteFooter />,
        hero: homePage ? <HomepageHero /> : undefined,
        heading: homePage ? <HomepageCatalogHeading /> : undefined,
        sections: homePage ? (
          <HomepageSections
            metrics={initialPage?.data[0]?.metrics}
            total={validAsOf(stats?.updatedAt) ? stats?.total : undefined}
          />
        ) : undefined,
      }}
    >
      {!range && <DataDisclosure asOf={stats?.updatedAt} />}
      {!range && !metricView && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteNode()) }}
        />
      )}
      {copy && (
        <section className="reference-card" aria-label={copy.heading}>
          <h2>{copy.heading}</h2>
          {copy.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </section>
      )}
      {stats && range && <DirectorySummary label={range.label} stats={stats} />}
      {children}
    </Marketplace>
  );
}
