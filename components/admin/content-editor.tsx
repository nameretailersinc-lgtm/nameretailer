"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import type { CmsRecord, RecordInput, Revision } from "@/lib/cms/types";
import { api, mutation, errorMessage } from "./api";
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
  Badge,
  date,
  useDirtyGuard,
} from "./primitives";
import { useWorkspaceUser } from "./admin-shell";

const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: "" }, title: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "iframe[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(
        {
          width: "560",
          height: "315",
          loading: "lazy",
          sandbox: "allow-scripts allow-same-origin allow-presentation",
          referrerpolicy: "strict-origin-when-cross-origin",
        },
        HTMLAttributes,
      ),
    ];
  },
});
const blank: RecordInput = {
  title: "",
  slug: "",
  status: "draft",
  data: {
    type: "page",
    body: "",
    excerpt: "",
    seoTitle: "",
    metaDescription: "",
    canonical: "",
    robotsIndex: true,
    robotsFollow: true,
    ogImage: "",
    focusKeyword: "",
    schemaType: "WebPage",
    faq: [],
    sources: [],
    categoryIds: [],
    tagIds: [],
    relatedIds: [],
    authorId: null,
    reviewerId: null,
    scheduledAt: null,
    publishedAt: null,
    lastReviewedAt: null,
  },
};
type FAQ = { question: string; answer: string };
type Source = { label: string; url: string };
function localDate(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  const d = new Date(value);
  if (!Number.isFinite(d.valueOf())) return "";
  return new Date(d.valueOf() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
function isoDate(value: string) {
  return value ? new Date(value).toISOString() : null;
}
function plaintext(html: unknown) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ContentEditor({ id }: { id?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const backUrl =
    returnTo && /^\/admin\/content\/(?:\?[^#]*)?$/.test(returnTo)
      ? returnTo
      : "/admin/content/";
  const [recordId, setRecordId] = useState(id);
  const [draft, setDraft] = useState<RecordInput>(blank);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [entities, setEntities] = useState<CmsRecord[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [html, setHtml] = useState("");
  const [showInsert, setShowInsert] = useState<
    "link" | "image" | "embed" | null
  >(null);
  const [insertUrl, setInsertUrl] = useState("");
  const [insertText, setInsertText] = useState("");
  const [insertDecorative, setInsertDecorative] = useState(false);
  const user = useWorkspaceUser();
  const canPublish = user?.role === "admin" || user?.role === "editor";
  const saveRef = useRef<() => void>(() => {});
  useDirtyGuard(dirty);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          HTMLAttributes: { target: null, rel: null, class: null },
        },
      }),
      TableKit,
      Image.configure({ allowBase64: false }),
      Placeholder.configure({
        placeholder: "Write the original page content…",
      }),
      Embed,
    ],
    immediatelyRender: false,
    content: "",
    editorProps: {
      attributes: {
        "aria-label": "Body (rich text)",
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor: current }) => {
      setDraft((old) => ({
        ...old,
        data: { ...old.data, body: current.getHTML() },
      }));
      setDirty(true);
      setSuccess("");
    },
  });
  useEffect(() => {
    let active = true;
    Promise.all(
      ["authors", "categories", "tags", "content", "media"].map((collection) =>
        api<{ data: CmsRecord[] }>(
          `/api/admin/records/${collection}?pageSize=100`,
        )
          .then((r) => r.data)
          .catch(() => []),
      ),
    ).then((groups) => {
      if (active) setEntities(groups.flat());
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!id || !editor) return;
    let active = true;
    api<{ data: CmsRecord }>(`/api/admin/records/content/${id}`)
      .then((result) => {
        if (!active) return;
        const row = result.data;
        setRecordId(row.id);
        setDraft({
          title: row.title,
          slug: row.slug,
          status: row.status,
          data: { ...blank.data, ...row.data },
          version: row.version,
        });
        editor.commands.setContent(String(row.data.body || ""), {
          emitUpdate: false,
        });
        setDirty(false);
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
  }, [id, editor]);
  function change(key: string, value: unknown) {
    setDraft((old) => ({ ...old, data: { ...old.data, [key]: value } }));
    setDirty(true);
    setSuccess("");
  }
  const save = useCallback(
    async (status: string) => {
      setBusy(true);
      setError("");
      setSuccess("");
      try {
        const body = editor?.getHTML() ?? String(draft.data.body || "");
        const result = await mutation<{ data: CmsRecord }>(
          recordId
            ? `/api/admin/records/content/${recordId}`
            : "/api/admin/records/content",
          recordId ? "PATCH" : "POST",
          { ...draft, status, data: { ...draft.data, body } },
        );
        const row = result.data;
        setRecordId(row.id);
        setDraft({
          title: row.title,
          slug: row.slug,
          status: row.status,
          data: { ...blank.data, ...row.data },
          version: row.version,
        });
        editor?.commands.setContent(String(row.data.body || ""), {
          emitUpdate: false,
        });
        setDirty(false);
        setSuccess(`Content saved as ${row.status}.`);
        if (!recordId)
          window.history.replaceState(
            null,
            "",
            `/admin/content/${row.id}/${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`,
          );
      } catch (cause) {
        setError(errorMessage(cause));
      } finally {
        setBusy(false);
      }
    },
    [draft, editor, recordId, returnTo],
  );
  useEffect(() => {
    saveRef.current = () => {
      if (!busy)
        void save(draft.status === "published" ? "published" : "draft");
    };
  }, [save, busy, draft.status]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  async function loadRevisions() {
    if (!recordId) return;
    try {
      const result = await api<{ data: Revision[] }>(
        `/api/admin/records/content/${recordId}/revisions`,
      );
      setRevisions(result.data);
      setShowRevisions(true);
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  function openInsert(kind: "link" | "image" | "embed") {
    setShowInsert(kind);
    setInsertUrl("");
    setInsertText("");
    setInsertDecorative(false);
  }
  const bodyText = plaintext(draft.data.body);
  const keyword = String(draft.data.focusKeyword || "")
    .trim()
    .toLowerCase();
  const checks = [
    {
      label: "SEO title provided",
      passed: !!String(draft.data.seoTitle || "").trim(),
    },
    {
      label: "Description provided",
      passed: !!String(draft.data.metaDescription || "").trim(),
    },
    {
      label: "At least 30 words",
      passed: bodyText.split(/\s+/).filter(Boolean).length >= 30,
    },
    {
      label: "Focus keyword in title",
      passed:
        !!keyword &&
        String(draft.data.seoTitle || draft.title)
          .toLowerCase()
          .includes(keyword),
    },
    {
      label: "Focus keyword in content",
      passed: !!keyword && bodyText.toLowerCase().includes(keyword),
    },
    {
      label: "Sources provided",
      passed: ((draft.data.sources as Source[]) || []).length > 0,
    },
  ];
  const faq = (draft.data.faq as FAQ[]) || [];
  const sources = (draft.data.sources as Source[]) || [];
  const text = (
    key: string,
    label: string,
    hint?: string,
    multiline = false,
  ) => (
    <Field label={label} hint={hint}>
      {multiline ? (
        <Textarea
          value={String(draft.data[key] || "")}
          onChange={(e) => change(key, e.target.value)}
        />
      ) : (
        <Input
          value={String(draft.data[key] || "")}
          onChange={(e) => change(key, e.target.value)}
        />
      )}
    </Field>
  );
  const checkboxIds = (
    collection: "categories" | "tags" | "content",
    key: string,
  ) => {
    const selected = (draft.data[key] as string[]) || [];
    return (
      <div className="checkbox-list">
        {entities
          .filter(
            (row) =>
              row.collection === collection &&
              row.id !== recordId &&
              row.status !== "archived",
          )
          .map((row) => (
            <label className="check" key={row.id}>
              <input
                type="checkbox"
                checked={selected.includes(row.id)}
                onChange={(e) =>
                  change(
                    key,
                    e.target.checked
                      ? [...selected, row.id]
                      : selected.filter((value) => value !== row.id),
                  )
                }
              />
              {row.title}
            </label>
          ))}
        {!entities.some((row) => row.collection === collection) && (
          <p className="small muted">
            No available records. Create actual records in the corresponding
            workspace list.
          </p>
        )}
      </div>
    );
  };
  return (
    <>
      <PageHeading
        title={recordId ? "Edit content" : "Create content"}
        description="Original content, clear authorship and separate draft/publish decisions."
        actions={
          <Link className="button button-secondary" href={backUrl}>
            Back to content
          </Link>
        }
      />
      <Feedback error={error} success={success} />
      {loading ? (
        <Loading label="Loading content…" />
      ) : (
        <>
          <div className="actions editor-save-bar">
            <Badge>{draft.status}</Badge>
            <Button disabled={busy} onClick={() => save("draft")}>
              {busy ? "Saving…" : "Save draft"}
            </Button>
            {draft.status === "published" && canPublish && (
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => save("published")}
              >
                Save changes
              </Button>
            )}
            {canPublish && (
              <>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Publish this content after server editorial checks?",
                      )
                    )
                      void save("published");
                  }}
                >
                  Publish
                </Button>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => save("scheduled")}
                >
                  Schedule
                </Button>
              </>
            )}
            {recordId && (
              <>
                <Button variant="ghost" disabled={busy} onClick={loadRevisions}>
                  Revisions
                </Button>
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={async () => {
                    if (
                      dirty &&
                      !window.confirm(
                        "Duplicate saved content? Unsaved changes will not be copied.",
                      )
                    )
                      return;
                    try {
                      const result = await mutation<{ data: CmsRecord }>(
                        `/api/admin/records/content/${recordId}/duplicate`,
                        "POST",
                      );
                      router.push(`/admin/content/${result.data.id}/`);
                    } catch (e) {
                      setError(errorMessage(e));
                    }
                  }}
                >
                  Duplicate content
                </Button>
                <a
                  className="button button-secondary"
                  href={`/admin/preview/${recordId}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview saved content
                </a>
              </>
            )}
            <span className="status-line" role="status">
              {dirty
                ? "Unsaved changes — Ctrl/Cmd+S to save"
                : recordId
                  ? "Saved version " + draft.version
                  : "New unsaved content"}
            </span>
          </div>
          {!canPublish && (
            <p className="small muted">
              Author accounts save their own drafts. An editor or administrator
              publishes and schedules content.
            </p>
          )}
          <div className="editor-layout">
            <div>
              <Panel title="Editorial content">
                <Field label="Content title">
                  <Input
                    required
                    value={draft.title}
                    onChange={(e) => {
                      setDraft({ ...draft, title: e.target.value });
                      setDirty(true);
                    }}
                  />
                </Field>
                <div className="grid-two">
                  <Field
                    label="Slug"
                    hint="Lowercase path; existing migration slugs should be preserved."
                  >
                    <Input
                      value={draft.slug}
                      onChange={(e) => {
                        setDraft({ ...draft, slug: e.target.value });
                        setDirty(true);
                      }}
                    />
                  </Field>
                  <Field label="Content type">
                    <Select
                      value={String(draft.data.type)}
                      onChange={(e) => change("type", e.target.value)}
                    >
                      <option value="page">Page</option>
                      <option value="post">Post</option>
                    </Select>
                  </Field>
                </div>
                <p className="field-label" id="editor-label">
                  Body
                </p>
                <div
                  className="editor-toolbar"
                  role="group"
                  aria-label="Rich text formatting"
                >
                  <Button
                    variant="secondary"
                    type="button"
                    aria-pressed={editor?.isActive("bold") || false}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  >
                    Bold
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    aria-pressed={editor?.isActive("italic") || false}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  >
                    Italic
                  </Button>
                  {([2, 3, 4] as const).map((level) => (
                    <Button
                      variant="secondary"
                      type="button"
                      key={level}
                      aria-pressed={
                        editor?.isActive("heading", { level }) || false
                      }
                      onClick={() =>
                        editor?.chain().focus().toggleHeading({ level }).run()
                      }
                    >
                      Heading {level}
                    </Button>
                  ))}
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => editor?.chain().focus().setParagraph().run()}
                  >
                    Paragraph
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                  >
                    Bullet list
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                  >
                    Numbered list
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() =>
                      editor?.chain().focus().toggleBlockquote().run()
                    }
                  >
                    Quote
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() =>
                      editor
                        ?.chain()
                        .focus()
                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                        .run()
                    }
                  >
                    Insert table
                  </Button>
                  {editor?.isActive("table") && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          editor.chain().focus().addRowAfter().run()
                        }
                      >
                        Add row
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          editor.chain().focus().addColumnAfter().run()
                        }
                      >
                        Add column
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          editor.chain().focus().deleteTable().run()
                        }
                      >
                        Delete table
                      </Button>
                    </>
                  )}
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => openInsert("link")}
                  >
                    Insert link
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => openInsert("image")}
                  >
                    Insert image
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => openInsert("embed")}
                  >
                    Insert embed
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => editor?.chain().focus().undo().run()}
                  >
                    Undo
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => editor?.chain().focus().redo().run()}
                  >
                    Redo
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setShowHtml(!showHtml);
                      setHtml(editor?.getHTML() || "");
                    }}
                  >
                    Edit HTML
                  </Button>
                </div>
                <EditorContent editor={editor} />
                {showHtml && (
                  <div className="section-rule">
                    <Field
                      label="HTML source"
                      hint="Only the sanitized server-confirmed version is persisted."
                    >
                      <Textarea
                        className="code-input"
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                      />
                    </Field>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        editor?.commands.setContent(html);
                        setShowHtml(false);
                      }}
                    >
                      Apply HTML to editor
                    </Button>
                  </div>
                )}
                {showInsert && (
                  <form
                    className="repeat-row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      try {
                        if (
                          !insertUrl ||
                          (!insertUrl.startsWith("/") &&
                            !/^https?:\/\//i.test(insertUrl))
                        )
                          throw new Error(
                            "Use an HTTP(S) URL or absolute local path.",
                          );
                        if (showInsert === "link")
                          editor
                            ?.chain()
                            .focus()
                            .extendMarkRange("link")
                            .setLink({ href: insertUrl })
                            .run();
                        if (showInsert === "image") {
                          if (!insertDecorative && !insertText.trim())
                            throw new Error(
                              "Provide alternative text or explicitly mark decorative.",
                            );
                          editor
                            ?.chain()
                            .focus()
                            .setImage({
                              src: insertUrl,
                              alt: insertDecorative ? "" : insertText,
                            })
                            .run();
                        }
                        if (showInsert === "embed") {
                          const url = new URL(insertUrl);
                          if (
                            url.protocol !== "https:" ||
                            !(
                              (url.hostname === "www.youtube-nocookie.com" &&
                                /^\/embed\/[A-Za-z0-9_-]+$/.test(
                                  url.pathname,
                                )) ||
                              (url.hostname === "player.vimeo.com" &&
                                /^\/video\/\d+$/.test(url.pathname))
                            )
                          )
                            throw new Error(
                              "Only YouTube no-cookie /embed/ or Vimeo /video/ HTTPS embeds are allowed.",
                            );
                          if (!insertText.trim())
                            throw new Error(
                              "Provide an accessible embed title.",
                            );
                          editor
                            ?.chain()
                            .focus()
                            .insertContent({
                              type: "embed",
                              attrs: { src: insertUrl, title: insertText },
                            })
                            .run();
                        }
                        setShowInsert(null);
                        setError("");
                      } catch (cause) {
                        setError(errorMessage(cause));
                      }
                    }}
                  >
                    <h3>Insert {showInsert}</h3>
                    <Field label="Insert URL">
                      <Input
                        required
                        value={insertUrl}
                        onChange={(e) => setInsertUrl(e.target.value)}
                      />
                    </Field>
                    {showInsert === "image" && (
                      <Field label="Choose library image">
                        <Select
                          value=""
                          onChange={(e) => {
                            const row = entities.find(
                              (item) =>
                                item.id === e.target.value &&
                                item.collection === "media",
                            );
                            if (row) {
                              setInsertUrl(String(row.data.url));
                              setInsertText(String(row.data.alt || ""));
                              setInsertDecorative(row.data.decorative === true);
                            }
                          }}
                        >
                          <option value="">Select uploaded image</option>
                          {entities
                            .filter(
                              (row) =>
                                row.collection === "media" &&
                                row.status !== "archived",
                            )
                            .map((row) => (
                              <option key={row.id} value={row.id}>
                                {row.title}
                              </option>
                            ))}
                        </Select>
                      </Field>
                    )}
                    {showInsert !== "link" && (
                      <Field
                        label={
                          showInsert === "image"
                            ? "Image alternative text"
                            : "Embed accessible title"
                        }
                      >
                        <Input
                          required={!insertDecorative}
                          disabled={insertDecorative}
                          value={insertText}
                          onChange={(e) => setInsertText(e.target.value)}
                        />
                      </Field>
                    )}
                    {showInsert === "image" && (
                      <label className="check">
                        <input
                          type="checkbox"
                          checked={insertDecorative}
                          onChange={(e) =>
                            setInsertDecorative(e.target.checked)
                          }
                        />
                        Decorative body image
                      </label>
                    )}
                    <div className="actions">
                      <Button>Insert {showInsert}</Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowInsert(null)}
                      >
                        Cancel insertion
                      </Button>
                    </div>
                  </form>
                )}
                <p className="small muted">
                  {bodyText.split(/\s+/).filter(Boolean).length} words. Headings
                  start at H2; the page title supplies H1.
                </p>
                {text("excerpt", "Excerpt", undefined, true)}
              </Panel>
              <Panel title="FAQ builder">
                <p className="small muted">
                  Visible question-and-answer blocks can support structured data
                  in public templates. No rich-result or ranking guarantee.
                </p>
                {faq.map((item, index) => (
                  <div className="repeat-row" key={index}>
                    <Field label={`FAQ question ${index + 1}`}>
                      <Input
                        value={item.question}
                        onChange={(e) =>
                          change(
                            "faq",
                            faq.map((row, i) =>
                              i === index
                                ? { ...row, question: e.target.value }
                                : row,
                            ),
                          )
                        }
                      />
                    </Field>
                    <Field label={`FAQ answer ${index + 1}`}>
                      <Textarea
                        value={item.answer}
                        onChange={(e) =>
                          change(
                            "faq",
                            faq.map((row, i) =>
                              i === index
                                ? { ...row, answer: e.target.value }
                                : row,
                            ),
                          )
                        }
                      />
                    </Field>
                    <Button
                      variant="danger"
                      onClick={() =>
                        change(
                          "faq",
                          faq.filter((_, i) => i !== index),
                        )
                      }
                    >
                      Remove FAQ {index + 1}
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() =>
                    change("faq", [...faq, { question: "", answer: "" }])
                  }
                >
                  Add FAQ
                </Button>
              </Panel>
              <Panel title="Sources & citations">
                {sources.map((item, index) => (
                  <div className="repeat-row" key={index}>
                    <Field label={`Source label ${index + 1}`}>
                      <Input
                        value={item.label}
                        onChange={(e) =>
                          change(
                            "sources",
                            sources.map((row, i) =>
                              i === index
                                ? { ...row, label: e.target.value }
                                : row,
                            ),
                          )
                        }
                      />
                    </Field>
                    <Field label={`Source URL ${index + 1}`}>
                      <Input
                        type="url"
                        value={item.url}
                        onChange={(e) =>
                          change(
                            "sources",
                            sources.map((row, i) =>
                              i === index
                                ? { ...row, url: e.target.value }
                                : row,
                            ),
                          )
                        }
                      />
                    </Field>
                    <Button
                      variant="danger"
                      onClick={() =>
                        change(
                          "sources",
                          sources.filter((_, i) => i !== index),
                        )
                      }
                    >
                      Remove source {index + 1}
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() =>
                    change("sources", [...sources, { label: "", url: "" }])
                  }
                >
                  Add source
                </Button>
              </Panel>
              <Panel title="Related content & internal links">
                {checkboxIds("content", "relatedIds")}
                <p className="small muted">
                  Select actual related content; topic relevance is an editorial
                  decision. Links only become public with the approved
                  templates.
                </p>
                <ul className="list-plain">
                  {entities
                    .filter(
                      (row) =>
                        row.collection === "content" &&
                        row.id !== recordId &&
                        row.status === "published",
                    )
                    .slice(0, 8)
                    .map((row) => (
                      <li key={row.id}>
                        <strong>{row.title}</strong>
                        <p className="small">
                          Suggested internal path: /{row.slug}/
                        </p>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            editor
                              ?.chain()
                              .focus()
                              .insertContent({
                                type: "paragraph",
                                content: [
                                  {
                                    type: "text",
                                    text: row.title,
                                    marks: [
                                      {
                                        type: "link",
                                        attrs: { href: `/${row.slug}/` },
                                      },
                                    ],
                                  },
                                ],
                              })
                              .run()
                          }
                        >
                          Insert internal link
                        </Button>
                      </li>
                    ))}
                </ul>
              </Panel>
              {showRevisions && (
                <Panel title="Revision history">
                  {revisions.length ? (
                    <ul className="list-plain">
                      {revisions.map((row) => (
                        <li key={row.id}>
                          <strong>Version {row.version}</strong> ·{" "}
                          {date(row.createdAt)}
                          <p className="small">{row.snapshot.title}</p>
                          <Button
                            variant="secondary"
                            disabled={busy}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  "Restore this saved revision? Unsaved changes will be replaced.",
                                )
                              )
                                return;
                              setBusy(true);
                              try {
                                const result = await mutation<{
                                  data: CmsRecord;
                                }>(
                                  `/api/admin/records/content/${recordId}/restore`,
                                  "POST",
                                  {
                                    revisionId: row.id,
                                    version: draft.version,
                                  },
                                );
                                const restored = result.data;
                                setDraft({
                                  title: restored.title,
                                  slug: restored.slug,
                                  status: restored.status,
                                  data: { ...blank.data, ...restored.data },
                                  version: restored.version,
                                });
                                editor?.commands.setContent(
                                  String(restored.data.body || ""),
                                  { emitUpdate: false },
                                );
                                setDirty(false);
                                setSuccess(
                                  "Revision restored as a new saved version.",
                                );
                                await loadRevisions();
                              } catch (e) {
                                setError(errorMessage(e));
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            Restore version {row.version}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No earlier revisions.</p>
                  )}
                </Panel>
              )}
            </div>
            <aside aria-label="Content settings">
              <Panel title="Publication & attribution">
                <Field label="Author">
                  <Select
                    value={String(draft.data.authorId || "")}
                    onChange={(e) => change("authorId", e.target.value || null)}
                  >
                    <option value="">No author selected</option>
                    {entities
                      .filter((row) => row.collection === "authors")
                      .map((row) => (
                        <option value={row.id} key={row.id}>
                          {row.title}
                          {row.data.verified === true && row.status === "active"
                            ? " — verified active"
                            : " — unverified/inactive"}
                        </option>
                      ))}
                  </Select>
                </Field>
                <Field label="Reviewer (optional)">
                  <Select
                    value={String(draft.data.reviewerId || "")}
                    onChange={(event) =>
                      change("reviewerId", event.target.value || null)
                    }
                  >
                    <option value="">No reviewer selected</option>
                    {entities
                      .filter(
                        (row) =>
                          row.collection === "authors" &&
                          row.status === "active" &&
                          row.data.verified === true,
                      )
                      .map((row) => (
                        <option value={row.id} key={row.id}>
                          {row.title}
                        </option>
                      ))}
                  </Select>
                </Field>
                <p className="small muted">
                  Posts require a verified active real author before publishing.
                  Login users are not automatically public authors.
                </p>
                <Field
                  label="Scheduled publication"
                  hint={`Your browser timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}. Server stores UTC.`}
                >
                  <Input
                    type="datetime-local"
                    value={localDate(draft.data.scheduledAt)}
                    onChange={(e) =>
                      change("scheduledAt", isoDate(e.target.value))
                    }
                  />
                </Field>
                <Field label="Published at">
                  <Input
                    type="datetime-local"
                    value={localDate(draft.data.publishedAt)}
                    onChange={(e) =>
                      change("publishedAt", isoDate(e.target.value))
                    }
                  />
                </Field>
                <Field label="Last reviewed at">
                  <Input
                    type="datetime-local"
                    value={localDate(draft.data.lastReviewedAt)}
                    onChange={(e) =>
                      change("lastReviewedAt", isoDate(e.target.value))
                    }
                  />
                </Field>
                <h3>Categories</h3>
                {checkboxIds("categories", "categoryIds")}
                <h3 className="section-rule">Tags</h3>
                {checkboxIds("tags", "tagIds")}
              </Panel>
              <Panel title="SEO & search presentation">
                {text(
                  "seoTitle",
                  "SEO title",
                  `${String(draft.data.seoTitle || "").length} characters — guidance, not a fixed Google limit.`,
                )}
                {text(
                  "metaDescription",
                  "Meta description",
                  `${String(draft.data.metaDescription || "").length} characters — guidance, not a fixed Google limit.`,
                  true,
                )}
                <div className="serp-preview">
                  <small>Approximate search preview</small>
                  <strong>
                    {String(
                      draft.data.seoTitle || draft.title || "Your page title",
                    )}
                  </strong>
                  <p>https://nameretailer.com/{draft.slug}/</p>
                  <p>
                    {String(
                      draft.data.metaDescription ||
                        "Your descriptive summary will appear here. Search engines may rewrite it.",
                    )}
                  </p>
                </div>
                <div className="section-rule">
                  {text(
                    "canonical",
                    "Canonical URL",
                    "Use the canonical nameretailer.com origin without query or fragment. Leave empty for the page URL.",
                  )}
                  {(["robotsIndex", "robotsFollow"] as const).map((key) => (
                    <label className="check" key={key}>
                      <input
                        type="checkbox"
                        checked={draft.data[key] !== false}
                        onChange={(e) => change(key, e.target.checked)}
                      />
                      {key === "robotsIndex"
                        ? "Allow search indexing"
                        : "Allow link following"}
                    </label>
                  ))}
                  {text("ogImage", "Open Graph image URL")}
                  {text("focusKeyword", "Focus keyword")}
                  <Field label="Schema type">
                    <Select
                      value={String(draft.data.schemaType || "WebPage")}
                      onChange={(e) => change("schemaType", e.target.value)}
                    >
                      {[
                        "WebPage",
                        "Article",
                        "BlogPosting",
                        "FAQPage",
                        "HowTo",
                        "ItemList",
                        "Service",
                      ].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </Select>
                  </Field>
                  <p className="small muted">
                    Select only a type the visible content supports. Some types
                    have no current Google rich result.
                  </p>
                  <h3>
                    Editorial checks:{" "}
                    {checks.filter((check) => check.passed).length}/
                    {checks.length}
                  </h3>
                  <ul className="list-plain">
                    {checks.map((check) => (
                      <li key={check.label}>
                        {check.passed ? "✓ Passed" : "○ Needs review"} —{" "}
                        {check.label}
                      </li>
                    ))}
                  </ul>
                  <p className="small muted">
                    This checklist is not a search ranking score.
                  </p>
                </div>
              </Panel>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
