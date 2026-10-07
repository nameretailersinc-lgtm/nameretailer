"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useWorkspaceUser } from "./admin-shell";
import type { Collection, CmsRecord, RecordInput } from "@/lib/cms/types";
import { api, apiPath, mutation, errorMessage } from "./api";
import {
  PageHeading,
  Panel,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Feedback,
  Loading,
  Empty,
  Badge,
  date,
  useDirtyGuard,
} from "./primitives";

const names: Record<Collection, string> = {
  content: "Content",
  categories: "Categories",
  tags: "Tags",
  authors: "Authors",
  media: "Media library",
  redirects: "Redirects",
  notFound: "404 log",
  menus: "Menus",
  sections: "Homepage sections",
  widgets: "Footer & widgets",
  leads: "Leads inbox",
  subscribers: "Subscribers",
};
const states: Record<Collection, string[]> = {
  content: ["draft", "published", "scheduled", "archived"],
  categories: ["draft", "active", "published", "archived"],
  tags: ["draft", "active", "published", "archived"],
  authors: ["draft", "active", "archived"],
  media: ["draft", "active", "published", "archived"],
  redirects: ["draft", "active", "archived"],
  notFound: ["new", "read", "archived"],
  menus: ["draft", "active", "published", "archived"],
  sections: ["draft", "active", "published", "archived"],
  widgets: ["draft", "active", "published", "archived"],
  leads: ["new", "read", "archived"],
  subscribers: ["pending", "subscribed", "unsubscribed", "archived"],
};
type MenuItem = { label: string; url: string; children?: MenuItem[] };
function defaultData(collection: Collection): Record<string, unknown> {
  return (
    {
      categories: { description: "" },
      tags: { description: "" },
      authors: {
        name: "",
        bio: "",
        credentials: "",
        url: "",
        sameAs: [],
        verified: false,
      },
      redirects: { source: "", target: "", statusCode: 301, enabled: false },
      menus: { location: "header", items: [] },
      sections: { position: 0, type: "editorial", body: "", enabled: false },
      widgets: { location: "footer", body: "", enabled: false },
      leads: { email: "", message: "", consent: false },
      subscribers: { email: "", consent: false, consentedAt: null },
      notFound: { path: "", count: 1, lastSeenAt: new Date().toISOString() },
      media: {},
      content: {},
    } as Record<Collection, Record<string, unknown>>
  )[collection];
}

function MenuItems({
  items,
  onChange,
  depth = 0,
}: {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  depth?: number;
}) {
  function update(index: number, value: Partial<MenuItem>) {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...value } : item)),
    );
  }
  return (
    <>
      {items.map((item, index) => (
        <div className="repeat-row" key={index}>
          <div className="grid-two">
            <Field label={`Menu label ${depth + 1}.${index + 1}`}>
              <Input
                required
                value={item.label}
                onChange={(e) => update(index, { label: e.target.value })}
              />
            </Field>
            <Field label={`Menu URL ${depth + 1}.${index + 1}`}>
              <Input
                required
                value={item.url}
                onChange={(e) => update(index, { url: e.target.value })}
              />
            </Field>
          </div>
          <div className="repeat-actions">
            <Button
              type="button"
              variant="secondary"
              disabled={index === 0}
              onClick={() => {
                const next = [...items];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                onChange(next);
              }}
            >
              Move up
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={index === items.length - 1}
              onClick={() => {
                const next = [...items];
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                onChange(next);
              }}
            >
              Move down
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Remove menu item {index + 1}
            </Button>
          </div>
          {depth < 2 && (
            <div className="section-rule">
              <MenuItems
                items={item.children || []}
                onChange={(children) => update(index, { children })}
                depth={depth + 1}
              />
            </div>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() => onChange([...items, { label: "", url: "" }])}
      >
        {depth ? "Add child item" : "Add menu item"}
      </Button>
    </>
  );
}

function RecordFields({
  collection,
  data,
  onChange,
  taxonomies,
}: {
  collection: Collection;
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  taxonomies: CmsRecord[];
}) {
  const text = (
    key: string,
    label: string,
    hint?: string,
    multiline = false,
  ) => (
    <Field label={label} hint={hint}>
      {multiline ? (
        <Textarea
          value={String(data[key] ?? "")}
          onChange={(e) => onChange(key, e.target.value)}
        />
      ) : (
        <Input
          value={String(data[key] ?? "")}
          onChange={(e) => onChange(key, e.target.value)}
        />
      )}
    </Field>
  );
  const check = (key: string, label: string) => (
    <label className="check">
      <input
        type="checkbox"
        checked={data[key] === true}
        onChange={(e) => onChange(key, e.target.checked)}
      />
      {label}
    </label>
  );
  if (collection === "categories" || collection === "tags")
    return (
      <>
        {text("description", "Description", undefined, true)}
        <Field label="Parent taxonomy">
          <Select
            value={String(data.parentId || "")}
            onChange={(e) => onChange("parentId", e.target.value || null)}
          >
            <option value="">No parent</option>
            {taxonomies.map((row) => (
              <option key={row.id} value={row.id}>
                {row.title}
              </option>
            ))}
          </Select>
        </Field>
      </>
    );
  if (collection === "authors")
    return (
      <>
        {text("name", "Author name")}
        <Field
          label="Author entity type"
          hint="Use Organization for an actual brand, not an invented staff identity."
        >
          <Select
            value={String(data.entityType || "Person")}
            onChange={(event) => onChange("entityType", event.target.value)}
          >
            <option value="Person">Person</option>
            <option value="Organization">Organization</option>
          </Select>
        </Field>
        {text(
          "bio",
          "Author biography",
          "Actual biography, not a generated identity.",
          true,
        )}
        {text("credentials", "Credentials", undefined, true)}
        {text("url", "Author profile URL")}
        <Field label="Confirmed social profiles" hint="One URL per line">
          <Textarea
            value={((data.sameAs as string[]) || []).join("\n")}
            onChange={(e) =>
              onChange("sameAs", e.target.value.split("\n").filter(Boolean))
            }
          />
        </Field>
        {check(
          "verified",
          "I have verified this author’s real identity and biography",
        )}
      </>
    );
  if (collection === "media")
    return (
      <>
        {text(
          "alt",
          "Alternative text",
          "Describe informative media. Leave empty only after explicitly marking decorative.",
        )}
        {check("decorative", "Decorative image (empty alternative text)")}
        {text("folder", "Media folder")}
        <p className="small wrap-anywhere">
          WebP:{" "}
          <a href={String(data.url)} target="_blank" rel="noreferrer">
            {String(data.url)}
          </a>
          <br />
          AVIF: {String(data.avifUrl || "Unavailable")}
          <br />
          {String(data.width)} × {String(data.height)} pixels
        </p>
      </>
    );
  if (collection === "redirects")
    return (
      <>
        <p className="notice">
          Phase 3 stores disabled redirect rules only. Live migration activation
          needs Phase 4 approval.
        </p>
        {text(
          "source",
          "Source path",
          "A same-site path, for example /old-page/.",
        )}
        {text(
          "target",
          "Target path",
          "Use the final same-site destination; chains and loops are rejected.",
        )}
        <Field label="Redirect status code">
          <Select
            value={String(data.statusCode || 301)}
            onChange={(e) => onChange("statusCode", Number(e.target.value))}
          >
            <option value="301">301 — permanent</option>
            <option value="302">302 — temporary</option>
          </Select>
        </Field>
      </>
    );
  if (collection === "menus")
    return (
      <>
        {text("location", "Menu location", "For example header or footer.")}
        <MenuItems
          items={(data.items as MenuItem[]) || []}
          onChange={(items) => onChange("items", items)}
        />
      </>
    );
  if (collection === "sections" || collection === "widgets")
    return (
      <>
        {collection === "sections" ? (
          <>
            <Field label="Section position">
              <Input
                type="number"
                min={0}
                value={Number(data.position || 0)}
                onChange={(e) => onChange("position", Number(e.target.value))}
              />
            </Field>
            {text("type", "Section type")}
          </>
        ) : (
          text("location", "Widget location")
        )}
        {text("body", "HTML body", "Server sanitizes unsafe markup.", true)}
        {check("enabled", "Enabled when public templates are activated")}
      </>
    );
  if (collection === "leads")
    return (
      <>
        <Field label="Lead email">
          <Input
            type="email"
            required
            value={String(data.email || "")}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </Field>
        {text("message", "Lead message", undefined, true)}
        {check("consent", "Consent actually received")}
      </>
    );
  if (collection === "subscribers")
    return (
      <>
        <Field label="Subscriber email">
          <Input
            type="email"
            required
            value={String(data.email || "")}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </Field>
        {check("consent", "Subscription consent actually received")}
        <Field
          label="Consent timestamp"
          hint="Enter the actual ISO timestamp, not an estimated date."
        >
          <Input
            value={String(data.consentedAt || "")}
            onChange={(e) => onChange("consentedAt", e.target.value || null)}
          />
        </Field>
      </>
    );
  if (collection === "notFound")
    return (
      <>
        {text("path", "Missing path")}
        <Field label="Occurrence count">
          <Input
            type="number"
            min={0}
            value={Number(data.count || 0)}
            onChange={(e) => onChange("count", Number(e.target.value))}
          />
        </Field>
        {text("lastSeenAt", "Last seen (ISO timestamp)")}
      </>
    );
  return null;
}

export function RecordList({ collection }: { collection: Collection }) {
  const user = useWorkspaceUser();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<CmsRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(
    Math.max(1, Math.floor(Number(searchParams.get("page")) || 1)),
  );
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(
    states[collection].includes(searchParams.get("status") || "")
      ? searchParams.get("status")!
      : "",
  );
  const [sort, setSort] = useState(
    ["title", "updatedAt", "createdAt"].includes(searchParams.get("sort") || "")
      ? searchParams.get("sort")!
      : "updatedAt",
  );
  const [direction, setDirection] = useState(
    searchParams.get("direction") === "asc" ? "asc" : "desc",
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<CmsRecord | null | undefined>();
  const [draft, setDraft] = useState<RecordInput>({
    title: "",
    slug: "",
    status: states[collection][0],
    data: defaultData(collection),
  });
  const [dirty, setDirty] = useState(false);
  const [csv, setCsv] = useState("");
  const [taxonomies, setTaxonomies] = useState<CmsRecord[]>([]);
  const [file, setFile] = useState<File>();
  const [alt, setAlt] = useState("");
  const [folder, setFolder] = useState("");
  const [decorative, setDecorative] = useState(false);
  useDirtyGuard(dirty);
  const listParams = new URLSearchParams();
  if (query) listParams.set("q", query);
  if (status) listParams.set("status", status);
  if (sort !== "updatedAt") listParams.set("sort", sort);
  if (direction !== "desc") listParams.set("direction", direction);
  if (page > 1) listParams.set("page", String(page));
  const listQuery = listParams.toString();
  const returnTo = `/admin/${collection}/${listQuery ? "?" + listQuery : ""}`;
  const contentHref = (id: string) =>
    `/admin/content/${id}/?returnTo=${encodeURIComponent(returnTo)}`;
  useEffect(() => {
    const edit = new URLSearchParams(window.location.search).get("edit");
    const params = new URLSearchParams(listQuery);
    if (edit) params.set("edit", edit);
    const suffix = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (suffix ? "?" + suffix : ""),
    );
  }, [listQuery]);
  const requestPage = useCallback(
    () =>
      api<{ data: CmsRecord[]; total: number }>(
        `/api/admin/records/${collection}?q=${encodeURIComponent(query)}&status=${status}&sort=${sort}&direction=${direction}&page=${page}`,
      ),
    [collection, query, status, sort, direction, page],
  );
  const load = useCallback(async () => {
    try {
      const result = await requestPage();
      setRows(result.data);
      setTotal(result.total);
      setSelected([]);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [requestPage]);
  useEffect(() => {
    let active = true;
    requestPage()
      .then((result) => {
        if (active) {
          setRows(result.data);
          setTotal(result.total);
          setSelected([]);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [requestPage]);
  useEffect(() => {
    if (collection === "categories" || collection === "tags")
      api<{ data: CmsRecord[] }>(
        `/api/admin/records/${collection}?pageSize=100`,
      )
        .then((r) => setTaxonomies(r.data))
        .catch(() => {});
  }, [collection]);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("edit");
    if (!id || collection === "content") return;
    let active = true;
    api<{ data: CmsRecord }>(
      `/api/admin/records/${collection}/${encodeURIComponent(id)}`,
    )
      .then(({ data: row }) => {
        if (active) {
          setEditing(row);
          setDraft({
            title: row.title,
            slug: row.slug,
            status: row.status,
            data: row.data,
            version: row.version,
          });
          setDirty(false);
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [collection]);
  function edit(row: CmsRecord | null) {
    if (dirty && !window.confirm("Discard unsaved record changes?")) return;
    setEditing(row);
    setDraft(
      row
        ? {
            title: row.title,
            slug: row.slug,
            status: row.status,
            data: row.data,
            version: row.version,
          }
        : {
            title: "",
            slug: "",
            status: states[collection][0],
            data: defaultData(collection),
          },
    );
    setDirty(false);
    setError("");
    setSuccess("");
  }
  function change(key: string, value: unknown) {
    setDraft((old) => ({ ...old, data: { ...old.data, [key]: value } }));
    setDirty(true);
  }
  async function bulk(action: string) {
    if (
      !window.confirm(
        `${action === "publish" ? "Publish" : "Archive"} ${selected.length} selected records?`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await mutation("/api/admin/bulk", "POST", {
        collection,
        ids: selected,
        action,
      });
      setSuccess(`${selected.length} records processed.`);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title={names[collection]}
        description={
          collection === "content"
            ? "Posts and pages, editorial status and SEO fields."
            : collection === "notFound"
              ? "Actual missing-page requests will appear when public routing is activated."
              : `Manage ${names[collection].toLowerCase()} in the private workspace.`
        }
        actions={
          collection === "content" ? (
            <Link className="button" href={contentHref("new")}>
              Create content
            </Link>
          ) : collection !== "media" && collection !== "notFound" ? (
            <Button onClick={() => edit(null)}>Create record</Button>
          ) : undefined
        }
      />
      <Feedback error={error} success={success} />
      {collection === "media" && (
        <Panel title="Upload image">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!file) return;
              const formElement = e.currentTarget;
              setBusy(true);
              setError("");
              try {
                const form = new FormData();
                form.set("file", file);
                form.set("alt", decorative ? "" : alt);
                form.set("folder", folder);
                form.set("decorative", String(decorative));
                await api("/api/admin/media", { method: "POST", body: form });
                setSuccess("Image uploaded and optimized to WebP and AVIF.");
                setFile(undefined);
                setAlt("");
                setDecorative(false);
                formElement.reset();
                await load();
              } catch (cause) {
                setError(errorMessage(cause));
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="grid-two">
              <Field
                label="Image file"
                hint="JPEG, PNG, WebP or AVIF; up to 10 MB."
              >
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  required
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
              </Field>
              <Field label="Upload alternative text">
                <Input
                  required={!decorative}
                  disabled={decorative}
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                />
              </Field>
              <Field label="Upload folder">
                <Input
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                />
              </Field>
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={decorative}
                onChange={(e) => setDecorative(e.target.checked)}
              />
              Decorative upload (empty alternative text)
            </label>
            <Button disabled={busy}>
              {busy ? "Uploading…" : "Upload image"}
            </Button>
          </form>
        </Panel>
      )}
      {collection === "redirects" && (
        <Panel title="Import redirects CSV">
          <p className="small">
            Headers: source,target,statusCode. Rules remain disabled. All rows
            validate before any import.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await mutation("/api/admin/import/redirects", "POST", { csv });
                setCsv("");
                setSuccess(
                  "Redirect configuration imported. No public rules activated.",
                );
                await load();
              } catch (cause) {
                setError(errorMessage(cause));
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Redirect CSV">
              <Textarea
                required
                className="code-input"
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                placeholder={
                  "source,target,statusCode\n/old-page/,/new-page/,301"
                }
              />
            </Field>
            <Field label="Choose CSV file">
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const chosen = e.target.files?.[0];
                  if (chosen) {
                    if (chosen.size > 1000000) {
                      setError("CSV is limited to 1 MB.");
                      return;
                    }
                    setCsv(await chosen.text());
                  }
                }}
              />
            </Field>
            <Button disabled={busy}>Import CSV</Button>
          </form>
        </Panel>
      )}
      {editing !== undefined && (
        <Panel title={editing ? "Edit record" : "Create record"}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await mutation(
                  editing
                    ? `/api/admin/records/${collection}/${editing.id}`
                    : `/api/admin/records/${collection}`,
                  editing ? "PATCH" : "POST",
                  draft,
                );
                setDirty(false);
                setEditing(undefined);
                setSuccess("Record saved.");
                await load();
              } catch (cause) {
                setError(errorMessage(cause));
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="grid-three">
              <Field label="Record title">
                <Input
                  required
                  value={draft.title}
                  onChange={(e) => {
                    setDraft({ ...draft, title: e.target.value });
                    setDirty(true);
                  }}
                />
              </Field>
              <Field
                label="Record slug"
                hint="Leave empty to generate from the title."
              >
                <Input
                  value={draft.slug}
                  onChange={(e) => {
                    setDraft({ ...draft, slug: e.target.value });
                    setDirty(true);
                  }}
                />
              </Field>
              <Field label="Record status">
                <Select
                  value={draft.status}
                  onChange={(e) => {
                    setDraft({ ...draft, status: e.target.value });
                    setDirty(true);
                  }}
                >
                  {states[collection].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <RecordFields
              collection={collection}
              data={draft.data}
              onChange={change}
              taxonomies={taxonomies.filter((row) => row.id !== editing?.id)}
            />
            <div className="actions">
              <Button disabled={busy}>
                {busy ? "Saving…" : "Save record"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (!dirty || window.confirm("Discard unsaved changes?")) {
                    setEditing(undefined);
                    setDirty(false);
                  }
                }}
              >
                Cancel
              </Button>
              <span className="status-line">
                {dirty ? "Unsaved changes" : "Loaded record"}
              </span>
            </div>
          </form>
        </Panel>
      )}
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(q);
          setPage(1);
        }}
      >
        <Field label="Search records">
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Field>
        <Field label="Status filter">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {states[collection].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Sort records">
          <Select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="updatedAt">Last updated</option>
            <option value="title">Title</option>
            <option value="createdAt">Created</option>
          </Select>
        </Field>
        <Field label="Sort direction">
          <Select
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value);
              setPage(1);
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
        </Field>
        <Button>Search</Button>
      </form>
      {selected.length > 0 && (
        <div className="bulk-actions">
          <span>{selected.length} selected on this page</span>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => bulk("archive")}
          >
            Archive selected
          </Button>
          {collection === "content" &&
            (user?.role === "editor" || user?.role === "admin") && (
              <Button disabled={busy} onClick={() => bulk("publish")}>
                Publish selected
              </Button>
            )}
          <Button variant="ghost" onClick={() => setSelected([])}>
            Clear selection
          </Button>
        </div>
      )}
      {loading ? (
        <Loading />
      ) : rows.length ? (
        <div
          className="table-container record-table-region"
          tabIndex={0}
          role="region"
          aria-label={`${names[collection]} records table — scroll horizontally to view all columns`}
        >
          <table className="record-table">
            <caption>
              {total} matching {names[collection].toLowerCase()}. On narrow
              screens, scroll horizontally to view all columns.
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    aria-label="Select all records on this page"
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? rows.map((row) => row.id) : [],
                      )
                    }
                  />
                </th>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Last updated</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.title}`}
                      checked={selected.includes(row.id)}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? [...selected, row.id]
                            : selected.filter((id) => id !== row.id),
                        )
                      }
                    />
                  </td>
                  <th scope="row" className="record-title">
                    {collection === "content" ? (
                      <a href={contentHref(row.id)}>{row.title}</a>
                    ) : (
                      row.title
                    )}
                    <p className="small">/{row.slug}/</p>
                    {collection === "media" && (
                      <p>
                        <a
                          href={String(row.data.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open image
                        </a>
                        <br />
                        {String(row.data.alt) || "Decorative image"}
                      </p>
                    )}
                    {collection === "redirects" && (
                      <p className="small wrap-anywhere">
                        {String(row.data.source)} → {String(row.data.target)} ·{" "}
                        {String(row.data.statusCode)} · Disabled
                      </p>
                    )}
                    {collection === "notFound" && (
                      <p className="small">
                        {String(row.data.path)} · {String(row.data.count)}{" "}
                        requests
                      </p>
                    )}
                  </th>
                  <td>
                    <Badge>{row.status}</Badge>
                  </td>
                  <td>{date(row.updatedAt)}</td>
                  <td>
                    <div className="actions">
                      {collection === "content" ? (
                        <a
                          className="button button-secondary"
                          href={contentHref(row.id)}
                        >
                          Edit
                        </a>
                      ) : (
                        <Button variant="secondary" onClick={() => edit(row)}>
                          Edit
                        </Button>
                      )}
                      {collection === "notFound" && (
                        <Button
                          variant="secondary"
                          disabled={busy}
                          onClick={async () => {
                            const target = window.prompt(
                              "Final destination path for this missing URL:",
                              "/",
                            );
                            if (!target) return;
                            setBusy(true);
                            try {
                              await mutation(
                                "/api/admin/records/redirects",
                                "POST",
                                {
                                  title: `Redirect ${String(row.data.path)}`,
                                  slug: `redirect-${row.id}`,
                                  status: "draft",
                                  data: {
                                    source: row.data.path,
                                    target,
                                    statusCode: 301,
                                    enabled: false,
                                  },
                                },
                              );
                              setSuccess(
                                "Disabled redirect created. Review it in Redirects.",
                              );
                            } catch (e) {
                              setError(errorMessage(e));
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          Create redirect
                        </Button>
                      )}
                      {collection === "content" && (
                        <Button
                          variant="ghost"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            try {
                              await mutation(
                                `/api/admin/records/${collection}/${row.id}/duplicate`,
                                "POST",
                              );
                              setSuccess("Record duplicated.");
                              await load();
                            } catch (e) {
                              setError(errorMessage(e));
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          Duplicate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>
          <p>No records match these criteria.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setQ("");
              setQuery("");
              setStatus("");
              setPage(1);
            }}
          >
            Reset filters
          </Button>
        </Empty>
      )}
      <div className="pagination">
        <p>
          Page {page} of {Math.max(1, Math.ceil(total / 20))} · {total} results
        </p>
        <div className="actions">
          <Button
            variant="secondary"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={page * 20 >= total || loading}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      {["leads", "subscribers"].includes(collection) && (
        <p>
          <a
            className="button button-secondary"
            href={apiPath(
              `/api/admin/export?format=csv&collection=${collection}`,
            )}
          >
            Export {names[collection].toLowerCase()} CSV
          </a>
        </p>
      )}
    </>
  );
}
