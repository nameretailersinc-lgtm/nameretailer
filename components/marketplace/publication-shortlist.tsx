"use client";

import { ShortlistInquiry } from "@/components/inquiries/placement-inquiry";
import Link from "next/link";
import {
  Scale,
  Trash2,
  X,
  Plus,
  ExternalLink,
  BookmarkPlus,
} from "lucide-react";
import { useShortlist } from "./shortlist";
import { publicationPath } from "@/lib/commerce/publication-pages";
import styles from "./publication-shortlist.module.css";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numFormat = new Intl.NumberFormat("en-US");

function cleanHost(domain: string): string {
  try {
    const url = new URL(domain);
    return url.hostname.replace(/^www\./, "") + (url.pathname !== "/" ? url.pathname : "");
  } catch {
    return domain.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  }
}

export function PublicationShortlist() {
  const { items, clear, toggle, status } = useShortlist();
  const maxSlots = 4;
  const count = items.length;
  const emptySlotsCount = Math.max(0, maxSlots - count);

  return (
    <section className={`reference-card ${styles.card}`} aria-labelledby="profile-shortlist-title">
      <div className={styles.header}>
        <div>
          <div className={styles.titleRow}>
            <span className={styles.iconBadge} aria-hidden="true">
              <Scale size={20} />
            </span>
            <h2 id="profile-shortlist-title" className={styles.title}>
              Your publication comparison{" "}
              <span className={styles.countBadge}>({count}/{maxSlots})</span>
            </h2>
          </div>
          <p className={styles.subtitle}>
            Shortlist this listing and relevant alternatives to compare up to four publications side-by-side on pricing, authority metrics, and turnaround.
          </p>
        </div>

        {count > 0 && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={clear}
            aria-label="Clear publication comparison"
          >
            <Trash2 size={14} aria-hidden="true" />
            Clear comparison
          </button>
        )}
      </div>

      <p className="screen-reader-only" role="status" aria-live="polite">
        {status || (count ? `${count} publications shortlisted.` : "No publications shortlisted yet.")}
      </p>

      {/* 4-Column Comparison Grid */}
      <div className={styles.grid}>
        {items.map((item, index) => {
          const host = cleanHost(item.domain);
          const href = publicationPath(item);
          const monogram = host.replace(/^www\./, "").slice(0, 2).toUpperCase();
          const da = typeof item.metrics?.da === "number" ? item.metrics.da : null;
          const dr = typeof item.metrics?.dr === "number" ? item.metrics.dr : null;
          const traffic = typeof item.metrics?.traffic === "number" ? numFormat.format(item.metrics.traffic) : null;

          return (
            <article key={item.id} className={styles.itemCard}>
              <div className={styles.itemTop}>
                <span className={styles.itemSlotBadge}>#{index + 1}</span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => toggle(item)}
                  title={`Remove ${host} from comparison`}
                  aria-label={`Remove ${host} from comparison`}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>

              <div className={styles.itemIdentity}>
                <span className={styles.monogram} aria-hidden="true">
                  {monogram}
                </span>
                {href ? (
                  <Link href={href} className={styles.itemDomainLink}>
                    {host}
                  </Link>
                ) : (
                  <span className={styles.itemDomainLink}>{host}</span>
                )}
              </div>

              <div className={styles.itemPrice}>
                {usd.format(item.priceCents / 100)}
                <small>USD</small>
              </div>

              <div className={styles.itemMetrics}>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>DR</span>
                  <span className={`${styles.metricValue} ${styles.metricDr}`}>
                    {dr ?? "Unavailable"}
                  </span>
                </div>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>DA</span>
                  <span className={`${styles.metricValue} ${styles.metricDa}`}>
                    {da ?? "Unavailable"}
                  </span>
                </div>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>Traffic</span>
                  <span className={`${styles.metricValue} ${styles.metricTraffic}`}>
                    {traffic ?? "Unavailable"}
                  </span>
                </div>
                <div className={styles.metricBox}>
                  <span className={styles.metricLabel}>Turnaround</span>
                  <span className={styles.metricValue}>
                    {item.turnaround || "Unavailable"}
                  </span>
                </div>
              </div>

              <div className={styles.itemFooter}>
                {href ? (
                  <Link href={href} className={styles.viewLink}>
                    View details <ExternalLink size={12} aria-hidden="true" />
                  </Link>
                ) : (
                  <span className={styles.viewLink}>
                    {item.category || "General"}
                  </span>
                )}
              </div>
            </article>
          );
        })}

        {/* Empty slots placeholders */}
        {Array.from({ length: emptySlotsCount }).map((_, i) => {
          const slotNum = count + i + 1;
          return (
            <div key={`empty-slot-${slotNum}`} className={styles.emptySlot}>
              <span className={styles.emptySlotNumber}>Slot {slotNum}</span>
              <div className={styles.emptySlotIcon} aria-hidden="true">
                <Plus size={18} />
              </div>
              <span className={styles.emptySlotLabel}>
                {count === 0 && slotNum === 1 ? "No publications shortlisted yet" : "Empty comparison slot"}
              </span>
              <span className={styles.emptySlotHint}>
                Click &ldquo;Shortlist&rdquo; to add
              </span>
            </div>
          );
        })}
      </div>

      {/* Helpful Guidance Banner / Footer */}
      {count === 0 ? (
        <div className={styles.tipBox}>
          <BookmarkPlus size={19} className={styles.tipIcon} aria-hidden="true" />
          <div>
            <strong>How to compare:</strong> Select the <strong>Shortlist</strong> button in the placement summary sidebar or on any nearby alternative to compare up to 4 publications during your visit.
          </div>
        </div>
      ) : (
        <div className={styles.bottomBar}>
          <p className={styles.bottomNote}>
            Shortlisted values are selected snapshots for this visit.
          </p>
          <ShortlistInquiry />
        </div>
      )}
    </section>
  );
}
