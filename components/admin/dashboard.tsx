"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCheck,
  Database,
  FilePlus2,
  FileText,
  Image,
  LayoutGrid,
  Lightbulb,
  Link2,
  Mail,
  PencilLine,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { AuditRow, SeoWarning } from "@/lib/cms/types";
import { api, errorMessage } from "./api";
import { useWorkspaceUser } from "./admin-shell";
import {
  PageHeading,
  Panel,
  Feedback,
  Loading,
  Empty,
  date,
} from "./primitives";

type Data = {
  stats: Record<string, number>;
  recentActivity: AuditRow[];
  warnings: SeoWarning[];
};
const metrics: {
  key: string;
  label: string;
  icon: LucideIcon;
  tone: string;
  href: string;
  hint: string;
  role?: "editor" | "admin";
}[] = [
  {
    key: "content",
    label: "Content",
    icon: FileText,
    tone: "blue",
    href: "/admin/content/",
    hint: "All posts & pages",
  },
  {
    key: "published",
    label: "Published",
    icon: Database,
    tone: "green",
    href: "/admin/content/?status=published",
    hint: "Live content",
  },
  {
    key: "drafts",
    label: "Drafts",
    icon: PencilLine,
    tone: "orange",
    href: "/admin/content/?status=draft",
    hint: "Ready for your next edit",
  },
  {
    key: "scheduled",
    label: "Scheduled",
    icon: CalendarDays,
    tone: "purple",
    href: "/admin/content/?status=scheduled",
    hint: "Upcoming publications",
  },
  {
    key: "media",
    label: "Media",
    icon: Image,
    tone: "pink",
    href: "/admin/media/",
    hint: "Your image library",
    role: "editor",
  },
  {
    key: "leads",
    label: "Leads",
    icon: Mail,
    tone: "blue",
    href: "/admin/leads/",
    hint: "Conversations to explore",
    role: "admin",
  },
  {
    key: "subscribers",
    label: "Subscribers",
    icon: Users,
    tone: "green",
    href: "/admin/subscribers/",
    hint: "Your growing audience",
    role: "admin",
  },
];
const tips = [
  {
    title: "Give your content a strong start",
    body: "Add a clear SEO title, a useful description, and a social sharing image before publishing.",
    href: "/admin/content/",
    link: "Review your content",
  },
  {
    title: "Make every image accessible",
    body: "Describe informative images with useful alternative text. Mark decorative images appropriately.",
    href: "/admin/media/",
    link: "Open media library",
    role: "editor",
  },
  {
    title: "Connect your best ideas",
    body: "Link related articles so readers can discover more of your work and find their next useful answer.",
    href: "/admin/content/",
    link: "Explore your content",
  },
];
function warningType(code: string) {
  if (code === "missing-review-date") return "Accuracy";
  if (code === "possible-orphan") return "Internal links";
  if (code === "missing-alt") return "Accessibility";
  return "SEO";
}
function warningHref(warning: SeoWarning) {
  if (!warning.recordId) return "/admin/content/";
  return warning.code === "missing-alt"
    ? `/admin/media/?edit=${encodeURIComponent(warning.recordId)}`
    : `/admin/content/${encodeURIComponent(warning.recordId)}/`;
}
function activityIcon(action: string) {
  if (action.startsWith("settings")) return Settings;
  if (/publish|activate|approve/.test(action)) return CheckCheck;
  if (/media|upload/.test(action)) return Image;
  return FileText;
}

export function Dashboard() {
  const user = useWorkspaceUser();
  const [data, setData] = useState<Data>();
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(true);
  const [allChecks, setAllChecks] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const load = useCallback(
    (signal?: AbortSignal) =>
      api<{ data: Data }>("/api/admin/dashboard", { signal })
        .then((result) => {
          if (signal?.aborted) return;
          setData(result.data);
          setError("");
        })
        .catch((cause) => {
          if (!signal?.aborted) setError(errorMessage(cause));
        })
        .finally(() => {
          if (!signal?.aborted) setRefreshing(false);
        }),
    [],
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  const isAdmin = user?.role === "admin";
  const canEdit = isAdmin || user?.role === "editor";
  const visibleMetrics = metrics.filter(
    (metric) => !metric.role || (metric.role === "admin" ? isAdmin : canEdit),
  );
  const availableTips = tips.filter((tip) => !tip.role || canEdit);
  const tip = availableTips[tipIndex % availableTips.length];
  const total = data?.stats.content || 0;
  const published = data?.stats.published || 0;
  const drafts = data?.stats.drafts || 0;
  const scheduled = data?.stats.scheduled || 0;
  const other = Math.max(0, total - published - drafts - scheduled);
  const percentage = (value: number) =>
    total ? Math.round((value / total) * 100) : 0;
  const publishedEnd = total ? (published / total) * 100 : 0;
  const draftsEnd = publishedEnd + (total ? (drafts / total) * 100 : 0);
  const scheduledEnd = draftsEnd + (total ? (scheduled / total) * 100 : 0);
  const chartStyle: CSSProperties = {
    background: total
      ? `conic-gradient(#00a674 0% ${publishedEnd}%, #ffb638 ${publishedEnd}% ${draftsEnd}%, #a77bfa ${draftsEnd}% ${scheduledEnd}%, var(--muted) ${scheduledEnd}% 100%)`
      : "var(--muted)",
  };

  return (
    <>
      <PageHeading
        title="Workspace overview"
        description="Your content, recent edits, and publishing checks at a glance."
        actions={
          <>
            <span className="workspace-live">
              <i />
              Live workspace
            </span>
            <button
              className="workspace-icon-button workspace-refresh"
              aria-label="Refresh dashboard"
              disabled={refreshing}
              onClick={() => {
                setRefreshing(true);
                void load();
              }}
            >
              <RefreshCw
                size={17}
                className={refreshing ? "is-spinning" : ""}
                aria-hidden="true"
              />
            </button>
            <Link className="button" href="/admin/content/new/">
              <Plus size={18} aria-hidden="true" />
              Create content
            </Link>
          </>
        }
      />
      <Feedback error={error} />
      {!data && !error ? (
        <>
          <Loading label="Loading your workspace…" />
          <div className="dashboard-skeleton" aria-hidden="true">
            {visibleMetrics.map((metric) => (
              <div key={metric.key} />
            ))}
          </div>
        </>
      ) : (
        data && (
          <>
            <div className="stats-grid dashboard-stats">
              {visibleMetrics.map(
                ({ key, label, icon: Icon, tone, href, hint }) => (
                  <Link
                    className="workspace-stat"
                    data-tone={tone}
                    key={key}
                    href={href}
                  >
                    <span className="workspace-stat-icon">
                      <Icon size={24} strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <div className="workspace-stat-copy">
                      <strong>
                        {(data.stats[key] || 0).toLocaleString("en")}
                      </strong>
                      <span>{label}</span>
                      <small>{hint}</small>
                    </div>
                    <ArrowRight
                      className="workspace-stat-arrow"
                      size={15}
                      aria-hidden="true"
                    />
                    <Icon
                      className="workspace-stat-watermark"
                      size={53}
                      strokeWidth={1}
                      aria-hidden="true"
                    />
                  </Link>
                ),
              )}
              <Link
                className="workspace-organize"
                href={canEdit ? "/admin/categories/" : "/admin/content/"}
              >
                <span className="workspace-stat-icon">
                  <Lightbulb size={26} aria-hidden="true" />
                </span>
                <div>
                  <strong>Make room for great content</strong>
                  <p>
                    {canEdit
                      ? "Keep your topics organized and your next idea within reach."
                      : "Turn your next idea into a draft and keep the momentum going."}
                  </p>
                </div>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className="dashboard-primary-grid">
              <Panel
                className="dashboard-checks"
                title="SEO & editorial checks"
                icon={<ShieldCheck size={22} aria-hidden="true" />}
                description={
                  data.warnings.length
                    ? `Showing ${allChecks ? data.warnings.length : Math.min(10, data.warnings.length)} of ${data.warnings.length} current warnings.`
                    : "A little care makes your content go further."
                }
                actions={
                  data.warnings.length > 10 ? (
                    <button
                      className="button button-secondary button-sm"
                      aria-expanded={allChecks}
                      aria-controls="dashboard-warning-list"
                      onClick={() => setAllChecks(!allChecks)}
                    >
                      {allChecks ? "Show fewer" : "View all checks"}
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  ) : undefined
                }
              >
                {data.warnings.length ? (
                  <>
                    <div className="check-list-labels" aria-hidden="true">
                      <span>Issue</span>
                      <span>Description</span>
                      <span>Type</span>
                      <span>Action</span>
                    </div>
                    <ul
                      className="list-plain dashboard-warning-list"
                      id="dashboard-warning-list"
                    >
                      {(allChecks
                        ? data.warnings
                        : data.warnings.slice(0, 10)
                      ).map((warning, index) => (
                        <li
                          key={`${warning.code}-${warning.recordId}-${index}`}
                        >
                          <strong className="check-issue">
                            <i
                              data-severity={
                                warning.code === "missing-review-date"
                                  ? "review"
                                  : "warning"
                              }
                            />
                            {warning.code.replaceAll("-", " ")}
                          </strong>
                          <p title={warning.message}>{warning.message}</p>
                          <span className="check-type">
                            {warningType(warning.code)}
                          </span>
                          <Link
                            className="button button-secondary button-sm"
                            aria-label={`Review ${warning.code.replaceAll("-", " ")} ${index + 1}`}
                            href={warningHref(warning)}
                          >
                            Review
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="dashboard-panel-footer">
                      <span>
                        <ShieldCheck size={13} aria-hidden="true" />
                        Small improvements, stronger content.
                      </span>
                      <Link href="/admin/content/">
                        Review content
                        <ArrowRight size={13} aria-hidden="true" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="dashboard-all-clear">
                    <span>
                      <Check size={28} aria-hidden="true" />
                    </span>
                    <h3>You’re all caught up</h3>
                    <p>
                      No current editorial warnings. Keep creating great
                      content.
                    </p>
                    <Link
                      className="button button-secondary"
                      href="/admin/content/"
                    >
                      View content
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </Panel>
              <Panel
                className="dashboard-activity"
                title="Recent activity"
                icon={<Activity size={22} aria-hidden="true" />}
                actions={
                  isAdmin ? (
                    <Link
                      className="button button-secondary button-sm"
                      href="/admin/audit/"
                    >
                      View all activity
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  ) : undefined
                }
              >
                {data.recentActivity.length ? (
                  <ul className="list-plain dashboard-activity-list">
                    {data.recentActivity.slice(0, 7).map((row) => {
                      const Icon = activityIcon(row.action);
                      return (
                        <li key={row.id}>
                          <span
                            className="activity-icon"
                            data-tone={
                              /publish|activate|approve/.test(row.action)
                                ? "green"
                                : row.action.startsWith("settings")
                                  ? "neutral"
                                  : "blue"
                            }
                          >
                            <Icon size={19} aria-hidden="true" />
                          </span>
                          <div>
                            <div className="activity-title">
                              <strong title={row.action}>{row.action}</strong>
                              <time dateTime={row.createdAt}>
                                {date(row.createdAt)}
                              </time>
                            </div>
                            <p title={row.detail || row.collection}>
                              {row.detail || row.collection}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Empty>Your team’s recent changes will appear here.</Empty>
                )}
              </Panel>
            </div>
            <div className="dashboard-secondary-grid">
              <Panel
                title="Content by status"
                icon={<ShieldCheck size={22} aria-hidden="true" />}
                actions={
                  <Link
                    className="button button-secondary button-sm"
                    href="/admin/content/"
                  >
                    View content
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                }
              >
                <div className="dashboard-content-status">
                  <div
                    className="content-donut"
                    style={chartStyle}
                    role="img"
                    aria-label={`${total} total content: ${published} published, ${drafts} drafts, ${scheduled} scheduled${other ? `, ${other} other` : ""}.`}
                  >
                    <div>
                      <strong>{total.toLocaleString("en")}</strong>
                      <span>Total</span>
                    </div>
                  </div>
                  <ul className="content-status-legend">
                    {[
                      {
                        label: "Published",
                        count: published,
                        tone: "green",
                        status: "published",
                      },
                      {
                        label: "Drafts",
                        count: drafts,
                        tone: "orange",
                        status: "draft",
                      },
                      {
                        label: "Scheduled",
                        count: scheduled,
                        tone: "purple",
                        status: "scheduled",
                      },
                      ...(other
                        ? [
                            {
                              label: "Other",
                              count: other,
                              tone: "neutral",
                              status: "",
                            },
                          ]
                        : []),
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          href={`/admin/content/${item.status ? `?status=${item.status}` : ""}`}
                        >
                          <i data-tone={item.tone} />
                          <span>{item.label}</span>
                          <strong>
                            {item.count}{" "}
                            <small>({percentage(item.count)}%)</small>
                          </strong>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>
              <Panel
                className="dashboard-quick-actions"
                title="Quick actions"
                icon={<Zap size={21} aria-hidden="true" />}
              >
                <div className="quick-action-grid">
                  {[
                    {
                      title: "Create content",
                      href: "/admin/content/new/",
                      icon: FilePlus2,
                    },
                    ...(canEdit
                      ? [
                          {
                            title: "Upload media",
                            href: "/admin/media/",
                            icon: Image,
                          },
                          {
                            title: "Manage categories",
                            href: "/admin/categories/",
                            icon: LayoutGrid,
                          },
                        ]
                      : []),
                    ...(isAdmin
                      ? [
                          {
                            title: "View redirects",
                            href: "/admin/redirects/",
                            icon: Link2,
                          },
                        ]
                      : [
                          {
                            title: "View content",
                            href: "/admin/content/",
                            icon: FileText,
                          },
                        ]),
                  ].map(({ title, href, icon: Icon }) => (
                    <Link key={title} href={href}>
                      <Icon size={24} aria-hidden="true" />
                      <span>{title}</span>
                    </Link>
                  ))}
                </div>
              </Panel>
              <Panel
                className="dashboard-tips"
                title="A little inspiration"
                icon={<Lightbulb size={22} aria-hidden="true" />}
              >
                <div
                  className="workspace-tip"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div>
                    <h3>{tip.title}</h3>
                    <p>{tip.body}</p>
                    <Link href={tip.href}>
                      {tip.link}
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </div>
                  <FileText size={62} strokeWidth={1.3} aria-hidden="true" />
                </div>
                <div className="tip-controls">
                  <button
                    className="workspace-icon-button"
                    aria-label="Previous tip"
                    onClick={() =>
                      setTipIndex(
                        (tipIndex + availableTips.length - 1) %
                          availableTips.length,
                      )
                    }
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                  </button>
                  <div>
                    {availableTips.map((item, index) => (
                      <button
                        key={item.title}
                        aria-label={`Show tip ${index + 1}: ${item.title}`}
                        aria-pressed={tipIndex % availableTips.length === index}
                        onClick={() => setTipIndex(index)}
                      />
                    ))}
                  </div>
                  <button
                    className="workspace-icon-button"
                    aria-label="Next tip"
                    onClick={() =>
                      setTipIndex((tipIndex + 1) % availableTips.length)
                    }
                  >
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </Panel>
            </div>
          </>
        )
      )}
    </>
  );
}
