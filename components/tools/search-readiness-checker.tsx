"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  Globe2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
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
  const [issuesOnly, setIssuesOnly] = useState(false);
  const checks = reports.flatMap((report) => report.checks);
  const passed = checks.filter((check) => check.passed).length;
  const score = checks.length ? Math.round((passed / checks.length) * 100) : 0;
  const reportText = reports
    .map(
      (report) =>
        `${report.category}\n${report.checks.map((check) => `${check.passed ? "PASS" : "REVIEW"}: ${check.label}\n${check.detail}`).join("\n\n")}`,
    )
    .join("\n\n");
  return (
    <section
      className="reference-card tool-workspace readiness-workspace"
      aria-label="AEO, GEO and SEO checker workspace"
    >
      <div className="readiness-intro">
        <span className="readiness-kicker">
          <Sparkles size={16} aria-hidden="true" /> One page. Three
          perspectives.
        </span>
        <h2>Check your page’s search readiness</h2>
        <p className="readiness-subtitle">
          Turn your page into a practical improvement plan.
        </p>
      </div>
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
        <div className="readiness-assurance">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>
            No account needed · No scripts executed · 14 transparent checks
          </span>
        </div>
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
            {busy ? (
              <>
                <span className="readiness-spinner" aria-hidden="true" />{" "}
                Checking page…
              </>
            ) : (
              <>
                Run AEO, GEO and SEO check{" "}
                <ArrowUpRight size={18} aria-hidden="true" />
              </>
            )}
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
          <div className="readiness-summary">
            <div
              className="readiness-score"
              aria-label={`${score} percent of checklist signals passed`}
            >
              <strong>
                {score}
                <small>%</small>
              </strong>
              <span>Checklist score</span>
            </div>
            <div>
              <span className="readiness-kicker">Your page report</span>
              <h3>
                {score >= 85
                  ? "A strong structural foundation"
                  : score >= 50
                    ? "Good foundations. Room to improve."
                    : "Your next improvements start here."}
              </h3>
              <p>
                {passed} signals passed · {checks.length - passed} need review.
                Start with indexing and page metadata, then work through answer
                clarity and attribution.
              </p>
            </div>
          </div>
          <div className="readiness-category-grid">
            {reports.map((report) => {
              const count = report.checks.filter(
                (check) => check.passed,
              ).length;
              return (
                <a
                  href={`#readiness-${report.category.slice(0, 3).toLowerCase()}`}
                  className="readiness-category"
                  key={report.category}
                >
                  <span>
                    {report.category.split(" · ")[0]}{" "}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </span>
                  <strong>
                    {Math.round((count / report.checks.length) * 100)}
                    <small>%</small>
                  </strong>
                  <span>
                    {count} of {report.checks.length} signals passed
                  </span>
                  <progress
                    value={count}
                    max={report.checks.length}
                    aria-label={`${report.category} signals passed`}
                  />
                </a>
              );
            })}
          </div>
          <label className="readiness-filter">
            <input
              type="checkbox"
              checked={issuesOnly}
              onChange={(event) => setIssuesOnly(event.target.checked)}
            />{" "}
            Show only checks that need review
          </label>
          <p>
            Checklist scores count detected signals equally. They do not measure
            rankings, indexing, AI citations or the accuracy of your content.
            Rendered JavaScript, HTTP headers, crawl access and off-site
            reputation require separate checks.
          </p>
          {reports.map((report) => (
            <section
              className="readiness-report"
              id={`readiness-${report.category.slice(0, 3).toLowerCase()}`}
              key={report.category}
            >
              <h3>{report.category}</h3>
              <p>
                <strong>
                  {report.checks.filter((check) => check.passed).length} /{" "}
                  {report.checks.length} checks passed
                </strong>
              </p>
              {issuesOnly && report.checks.every((check) => check.passed) && (
                <p className="readiness-all-clear">
                  <CheckCircle2 size={18} aria-hidden="true" /> All signals
                  passed in this category.
                </p>
              )}
              <ul className="readiness-checks">
                {report.checks
                  .filter((check) => !issuesOnly || !check.passed)
                  .map((check) => (
                    <li
                      className={
                        check.passed ? "readiness-pass" : "readiness-review"
                      }
                      key={check.label}
                    >
                      {check.passed ? (
                        <CheckCircle2 size={21} aria-hidden="true" />
                      ) : (
                        <TriangleAlert size={21} aria-hidden="true" />
                      )}
                      <div>
                        <strong>
                          {check.passed ? "Pass" : "Review"}: {check.label}
                        </strong>
                        <p>{check.detail}</p>
                      </div>
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
            <Download size={17} aria-hidden="true" /> Download report
          </button>
        </>
      )}
      {!reports.length && !busy && (
        <div className="readiness-empty">
          <Globe2 size={30} aria-hidden="true" />
          <h3>A useful audit starts with your page.</h3>
          <p>
            Add a URL or page HTML above. Get separate search, answer and
            generative search checklists, plus a report you can keep.
          </p>
        </div>
      )}
    </section>
  );
}
