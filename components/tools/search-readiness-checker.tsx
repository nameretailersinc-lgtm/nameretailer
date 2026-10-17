"use client";

import { useState } from "react";
import {
  inspectSearchReadiness,
  type ReadinessReport,
} from "@/lib/tools/search-readiness";

export function SearchReadinessChecker() {
  const [html, setHtml] = useState("");
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
        Paste the full HTML source of one page, including its head and body.
        Your input stays in this browser. This tool does not fetch a URL or
        execute submitted scripts.
      </p>
      <form
        className="tool-form"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          setStatus("");
          setReports([]);
          if (!html.trim() || !/<[a-z][\s\S]*>/i.test(html)) {
            setError("Paste page HTML, rather than a URL or plain text.");
            return;
          }
          if (html.length > 1_000_000) {
            setError("Use HTML smaller than 1,000,000 characters.");
            return;
          }
          // A template keeps pasted content inert, including resource elements.
          const template = document.createElement("template");
          template.innerHTML = html;
          const doc = document.implementation.createHTMLDocument("");
          doc.head.replaceChildren();
          doc.body.replaceChildren(template.content);
          setReports(inspectSearchReadiness(doc));
          setStatus("Three checklists are ready.");
        }}
      >
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
            setHtml(event.target.value);
            setReports([]);
            setError("");
            setStatus("");
          }}
          required
        />
        <div className="tool-actions">
          <button className="button button-primary" type="submit">
            Run AEO, GEO and SEO check
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
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
