"use client";

import { finishedCopy } from "@/lib/site/public-copy";
import { trackEvent } from "@/lib/analytics/events";
import { memo, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  ArrowRight,
  Bookmark,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Check,
  CircleDollarSign,
  Clock3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Globe2,
  Info,
  Languages,
  Layers3,
  Link2,
  RotateCcw,
  Search,
  Scale,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type {
  ProductFacets,
  ProductPage,
  PublicProduct,
} from "@/lib/commerce/types";
import { api, errorMessage } from "@/components/admin/api";
import { Button, Field, Input, Select } from "@/components/admin/primitives";
import {
  MarketplaceBenefits,
  MarketplaceBuyerGuide,
  MarketplaceHero,
  MarketplaceInquiry,
} from "./presentation";
import homepageStyles from "@/components/site/homepage.module.css";
import { CountryName } from "@/components/site/country-name";
import { BuyPlacement } from "@/components/cart/buy-placement";
import { CatalogBrowser } from "./catalog-browser";
import { publicationPath } from "@/lib/commerce/publication-pages";
import {
  rangeQuery,
  type MarketplaceRange,
} from "@/lib/commerce/marketplace-ranges";
import { marketplaceQuery } from "@/lib/commerce/marketplace-query";
import {
  breadcrumbSchema,
  itemListNode,
  serializeJsonLd,
} from "@/lib/seo/json-ld";

const filters = [
  "q",
  "country",
  "language",
  "category",
  "minDr",
  "maxDr",
  "minDa",
  "maxDa",
  "minTraffic",
  "maxTraffic",
  "minPrice",
  "maxPrice",
] as const;
const filterLabels: Record<(typeof filters)[number], string> = {
  q: "Keyword",
  country: "Country",
  language: "Language",
  category: "Topic",
  minDr: "Minimum DR",
  maxDr: "Maximum DR",
  minDa: "Minimum DA",
  maxDa: "Maximum DA",
  minTraffic: "Minimum traffic",
  maxTraffic: "Maximum traffic",
  minPrice: "Min price",
  maxPrice: "Max price",
};
const sorts = [
  ["domain", "Publication A–Z"],
  ["priceAsc", "Price: low to high"],
  ["priceDesc", "Price: high to low"],
  ["drDesc", "DR: high to low"],
  ["trafficDesc", "Traffic: high to low"],
] as const;
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const number = new Intl.NumberFormat("en-US");
function subscribeToCompactViewport(onChange: () => void) {
  const viewport = window.matchMedia("(max-width: 800px)");
  viewport.addEventListener("change", onChange);
  return () => viewport.removeEventListener("change", onChange);
}
function isCompactViewport() {
  return window.matchMedia("(max-width: 800px)").matches;
}
function desktopViewport() {
  return false;
}
export function productPrice(cents: number) {
  return usd.format(cents / 100);
}
export function productMetric(value: number | null) {
  return value === null ? "Unavailable" : number.format(value);
}
const TableMetric = memo(function TableMetric({
  value,
  tone,
}: {
  value: number | null;
  tone?: "da" | "dr" | "traffic";
}) {
  const colors = {
    da: homepageStyles.metricDa,
    dr: homepageStyles.metricDr,
    traffic: homepageStyles.metricTraffic,
  };
  return value === null ? (
    <span className={homepageStyles.metricUnavailable} title="Unavailable">
      <span aria-hidden="true">—</span>
      <span className="screen-reader-only">Unavailable</span>
    </span>
  ) : (
    <span
      className={
        tone ? `${colors[tone]} publication-metric-${tone}` : undefined
      }
    >
      {productMetric(value)}
    </span>
  );
});
export function productDomain(domain: string) {
  try {
    return new URL(domain).hostname;
  } catch {
    return domain;
  }
}
/** Publication names open listing details on Name Retailer. */
const PublicationName = memo(function PublicationName({
  product,
}: {
  product: PublicProduct;
}) {
  const path = publicationPath(product);
  if (path)
    return (
      <Link href={path} prefetch={false}>
        {productDomain(product.domain)}
      </Link>
    );
  return <span>{productDomain(product.domain)}</span>;
});
function PlacementDetails({ product }: { product: PublicProduct }) {
  return (
    <>
      <p className="marketplace-publisher-link">
        <strong>Publisher URL:</strong>{" "}
        <a
          href={product.domain}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {product.domain}
          <span className="screen-reader-only">
            {" "}
            (opens publication in a new tab)
          </span>
        </a>
      </p>
      <dl>
        <div>
          <dt>Link type</dt>
          <dd>{product.linkType || "Unavailable"}</dd>
        </div>
        <div>
          <dt>Turnaround</dt>
          <dd>{product.turnaround || "Unavailable"}</dd>
        </div>
        <div>
          <dt>Trust Flow (TF)</dt>
          <dd>{productMetric(product.metrics.tf)}</dd>
        </div>
        <div>
          <dt>URL Rating (UR)</dt>
          <dd>{productMetric(product.metrics.ur)}</dd>
        </div>
        <div>
          <dt>Referring domains</dt>
          <dd>{productMetric(product.metrics.referringDomains)}</dd>
        </div>
        <div>
          <dt>Backlinks</dt>
          <dd>{productMetric(product.metrics.backlinks)}</dd>
        </div>
        <div>
          <dt>Spam score</dt>
          <dd>{productMetric(product.metrics.spamScore)}</dd>
        </div>
      </dl>
      <p className="marketplace-placement-requirements">
        <strong>Requirements:</strong>{" "}
        {finishedCopy(product.requirements) ||
          "Unavailable. Confirm placement requirements before ordering."}
      </p>
      <Link
        className="marketplace-plan-placement"
        href={`/cart/?product=${product.id}`}
      >
        Plan placement
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
      <BuyPlacement productId={product.id} />
    </>
  );
}

const Detail = memo(function Detail({ product }: { product: PublicProduct }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <details
      className="publication-details"
      onToggle={(event) => {
        if (event.currentTarget.open) setLoaded(true);
      }}
    >
      <summary>Placement details</summary>
      {loaded && <PlacementDetails product={product} />}
    </details>
  );
});

function PublicationDialog({
  product,
  onClose,
}: {
  product: PublicProduct;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    element?.showModal();
    return () => {
      element?.close();
      opener?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="marketplace-publication-dialog"
      aria-labelledby="publication-dialog-heading"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="marketplace-dialog-heading">
        <div>
          <p>Publication details</p>
          <h2 id="publication-dialog-heading">
            {productDomain(product.domain)}
          </h2>
        </div>
        <Button
          variant="ghost"
          onClick={onClose}
          aria-label="Close publication details"
        >
          <X size={20} aria-hidden="true" />
        </Button>
      </div>
      <div className="marketplace-dialog-overview">
        <div>
          <span>Placement price</span>
          <strong className="marketplace-price">
            {productPrice(product.priceCents)}
          </strong>
          <small>USD per placement</small>
        </div>
        <dl>
          <div>
            <dt>DA</dt>
            <dd>
              <TableMetric value={product.metrics.da} tone="da" />
            </dd>
          </div>
          <div>
            <dt>DR</dt>
            <dd>
              <TableMetric value={product.metrics.dr} tone="dr" />
            </dd>
          </div>
          <div>
            <dt>Est. traffic</dt>
            <dd>
              <TableMetric value={product.metrics.traffic} tone="traffic" />
            </dd>
          </div>
        </dl>
      </div>
      <div className="marketplace-dialog-audience">
        <span>{product.category || "Topic unavailable"}</span>
        <span>
          <Globe2 size={14} aria-hidden="true" />
          <CountryName country={product.country} />
        </span>
        <span>{product.language || "Language unavailable"}</span>
      </div>
      <PlacementDetails product={product} />
    </dialog>
  );
}

function HomepageShortlist({
  shortlist,
  status,
  onClear,
  onRemove,
}: {
  shortlist: PublicProduct[];
  status: string;
  onClear: () => void;
  onRemove: (product: PublicProduct) => void;
}) {
  return (
    <section
      className={`marketplace-shortlist ${homepageStyles.shortlist}`}
      id="shortlist"
      data-empty={shortlist.length === 0 || undefined}
      tabIndex={-1}
      aria-labelledby="shortlist-heading"
    >
      <div className={homepageStyles.shortlistHeading}>
        <div>
          <span className={homepageStyles.shortlistBadge}>
            <Layers3 size={17} aria-hidden="true" />
            Your Shortlist
          </span>
          <h2 id="shortlist-heading">
            Your shortlist <span>({shortlist.length}/4)</span>
          </h2>
          <p>
            Compare up to four publications. This local shortlist lasts for this
            visit and is not a cart or reservation.
          </p>
        </div>
        {shortlist.length > 0 && (
          <Button
            variant="secondary"
            className={homepageStyles.dangerButton}
            onClick={onClear}
          >
            <Trash2 size={18} aria-hidden="true" />
            Clear shortlist
          </Button>
        )}
        <div className={homepageStyles.shortlistArt} aria-hidden="true">
          <div>
            <i />
            <i />
            <i />
          </div>
          <div>
            <i />
            <i />
            <i />
            <Bookmark size={46} />
          </div>
          <span>
            <Check size={26} />
          </span>
        </div>
      </div>
      <div className={homepageStyles.shortlistActivity}>
        <p
          className={`marketplace-status ${homepageStyles.shortlistStatus}`}
          role="status"
        >
          {status ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Layers3 size={16} aria-hidden="true" />
          )}
          {status ||
            "Select Shortlist on a publication to compare its details here."}
        </p>
        {shortlist.length === 0 && (
          <Button variant="secondary" disabled>
            <Scale size={15} aria-hidden="true" />
            Compare shortlist
          </Button>
        )}
      </div>
      {shortlist.length > 0 && (
        <>
          <div className={homepageStyles.shortlistGrid}>
            {shortlist.map((product, index) => (
              <article
                className={`publication-card ${homepageStyles.shortlistCard}`}
                key={product.id}
              >
                <div className={homepageStyles.shortlistCardTop}>
                  <span>{index + 1}</span>
                  <span aria-hidden="true">
                    <Check size={15} />
                  </span>
                </div>
                <div className={homepageStyles.shortlistIdentity}>
                  <span
                    className={`marketplace-publication-mark marketplace-publication-mark-${index % 4}`}
                    aria-hidden="true"
                  >
                    {productDomain(product.domain)
                      .replace(/^www\./, "")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div>
                    <h3>
                      <PublicationName product={product} />
                    </h3>
                    <p>{product.category || "Topic unavailable"}</p>
                    <strong className="marketplace-price">
                      {productPrice(product.priceCents)}
                    </strong>
                  </div>
                </div>
                <dl>
                  {[
                    {
                      label: "Topic",
                      Icon: Tag,
                      value: product.category || "Unavailable",
                    },
                    {
                      label: "Country",
                      Icon: Globe2,
                      value: <CountryName country={product.country} />,
                    },
                    {
                      label: "Language",
                      Icon: Languages,
                      value: product.language || "Unavailable",
                    },
                    {
                      label: "DA",
                      Icon: ChartNoAxesColumnIncreasing,
                      value: (
                        <span
                          className={
                            product.metrics.da === null
                              ? homepageStyles.metricUnavailable
                              : homepageStyles.metricDa
                          }
                        >
                          {productMetric(product.metrics.da)}
                        </span>
                      ),
                    },
                    {
                      label: "DR",
                      Icon: ChartNoAxesColumnIncreasing,
                      value: (
                        <span
                          className={
                            product.metrics.dr === null
                              ? homepageStyles.metricUnavailable
                              : homepageStyles.metricDr
                          }
                        >
                          {productMetric(product.metrics.dr)}
                        </span>
                      ),
                    },
                    {
                      label: "Estimated traffic",
                      Icon: ChartNoAxesColumnIncreasing,
                      value: (
                        <span
                          className={
                            product.metrics.traffic === null
                              ? homepageStyles.metricUnavailable
                              : homepageStyles.metricTraffic
                          }
                        >
                          {productMetric(product.metrics.traffic)}
                        </span>
                      ),
                    },
                    {
                      label: "Link type",
                      Icon: Link2,
                      value: product.linkType || "Unavailable",
                    },
                    {
                      label: "Turnaround",
                      Icon: Clock3,
                      value: product.turnaround || "Unavailable",
                    },
                  ].map(({ label, Icon, value }) => (
                    <div key={label}>
                      <dt>
                        <Icon size={15} aria-hidden="true" />
                        {label}
                      </dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <Button
                  variant="secondary"
                  className={homepageStyles.dangerButton}
                  onClick={() => onRemove(product)}
                  aria-label={`Remove ${productDomain(product.domain)} from comparison`}
                >
                  <Trash2 size={17} aria-hidden="true" />
                  Remove publication
                </Button>
              </article>
            ))}
          </div>
          <div className={homepageStyles.shortlistSummary}>
            <span className={homepageStyles.shortlistSummaryIcon}>
              <Layers3 size={25} aria-hidden="true" />
            </span>
            <div>
              <strong>
                {shortlist.length}{" "}
                {shortlist.length === 1 ? "publication" : "publications"}{" "}
                selected
              </strong>
              <p>Compare key metrics, prices, and details side by side.</p>
            </div>
            <a className="button button-primary" href="#shortlist">
              <Scale size={20} aria-hidden="true" />
              Compare shortlist
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
          <p className={homepageStyles.shortlistNote}>
            Shortlisted values are the snapshots you selected, not live price or
            availability reservations.
          </p>
        </>
      )}
    </section>
  );
}

function MetricFilter({
  name,
  label,
  initialValue,
  disabled = false,
}: {
  name: "minDr" | "minDa";
  label: string;
  initialValue: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="marketplace-score-filter">
      <Field label={label}>
        <Input
          name={name}
          disabled={disabled}
          type="number"
          min={0}
          max={100}
          step={1}
          placeholder="Any"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </Field>
      <input
        type="range"
        disabled={disabled}
        min={0}
        max={100}
        step={1}
        aria-label={`${label} slider`}
        value={value || "0"}
        onChange={(event) =>
          setValue(event.target.value === "0" ? "" : event.target.value)
        }
      />
      <div className="marketplace-range-ticks" aria-hidden="true">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
}

function PublicationSearch({
  query,
  facets,
  onSearch,
  onAdvancedFilters,
}: {
  query: string;
  facets: ProductFacets;
  onSearch: (changes: Record<string, string>) => void;
  onAdvancedFilters?: () => void;
}) {
  const params = new URLSearchParams(query);
  const [browser, setBrowser] = useState<"category" | "country" | null>(null);
  const [mode, setMode] = useState<"q" | "category" | "country">(() =>
    params.get("q")
      ? "q"
      : params.get("category")
        ? "category"
        : params.get("country")
          ? "country"
          : "q",
  );
  const availableOptions =
    mode === "category" ? facets.categories : facets.countries;
  const selectedOption = params.get(mode);
  const options =
    selectedOption && !availableOptions.includes(selectedOption)
      ? [selectedOption, ...availableOptions]
      : availableOptions;
  const suggestedTopics = [
    "Business",
    "Technology",
    "Health",
    "Finance",
    "Travelling",
  ].filter((topic) => facets.categories.includes(topic));
  return (
    <section
      className="marketplace-search-panel"
      aria-label="Find publications"
    >
      <div
        className="marketplace-search-modes"
        role="group"
        aria-label="Search method"
      >
        {[
          {
            key: "q",
            Icon: Search,
            title: "Search by Domain / Keyword",
            label: "Domain or keyword",
            compactLabel: "Keyword",
          },
          {
            key: "category",
            Icon: SlidersHorizontal,
            title: "Search by Topic",
            label: "Browse by topic",
            compactLabel: "Topic",
          },
          {
            key: "country",
            Icon: Globe2,
            title: "Search by Location",
            label: "Choose a location",
            compactLabel: "Location",
          },
        ].map(({ key, Icon, title, label, compactLabel }) => (
          <button
            key={key}
            type="button"
            aria-label={title}
            aria-pressed={mode === key}
            onClick={() => {
              setMode(key as typeof mode);
              if (key === "category" || key === "country") setBrowser(key);
            }}
          >
            <span className="marketplace-search-mode-icon">
              <Icon size={21} aria-hidden="true" />
            </span>
            <span className="marketplace-search-mode-copy">
              <strong>
                <span className="marketplace-search-mode-name">{label}</span>
                <span className="marketplace-search-mode-compact">
                  {compactLabel}
                </span>
              </strong>
            </span>
          </button>
        ))}
        {onAdvancedFilters && (
          <button type="button" onClick={onAdvancedFilters}>
            <span className="marketplace-search-mode-icon">
              <SlidersHorizontal size={21} aria-hidden="true" />
            </span>
            <span className="marketplace-search-mode-copy">
              <strong>
                <span className="marketplace-search-mode-name">
                  Advanced filters
                </span>
                <span className="marketplace-search-mode-compact">Filters</span>
              </strong>
            </span>
          </button>
        )}
      </div>
      <div className="marketplace-search-body">
        <form
          key={`${mode}:${query}`}
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            onSearch({ [mode]: String(form.get(mode) || "").trim() });
          }}
        >
          <div className="marketplace-search-input">
            <Search size={22} aria-hidden="true" />
            {mode === "q" ? (
              <Input
                name="q"
                type="search"
                maxLength={150}
                aria-label="Find a publication by domain or keyword"
                placeholder="Search a domain, keyword or audience…"
                defaultValue={params.get("q") || ""}
              />
            ) : (
              <Select
                name={mode}
                aria-label={
                  mode === "category"
                    ? "Find publications by topic"
                    : "Find publications by country"
                }
                defaultValue={params.get(mode) || ""}
              >
                <option value="">
                  {mode === "category"
                    ? "All publication topics"
                    : "All countries"}
                </option>
                {options.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            )}
          </div>
          <Button>
            Find Publications
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </form>
        <div className="marketplace-search-guidance">
          {suggestedTopics.length > 0 && (
            <div
              className="marketplace-topic-shortcuts"
              role="group"
              aria-label="Explore publication topics"
            >
              <span>Explore topics</span>
              {suggestedTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  aria-pressed={params.get("category") === topic}
                  onClick={() => {
                    setMode("category");
                    onSearch({
                      q: "",
                      category: params.get("category") === topic ? "" : topic,
                    });
                  }}
                >
                  {topic === "Travelling" ? "Travel" : topic}
                </button>
              ))}
              <button type="button" onClick={() => setBrowser("category")}>
                More <ChevronDown size={13} aria-hidden="true" />
              </button>
            </div>
          )}
          <Link href="/how-to-buy-links/">
            <FileText size={14} aria-hidden="true" />
            <span>How to choose a publication</span>
          </Link>
        </div>
      </div>
      {browser && (
        <CatalogBrowser
          kind={browser}
          values={browser === "category" ? facets.categories : facets.countries}
          onClose={() => setBrowser(null)}
          onSelect={(item) => {
            setMode(browser);
            onSearch({ q: "", [browser]: item });
            setBrowser(null);
          }}
        />
      )}
    </section>
  );
}

function MetricContext({ compact = false }: { compact?: boolean }) {
  const Container = compact ? "details" : "section";
  return (
    <Container className="marketplace-method">
      {compact ? (
        <summary>
          Read the metrics in context <Info size={14} aria-hidden="true" />
        </summary>
      ) : (
        <h2>Read the metrics in context</h2>
      )}
      <p>
        DA and DR are third-party scores, not a guarantee of placement quality
        or search results. Traffic figures are estimates.
      </p>
      <p>
        Missing values are shown as Unavailable.{" "}
        <Link href="/methodology/">How we source listings and metrics</Link>.
      </p>
      <Link href="/how-to-buy-links/#metrics">Read the metric checklist →</Link>
    </Container>
  );
}

export function Marketplace({
  metricView = false,
  range,
  children,
  initialPage,
  initialQuery,
  catalogueAsOf,
  presentation,
}: {
  metricView?: boolean;
  range?: MarketplaceRange;
  /** Server-rendered content placed after the marketplace tools. */
  children?: React.ReactNode;
  initialPage?: ProductPage;
  initialQuery?: string;
  catalogueAsOf?: string;
  presentation: {
    header: React.ReactNode;
    footer: React.ReactNode;
    hero?: React.ReactNode;
    heading?: React.ReactNode;
    sections?: React.ReactNode;
  };
}) {
  const compactViewport = useSyncExternalStore(
    subscribeToCompactViewport,
    isCompactViewport,
    desktopViewport,
  );
  const searchParams = useSearchParams();
  const params = rangeQuery(searchParams.toString(), range);
  const pathname = usePathname();
  const homePage = pathname === "/" && !metricView && !range;
  const normalized = marketplaceQuery(searchParams.toString(), range);
  const sort = normalized.get("sort")!;
  const page = Number(normalized.get("page"));
  const pageSize = Number(normalized.get("pageSize"));
  const query = normalized.toString();
  const [result, setResult] = useState<
    { query: string; value: ProductPage } | undefined
  >(
    initialPage && initialQuery
      ? { query: initialQuery, value: initialPage }
      : undefined,
  );
  const [facets, setFacets] = useState<ProductFacets>({
    countries: [],
    languages: [],
    categories: [],
  });
  const [error, setError] = useState("");
  const [facetError, setFacetError] = useState("");
  const [retry, setRetry] = useState(0);
  const [shortlist, setShortlist] = useState<PublicProduct[]>([]);
  const [status, setStatus] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(
    null,
  );
  const filtersPanel = useRef<HTMLDetailsElement>(null);
  const firstQuery = useRef(true);
  useEffect(() => {
    // Hydration retains the exact inventory delivered in the server HTML.
    if (firstQuery.current) {
      firstQuery.current = false;
      if (initialPage && initialQuery === query && retry === 0) return;
    }
    let active = true;
    const controller = new AbortController();
    api<ProductPage>(`/api/products/?${query}`, { signal: controller.signal })
      .then((value) => {
        if (active) {
          setResult({ query, value });
          setError("");
        }
      })
      .catch((cause) => {
        if (active) setError(errorMessage(cause));
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [query, retry, initialPage, initialQuery]);
  useEffect(() => {
    let active = true;
    api<{ data: ProductFacets }>("/api/products/facets/")
      .then(({ data }) => {
        if (active) {
          setFacets(data);
          setFacetError("");
        }
      })
      .catch((cause) => {
        if (active) setFacetError(errorMessage(cause));
      });
    return () => {
      active = false;
    };
  }, [retry]);
  const loading = result?.query !== query && !error;
  const value = result?.query === query ? result.value : undefined;
  function navigate(changes: Record<string, string>, resetPage = true) {
    trackEvent("filter_use", { filter_fields: Object.keys(changes).join(",") });
    const next = new URLSearchParams(query);
    for (const [key, item] of Object.entries(changes)) {
      if (item) next.set(key, item);
      else next.delete(key);
    }
    if (resetPage) next.set("page", "1");
    setError("");
    window.history.pushState(null, "", `${pathname}?${next}`);
  }
  function reset() {
    setError("");
    window.history.pushState(null, "", pathname);
  }
  function toggle(product: PublicProduct) {
    const selected = shortlist.some((item) => item.id === product.id);
    if (selected) {
      trackEvent("shortlist", { product_id: product.id, action: "remove" });
      setShortlist((items) => items.filter((item) => item.id !== product.id));
      setStatus(
        `${productDomain(product.domain)} removed from your shortlist.`,
      );
    } else if (shortlist.length >= 4)
      setStatus(
        "Your shortlist is limited to four publications. Remove one to add another.",
      );
    else {
      trackEvent("shortlist", { product_id: product.id, action: "add" });
      setShortlist((items) => [...items, product]);
      setStatus(`${productDomain(product.domain)} added to your shortlist.`);
    }
  }
  const activeFilters = filters.filter(
    (key) => normalized.has(key) && !(key in (range?.bounds || {})),
  );
  const shortlistControl = (product: PublicProduct) => (
    <Button
      variant="secondary"
      className="marketplace-bookmark"
      aria-label={
        shortlist.some((item) => item.id === product.id)
          ? "Remove from shortlist"
          : "Shortlist"
      }
      title={
        shortlist.some((item) => item.id === product.id)
          ? "Remove from shortlist"
          : "Shortlist"
      }
      aria-pressed={shortlist.some((item) => item.id === product.id)}
      disabled={
        shortlist.length >= 4 &&
        !shortlist.some((item) => item.id === product.id)
      }
      onClick={() => toggle(product)}
    >
      <>
        <Bookmark
          size={18}
          aria-hidden="true"
          fill={
            shortlist.some((item) => item.id === product.id)
              ? "currentColor"
              : "none"
          }
        />
        <span className="marketplace-bookmark-label">
          {shortlist.some((item) => item.id === product.id)
            ? "Remove from shortlist"
            : "Shortlist"}
        </span>
      </>
    </Button>
  );
  const facet = (
    key: "country" | "language" | "category",
    label: string,
    values: string[],
  ) => (
    <Field label={label}>
      <Select name={key} defaultValue={params.get(key) || ""}>
        <option value="">All {label.toLowerCase()}</option>
        {[
          ...new Set([
            ...(params.get(key) ? [params.get(key)!] : []),
            ...values,
          ]),
        ].map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>
    </Field>
  );
  return (
    <div
      className={`marketplace reference-site reference-marketplace marketplace-browser${homePage ? ` ${homepageStyles.page}` : ""}`}
    >
      {presentation.header}
      <main id="main" tabIndex={-1}>
        {pathname !== "/" && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeJsonLd(
                breadcrumbSchema([
                  ["Marketplace", "/"],
                  [
                    range?.label ||
                      (metricView ? "Domain Rating" : "Publications"),
                    pathname,
                  ],
                ]),
              ),
            }}
          />
        )}
        {value && !error && !loading && itemListNode(value.data) && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeJsonLd(itemListNode(value.data)),
            }}
          />
        )}
        {pathname !== "/" && (
          <nav className="reference-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Marketplace</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">
              {range?.label || (metricView ? "Domain Rating" : "Publications")}
            </span>
          </nav>
        )}
        {range && (
          <aside
            className="marketplace-range-notice"
            aria-label="Selected marketplace range"
          >
            <p>
              <strong>{range.label}</strong> is fixed for this page. Additional
              filters narrow this range; Reset keeps it. Bounds are inclusive
              unless the label says “above”. Missing metrics are excluded, not
              counted as zero.
            </p>
            <Link href="/">
              Browse all publications{" "}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
        )}
        {metricView ? (
          <>
            <MarketplaceHero metricView />
            <MarketplaceBenefits />
          </>
        ) : (
          <section
            className="marketplace-discovery"
            aria-labelledby="publication-discovery-title"
          >
            {homePage ? (
              presentation.hero
            ) : (
              <div className="marketplace-browser-heading">
                <div className="marketplace-discovery-copy">
                  <span className="marketplace-browser-label">
                    <Sparkles size={13} aria-hidden="true" />
                    Discover. Compare. Plan.
                  </span>
                  <h1 id="publication-discovery-title">
                    {range ? (
                      range.title
                    ) : (
                      <>
                        A guest post marketplace that{" "}
                        <span>fits your audience.</span>
                      </>
                    )}
                  </h1>
                  <p>
                    Guest-post opportunities that fit your audience, topic and
                    budget.
                  </p>
                  <ul className="marketplace-discovery-details">
                    <li>
                      <Globe2 size={15} aria-hidden="true" />
                      Audience fit
                    </li>
                    <li>
                      <ArrowDownUp size={15} aria-hidden="true" />
                      DA &amp; DR metrics
                    </li>
                    <li>
                      <CircleDollarSign size={15} aria-hidden="true" />
                      Placement prices
                    </li>
                  </ul>
                </div>
                <div className="marketplace-discovery-art" aria-hidden="true">
                  <Image
                    src="/03_listing_browser_panel.png"
                    width={880}
                    height={405}
                    sizes="(max-width: 800px) 1px, (max-width: 1100px) 34vw, 380px"
                    alt=""
                    preload
                  />
                </div>
              </div>
            )}
            <PublicationSearch
              query={query}
              facets={facets}
              onSearch={navigate}
              onAdvancedFilters={
                homePage
                  ? () => {
                      const panel = filtersPanel.current;
                      if (!panel) return;
                      panel.open = true;
                      panel.scrollIntoView({ block: "start" });
                      panel
                        .querySelector<HTMLInputElement>('input[name="q"]')
                        ?.focus({ preventScroll: true });
                    }
                  : undefined
              }
            />
          </section>
        )}
        {metricView && (
          <div className="marketplace-catalog-intro">
            <div>
              <p className="eyebrow">Your publication search</p>
              <h2>Explore. Shortlist. Compare.</h2>
            </div>
            <p>
              Start with the audience you want to reach, then weigh the details
              that matter to your placement.
            </p>
          </div>
        )}
        {homePage && presentation.heading}
        <div className="marketplace-workspace" id="inventory">
          <aside
            className={metricView ? undefined : "marketplace-filter-sidebar"}
          >
            {!metricView && (
              <button
                className="marketplace-reset"
                type="button"
                onClick={reset}
              >
                <RotateCcw size={14} aria-hidden="true" />
                Reset All
              </button>
            )}
            <details
              ref={filtersPanel}
              className="marketplace-filter-panel"
              open={metricView || !compactViewport}
            >
              <summary>
                {homePage && (
                  <span className={homepageStyles.filterIcon}>
                    <SlidersHorizontal size={20} aria-hidden="true" />
                  </span>
                )}
                {metricView ? "Filter publications" : "Refine Results"}
                {!metricView && activeFilters.length > 0 ? (
                  <span
                    className="marketplace-filter-count"
                    aria-label={`${activeFilters.length} applied filters`}
                  >
                    {activeFilters.length}
                  </span>
                ) : (
                  <SlidersHorizontal size={17} aria-hidden="true" />
                )}
              </summary>
              <form
                key={query}
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  const changes: Record<string, string> = {};
                  for (const key of filters)
                    changes[key] = String(form.get(key) || "").trim();
                  navigate(changes);
                }}
              >
                <Field label="Search publications">
                  <Input
                    name="q"
                    type="search"
                    maxLength={150}
                    defaultValue={params.get("q") || ""}
                    placeholder="Search domain or topic…"
                  />
                </Field>
                {!metricView && (
                  <div className="marketplace-filter-group-heading">
                    {homePage && (
                      <span className={homepageStyles.filterIcon}>
                        <Users size={18} aria-hidden="true" />
                      </span>
                    )}
                    Audience
                  </div>
                )}
                {facet("category", "Topics", facets.categories)}
                {facet("country", "Countries", facets.countries)}
                {facet("language", "Languages", facets.languages)}
                {!metricView && (
                  <div className="marketplace-filter-group-heading">
                    {homePage && (
                      <span
                        className={`${homepageStyles.filterIcon} ${homepageStyles.budgetIcon}`}
                      >
                        <CircleDollarSign size={18} aria-hidden="true" />
                      </span>
                    )}
                    Budget &amp; metrics
                  </div>
                )}
                <div
                  className={homePage ? homepageStyles.priceFilters : undefined}
                >
                  {homePage && (
                    <Field label="Minimum price (USD)">
                      <Input
                        name="minPrice"
                        type="number"
                        min={0}
                        step={0.01}
                        defaultValue={params.get("minPrice") || ""}
                        placeholder="Min"
                      />
                    </Field>
                  )}
                  <Field label="Maximum price (USD)">
                    <Input
                      name="maxPrice"
                      disabled={!!range?.bounds.maxPrice}
                      type="number"
                      min={0}
                      step={0.01}
                      defaultValue={params.get("maxPrice") || ""}
                      placeholder={homePage ? "Max" : undefined}
                    />
                  </Field>
                </div>
                {metricView ? (
                  <div className="marketplace-filter-metrics">
                    <Field label="Minimum DR">
                      <Input
                        name="minDr"
                        disabled={!!range?.bounds.minDr}
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        defaultValue={params.get("minDr") || ""}
                      />
                    </Field>
                    <Field label="Minimum DA">
                      <Input
                        name="minDa"
                        disabled={!!range?.bounds.minDa}
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        defaultValue={params.get("minDa") || ""}
                      />
                    </Field>
                  </div>
                ) : (
                  <>
                    <MetricFilter
                      name="minDr"
                      disabled={!!range?.bounds.minDr}
                      label="Minimum DR"
                      initialValue={params.get("minDr") || ""}
                    />
                    <MetricFilter
                      name="minDa"
                      disabled={!!range?.bounds.minDa}
                      label="Minimum DA"
                      initialValue={params.get("minDa") || ""}
                    />
                  </>
                )}
                {homePage && (
                  <Field label="Minimum traffic">
                    <Input
                      name="minTraffic"
                      type="number"
                      min={0}
                      step={1}
                      defaultValue={params.get("minTraffic") || ""}
                      placeholder="Any"
                    />
                  </Field>
                )}
                <details
                  className="marketplace-extra-ranges"
                  open={range ? true : undefined}
                >
                  <summary>
                    {homePage && (
                      <span className={homepageStyles.filterIcon}>
                        <SlidersHorizontal size={18} aria-hidden="true" />
                      </span>
                    )}
                    More range filters
                  </summary>
                  {(
                    [
                      "maxDa",
                      "maxDr",
                      "minTraffic",
                      "maxTraffic",
                      "minPrice",
                    ] as const
                  )
                    .filter(
                      (key) =>
                        !homePage ||
                        (key !== "minPrice" && key !== "minTraffic"),
                    )
                    .map((key) => (
                      <Field
                        key={key}
                        label={`${filterLabels[key]}${key === "minPrice" ? " (USD)" : ""}`}
                      >
                        <Input
                          name={key}
                          type="number"
                          min={0}
                          max={
                            key === "maxDa" || key === "maxDr" ? 100 : undefined
                          }
                          step={key === "minPrice" ? 0.01 : 1}
                          defaultValue={params.get(key) || ""}
                          disabled={!!range?.bounds[key]}
                        />
                      </Field>
                    ))}
                </details>
                <div className="actions">
                  <Button>
                    <SlidersHorizontal size={17} aria-hidden="true" />
                    Apply filters
                  </Button>
                  {metricView && (
                    <Button type="button" variant="secondary" onClick={reset}>
                      Reset filters
                    </Button>
                  )}
                </div>
                {facetError && (
                  <p className="marketplace-error" role="status">
                    Filter options could not load. Search and numeric filters
                    remain available.
                  </p>
                )}
              </form>
            </details>
          </aside>
          <section
            className="marketplace-results"
            aria-labelledby="results-heading"
            aria-busy={loading}
          >
            <div className="marketplace-results-heading">
              <div>
                <div className="marketplace-results-title">
                  <h2 id="results-heading">Available Publications</h2>
                  <span role="status" className="marketplace-result-count">
                    {value
                      ? catalogueAsOf
                        ? `${value.total.toLocaleString("en-US")} matching publications`
                        : "Matching publications"
                      : "Loading…"}
                  </span>
                </div>
                <p className={homePage ? "screen-reader-only" : undefined}>
                  Compare publications and find the right fit for your next
                  placement.
                </p>
                {homePage && (
                  <div
                    className={homepageStyles.catalogSortShortcuts}
                    role="group"
                    aria-label="Quick publication sorting"
                  >
                    {[
                      ["domain", "All Publications"],
                      ["trafficDesc", "Highest Traffic"],
                      ["drDesc", "Highest DR"],
                      ["priceAsc", "Lowest Price"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={sort === key}
                        onClick={() => navigate({ sort: key })}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="marketplace-sort">
                <div className="marketplace-toolbar-field">
                  <ArrowDownUp size={16} aria-hidden="true" />
                  <Field label="Sort publications">
                    <Select
                      value={sort}
                      onChange={(event) =>
                        navigate({ sort: event.target.value })
                      }
                    >
                      {sorts.map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field label="Results per page">
                  <Select
                    value={String(pageSize)}
                    onChange={(event) =>
                      navigate({ pageSize: event.target.value })
                    }
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </Select>
                </Field>
              </div>
            </div>
            {activeFilters.length > 0 && (
              <div className="marketplace-chips" aria-label="Applied filters">
                {activeFilters.map((key) => {
                  const rawValue = normalized.get(key)!;
                  const displayValue =
                    (key === "maxPrice" || key === "minPrice") &&
                    Number.isFinite(Number(rawValue))
                      ? usd.format(Number(rawValue))
                      : rawValue;
                  return (
                    <Button
                      key={key}
                      variant="secondary"
                      aria-label={`Remove ${filterLabels[key].toLowerCase()} filter: ${displayValue}`}
                      onClick={() => navigate({ [key]: "" })}
                    >
                      <span>{filterLabels[key]}:</span> {displayValue}
                      <X size={13} aria-hidden="true" />
                    </Button>
                  );
                })}
              </div>
            )}
            {error ? (
              <div role="alert" className="marketplace-error">
                <h3>Inventory could not load</h3>
                <p>{error}</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setError("");
                    setRetry((value) => value + 1);
                  }}
                >
                  Retry inventory
                </Button>
              </div>
            ) : loading ? (
              <div role="status" className="marketplace-loading">
                <p>Loading publications…</p>
                <div className="marketplace-skeleton" aria-hidden="true" />
              </div>
            ) : value?.data.length ? (
              <>
                <div
                  className="marketplace-table-region"
                  tabIndex={0}
                  role="region"
                  aria-label="Publication comparison table — scroll horizontally if needed"
                >
                  <table className="marketplace-table">
                    <caption className="screen-reader-only">
                      Publications with USD placement price and metrics. A dash
                      means the metric is unavailable.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col" className="marketplace-rank-column">
                          #
                        </th>
                        <th scope="col">Publication</th>
                        <th
                          scope="col"
                          className={
                            homePage ? homepageStyles.metricDa : undefined
                          }
                        >
                          DA
                        </th>
                        <th
                          scope="col"
                          className={
                            homePage ? homepageStyles.metricDr : undefined
                          }
                        >
                          DR
                        </th>
                        <th scope="col">
                          <span
                            className={
                              homePage
                                ? homepageStyles.trafficHeading
                                : undefined
                            }
                          >
                            Est. traffic
                            {homePage && <Info size={12} aria-hidden="true" />}
                          </span>
                        </th>
                        <th scope="col">Country / language</th>
                        <th scope="col">Price (USD)</th>
                        <th scope="col">Actions</th>
                        <th scope="col">Compare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {value.data.map((product, index) => (
                        <tr
                          key={product.id}
                          data-shortlisted={
                            shortlist.some((item) => item.id === product.id) ||
                            undefined
                          }
                        >
                          <td>
                            <span className="marketplace-row-number">
                              {(value.page - 1) * value.pageSize + index + 1}
                            </span>
                          </td>
                          <th scope="row">
                            <div className="marketplace-publication-identity">
                              <span
                                className={`marketplace-publication-mark marketplace-publication-mark-${index % 4}`}
                                aria-hidden="true"
                              >
                                {productDomain(product.domain)
                                  .replace(/^www\./, "")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </span>
                              <div>
                                <PublicationName product={product} />
                                <p>{product.category || "Topic unavailable"}</p>
                              </div>
                            </div>
                          </th>
                          <td>
                            <TableMetric value={product.metrics.da} tone="da" />
                          </td>
                          <td>
                            <TableMetric value={product.metrics.dr} tone="dr" />
                          </td>
                          <td>
                            <TableMetric
                              value={product.metrics.traffic}
                              tone="traffic"
                            />
                          </td>
                          <td>
                            <span className="marketplace-publication-country">
                              <CountryName country={product.country} />
                            </span>
                            <span className="marketplace-publication-language">
                              {product.language || "Unavailable"}
                            </span>
                          </td>
                          <td className="marketplace-price">
                            {productPrice(product.priceCents)}
                          </td>
                          <td>
                            <div
                              className={`marketplace-row-actions ${homepageStyles.rowActions}`}
                            >
                              <BuyPlacement productId={product.id} />
                              <Button
                                variant="secondary"
                                className="marketplace-view-details"
                                onClick={() => setSelectedProduct(product)}
                              >
                                View Details
                                <ArrowRight size={14} aria-hidden="true" />
                              </Button>
                            </div>
                          </td>
                          <td>{shortlistControl(product)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="marketplace-cards">
                  {value.data.map((product, index) => (
                    <article
                      className={`publication-card${metricView ? "" : " marketplace-listing-card"}`}
                      key={product.id}
                      data-shortlisted={
                        shortlist.some((item) => item.id === product.id) ||
                        undefined
                      }
                    >
                      <div className="publication-card-heading">
                        {!metricView && (
                          <span
                            className={`marketplace-publication-mark marketplace-publication-mark-${index % 4}`}
                            aria-hidden="true"
                          >
                            {productDomain(product.domain)
                              .replace(/^www\./, "")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                        <div>
                          <h3>
                            <PublicationName product={product} />
                          </h3>
                          {!metricView && (
                            <p className="marketplace-listing-topic">
                              {product.category || "Topic unavailable"}
                            </p>
                          )}
                        </div>
                        <strong className="marketplace-price">
                          {productPrice(product.priceCents)}
                          {!metricView && <small>per placement</small>}
                        </strong>
                      </div>
                      {metricView && (
                        <p className="muted">
                          {product.category || "Topic unavailable"}
                        </p>
                      )}
                      <dl
                        className={
                          metricView ? undefined : "marketplace-listing-metrics"
                        }
                      >
                        <div>
                          <dt>DA</dt>
                          <dd>
                            <TableMetric value={product.metrics.da} tone="da" />
                          </dd>
                        </div>
                        <div>
                          <dt>DR</dt>
                          <dd>
                            <TableMetric value={product.metrics.dr} tone="dr" />
                          </dd>
                        </div>
                        <div>
                          <dt>
                            {metricView ? "Estimated traffic" : "Est. traffic"}
                          </dt>
                          <dd>
                            <TableMetric
                              value={product.metrics.traffic}
                              tone="traffic"
                            />
                          </dd>
                        </div>
                        {metricView && (
                          <>
                            <div>
                              <dt>Country</dt>
                              <dd>
                                <CountryName country={product.country} />
                              </dd>
                            </div>
                            <div>
                              <dt>Language</dt>
                              <dd>{product.language || "Unavailable"}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                      {metricView ? (
                        <>
                          <Detail product={product} />
                          <BuyPlacement productId={product.id} />
                          {shortlistControl(product)}
                        </>
                      ) : (
                        <>
                          <div className="marketplace-listing-audience">
                            <Globe2 size={14} aria-hidden="true" />
                            <span>
                              <CountryName country={product.country} />
                            </span>
                            <span>
                              {product.language || "Language unavailable"}
                            </span>
                          </div>
                          <div className="marketplace-listing-actions">
                            <BuyPlacement productId={product.id} />
                            <Button
                              variant="secondary"
                              className="marketplace-view-details"
                              onClick={() => setSelectedProduct(product)}
                            >
                              View Details
                              <ArrowRight size={14} aria-hidden="true" />
                            </Button>
                            {shortlistControl(product)}
                          </div>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="marketplace-empty">
                <h3>No publications match these filters</h3>
                <p>
                  Try a broader topic, location or budget, or remove a filter to
                  explore more publications.
                </p>
                <Button variant="secondary" onClick={reset}>
                  Clear all filters
                </Button>
              </div>
            )}
            {value && (
              <nav
                className="marketplace-pagination"
                aria-label="Publication result pages"
              >
                <p>
                  {value.total && catalogueAsOf
                    ? `Showing ${((value.page - 1) * value.pageSize + 1).toLocaleString("en-US")}–${Math.min(value.page * value.pageSize, value.total).toLocaleString("en-US")} of ${value.total.toLocaleString("en-US")} publications`
                    : value.total
                      ? `Showing publications on page ${value.page}`
                      : "No publications found"}
                </p>
                <div className="actions">
                  <Button
                    variant="secondary"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => navigate({ page: String(page - 1) }, false)}
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </Button>
                  {Array.from(
                    new Set([
                      1,
                      ...[page - 1, page, page + 1].filter(
                        (item) =>
                          item > 1 && item < Math.ceil(value.total / pageSize),
                      ),
                      Math.max(1, Math.ceil(value.total / pageSize)),
                    ]),
                  ).map((item, index, pages) => (
                    <span className="marketplace-page-item" key={item}>
                      {index > 0 && item - pages[index - 1] > 1 && (
                        <span aria-hidden="true">…</span>
                      )}
                      <Button
                        variant={item === page ? "primary" : "secondary"}
                        aria-label={`Page ${item}`}
                        aria-current={item === page ? "page" : undefined}
                        onClick={() => navigate({ page: String(item) }, false)}
                      >
                        {item}
                      </Button>
                    </span>
                  ))}
                  <Button
                    variant="secondary"
                    aria-label="Next page"
                    disabled={page * pageSize >= value.total}
                    onClick={() => navigate({ page: String(page + 1) }, false)}
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </Button>
                </div>
              </nav>
            )}
            {metricView && <MetricContext />}
          </section>
        </div>
        {!metricView && <MetricContext compact />}
        {homePage ? (
          <HomepageShortlist
            shortlist={shortlist}
            status={status}
            onRemove={toggle}
            onClear={() => {
              setShortlist([]);
              setStatus("Shortlist cleared.");
            }}
          />
        ) : (
          <section
            className="marketplace-shortlist"
            id="shortlist"
            tabIndex={-1}
            aria-labelledby="shortlist-heading"
          >
            <div className="marketplace-results-heading">
              <div>
                <h2 id="shortlist-heading">
                  Your shortlist ({shortlist.length}/4)
                </h2>
                <p>
                  Compare up to four publications. This local shortlist lasts
                  for this visit and is not a cart or reservation.
                </p>
              </div>
              {shortlist.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShortlist([]);
                    setStatus("Shortlist cleared.");
                  }}
                >
                  Clear shortlist
                </Button>
              )}
            </div>
            <p className="marketplace-status" role="status">
              {status ||
                "Select Shortlist on a publication to compare its details here."}
            </p>
            {shortlist.length > 0 && (
              <>
                <div className="marketplace-compare-grid">
                  {shortlist.map((product) => (
                    <article className="publication-card" key={product.id}>
                      <h3>{productDomain(product.domain)}</h3>
                      <p className="marketplace-price">
                        {productPrice(product.priceCents)}
                      </p>
                      <dl>
                        {[
                          ["Topic", product.category || "Unavailable"],
                          ["Country", product.country || "Unavailable"],
                          ["Language", product.language || "Unavailable"],
                          ["DA", productMetric(product.metrics.da)],
                          ["DR", productMetric(product.metrics.dr)],
                          [
                            "Estimated traffic",
                            productMetric(product.metrics.traffic),
                          ],
                          ["Link type", product.linkType || "Unavailable"],
                          ["Turnaround", product.turnaround || "Unavailable"],
                        ].map(([label, number]) => (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>{number}</dd>
                          </div>
                        ))}
                      </dl>
                      <Button
                        variant="secondary"
                        onClick={() => toggle(product)}
                        aria-label={`Remove ${productDomain(product.domain)} from comparison`}
                      >
                        Remove publication
                      </Button>
                    </article>
                  ))}
                </div>
                <p className="small muted">
                  Shortlisted values are the snapshots you selected, not live
                  price or availability reservations.
                </p>
              </>
            )}
          </section>
        )}
        {metricView ? (
          <>
            <MarketplaceBuyerGuide />
            <MarketplaceInquiry />
          </>
        ) : (
          <p className="marketplace-browser-help">
            Need help choosing a publication?{" "}
            <Link href="/how-to-buy-links/">
              Read the placement guide{" "}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </p>
        )}
        {!metricView && shortlist.length > 0 && (
          <aside
            className="marketplace-comparison-bar"
            aria-label="Selected publications"
          >
            <div>
              <span className="marketplace-comparison-count">
                {shortlist.length}
              </span>
              <span>
                Selected <small>Compare up to 4</small>
              </span>
            </div>
            <a href="#shortlist">
              Compare shortlist
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </aside>
        )}
        {selectedProduct && (
          <PublicationDialog
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
        {homePage && presentation.sections}
        {homePage ? (
          <details className={homepageStyles.explore} open>
            <summary>
              <BookOpen size={17} aria-hidden="true" />
              Guest posting guides &amp; publication directories
              <ChevronDown size={16} aria-hidden="true" />
            </summary>
            {children}
          </details>
        ) : (
          children
        )}
      </main>
      {presentation.footer}
    </div>
  );
}
