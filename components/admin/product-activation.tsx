"use client";
import { useState } from "react";
import Link from "next/link";
import { api, mutation, errorMessage } from "./api";
import { Panel, Field, Input, Button, Feedback } from "./primitives";
type Preview = {
  importId: string;
  limit: number;
  sha256: string;
  count: number;
  expires: number;
  signature: string;
  remainingDrafts: number;
  invalid: number;
  canActivate: boolean;
  rows: Array<{
    id: string;
    domain: string;
    version: number;
    priceCents: number;
    currency: string;
    country: string;
    language: string;
    category: string;
    missingMetrics: number;
  }>;
};
export function ProductActivation({
  onActivated,
}: {
  onActivated: () => void;
}) {
  const [importId, setImportId] = useState("");
  const [limit, setLimit] = useState("100");
  const [preview, setPreview] = useState<Preview>();
  const [confirmation, setConfirmation] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  function invalidate() {
    setPreview(undefined);
    setConfirmation("");
    setAcknowledged(false);
    setError("");
    setSuccess("");
  }
  async function loadPreview() {
    invalidate();
    setBusy(true);
    try {
      setPreview(
        (
          await api<{ data: Preview }>(
            `/api/admin/products/activate?importId=${encodeURIComponent(importId)}&limit=${encodeURIComponent(limit)}`,
          )
        ).data,
      );
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  async function activate() {
    if (!preview) return;
    setBusy(true);
    setError("");
    setSuccess("");
    const { importId, limit, sha256, count, expires, signature } = preview;
    try {
      const result = await mutation<{ data: { activated: number } }>(
        "/api/admin/products/activate",
        "POST",
        {
          importId,
          limit,
          sha256,
          count,
          expires,
          signature,
          confirmation,
          acknowledgeUnverifiedMetrics: acknowledged,
        },
      );
      invalidate();
      setSuccess(
        `${result.data.activated} reviewed listings activated. They are now visible in the catalog; no orders were created. Preview again for the next batch.`,
      );
      onActivated();
    } catch (cause) {
      setError(errorMessage(cause));
      setPreview(undefined);
      setConfirmation("");
      setAcknowledged(false);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Panel title="Bulk activation — reviewed imports only">
      <p className="notice">
        Previewing does not publish anything. Activation changes only the
        displayed draft listings from one completed import, in atomic batches of
        up to 500. It does not verify publisher availability, metrics or
        editorial quality, and does not enable checkout.
      </p>
      <Field label="Completed import ID">
        <Input
          value={importId}
          disabled={busy}
          onChange={(event) => {
            invalidate();
            setImportId(event.target.value.trim());
          }}
          placeholder="Paste the import ID returned by your CSV import"
        />
      </Field>
      <Field
        label="Listings per activation batch"
        hint="1–500. Review this batch before confirming; repeat for remaining drafts."
      >
        <Input
          type="number"
          min={1}
          max={500}
          value={limit}
          disabled={busy}
          onChange={(event) => {
            invalidate();
            setLimit(event.target.value);
          }}
        />
      </Field>
      <Button
        variant="secondary"
        disabled={busy || !importId}
        onClick={loadPreview}
      >
        Preview activation
      </Button>
      <Feedback error={error} success={success} />
      {preview && (
        <div>
          <p role="status">
            {preview.count} draft listings in this preview ·{" "}
            {preview.remainingDrafts} drafts remaining in the import ·{" "}
            {preview.invalid} invalid listings.
          </p>
          <p>
            <Link
              href={`/admin/products/?status=draft&importId=${preview.importId}`}
            >
              Review this import in inventory
            </Link>
          </p>
          <div
            className="table-container products-table-region"
            role="region"
            aria-label="Exact activation batch"
            tabIndex={0}
          >
            <table>
              <caption>
                Exact listings proposed for activation — not a sample
              </caption>
              <thead>
                <tr>
                  <th scope="col">Publication</th>
                  <th scope="col">USD placement price</th>
                  <th scope="col">Topic / country / language</th>
                  <th scope="col">Missing metrics</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className="wrap-anywhere">
                      {row.domain}
                    </th>
                    <td>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(row.priceCents / 100)}
                    </td>
                    <td>
                      {row.category || "Unavailable"} /{" "}
                      {row.country || "Unavailable"} /{" "}
                      {row.language || "Unavailable"}
                    </td>
                    <td>{row.missingMetrics} of 8</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              disabled={busy}
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
            />{" "}
            I reviewed these listings and prices. Metrics remain owner-supplied;
            activation is not independent verification.
          </label>
          <Field
            label="Activation confirmation"
            hint="Type ACTIVATE REVIEWED LISTINGS. The preview expires after 15 minutes; any listing change requires a new preview."
          >
            <Input
              disabled={busy}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </Field>
          <Button
            disabled={
              busy ||
              !preview.canActivate ||
              !acknowledged ||
              confirmation !== "ACTIVATE REVIEWED LISTINGS"
            }
            onClick={activate}
          >
            Activate {preview.count} reviewed listings
          </Button>
        </div>
      )}
    </Panel>
  );
}
