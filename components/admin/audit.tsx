"use client";
import { useEffect, useState } from "react";
import type { AuditRow } from "@/lib/cms/types";
import { api, errorMessage } from "./api";
import {
  PageHeading,
  Field,
  Input,
  Select,
  Button,
  Feedback,
  Loading,
  Empty,
  date,
} from "./primitives";
export function Audit() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState("desc");
  const [action, setAction] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api<{ data: AuditRow[]; total: number }>(
      `/api/admin/audit?q=${encodeURIComponent(query)}&page=${page}&direction=${direction}&action=${encodeURIComponent(action)}`,
    )
      .then((r) => {
        if (active) {
          setRows(r.data);
          setTotal(r.total);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [query, page, direction, action]);
  return (
    <>
      <PageHeading
        title="Audit log"
        description="Recorded server actions and who performed them."
      />
      <Feedback error={error} />
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(q);
          setPage(1);
        }}
      >
        <Field label="Search audit log">
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Field>
        <Field label="Date order">
          <Select
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value);
              setPage(1);
            }}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </Select>
        </Field>
        <Field label="Action filter">
          <Select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
              setBusy(true);
            }}
          >
            <option value="">All actions</option>
            {[
              "create",
              "update",
              "bulk.archive",
              "bulk.publish",
              "bulk.delete",
              "user.create",
              "user.update",
              "settings.update",
              "media.upload",
              "redirect.import",
              "export",
              "password.reset",
              "content.publish.scheduled",
              "content.schedule.blocked",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Select>
        </Field>
        <Button>Search</Button>
      </form>
      {busy ? (
        <Loading />
      ) : rows.length ? (
        <div
          className="table-container"
          tabIndex={0}
          role="region"
          aria-label="Audit log table"
        >
          <table>
            <caption>{total} recorded actions</caption>
            <thead>
              <tr>
                <th scope="col">Action</th>
                <th scope="col">Record / detail</th>
                <th scope="col">Actor</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.action}</th>
                  <td className="wrap-anywhere">
                    {row.collection} / {row.recordId}
                    <p className="small">{row.detail}</p>
                  </td>
                  <td className="wrap-anywhere">{row.actorId}</td>
                  <td>{date(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No audit actions match these criteria.</Empty>
      )}
      <div className="pagination">
        <p>
          Page {page} of {Math.max(1, Math.ceil(total / 20))}
        </p>
        <div className="actions">
          <Button
            variant="secondary"
            disabled={page === 1 || busy}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={page * 20 >= total || busy}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
