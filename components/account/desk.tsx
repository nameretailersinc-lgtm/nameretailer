import Link from "next/link";
import {
  ChevronRight,
  ExternalLink,
  Home,
  type LucideIcon,
} from "lucide-react";
import styles from "./desk.module.css";

export function DeskHeader({
  title,
  description,
  icon: Icon,
  checkout = false,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  checkout?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.header}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">
          <Home size={14} aria-hidden="true" />
          Home
        </Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span aria-current="page">{title}</span>
      </nav>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>
          <span className={styles.heroIcon}>
            <Icon size={28} aria-hidden="true" />
          </span>
          <div>
            <p className={styles.eyebrow}>Your publication desk</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>
        {checkout ? (
          <ol className={styles.progress} aria-label="Placement progress">
            <li>
              <Link href="/">
                <span>1</span>
                <strong>Publication</strong>
                <small>Review details</small>
              </Link>
            </li>
            <li>
              <Link href="/cart/">
                <span>2</span>
                <strong>Brief & shortlist</strong>
                <small>Placement information</small>
              </Link>
            </li>
            <li aria-current="step">
              <span>3</span>
              <strong>Checkout</strong>
              <small>Payment & confirm</small>
            </li>
          </ol>
        ) : (
          children
        )}
      </div>
    </header>
  );
}

export function DeskHeading({
  icon: Icon,
  title,
  description,
  id,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  id?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.sectionIcon}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <div>
        <h2 id={id}>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function PublicationIdentity({ domain }: { domain: string | null }) {
  let url: URL | null = null;
  try {
    const candidate = new URL(
      domain?.includes("://") ? domain : `https://${domain}`,
    );
    if (domain && ["http:", "https:"].includes(candidate.protocol))
      url = candidate;
  } catch {
    /* Unavailable catalogue domains are displayed without an external link. */
  }
  const name = url?.hostname || domain || "Unavailable publication";
  return (
    <div className={styles.publicationIdentity}>
      <span className={styles.publicationAvatar} aria-hidden="true">
        {name
          .replace(/^www\./, "")
          .slice(0, 2)
          .toUpperCase()}
      </span>
      {url ? (
        <a href={url.href} target="_blank" rel="noopener noreferrer">
          {name}
          <ExternalLink size={14} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <strong>{name}</strong>
      )}
    </div>
  );
}
