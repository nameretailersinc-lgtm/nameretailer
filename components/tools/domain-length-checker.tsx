"use client";
import { useState } from "react";
import { domainLength } from "@/lib/tools/domain-length";

export function DomainLengthChecker() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof domainLength> | null>(
    null,
  );
  const [error, setError] = useState("");
  return (
    <section
      className="reference-card tool-workspace"
      aria-label="Domain length checker"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setResult(null);
          setError("");
          try {
            setResult(domainLength(input));
          } catch (cause) {
            setError(
              cause instanceof Error ? cause.message : "Check your domain.",
            );
          }
        }}
      >
        <label htmlFor="domain-length-input">Domain name</label>
        <input
          id="domain-length-input"
          value={input}
          maxLength={2048}
          autoCapitalize="none"
          spellCheck={false}
          placeholder="example.com"
          aria-describedby="domain-length-help"
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setError("");
          }}
        />
        <p id="domain-length-help">
          Enter a domain without https:// or a path. Processing stays in your
          browser.
        </p>
        <button className="button button-primary" type="submit">
          Check length
        </button>
      </form>
      <div aria-live="polite" aria-atomic="true">
        {error && <p role="alert">{error}</p>}
        {result && (
          <>
            <h2>Domain length result</h2>
            <p>
              ASCII hostname:{" "}
              <strong style={{ overflowWrap: "anywhere" }}>
                {result.ascii}
              </strong>
            </p>
            <p>
              {result.asciiCharacters} ASCII characters including dots;{" "}
              {result.displayCharacters} characters in your input.
            </p>
            <p>
              {result.withinLimits
                ? "Within DNS length limits."
                : "Exceeds DNS length limits."}{" "}
              This does not confirm registration eligibility or availability.
            </p>
            <ul>
              {result.labels.map((item, index) => (
                <li key={index} style={{ overflowWrap: "anywhere" }}>
                  {item.label}: {item.length} of 63 ASCII characters
                  {item.withinLimit ? "" : " — too long"}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
