"use client";

import { useState, useRef, useEffect } from "react";
import {
  inspectSearchReadiness,
  type ReadinessReport,
} from "@/lib/tools/search-readiness";

export function SearchReadinessChecker() {
  const [html, setHtml] = useState("");
  const [mode, setMode] = useState("html");
  const [pageUrl, setPageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  function reset() {
    active.current?.abort();
    active.current = null;
    setBusy(false);
    setReports([]);
    setError("");
    setStatus("");
    setSource("");
  }
  const [reports, setReports] = useState<ReadinessReport[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const reportText = reports
    .map(
      (report) =>
        `${report.category}\n${report.checks.map((check) => `${check.passed ? "PASS" : "REVIEW"}: ${check.label}\n${check.detail}`).join("\n\n")}`,
    )
    .join("\n\n");
  return (
    <section
      className="reference-card tool-workspace"
      aria-label="AEO, GEO and SEO checker workspace"
    >
      <h2>Check your page’s search readiness</h2>
      <p>
        Enter a public page URL or paste its full HTML source, including the
        head and body. URL checks send the address to our server to fetch the
        page. Pasted HTML stays in your browser. Neither option executes the
        page’s scripts. URL checks inspect returned HTML, so content loaded by
        JavaScript may be missing.
      </p>
      <form
        className="tool-form"
        onSubmit={async (event) => {
          event.preventDefault();
          reset();
          let input = html;
          let fetchedUrl = "";
          if (mode === "url") {
            const controller = new AbortController();
            active.current = controller;
            setBusy(true);
            setStatus("Fetching page HTML…");
            const timeout = setTimeout(() => controller.abort(), 20000);
            try {
              const response = await fetch("/api/tools/readiness/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input: pageUrl }),
                signal: controller.signal,
              });
              const data = (await response.json()) as {
                html?: string;
                url?: string;
                error?: string;
              };
              if (!response.ok)
                throw new Error(data.error || "The page could not be fetched.");
              if (active.current !== controller) return;
              input = data.html || "";
              fetchedUrl = data.url || pageUrl;
            } catch (failure) {
              if (active.current === controller) {
                setError(
                  failure instanceof Error && failure.name !== "AbortError"
                    ? failure.message
                    : "The request timed out. Try again or paste the HTML.",
                );
                setStatus("");
              }
              return;
            } finally {
              clearTimeout(timeout);
              if (active.current === controller) {
                active.current = null;
                setBusy(false);
              }
            }
          }
          if (!input.trim() || !/<[a-z][\s\S]*>/i.test(input)) {
            setError("Paste page HTML, rather than a URL or plain text.");
            return;
          }
          if (input.length > 1_000_000) {
            setError("Use HTML smaller than 1,000,000 characters.");
            return;
          }
          // A template keeps pasted content inert, including resource elements.
          const template = document.createElement("template");
          template.innerHTML = input;
          const doc = document.implementation.createHTMLDocument("");
          doc.head.replaceChildren();
          doc.body.replaceChildren(template.content);
          setReports(inspectSearchReadiness(doc));
          setSource(fetchedUrl);
          setStatus("Three checklists are ready.");
        }}
      >
        <label htmlFor="readiness-mode">Check from</label>
        <select
          id="readiness-mode"
          value={mode}
          onChange={(event) => {
            reset();
            setMode(event.target.value);
          }}
        >
          <option value="html">Pasted HTML</option>
          <option value="url">Page URL</option>
        </select>
        {mode === "url" ? (
          <>
            <label htmlFor="readiness-url">Page URL</label>
            <input
              id="readiness-url"
              type="url"
              required
              value={pageUrl}
              maxLength={2048}
              placeholder="https://example.com/your-page/"
              onChange={(event) => {
                reset();
                setPageUrl(event.target.value);
              }}
            />
            <p>
              Public HTTP and HTTPS pages only, up to 1 MB. Pages that require
              login or block automated requests may need pasted HTML.
            </p>
          </>
        ) : (
          <>
            <label htmlFor="readiness-html">Page HTML</label>
            <textarea
              id="readiness-html"
              rows={12}
              value={html}
              maxLength={1_000_001}
              placeholder={
                '<html lang="en"><head><title>Your page title</title></head><body><h1>Your topic</h1></body></html>'
              }
              onChange={(event) => {
                reset();
                setHtml(event.target.value);
                setReports([]);
                setError("");
                setStatus("");
              }}
              required
            />
          </>
        )}
        <div className="tool-actions">
          <button
            className="button button-primary"
            type="submit"
            disabled={busy}
          >
            {busy ? "Checking page…" : "Run AEO, GEO and SEO check"}
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              reset();
              setPageUrl("");
              setHtml("");
              setReports([]);
              setError("");
              setStatus("");
            }}
          >
            Clear
          </button>
        </div>
      </form>
      {error && <p role="alert">{error}</p>}
      <p role="status">{status}</p>
      {source && <p>Checked URL: {source}</p>}
      {reports.length > 0 && (
        <>
          <p>
            Checklist scores count detected signals equally. They do not measure
            rankings, indexing, AI citations or the accuracy of your content.
            Rendered JavaScript, HTTP headers, crawl access and off-site
            reputation require separate checks.
          </p>
          {reports.map((report) => (
            <section className="reference-card" key={report.category}>
              <h3>{report.category}</h3>
              <p>
                <strong>
                  {report.checks.filter((check) => check.passed).length} /{" "}
                  {report.checks.length} checks passed
                </strong>
              </p>
              <ul>
                {report.checks.map((check) => (
                  <li key={check.label}>
                    <strong>
                      {check.passed ? "Pass" : "Review"}: {check.label}
                    </strong>
                    <p>{check.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              const url = URL.createObjectURL(
                new Blob(
                  [
                    (source ? `Checked URL: ${source}\n\n` : "") +
                      reportText +
                      "\n\nStructural HTML checklist only; not a ranking or AI citation prediction.",
                  ],
                  { type: "text/plain;charset=utf-8" },
                ),
              );
              const link = document.createElement("a");
              link.href = url;
              link.download = "aeo-geo-seo-report.txt";
              link.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Download report
          </button>
        </>
      )}
    </section>
  );
}
