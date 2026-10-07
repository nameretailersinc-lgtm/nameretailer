"use client";
import { useState } from "react";
import {
  Clipboard,
  Clock,
  FileText,
  Pilcrow,
  ShieldCheck,
  Trash2,
  Type,
  Zap,
  Wifi,
} from "lucide-react";
import { countText } from "@/lib/tools/word-counter";
export function WordCounter() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const counts = countText(text);
  return (
    <section
      className="reference-tool-panel"
      aria-label="Word counter workspace"
    >
      <div className="reference-tool-workspace">
        <div>
          <label htmlFor="word-counter-text">Your text</label>
          <textarea
            id="word-counter-text"
            placeholder="Paste or type your text here…"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setStatus("");
            }}
            maxLength={100000}
            spellCheck
          />
          <div className="reference-actions">
            <button
              className="button button-primary"
              onClick={() => {
                setText(
                  "A useful article starts with a clear purpose. Choose a topic your audience cares about, support your claims and edit for clarity.\n\nThis is example text for the working word counter.",
                );
                setStatus("Example text loaded. Nothing was saved.");
              }}
            >
              <FileText size={17} aria-hidden="true" /> Load example text
            </button>
            <button
              className="button button-secondary"
              onClick={() => {
                setText("");
                setStatus("Text cleared. Nothing was saved.");
                document.getElementById("word-counter-text")?.focus();
              }}
            >
              <Trash2 size={17} aria-hidden="true" /> Clear text
            </button>
            <button
              className="button button-secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `Words: ${counts.words}\nCharacters: ${counts.characters}\nParagraphs: ${counts.paragraphs}\nEstimated reading minutes at 200 words/min: ${counts.readingMinutes}`,
                  );
                  setStatus("Counts copied. Your text was not included.");
                } catch {
                  setStatus(
                    "Clipboard is unavailable. Select the visible counts to copy them manually.",
                  );
                }
              }}
            >
              <Clipboard size={17} aria-hidden="true" /> Copy counts
            </button>
          </div>
        </div>
        <div>
          <h2>Live counts</h2>
          <dl className="reference-counts">
            {[
              ["Words", counts.words, FileText],
              ["Characters", counts.characters, Type],
              ["Paragraphs", counts.paragraphs, Pilcrow],
              ["Est. minutes", counts.readingMinutes, Clock],
            ].map(([label, value, Icon], index) => {
              const Mark = Icon as typeof FileText;
              return (
                <div key={String(label)} className={`count-tone-${index}`}>
                  <Mark size={23} aria-hidden="true" />
                  <dd data-count={String(label)}>{Number(value)}</dd>
                  <dt>{String(label)}</dt>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
      <div className="reference-privacy-note">
        <ShieldCheck size={27} aria-hidden="true" />
        <div>
          <strong>Your text is processed locally in your browser</strong>
          <p>
            We do not send or store your text. Counts include words, Unicode
            characters, nonempty lines as paragraphs, and estimated reading time
            at 200 words per minute. Maximum 100,000 characters.
          </p>
        </div>
      </div>
      <p role="status" className="reference-tool-status">
        {status}
      </p>
    </section>
  );
}
export function ToolBenefits() {
  return (
    <div className="reference-tool-benefits">
      {[
        [ShieldCheck, "Processed locally", "Your text stays in your browser"],
        [Zap, "Instant results", "Counts update while you type"],
        [Wifi, "No sign-up needed", "Free to use, up to 100,000 characters"],
      ].map(([Icon, title, text]) => {
        const Mark = Icon as typeof ShieldCheck;
        return (
          <div key={String(title)}>
            <span>
              <Mark size={21} aria-hidden="true" />
            </span>
            <p>
              <strong>{String(title)}</strong>
              <small>{String(text)}</small>
            </p>
          </div>
        );
      })}
    </div>
  );
}
