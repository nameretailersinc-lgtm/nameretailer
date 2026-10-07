"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { AuditRow, SeoWarning } from "@/lib/cms/types";
import { api, errorMessage } from "./api";
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
export function Dashboard() {
  const [data, setData] = useState<Data>();
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ data: Data }>("/api/admin/dashboard")
      .then((r) => setData(r.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);
  return (
    <>
      <PageHeading
        title="Workspace overview"
        description="Real content, recent edits and publishing checks."
        actions={
          <Link className="button" href="/admin/content/new/">
            Create content
          </Link>
        }
      />
      <Feedback error={error} />
      {!data && !error ? (
        <Loading />
      ) : (
        data && (
          <>
            <div className="stats-grid">
              {Object.entries(data.stats).map(([key, value]) => (
                <div className="stat" key={key}>
                  <strong>{value}</strong>
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              ))}
            </div>
            <div className="grid-two">
              <Panel title="SEO & editorial checks">
                {data.warnings.length ? (
                  <>
                    <p className="small muted">
                      Showing {Math.min(10, data.warnings.length)} of{" "}
                      {data.warnings.length} current warnings.
                    </p>
                    <ul className="list-plain">
                      {data.warnings.slice(0, 10).map((warning, index) => (
                        <li key={`${warning.code}-${index}`}>
                          <strong>{warning.code}</strong>
                          <p>{warning.message}</p>
                          {warning.recordId && (
                            <a
                              href={
                                warning.code === "missing-alt"
                                  ? `/admin/media/?edit=${encodeURIComponent(warning.recordId)}`
                                  : `/admin/content/${warning.recordId}/`
                              }
                            >
                              Review this record
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                    <p className="section-rule">
                      <Link href="/admin/content/">Review content</Link>
                    </p>
                  </>
                ) : (
                  <Empty>No current warnings found.</Empty>
                )}
                <p className="small muted">
                  These checks guide editing. They do not predict rankings or
                  certify launch readiness.
                </p>
              </Panel>
              <Panel title="Recent activity">
                {data.recentActivity.length ? (
                  <ul className="list-plain">
                    {data.recentActivity.map((row) => (
                      <li key={row.id}>
                        <strong>{row.action}</strong>
                        <p className="small">
                          {row.detail || row.collection} · {date(row.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty>No activity yet.</Empty>
                )}
              </Panel>
            </div>
          </>
        )
      )}
    </>
  );
}
