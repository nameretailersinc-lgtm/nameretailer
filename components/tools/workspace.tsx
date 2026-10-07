"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Clipboard, ShieldCheck, Trash2 } from "lucide-react";
import type { Tool } from "@/lib/tools/catalog";
import { toolIcon } from "@/lib/tools/presentation";
import {
  analyzeAlt,
  analyzeBacklinks,
  convertNumber,
  keywordIdeas,
  lengthUnits,
  sizeUnits,
  outreachBrief,
  sharingMarkup,
  transformText,
  validateSchema,
} from "@/lib/tools/core";
import { ImageWorkspace } from "./image-workspace";

const textModes: Record<string, Array<[string, string]>> = {
  "text-case-converter": [
    ["sentence", "Sentence case"],
    ["title", "Title case"],
    ["upper", "UPPERCASE"],
    ["lower", "lowercase"],
  ],
  "reverse-text": [
    ["graphemes", "Characters (emoji safe)"],
    ["words", "Word order"],
    ["lines", "Line order"],
  ],
  "base64-encode-decode": [
    ["encode", "Encode UTF-8"],
    ["decode", "Decode UTF-8"],
  ],
};
export function ToolWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState(textModes[tool.slug]?.[0][0] || "");
  const [phrase, setPhrase] = useState("");
  const [from, setFrom] = useState(
    tool.slug === "temperature-converter"
      ? "C"
      : tool.slug === "file-size-converter"
        ? "B"
        : tool.slug === "px-to-rem"
          ? "px"
          : "m",
  );
  const [to, setTo] = useState(
    tool.slug === "temperature-converter"
      ? "F"
      : tool.slug === "file-size-converter"
        ? "KiB"
        : "cm",
  );
  const [root, setRoot] = useState("16");
  const [fields, setFields] = useState({
    title: "",
    description: "",
    url: "",
    image: "",
    imageAlt: "",
    name: "",
    type: tool.slug === "schema-generator" ? "Article" : "website",
  });
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const resultRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  function changed() {
    setOutput("");
    setStatus("");
    setError("");
    requestRef.current?.abort();
  }
  function field(key: keyof typeof fields, value: string) {
    changed();
    setFields((previous) => ({ ...previous, [key]: value }));
  }
  async function run(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setOutput("");
    setStatus("");
    setBusy(true);
    try {
      let value = "";
      if (tool.kind === "text")
        value = transformText(tool.slug, input, mode, phrase);
      if (tool.kind === "number")
        value = convertNumber(tool.slug, input, from, to, root);
      if (tool.kind === "markup")
        value =
          tool.slug === "schema-markup-validator"
            ? validateSchema(input)
            : sharingMarkup(tool.slug, fields);
      if (tool.kind === "alt") value = analyzeAlt(input);
      if (tool.kind === "backlinks") value = analyzeBacklinks(input);
      if (tool.kind === "keywords") value = keywordIdeas(input, phrase);
      if (tool.kind === "outreach")
        value = outreachBrief(input, fields.url, phrase);
      if (tool.kind === "amp" || tool.kind === "rating") {
        const controller = new AbortController();
        requestRef.current = controller;
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
          const response = await fetch(`/api/tools/${tool.kind}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input }),
            signal: controller.signal,
          });
          const data = (await response.json()) as {
            result?: string;
            error?: string;
          };
          if (!response.ok)
            throw new Error(data.error || "Tool unavailable. Try again later.");
          value = data.result || "No results.";
        } finally {
          clearTimeout(timeout);
        }
      }
      setOutput(value);
      setStatus("Result ready.");
    } catch (failure) {
      setError(
        failure instanceof Error && failure.name !== "AbortError"
          ? failure.message
          : "Request canceled or timed out. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setStatus("Result copied.");
    } catch {
      resultRef.current?.focus();
      resultRef.current?.select();
      setStatus(
        "Clipboard unavailable. The result is selected for manual copying.",
      );
    }
  }
  const isGenerator =
    tool.kind === "markup" && tool.slug !== "schema-markup-validator";
  const options =
    tool.slug === "temperature-converter"
      ? ["C", "F", "K"]
      : Object.keys(tool.slug === "length-converter" ? lengthUnits : sizeUnits);
  if (tool.kind === "image") return <ImageWorkspace tool={tool} />;
  return (
    <section
      className="reference-card tool-workspace"
      aria-label={`${tool.title} workspace`}
    >
      <div className="tool-workspace-heading">
        <div className="tools-workspace-title">
          <Image
            src={toolIcon(tool)}
            width={85}
            height={85}
            alt=""
            sizes="42px"
          />
          <div>
            <h2>Your workspace</h2>
            <small>Add your input and choose your settings.</small>
          </div>
        </div>
        <span className="reference-pill">{tool.mode}</span>
      </div>
      <form onSubmit={run} className="tool-form">
        {isGenerator ? (
          <>
            {tool.slug === "schema-generator" && (
              <label>
                Schema type
                <select
                  value={fields.type}
                  onChange={(event) => field("type", event.target.value)}
                >
                  {["Article", "Organization", "BreadcrumbList", "FAQPage"].map(
                    (type) => (
                      <option key={type}>{type}</option>
                    ),
                  )}
                </select>
              </label>
            )}
            {tool.slug === "open-graph-generator" && (
              <label>
                Page type
                <select
                  value={fields.type}
                  onChange={(event) => field("type", event.target.value)}
                >
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                </select>
              </label>
            )}
            <label>
              {fields.type === "FAQPage" ? "Question" : "Page title"}
              <input
                required
                maxLength={200}
                value={fields.title}
                onChange={(event) => field("title", event.target.value)}
              />
            </label>
            <label>
              {fields.type === "FAQPage" ? "Answer" : "Description"}
              <textarea
                required
                maxLength={2000}
                rows={3}
                value={fields.description}
                onChange={(event) => field("description", event.target.value)}
              />
            </label>
            <label>
              Page URL
              <input
                required
                type="url"
                placeholder="https://example.com/page/"
                maxLength={2048}
                value={fields.url}
                onChange={(event) => field("url", event.target.value)}
              />
            </label>
            {tool.slug === "schema-generator" &&
              ["Article", "Organization"].includes(fields.type) && (
                <label>
                  Real organization / organizational author
                  <input
                    required
                    maxLength={160}
                    value={fields.name}
                    onChange={(event) => field("name", event.target.value)}
                  />
                </label>
              )}
            <label>
              Image URL (optional)
              <input
                type="url"
                maxLength={2048}
                value={fields.image}
                onChange={(event) => field("image", event.target.value)}
              />
            </label>
            {fields.image && (
              <label>
                Image description
                <input
                  required
                  maxLength={300}
                  value={fields.imageAlt}
                  onChange={(event) => field("imageAlt", event.target.value)}
                />
              </label>
            )}
          </>
        ) : (
          <>
            <label>
              {tool.kind === "number"
                ? "Value"
                : tool.kind === "rating"
                  ? "Domains (one per line, maximum 30)"
                  : tool.kind === "backlinks"
                    ? "Backlink CSV report"
                    : ["amp", "alt"].includes(tool.kind)
                      ? "HTML to inspect"
                      : tool.kind === "keywords"
                        ? "Seed topic"
                        : tool.kind === "outreach"
                          ? "Proposed article topic"
                          : "Your text"}
              {tool.kind === "number" ||
              ["keywords", "outreach"].includes(tool.kind) ? (
                <input
                  required
                  maxLength={tool.kind === "number" ? 80 : 160}
                  value={input}
                  onChange={(event) => {
                    changed();
                    setInput(event.target.value);
                  }}
                  placeholder={
                    tool.slug === "hex-to-rgb"
                      ? "#14735b"
                      : tool.kind === "number"
                        ? "24"
                        : "Guest post planning"
                  }
                />
              ) : (
                <textarea
                  required
                  rows={10}
                  maxLength={tool.kind === "backlinks" ? 1000000 : 100000}
                  spellCheck={
                    !["alt", "amp", "backlinks", "markup"].includes(tool.kind)
                  }
                  value={input}
                  onChange={(event) => {
                    changed();
                    setInput(event.target.value);
                  }}
                  placeholder={
                    tool.kind === "backlinks"
                      ? "source_url,rel\nhttps://example.com/article,nofollow"
                      : "Paste your text here…"
                  }
                />
              )}
            </label>
            {tool.kind === "backlinks" && (
              <label>
                Or open a CSV file (up to 1 MB)
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={async (event) => {
                    changed();
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1000000) {
                      setError("Choose a CSV under 1 MB.");
                      return;
                    }
                    try {
                      setInput(await file.text());
                    } catch {
                      setError("The CSV could not be read.");
                    }
                  }}
                />
              </label>
            )}
            {textModes[tool.slug] && (
              <label>
                Conversion
                <select
                  value={mode}
                  onChange={(event) => {
                    changed();
                    setMode(event.target.value);
                  }}
                >
                  {textModes[tool.slug].map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {[
              "keyword-density-checker",
              "keyword-suggestion-tool",
              "backlink-generator",
            ].includes(tool.slug) && (
              <label>
                {tool.kind === "outreach"
                  ? "Publication name"
                  : tool.kind === "keywords"
                    ? "Audience (optional)"
                    : "Exact phrase (optional; leave blank for top words)"}
                <input
                  required={tool.kind === "outreach"}
                  maxLength={160}
                  value={phrase}
                  onChange={(event) => {
                    changed();
                    setPhrase(event.target.value);
                  }}
                />
              </label>
            )}
            {tool.kind === "outreach" && (
              <label>
                Resource URL
                <input
                  required
                  type="url"
                  value={fields.url}
                  maxLength={2048}
                  onChange={(event) => field("url", event.target.value)}
                />
              </label>
            )}
            {tool.kind === "number" && tool.slug !== "hex-to-rgb" && (
              <div className="tool-field-row">
                <label>
                  From
                  <select
                    value={from}
                    onChange={(event) => {
                      changed();
                      setFrom(event.target.value);
                    }}
                  >
                    {(tool.slug === "px-to-rem" ? ["px", "rem"] : options).map(
                      (unit) => (
                        <option key={unit}>{unit}</option>
                      ),
                    )}
                  </select>
                </label>
                {tool.slug === "px-to-rem" ? (
                  <label>
                    Root font size (pixels)
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="any"
                      value={root}
                      onChange={(event) => {
                        changed();
                        setRoot(event.target.value);
                      }}
                    />
                  </label>
                ) : (
                  <label>
                    To
                    <select
                      value={to}
                      onChange={(event) => {
                        changed();
                        setTo(event.target.value);
                      }}
                    >
                      {options.map((unit) => (
                        <option key={unit}>{unit}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}
          </>
        )}
        <div className="reference-actions">
          <button className="button button-primary" disabled={busy}>
            {busy
              ? "Working…"
              : isGenerator || tool.kind === "outreach"
                ? "Generate result"
                : "Run tool"}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              changed();
              setInput("");
              setPhrase("");
              setFields({
                ...fields,
                title: "",
                description: "",
                url: "",
                image: "",
                imageAlt: "",
                name: "",
              });
            }}
          >
            <Trash2 size={17} aria-hidden="true" />
            Clear
          </button>
        </div>
      </form>
      {error && (
        <p role="alert" className="tool-error">
          {error}
        </p>
      )}
      <p role="status" aria-live="polite">
        {status}
      </p>
      {output && (
        <div className="tool-result">
          <label htmlFor="tool-result">Result</label>
          <textarea
            id="tool-result"
            ref={resultRef}
            readOnly
            rows={Math.min(18, Math.max(4, output.split("\n").length))}
            value={output}
          />
          <button
            type="button"
            className="button button-secondary"
            onClick={copy}
          >
            <Clipboard size={17} aria-hidden="true" />
            Copy result
          </button>
        </div>
      )}
      <div className="tool-privacy">
        <ShieldCheck
          className="tools-privacy-icon"
          size={29}
          aria-hidden="true"
        />
        <strong>
          {["amp", "rating"].includes(tool.kind)
            ? "Only this request is sent to our server."
            : "Your input stays in this browser."}
        </strong>
        <p>
          {tool.kind === "amp"
            ? "Pasted HTML is validated, not executed or stored. Validator availability requires access to the official AMP CDN."
            : tool.kind === "rating"
              ? "Domains are matched against active owner-supplied catalog records. Missing scores stay unavailable; no Ahrefs API is called."
              : "No input is uploaded, saved or used to send messages. Results are cleared when you leave the page."}
        </p>
      </div>
    </section>
  );
}
