"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type {
  Product,
  ProductInput,
  ProductMetrics,
  ProductStatus,
  ImportIssue,
} from "@/lib/commerce/types";
import { api, mutation, errorMessage } from "./api";
import { ProductActivation } from "./product-activation";
import {
  PageHeading,
  Panel,
  Button,
  Field,
  Input,
  Textarea,
  Select,
  Feedback,
  Badge,
  Loading,
  Empty,
  useDirtyGuard,
  date,
} from "./primitives";

type Preview = {
  fatal: boolean;
  rows: number;
  valid: number;
  skipped: number;
  errors: number;
  warnings: number;
  issues: ImportIssue[];
  sha256: string;
  sample: ProductInput[];
};
type Page = { data: Product[]; total: number; page: number; pageSize: number };
const metricLabels: Record<keyof ProductMetrics, string> = {
  da: "Domain Authority (DA)",
  dr: "Domain Rating (DR)",
  tf: "Trust Flow (TF)",
  ur: "URL Rating (UR)",
  traffic: "Estimated traffic",
  referringDomains: "Referring domains",
  backlinks: "Backlinks",
  spamScore: "Spam score",
};
const sortOptions = [
  ["domain", "Publication A–Z"],
  ["priceAsc", "Price: low to high"],
  ["priceDesc", "Price: high to low"],
  ["drDesc", "DR: high to low"],
  ["trafficDesc", "Traffic: high to low"],
] as const;
const blank: ProductInput = {
  externalId: null,
  domain: "",
  language: "",
  country: "",
  category: "",
  priceCents: 0,
  currency: "USD",
  status: "draft",
  metrics: {
    da: null,
    dr: null,
    tf: null,
    ur: null,
    traffic: null,
    referringDomains: null,
    backlinks: null,
    spamScore: null,
  },
  linkType: "",
  turnaround: "",
  requirements: "",
};
const price = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
function usdCents(value: string) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim()))
    throw new Error(
      "Enter a positive USD price with no more than two decimal places.",
    );
  const [whole, decimal = ""] = value.trim().split(".");
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0)
    throw new Error("Enter a valid positive placement price.");
  return cents;
}
function hostname(domain: string) {
  try {
    return new URL(domain).hostname;
  } catch {
    return domain;
  }
}

export function Products() {
  const params = useSearchParams();
  const pathname = usePathname();
  const normalized = new URLSearchParams();
  for (const key of [
    "q",
    "status",
    "importId",
    "country",
    "language",
    "category",
    "minDr",
    "minDa",
    "maxPrice",
  ]) {
    const value = params.get(key);
    if (value) normalized.set(key, value.slice(0, 150));
  }
  const sort = sortOptions.some(([key]) => key === params.get("sort"))
    ? params.get("sort")!
    : "domain";
  normalized.set("sort", sort);
  const page = Math.max(
    1,
    Math.min(100000, Math.floor(Number(params.get("page")) || 1)),
  );
  normalized.set("page", String(page));
  normalized.set("pageSize", "20");
  const query = normalized.toString();
  const [result, setResult] = useState<{ query: string; value: Page }>();
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Product | null | undefined>();
  const [draft, setDraft] = useState<ProductInput>(blank);
  const [priceText, setPriceText] = useState("");
  const [dirty, setDirty] = useState(false);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<Preview>();
  const [acceptValidRows, setAcceptValidRows] = useState(false);
  const [importBusy, setImportBusy] = useState<"preview" | "commit" | null>(
    null,
  );
  useDirtyGuard(dirty);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    api<Page>(`/api/admin/products?${query}`, { signal: controller.signal })
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
  }, [query, reload]);
  const value = result?.query === query ? result.value : undefined;
  const loading = !value && !error;
  function navigate(changes: Record<string, string>, resetPage = true) {
    const next = new URLSearchParams(query);
    for (const [key, item] of Object.entries(changes)) {
      if (item) next.set(key, item);
      else next.delete(key);
    }
    if (resetPage) next.set("page", "1");
    setError("");
    window.history.pushState(null, "", `${pathname}?${next}`);
  }
  function edit(product: Product | null) {
    if (dirty && !window.confirm("Discard unsaved publication changes?"))
      return;
    setEditing(product);
    setDraft(
      product
        ? {
            externalId: product.externalId,
            domain: product.domain,
            language: product.language,
            country: product.country,
            category: product.category,
            priceCents: product.priceCents,
            currency: "USD",
            status: product.status,
            metrics: { ...product.metrics },
            linkType: product.linkType,
            turnaround: product.turnaround,
            requirements: product.requirements,
          }
        : { ...blank, metrics: { ...blank.metrics } },
    );
    setPriceText(product ? (product.priceCents / 100).toFixed(2) : "");
    setDirty(false);
    setError("");
    setSuccess("");
  }
  function change<K extends keyof ProductInput>(key: K, item: ProductInput[K]) {
    setDraft((old) => ({ ...old, [key]: item }));
    setDirty(true);
    setSuccess("");
  }
  async function importFile(action: "preview" | "commit") {
    if (!file) return;
    setImportBusy(action);
    setError("");
    setSuccess("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("action", action);
      if (action === "commit") {
        if (!preview)
          throw new Error("Preview this exact file before importing.");
        form.set("sha256", preview.sha256);
        if (acceptValidRows) form.set("acceptValidRows", "true");
      }
      if (action === "preview") {
        const response = await api<{ data: Preview }>(
          "/api/admin/products/import",
          { method: "POST", body: form },
        );
        setPreview(response.data);
        setAcceptValidRows(false);
        setSuccess(
          "CSV analysis complete. Review counts and flagged rows before importing.",
        );
      } else {
        const response = await api<{
          data: {
            importId: string;
            inserted: number;
            excluded: number;
            status: "draft";
          };
        }>("/api/admin/products/import", { method: "POST", body: form });
        setSuccess(
          `${response.data.inserted.toLocaleString("en-US")} publications imported as drafts; ${response.data.excluded.toLocaleString("en-US")} rows excluded. Nothing was automatically published or overwritten.`,
        );
        setPreview(undefined);
        setFile(undefined);
        setAcceptValidRows(false);
        setReload((old) => old + 1);
      }
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setImportBusy(null);
    }
  }
  const input = (
    key:
      | "domain"
      | "country"
      | "language"
      | "category"
      | "linkType"
      | "turnaround",
    label: string,
    hint?: string,
  ) => (
    <Field label={label} hint={hint}>
      <Input
        required={key === "domain"}
        value={draft[key]}
        onChange={(event) => change(key, event.target.value)}
      />
    </Field>
  );
  return (
    <div className="products-admin">
      <PageHeading
        title="Publications & inventory"
        description="Real marketplace products, separate from editorial CMS content. Imported products remain drafts until reviewed."
        actions={
          <Button disabled={!!importBusy} onClick={() => edit(null)}>
            Add publication
          </Button>
        }
      />
      <Feedback error={error} success={success} />
      <ProductActivation onActivated={() => setReload((value) => value + 1)} />
      <Panel title="CSV import — preview before committing">
        <p className="notice">
          The CSV placement Price is kept separate from original article-price
          fields. Legacy zeros mean unavailable in normalized metrics; raw
          values remain private. Export date_added is not a measurement date.
          Imported descriptions are not promoted to public SEO content.
        </p>
        <Field
          label="Publication CSV file"
          hint="Maximum 32 MiB. Source files stay private; existing domains and IDs are never overwritten."
        >
          <Input
            type="file"
            accept=".csv,text/csv"
            disabled={!!importBusy}
            onChange={(event) => {
              const next = event.target.files?.[0];
              setPreview(undefined);
              setAcceptValidRows(false);
              setSuccess("");
              if (next && next.size > 32 * 1024 * 1024) {
                setError("Choose a CSV smaller than 32 MiB.");
                setFile(undefined);
                return;
              }
              setError("");
              setFile(next);
            }}
          />
        </Field>
        <div className="actions">
          <Button
            variant="secondary"
            disabled={!file || !!importBusy}
            onClick={() => importFile("preview")}
          >
            {importBusy === "preview" ? "Analyzing CSV…" : "Preview CSV"}
          </Button>
          {file && (
            <span className="small">
              {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MiB
            </span>
          )}
        </div>
        {importBusy && (
          <p role="status" className="status-line">
            {importBusy === "preview"
              ? "Checking rows, identifiers, domains, prices and metrics."
              : "Staging and committing reviewed rows as drafts. Keep this page open."}
          </p>
        )}
        {preview && (
          <div className="products-import-review">
            <h3>Import review</h3>
            <dl className="products-import-counts">
              {[
                ["Rows", preview.rows],
                ["Valid", preview.valid],
                ["Skipped placeholders", preview.skipped],
                ["Errors", preview.errors],
                ["Warnings", preview.warnings],
              ].map(([label, count]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{Number(count).toLocaleString("en-US")}</dd>
                </div>
              ))}
            </dl>
            <p className="small wrap-anywhere">
              Preview file SHA-256: {preview.sha256}
            </p>
            {preview.fatal && (
              <p className="notice" role="alert">
                The CSV file structure is invalid. Fix its headers or format,
                choose the corrected file and preview it again. No rows can be
                imported from this preview.
              </p>
            )}
            {preview.issues.length > 0 && (
              <div
                className="table-container products-table-region"
                tabIndex={0}
                role="region"
                aria-label="CSV flagged rows"
              >
                <table>
                  <caption>
                    Flagged rows — showing up to the first 100 issues. Review
                    exclusions before committing.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Row</th>
                      <th scope="col">Issue</th>
                      <th scope="col">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.issues.slice(0, 100).map((issue, index) => (
                      <tr key={`${issue.row}-${issue.code}-${index}`}>
                        <th scope="row">{issue.row}</th>
                        <td>{issue.code}</td>
                        <td>{issue.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {preview.sample.length > 0 && (
              <div
                className="table-container products-table-region"
                tabIndex={0}
                role="region"
                aria-label="Normalized CSV sample"
              >
                <table>
                  <caption>
                    Up to five normalized records — not published inventory
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Publication URL</th>
                      <th scope="col">USD price</th>
                      <th scope="col">Country / language</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sample.slice(0, 5).map((product, index) => (
                      <tr key={`${product.domain}-${index}`}>
                        <th scope="row" className="wrap-anywhere">
                          {product.domain}
                        </th>
                        <td>{price(product.priceCents)}</td>
                        <td>
                          {product.country || "Unavailable"} /{" "}
                          {product.language || "Unavailable"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {preview.errors > 0 && !preview.fatal && (
              <label className="check">
                <input
                  type="checkbox"
                  checked={acceptValidRows}
                  disabled={!!importBusy}
                  onChange={(event) => setAcceptValidRows(event.target.checked)}
                />
                Import only valid rows as drafts; exclude flagged rows
              </label>
            )}
            <p className="small muted">
              Import is insert-only. Hash-bound confirmation applies to this
              exact previewed file. Review and activate suitable publications
              individually; active status is not a vetting claim.
            </p>
            <Button
              disabled={
                !!importBusy ||
                preview.fatal ||
                preview.valid === 0 ||
                (preview.errors > 0 && !acceptValidRows)
              }
              onClick={() => {
                if (
                  window.confirm(
                    `Import ${preview.valid.toLocaleString("en-US")} valid records as drafts${preview.errors > 0 ? " and exclude flagged rows" : ""}? Existing records will not be overwritten.`,
                  )
                )
                  void importFile("commit");
              }}
            >
              {importBusy === "commit"
                ? "Importing drafts…"
                : preview.errors > 0
                  ? "Import valid rows as drafts"
                  : "Import reviewed file as drafts"}
            </Button>
          </div>
        )}
      </Panel>
      {editing !== undefined && (
        <Panel title={editing ? "Edit publication" : "Add publication"}>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              try {
                const priceCents = usdCents(priceText);
                const response = await mutation<{ data: Product }>(
                  editing
                    ? `/api/admin/products/${editing.id}`
                    : "/api/admin/products",
                  editing ? "PATCH" : "POST",
                  {
                    ...draft,
                    priceCents,
                    ...(editing ? { version: editing.version } : {}),
                  },
                );
                setDirty(false);
                setEditing(undefined);
                setSuccess(`Publication saved as ${response.data.status}.`);
                setReload((old) => old + 1);
              } catch (cause) {
                setError(errorMessage(cause));
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="grid-two">
              {input(
                "domain",
                "Publication URL",
                "HTTPS publisher URL; meaningful paths are retained. No indexable individual product pages are created.",
              )}
              <Field label="Placement price (USD)">
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  required
                  value={priceText}
                  onChange={(event) => {
                    setPriceText(event.target.value);
                    setDirty(true);
                  }}
                />
              </Field>
              <Field
                label="Publication status"
                hint="Activate only after reviewing the actual listing and price."
              >
                <Select
                  value={draft.status}
                  onChange={(event) =>
                    change("status", event.target.value as ProductStatus)
                  }
                >
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                  <option value="archived">archived</option>
                </Select>
              </Field>
              <Field label="Legacy external ID (optional)">
                <Input
                  value={draft.externalId || ""}
                  onChange={(event) =>
                    change("externalId", event.target.value.trim() || null)
                  }
                />
              </Field>
              {input("category", "Publication topic")}
              {input("country", "Publication country")}
              {input("language", "Publication language")}
              {input(
                "linkType",
                "Link type",
                "Leave empty when unknown. Do not assume legacy package semantics.",
              )}
              {input(
                "turnaround",
                "Turnaround",
                "Actual estimate or terms; leave empty when unknown.",
              )}
            </div>
            <Field label="Placement requirements">
              <Textarea
                value={draft.requirements}
                onChange={(event) => change("requirements", event.target.value)}
              />
            </Field>
            <h3>Owner-supplied metrics</h3>
            <p className="small muted">
              Leave empty when unavailable. These fields do not establish
              verification or freshness.
            </p>
            <div className="grid-three">
              {(Object.keys(metricLabels) as Array<keyof ProductMetrics>).map(
                (key) => (
                  <Field key={key} label={metricLabels[key]}>
                    <Input
                      type="number"
                      min={0}
                      max={
                        ["da", "dr", "tf", "ur", "spamScore"].includes(key)
                          ? 100
                          : undefined
                      }
                      step={1}
                      value={draft.metrics[key] ?? ""}
                      onChange={(event) => {
                        setDraft((old) => ({
                          ...old,
                          metrics: {
                            ...old.metrics,
                            [key]:
                              event.target.value === ""
                                ? null
                                : Number(event.target.value),
                          },
                        }));
                        setDirty(true);
                      }}
                    />
                  </Field>
                ),
              )}
            </div>
            <div className="actions">
              <Button disabled={busy}>
                {busy ? "Saving publication…" : "Save publication"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  if (
                    !dirty ||
                    window.confirm("Discard unsaved publication changes?")
                  ) {
                    setEditing(undefined);
                    setDirty(false);
                  }
                }}
              >
                Cancel publication edit
              </Button>
              <span className="status-line">
                {dirty
                  ? "Unsaved changes"
                  : editing
                    ? "Loaded version " + editing.version
                    : "New unsaved publication"}
              </span>
            </div>
          </form>
        </Panel>
      )}
      <form
        className="toolbar"
        key={query}
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const changes: Record<string, string> = {};
          for (const key of [
            "q",
            "status",
            "country",
            "language",
            "category",
            "maxPrice",
            "minDr",
            "minDa",
          ])
            changes[key] = String(form.get(key) || "").trim();
          navigate(changes);
        }}
      >
        <Field label="Search inventory">
          <Input
            name="q"
            type="search"
            maxLength={150}
            defaultValue={params.get("q") || ""}
          />
        </Field>
        <Field label="Inventory status">
          <Select name="status" defaultValue={params.get("status") || ""}>
            <option value="">All statuses</option>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
          </Select>
        </Field>
        {[
          ["country", "Country filter"],
          ["language", "Language filter"],
          ["category", "Topic filter"],
        ].map(([key, label]) => (
          <Field key={key} label={label}>
            <Input name={key} defaultValue={params.get(key) || ""} />
          </Field>
        ))}
        <Field label="Maximum inventory price (USD)">
          <Input
            name="maxPrice"
            type="number"
            min={0.01}
            step={0.01}
            defaultValue={params.get("maxPrice") || ""}
          />
        </Field>
        <Field label="Minimum inventory DR">
          <Input
            name="minDr"
            type="number"
            min={0}
            max={100}
            defaultValue={params.get("minDr") || ""}
          />
        </Field>
        <Field label="Minimum inventory DA">
          <Input
            name="minDa"
            type="number"
            min={0}
            max={100}
            defaultValue={params.get("minDa") || ""}
          />
        </Field>
        <Button>Search inventory</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setError("");
            window.history.pushState(null, "", pathname);
          }}
        >
          Reset inventory filters
        </Button>
      </form>
      <div className="products-sort">
        <Field label="Sort inventory">
          <Select
            value={sort}
            onChange={(event) => navigate({ sort: event.target.value })}
          >
            {sortOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <p role="status">
          {value
            ? `${value.total.toLocaleString("en-US")} matching publications`
            : "Inventory results are loading."}
        </p>
      </div>
      {loading ? (
        <Loading label="Loading publications…" />
      ) : value?.data.length ? (
        <div
          className="table-container products-table-region"
          tabIndex={0}
          role="region"
          aria-label="Inventory table — scroll horizontally to view all columns"
        >
          <table>
            <caption>
              Real marketplace records. Active listings are visible to guests;
              drafts and archived listings are private.
            </caption>
            <thead>
              <tr>
                <th scope="col">Publication</th>
                <th scope="col">Status</th>
                <th scope="col">Placement price</th>
                <th scope="col">Country / language</th>
                <th scope="col">DA / DR</th>
                <th scope="col">Updated</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {value.data.map((product) => (
                <tr key={product.id}>
                  <th scope="row" className="wrap-anywhere">
                    {hostname(product.domain)}
                    <p className="small">{product.domain}</p>
                    <p className="small">
                      {product.category || "Topic unavailable"}
                    </p>
                  </th>
                  <td>
                    <Badge>{product.status}</Badge>
                  </td>
                  <td>{price(product.priceCents)}</td>
                  <td>
                    {product.country || "Unavailable"} /{" "}
                    {product.language || "Unavailable"}
                  </td>
                  <td>
                    {product.metrics.da ?? "Unavailable"} /{" "}
                    {product.metrics.dr ?? "Unavailable"}
                  </td>
                  <td>{date(product.updatedAt)}</td>
                  <td>
                    <Button
                      variant="secondary"
                      disabled={busy || !!importBusy}
                      onClick={() => edit(product)}
                    >
                      Edit publication
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <Empty>
            No publications match these filters. Import reviewed drafts or add a
            real publication manually.
          </Empty>
        )
      )}
      {value && (
        <div className="pagination">
          <p>
            Page {value.page} of{" "}
            {Math.max(1, Math.ceil(value.total / value.pageSize))} ·{" "}
            {value.total.toLocaleString("en-US")} results
          </p>
          <div className="actions">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => navigate({ page: String(page - 1) }, false)}
            >
              Previous publications
            </Button>
            <Button
              variant="secondary"
              disabled={page * 20 >= value.total}
              onClick={() => navigate({ page: String(page + 1) }, false)}
            >
              Next publications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
