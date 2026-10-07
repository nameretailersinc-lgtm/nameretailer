"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CodeXml,
  FileText,
  Globe,
  Headphones,
  House,
  ImageIcon,
  Info,
  Link2,
  Mail,
  Moon,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Star,
  Sun,
  UserRound,
  Wrench,
  X,
  Calculator,
  Zap,
} from "lucide-react";
import type { SiteSection } from "@/lib/site/pages";
import { tools } from "@/lib/tools/catalog";
import { toolGroups } from "@/lib/tools/presentation";
import { MarketplaceMenu } from "./marketplace-menu";

const groupIcons = [
  FileText,
  ImageIcon,
  Calculator,
  CodeXml,
  ChartNoAxesColumnIncreasing,
];
const guideLinks = [
  {
    title: "SEO Guides",
    description: "Search, answers and discoverability",
    href: "/blog/?q=SEO",
    icon: Search,
    tone: "green",
  },
  {
    title: "Guest Posting Guides",
    description: "Plan an editorial placement",
    href: "/how-to-buy-links/",
    icon: Link2,
    tone: "blue",
  },
  {
    title: "Marketplace Guides",
    description: "Compare publications and metrics",
    href: "/guest-post-marketplace/",
    icon: Globe,
    tone: "purple",
  },
  {
    title: "Content Writing Guides",
    description: "Prepare content with purpose",
    href: "/blog/?q=content",
    icon: FileText,
    tone: "coral",
  },
  {
    title: "Marketing Guides",
    description: "Practical research and planning",
    href: "/guides/",
    icon: ChartNoAxesColumnIncreasing,
    tone: "amber",
  },
];
const searchItems = [
  ...tools.map((tool) => ({
    title: tool.title,
    description: tool.group,
    href: `/${tool.slug}/`,
    kind: "Tool",
  })),
  ...guideLinks.map((guide) => ({ ...guide, kind: "Guide" })),
];

type Menu = "marketplace" | "tools" | "guides" | "account" | "updates" | null;
function subscribeTheme(callback: () => void) {
  window.addEventListener("site-theme-change", callback);
  return () => window.removeEventListener("site-theme-change", callback);
}
const currentTheme = () =>
  document.documentElement.dataset.siteTheme === "dark";

export function SiteNavigation({
  active,
  brand,
  trust,
}: {
  active?: SiteSection;
  brand: React.ReactNode;
  trust: React.ReactNode;
}) {
  const [menu, setMenu] = useState<Menu>(null);
  const [query, setQuery] = useState("");
  const dark = useSyncExternalStore(subscribeTheme, currentTheme, () => false);
  const [unread, setUnread] = useState(true);
  const header = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const openSearch = useCallback(() => {
    setMenu(null);
    setQuery("");
    if (!dialog.current?.open) dialog.current?.showModal();
    searchInput.current?.focus();
  }, []);

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") {
        setMenu(null);
        if (dialog.current?.open) {
          event.preventDefault();
          dialog.current.close();
        } else {
          trigger.current?.focus();
        }
      }
    }
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) setMenu(null);
    }
    document.addEventListener("keydown", keyboard);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("pointerdown", outside);
    };
  }, [openSearch]);

  useEffect(() => {
    if (menu !== "marketplace") return;
    function positionMenu() {
      if (!header.current) return;
      header.current.style.setProperty(
        "--site-marketplace-top",
        `${Math.max(8, header.current.getBoundingClientRect().bottom)}px`,
      );
    }
    positionMenu();
    document
      .getElementById("site-marketplace-menu")
      ?.querySelector<HTMLAnchorElement>("a")
      ?.focus({ preventScroll: true });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("resize", positionMenu);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", positionMenu);
    };
  }, [menu]);

  function toggle(name: Menu, button: HTMLButtonElement) {
    trigger.current = button;
    setMenu((previous) => (previous === name ? null : name));
  }
  const results = query.trim()
    ? searchItems.filter((item) =>
        `${item.title} ${item.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : searchItems.filter((item) =>
        [
          "Word counter",
          "JPG to PNG converter",
          "Schema generator",
          "SEO Guides",
          "Guest Posting Guides",
        ].includes(item.title),
      );

  return (
    <>
      <div className="reference-topbar site-topbar">
        <div className="site-topbar-trust">
          {trust}
          <ul className="site-trust-benefits" aria-label="Marketplace benefits">
            <li>
              <ShieldCheck size={18} aria-hidden="true" />
              Private planning
            </li>
            <li>
              <Zap size={18} aria-hidden="true" />
              Instant access
            </li>
            <li>
              <Star size={18} aria-hidden="true" />
              Publication insights
            </li>
          </ul>
        </div>
        <div className="site-topbar-links">
          <Link href="/help-center/">
            <Headphones size={17} aria-hidden="true" />
            Support
          </Link>
          <Link href="/contact/">
            <Mail size={17} aria-hidden="true" />
            Contact
          </Link>
          <button
            className="site-round-button site-theme-toggle"
            type="button"
            aria-label={dark ? "Use light appearance" : "Use dark appearance"}
            aria-pressed={dark}
            onClick={() => {
              setMenu(null);
              const next =
                document.documentElement.dataset.siteTheme !== "dark";
              document.documentElement.dataset.siteTheme = next
                ? "dark"
                : "light";
              window.dispatchEvent(new Event("site-theme-change"));
            }}
          >
            {dark ? (
              <Sun size={18} aria-hidden="true" />
            ) : (
              <Moon size={18} aria-hidden="true" />
            )}
          </button>
          <span className="site-language-selector">
            <Globe size={17} aria-hidden="true" />
            English
            <ChevronDown size={12} aria-hidden="true" />
          </span>
        </div>
      </div>
      <header
        className="reference-header site-header"
        ref={header}
        onBlurCapture={(event) => {
          if (
            menu === "marketplace" &&
            !event.currentTarget.contains(event.relatedTarget)
          )
            setMenu(null);
        }}
      >
        {brand}
        <nav className="site-primary-nav" aria-label="Site navigation">
          <Link
            className="site-nav-link"
            href="/home/"
            aria-current={active === "home" ? "page" : undefined}
          >
            <House size={20} aria-hidden="true" />
            Home
          </Link>
          {(
            [
              ["marketplace", "Marketplace", "/products/", Store],
              ["tools", "Tools", "/seo-tools/", Wrench],
              ["guides", "Guides", "/guides/", BookOpen],
            ] as const
          ).map(([key, title, href, Icon]) => (
            <div
              className={`site-nav-group${active === key || menu === key ? " is-active" : ""}`}
              key={key}
            >
              <Link
                href={href}
                aria-current={active === key ? "page" : undefined}
                onClick={() => setMenu(null)}
              >
                <Icon size={20} aria-hidden="true" />
                {title}
              </Link>
              <button
                type="button"
                aria-label={`Browse ${key}`}
                aria-expanded={menu === key}
                aria-controls={`site-${key}-menu`}
                onClick={(event) => toggle(key, event.currentTarget)}
              >
                <ChevronDown size={15} aria-hidden="true" />
              </button>
            </div>
          ))}
          <Link
            className="site-nav-link"
            href="/about/"
            aria-current={active === "about" ? "page" : undefined}
          >
            <Info size={19} aria-hidden="true" />
            About
          </Link>
          <Link
            className="site-nav-link"
            href="/help-center/"
            aria-current={active === "help" ? "page" : undefined}
          >
            <CircleHelp size={19} aria-hidden="true" />
            Help
          </Link>
        </nav>
        <div className="reference-header-actions site-header-actions">
          <button
            ref={searchTrigger}
            className="site-search-trigger"
            type="button"
            aria-label="Search tools and guides"
            aria-haspopup="dialog"
            aria-keyshortcuts="Control+k Meta+k"
            onClick={openSearch}
          >
            <Search size={21} aria-hidden="true" />
            <span>Search tools, guides…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <button
            className="site-round-button site-updates-toggle"
            type="button"
            aria-label="Site updates"
            aria-expanded={menu === "updates"}
            aria-controls="site-updates-menu"
            onClick={(event) => {
              toggle("updates", event.currentTarget);
              setUnread(false);
            }}
          >
            <Bell size={20} aria-hidden="true" />
            {unread && <span className="site-unread-dot" />}
          </button>
          <Link
            className="site-round-button site-cart-link"
            href="/cart/"
            aria-label="Open planning cart"
            title="Your planning cart"
            aria-current={active === "cart" ? "page" : undefined}
            onClick={() => setMenu(null)}
          >
            <ShoppingCart size={20} aria-hidden="true" />
          </Link>
          <button
            className="site-account-trigger"
            type="button"
            aria-label="Account info"
            aria-current={active === "account" ? "page" : undefined}
            aria-expanded={menu === "account"}
            aria-controls="site-account-menu"
            onClick={(event) => toggle("account", event.currentTarget)}
          >
            <UserRound size={19} aria-hidden="true" />
            <span>Account info</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </div>
        {menu === "marketplace" && (
          <>
            <div
              className="site-marketplace-backdrop"
              aria-hidden="true"
              onPointerDown={(event) => {
                event.preventDefault();
                setMenu(null);
                trigger.current?.focus();
              }}
            />
            <MarketplaceMenu
              onNavigate={() => setMenu(null)}
              onClose={() => {
                setMenu(null);
                trigger.current?.focus();
              }}
            />
          </>
        )}
        {(menu === "tools" || menu === "guides") && (
          <section
            className="site-mega-menu"
            id={`site-${menu}-menu`}
            aria-label={menu === "tools" ? "Tool categories" : "Guide topics"}
          >
            <div className="site-menu-feature">
              <p className="site-menu-tag">{menu}</p>
              <h2>
                {menu === "tools" ? (
                  <>
                    Powerful
                    <br />
                    Free Tools
                  </>
                ) : (
                  <>
                    Learn, Grow
                    <br />
                    and Succeed
                  </>
                )}
              </h2>
              <p>
                {menu === "tools"
                  ? "Simple, practical tools to make your work easier."
                  : "Step-by-step guides and expert tips for better content and marketing."}
              </p>
              <Image
                src={
                  menu === "tools"
                    ? "/tools/02_tools_document_illustration.png"
                    : "/01_guest_post_checklist.png"
                }
                width={395}
                height={335}
                alt=""
                sizes="260px"
              />
              <Link
                href={menu === "tools" ? "/seo-tools/" : "/guides/"}
                onClick={() => setMenu(null)}
                className="site-menu-cta"
              >
                View All {menu === "tools" ? "Tools" : "Guides"}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="site-menu-links">
              {menu === "tools"
                ? toolGroups.map((group, index) => {
                    const Icon = groupIcons[index];
                    return (
                      <Link
                        key={group.name}
                        href={`/seo-tools/#${group.name.toLowerCase().replaceAll(" ", "-")}`}
                        onClick={() => setMenu(null)}
                      >
                        <span
                          className={`site-menu-icon site-tone-${group.tone}`}
                        >
                          <Icon size={26} aria-hidden="true" />
                        </span>
                        <span>
                          <strong>{group.name}</strong>
                          <small>
                            {
                              tools.filter((tool) => tool.group === group.name)
                                .length
                            }{" "}
                            tools
                          </small>
                        </span>
                        <ChevronRight size={17} aria-hidden="true" />
                      </Link>
                    );
                  })
                : guideLinks.map((guide) => (
                    <Link
                      key={guide.title}
                      href={guide.href}
                      onClick={() => setMenu(null)}
                    >
                      <span
                        className={`site-menu-icon site-tone-${guide.tone}`}
                      >
                        <guide.icon size={26} aria-hidden="true" />
                      </span>
                      <span>
                        <strong>{guide.title}</strong>
                        <small>{guide.description}</small>
                      </span>
                      <ChevronRight size={17} aria-hidden="true" />
                    </Link>
                  ))}
            </div>
          </section>
        )}
        {menu === "account" && (
          <div
            id="site-account-menu"
            className="site-small-menu"
            aria-label="Account links"
          >
            <strong>Your workspace</strong>
            <Link href="/my-account/" onClick={() => setMenu(null)}>
              <UserRound size={18} aria-hidden="true" />
              Your account
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
            <Link
              href="/cart/"
              aria-label="Your planning cart"
              onClick={() => setMenu(null)}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              Your planning cart
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        )}
        {menu === "updates" && (
          <div
            id="site-updates-menu"
            className="site-small-menu site-updates-menu"
          >
            <strong>Latest from Name Retailer</strong>
            <p>28 free tools. One useful workspace.</p>
            <Link href="/seo-tools/" onClick={() => setMenu(null)}>
              <Wrench size={18} aria-hidden="true" />
              Explore the tools
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/blog/" onClick={() => setMenu(null)}>
              <BookOpen size={18} aria-hidden="true" />
              Read the journal
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        )}
      </header>
      <dialog
        ref={dialog}
        className="site-search-dialog"
        aria-labelledby="site-search-title"
        onClose={() => searchTrigger.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              dialog.current?.close();
          }
        }}
      >
        <div className="site-search-dialog-heading">
          <h2 id="site-search-title">Find your next useful tool</h2>
          <button
            type="button"
            aria-label="Close search"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <label className="site-dialog-search">
          <Search size={22} aria-hidden="true" />
          <span className="sr-only">Search tools and guides</span>
          <input
            ref={searchInput}
            type="search"
            placeholder="Search tools and guides…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className="site-search-summary" role="status">
          {query.trim()
            ? `${results.length} results`
            : "Popular tools and guides"}
        </p>
        <div className="site-search-results">
          {results.slice(0, 15).map((item) => (
            <Link
              key={item.href + item.title}
              href={item.href}
              onClick={() => dialog.current?.close()}
            >
              <span className="site-search-result-icon">
                {item.kind === "Tool" ? (
                  <Wrench size={19} aria-hidden="true" />
                ) : (
                  <BookOpen size={19} aria-hidden="true" />
                )}
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <span className="site-search-kind">{item.kind}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          ))}
          {!results.length && (
            <p className="site-search-empty">
              No matches yet. Try “image”, “schema” or “writing”.
            </p>
          )}
        </div>
        <div className="site-search-dialog-footer">
          <span>
            <Check size={14} aria-hidden="true" />
            Tools and guides, in one place
          </span>
          <kbd>Esc to close</kbd>
        </div>
      </dialog>
    </>
  );
}
