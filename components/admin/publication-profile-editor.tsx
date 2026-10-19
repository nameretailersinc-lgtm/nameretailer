"use client";

import { useEffect, useState } from "react";
import { publicationContentInput, type PublicationContent, type PublicationContentInput } from "@/lib/commerce/publication-content";
import type { publicationEditorialBrief } from "@/lib/commerce/publication-presentation";
import { api, mutation, errorMessage } from "./api";
import { Button, Field, Input, Textarea, Select, Feedback, Panel, Loading, useDirtyGuard } from "./primitives";

type Saved = { domain: string; version: number; publicationContent: PublicationContent | null; brief: ReturnType<typeof publicationEditorialBrief> };
const fields = [
  ["publisherName", "Publisher name", 160],
  ["description", "Publisher description", 3000],
  ["editorialGuidelines", "Editorial guidelines", 5000],
  ["audienceDetails", "Sourced audience details", 3000],
  ["contentRequirements", "Content requirements", 5000],
  ["priceIncludes", "Confirmed price inclusions", 2000],
  ["priceExcludes", "Confirmed price exclusions", 2000],
  ["secondaryNiches", "Secondary niches", 1000],
  ["contentCategories", "Documented content categories", 1500],
  ["acceptedTopics", "Confirmed accepted topics", 2000],
  ["restrictedTopics", "Confirmed restricted or prohibited topics", 2000],
  ["wordCountRequirements", "Confirmed article length requirements", 1000],
  ["imageRequirements", "Image requirements", 1500],
  ["editorialProcess", "Editorial review and publication process", 2500],
  ["linkPolicy", "Confirmed link attributes and placement policies", 2000],
  ["uniqueDifferentiators", "Source-backed differentiators", 2500],
  ["editorialNotes", "Public editorial notes", 2500],
  ["metricsSource", "Metric provider, channel, period and evidence", 1500],
] as const;

export function PublicationProfileEditor({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: () => void }) {
  const [record, setRecord] = useState<Saved>();
  const [draft, setDraft] = useState<PublicationContentInput>();
  const [reload, setReload] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useDirtyGuard(dirty);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    api<{ data: Saved }>(`/api/admin/products/${id}/profile`, { signal: controller.signal }).then(({ data }) => {
      if (!active) return;
      const input = publicationContentInput.parse({
        version: data.version,
        state: data.publicationContent?.domain === data.domain ? data.publicationContent.state : "draft",
        ...Object.fromEntries(fields.map(([key]) => [key, data.publicationContent?.[key] || ""])),
        sourceUrl: data.publicationContent?.sourceUrl || "",
        checkedAt: data.publicationContent?.checkedAt || "",
        metricsMeasuredAt: data.publicationContent?.metricsMeasuredAt || "",
        faqs: data.publicationContent?.faqs || [],
      });
      setRecord(data); setDraft(input); setError(""); setDirty(false);
    }).catch(cause => { if (active) setError(errorMessage(cause)); });
    return () => { active = false; controller.abort(); };
  }, [id, reload]);
  function change<K extends keyof PublicationContentInput>(key: K, value: PublicationContentInput[K]) {
    setDraft(old => old ? { ...old, [key]: value } : old);
    setDirty(true); setSuccess("");
  }
  function refresh() {
    if (dirty && !window.confirm("Discard unsaved profile changes and load the current version?")) return;
    setRecord(undefined); setDraft(undefined); setDirty(false); setError(""); setSuccess("");
    setReload(value => value + 1);
  }
  return (
    <Panel title="Publication profile content">
      <p className="notice">Add original, source-backed information for this exact listing. Leave unknown details empty. Drafts are private. Reviewed content is published on the detail page; it does not automatically change search indexing.</p>
      <Feedback error={error} success={success} />
      {!record && !error && <Loading label="Loading profile content…" />}
      {record && draft && <form onSubmit={async event => {
        event.preventDefault(); setError(""); setSuccess("");
        const parsed = publicationContentInput.safeParse(draft);
        if (!parsed.success) { setError(parsed.error.issues.map(issue => issue.message).join(" ")); return; }
        setBusy(true);
        try {
          const { data } = await mutation<{ data: Saved }>(`/api/admin/products/${id}/profile`, "PATCH", parsed.data);
          setRecord({ ...record, ...data }); setDraft({ ...parsed.data, version: data.version });
          setDirty(false); setSuccess(parsed.data.state === "reviewed" ? "Reviewed profile published." : "Profile draft saved. Draft content is private.");
          onSaved();
        } catch (cause) { setError(errorMessage(cause)); }
        finally { setBusy(false); }
      }}>
        <p className="wrap-anywhere"><strong>Listing:</strong> {record.domain}</p>
        <details><summary>Research brief and missing information</summary><p>{record.brief.knownFacts}</p><p>Editorial status: {record.brief.editorialStatus}</p><ul>{record.brief.missingInformation.map(item => <li key={item}>{item}</li>)}</ul><p>{record.brief.note}</p></details>
        {record.publicationContent && record.publicationContent.domain !== record.domain && <p className="notice">The listing URL changed. Recheck the retained content and evidence before marking it reviewed.</p>}
        <Field label="Profile review state"><Select value={draft.state} disabled={busy} onChange={event => change("state", event.target.value as PublicationContentInput["state"])}><option value="draft">Draft — private</option><option value="reviewed">Reviewed — publish sourced content</option></Select></Field>
        {fields.map(([key, label, maxLength]) => <Field key={key} label={label} hint="Plain text supported by the evidence below. Do not copy unsupported legacy marketing claims.">
          {key === "publisherName" ? <Input value={draft[key]} maxLength={maxLength} disabled={busy} onChange={event => change(key, event.target.value)} /> : <Textarea value={draft[key]} maxLength={maxLength} rows={4} disabled={busy} required={draft.state === "reviewed" && key === "description"} onChange={event => change(key, event.target.value)} />}
        </Field>)}
        <div className="grid-two">
          <Field label="Evidence URL" hint="Public HTTPS source supporting the reviewed information. Never put credentials or private documents here."><Input type="url" value={draft.sourceUrl} maxLength={2048} required={draft.state === "reviewed"} disabled={busy} onChange={event => change("sourceUrl", event.target.value)} /></Field>
          <Field label="Source checked on (UTC)" hint="Actual check date; never use a future or invented date."><Input type="date" value={draft.checkedAt} max={new Date().toISOString().slice(0, 10)} required={draft.state === "reviewed"} disabled={busy} onChange={event => change("checkedAt", event.target.value)} /></Field>
          <Field label="Metrics measured on (UTC)" hint="Only when documented by the metric source. This is separate from the profile source-check date."><Input type="date" value={draft.metricsMeasuredAt} max={new Date().toISOString().slice(0, 10)} disabled={busy} onChange={event => change("metricsMeasuredAt", event.target.value)} /></Field>
        </div>
        <h3>Source-backed publication questions</h3>
        <p className="small muted">Optional, up to six. Answers are public only after review. Do not add unsupported guarantees.</p>
        {draft.faqs.map((faq, index) => <div className="grid-two" key={index}>
          <Field label={`Profile question ${index + 1}`}><Input value={faq.question} required maxLength={200} disabled={busy} onChange={event => change("faqs", draft.faqs.map((item, i) => i === index ? { ...item, question: event.target.value } : item))} /></Field>
          <Field label={`Profile answer ${index + 1}`}><Textarea value={faq.answer} required maxLength={1800} disabled={busy} onChange={event => change("faqs", draft.faqs.map((item, i) => i === index ? { ...item, answer: event.target.value } : item))} /></Field>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => change("faqs", draft.faqs.filter((_, i) => i !== index))}>Remove question {index + 1}</Button>
        </div>)}
        <Button type="button" variant="secondary" disabled={busy || draft.faqs.length >= 6} onClick={() => change("faqs", [...draft.faqs, { question: "", answer: "" }])}>Add profile question</Button>
        <div className="actions"><Button disabled={busy}>{busy ? "Saving profile…" : "Save profile content"}</Button><span className="small">{dirty ? "Unsaved profile changes" : `Loaded version ${draft.version}`}</span></div>
      </form>}
      <div className="actions">
        <Button type="button" variant="secondary" disabled={busy} onClick={refresh}>Reload current profile</Button>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => { if (!dirty || window.confirm("Discard unsaved profile changes?")) onClose(); }}>Close profile editor</Button>
      </div>
    </Panel>
  );
}
