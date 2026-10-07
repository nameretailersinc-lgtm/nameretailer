import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Coins,
  Crown,
  Link2,
  ShieldCheck,
  Store,
  Wallet,
  X,
} from "lucide-react";
import { marketplaceGroups } from "@/lib/commerce/marketplace-ranges";

const cards = [
  {
    tone: "authority",
    icon: Crown,
    badge: "High Authority",
    badgeIcon: ArrowUpRight,
  },
  {
    tone: "traffic",
    icon: ChartNoAxesColumnIncreasing,
    badge: "More Reach",
    badgeIcon: ArrowUpRight,
  },
  {
    tone: "rating",
    icon: Link2,
    badge: "Quality Backlinks",
    badgeIcon: ShieldCheck,
  },
  { tone: "price", icon: Wallet, badge: "Budget Friendly", badgeIcon: Coins },
] as const;

export function MarketplaceMenu({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: () => void;
}) {
  return (
    <section
      className="site-mega-menu site-marketplace-menu"
      id="site-marketplace-menu"
      aria-label="Marketplace ranges"
    >
      <button
        type="button"
        className="site-marketplace-close"
        aria-label="Close marketplace menu"
        onClick={onClose}
      >
        <X size={23} aria-hidden="true" />
      </button>
      <div className="site-marketplace-menu-scroll">
        <div className="site-marketplace-menu-heading">
          <div className="site-marketplace-menu-intro">
            <p className="site-marketplace-eyebrow">
              <Store size={16} aria-hidden="true" />
              Publisher Marketplace
            </p>
            <h2>
              Find the right <span>publication</span>
            </h2>
            <p>Browse by authority, traffic estimate or placement budget.</p>
          </div>
          <div className="site-marketplace-menu-art" aria-hidden="true">
            <Image
              src="/01_hero_analytics_illustration.png"
              width={700}
              height={475}
              sizes="(max-width: 760px) 160px, 340px"
              alt=""
            />
          </div>
          <Link
            className="site-marketplace-all"
            href="/products/"
            onClick={onNavigate}
          >
            All publications
            <ArrowRight size={22} aria-hidden="true" />
          </Link>
        </div>
        <nav
          className="site-marketplace-category-jumps"
          aria-label="Browse marketplace categories"
        >
          {cards.map((card, index) => (
            <a key={card.tone} href={`#site-marketplace-${card.tone}`}>
              {["DA / PA", "Traffic", "DR", "Price"][index]}
            </a>
          ))}
        </nav>
        <div className="site-marketplace-menu-groups">
          {marketplaceGroups.map((group, index) => {
            const card = cards[index];
            const Icon = card.icon;
            const BadgeIcon = card.badgeIcon;
            return (
              <section
                className={`site-marketplace-category site-marketplace-${card.tone}`}
                id={`site-marketplace-${card.tone}`}
                tabIndex={-1}
                key={group.title}
                aria-labelledby={`marketplace-menu-category-${index}`}
              >
                <div className="site-marketplace-category-heading">
                  <span className="site-marketplace-category-icon">
                    <Icon size={39} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 id={`marketplace-menu-category-${index}`}>
                      {group.title}
                    </h3>
                    <p>{group.description}</p>
                  </div>
                  <span className="site-marketplace-category-badge">
                    <BadgeIcon size={17} aria-hidden="true" />
                    {card.badge}
                  </span>
                </div>
                <div
                  className="site-marketplace-category-decoration"
                  aria-hidden="true"
                >
                  {index === 0 && (
                    <div className="site-marketplace-mini-bars">
                      <i />
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                  )}
                  {index === 1 && (
                    <svg viewBox="0 0 200 90" fill="none">
                      <path
                        d="M2 88C18 76 26 62 39 66S59 87 72 80 94 37 110 42 131 73 148 59 173 22 194 8L194 90H2Z"
                        fill="currentColor"
                        opacity=".16"
                      />
                      <path
                        d="M2 88C18 76 26 62 39 66S59 87 72 80 94 37 110 42 131 73 148 59 173 22 194 8"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="194" cy="8" r="4" fill="currentColor" />
                    </svg>
                  )}
                  {index === 2 && <Link2 size={88} strokeWidth={2.5} />}
                  {index === 3 && (
                    <div className="site-marketplace-mini-coins">
                      <i />
                      <i />
                      <i />
                    </div>
                  )}
                </div>
                <div className="site-marketplace-category-links">
                  {group.ranges.map((range) => (
                    <Link
                      key={range.slug}
                      href={`/${range.slug}/`}
                      aria-label={range.label}
                      onClick={onNavigate}
                    >
                      {range.label.replaceAll("–", " – ")}
                      <ChevronRight size={19} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
