"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  FileCheck2,
  ShieldCheck,
  Upload,
  Link2,
  Globe2,
  ExternalLink,
  Info,
  Tag,
  Coins,
  ArrowRight,
  LockKeyhole,
  ImageIcon,
} from "lucide-react";
import { ArticleEditor } from "./article-editor";
import type {
  ArticleFileSummary,
  CartSelection,
  PlacementBrief,
  PlacementOptions,
  WritingWords,
} from "@/lib/commerce/cart-types";
import {
  briefIssue,
  placementBriefSchema,
} from "@/lib/commerce/brief-validation";
import {
  CustomerFeedback,
  customerError,
  customerMutation,
  customerRequest,
} from "@/components/account/shared";

export const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
const blank: PlacementBrief = {
  promotedUrl: "",
  keyword: "",
  specialRequirements: "",
  articleText: "",
  fileId: null,
};
export function PlacementForm({
  options,
  initial = 0,
  initialBrief,
  initialFile,
  busy,
  signedIn,
  onSave,
  onPendingChange,
  submitLabel = "Save placement to cart",
}: {
  options: PlacementOptions;
  initial?: WritingWords;
  initialBrief?: PlacementBrief;
  initialFile?: ArticleFileSummary | null;
  busy: boolean;
  signedIn: boolean;
  onSave: (item: CartSelection) => Promise<boolean>;
  onPendingChange?: (pending: boolean) => void;
  submitLabel?: string;
}) {
  const id = useId();
  const articleInput = useRef<{ focus: () => void } | null>(null);
  const [articleMode, setArticleMode] = useState<"paste" | "upload">(
    initialFile ? "upload" : "paste",
  );
  const [words, setWords] = useState<WritingWords>(initial);
  const [brief, setBrief] = useState<PlacementBrief>(initialBrief || blank);
  const [file, setFile] = useState<ArticleFileSummary | null>(
    initialFile || null,
  );
  const [chosen, setChosen] = useState<File | null>(null);
  const [retainedFiles, setRetainedFiles] = useState<ArticleFileSummary[]>([]);
  const [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  const addon =
    words === 0
      ? 0
      : options.writingOptions.find((option) => option.words === words)
          ?.priceCents;
  const disabled = busy || uploading;
  useEffect(() => {
    onPendingChange?.(uploading);
  }, [uploading, onPendingChange]);
  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    customerRequest<ArticleFileSummary[]>("/api/cart/files/")
      .then((files) => {
        if (active) setRetainedFiles(files);
      })
      .catch((cause) => {
        if (active) setError(customerError(cause));
      });
    return () => {
      active = false;
    };
  }, [signedIn]);
  function update(name: keyof PlacementBrief, value: string) {
    setBrief((old) => ({ ...old, [name]: value }));
  }
  async function upload(chosen: File | null) {
    if (!chosen || !signedIn) return;
    setUploading(true);
    setError("");
    try {
      if (chosen.size > 5 * 1024 * 1024 || !chosen.size)
        throw new Error("Choose a nonempty file up to 5 MiB.");
      const { token } = await customerRequest<{ token: string }>(
        "/api/account/csrf/",
      );
      const form = new FormData();
      form.set("file", chosen);
      const response = await fetch("/api/cart/files/", {
        method: "POST",
        body: form,
        headers: { "x-csrf-token": token },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Your article could not be uploaded.");
      const uploaded = data as ArticleFileSummary;
      setFile(uploaded);
      setRetainedFiles((old) => [
        uploaded,
        ...old.filter((value) => value.id !== uploaded.id),
      ]);
      setBrief((old) => ({ ...old, fileId: uploaded.id }));
      setChosen(null);
    } catch (cause) {
      setError(customerError(cause));
    } finally {
      setUploading(false);
    }
  }
  async function removeFile() {
    if (!file) {
      setBrief((old) => ({ ...old, fileId: null }));
      return;
    }
    setUploading(true);
    setError("");
    try {
      await customerMutation(`/api/cart/files/${file.id}/`, "DELETE", {});
      setRetainedFiles((old) => old.filter((value) => value.id !== file.id));
      setFile(null);
      setBrief((old) => ({ ...old, fileId: null }));
    } catch (cause) {
      setError(customerError(cause));
    } finally {
      setUploading(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = placementBriefSchema.safeParse(brief);
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join(" "));
      return;
    }
    const selection = {
      productId: options.productId,
      productVersion: options.productVersion,
      writingWords: words,
      brief: { ...parsed.data, fileId: words ? null : parsed.data.fileId },
    };
    const issue = briefIssue(selection, !!file);
    if (issue) {
      setError(issue);
      return;
    }
    if (!words && chosen) {
      setError(
        "Upload the selected file or clear the file selection before continuing.",
      );
      return;
    }
    await onSave(selection);
  }
  return (
    <form className="placement-builder" onSubmit={submit}>
      <div className="placement-builder-grid">
        <aside className="placement-explainer" aria-label="Placement guidance">
          <div className="placement-aside-heading">
            <span className="placement-round-icon">
              <FileCheck2 size={30} aria-hidden="true" />
            </span>
            <div>
              <h3>How it works</h3>
              <p>A clear brief, from the start.</p>
            </div>
          </div>
          <ol className="placement-instructions">
            <li>
              <span>1</span>Share your destination URL and keyword or anchor
              text.
            </li>
            <li>
              <span>2</span>Add your article or choose a writing package.
            </li>
            <li>
              <span>3</span>Review the publication requirements.
            </li>
            <li>
              <span>4</span>Save your brief and continue to review.
            </li>
          </ol>
          <div className="placement-aside-heading placement-publication-heading">
            <span className="placement-round-icon">
              <Link2 size={31} aria-hidden="true" />
            </span>
            <div>
              <h3>Your selected publication</h3>
              <p>This is where your article will be published.</p>
            </div>
          </div>
          <div className="placement-publication-card">
            <a
              className="placement-domain"
              href={options.domain}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe2 size={23} aria-hidden="true" />
              <span>{options.domain}</span>
              <ExternalLink size={16} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <dl>
              <div>
                <dt>Placement price</dt>
                <dd>{usd(options.placementCents)}</dd>
              </div>
              <div>
                <dt>Link type</dt>
                <dd>{options.linkType || "Confirm before purchase"}</dd>
              </div>
              <div>
                <dt>Turnaround</dt>
                <dd>{options.turnaround || "Not supplied"}</dd>
              </div>
            </dl>
            <p className="placement-requirements-note">
              <Info size={20} aria-hidden="true" />
              <span>
                {options.requirements ||
                  "No additional publisher requirements were supplied. Please confirm placement scope before purchase."}
              </span>
            </p>
          </div>
          <div className="placement-aside-heading placement-before-heading">
            <span className="placement-round-icon">
              <ShieldCheck size={32} aria-hidden="true" />
            </span>
            <div>
              <h3>Before you continue</h3>
              <p>
                This saves a brief to your private cart. It does not reserve
                inventory, place an order or charge a payment. Paid-link
                disclosure must be agreed before publication.
              </p>
            </div>
          </div>
          <div className="placement-sidebar-art" aria-hidden="true">
            <Image
              src="/03_listing_browser_panel.png"
              width={880}
              height={405}
              sizes="320px"
              alt=""
            />
            <div className="placement-art-document">
              <i />
              <i />
              <i />
              <i />
            </div>
            <span className="placement-art-link">
              <Link2 size={41} />
            </span>
            <span className="placement-art-image">
              <ImageIcon size={44} />
            </span>
          </div>
        </aside>
        <div className="placement-form-column">
          <section
            className="placement-inputs"
            aria-labelledby={`${id}-heading`}
          >
            <div className="placement-form-heading">
              <span className="placement-round-icon">
                <FileText size={27} aria-hidden="true" />
              </span>
              <div>
                <h2 id={`${id}-heading`}>Create Your Placement Brief</h2>
                <p>
                  Fill in the details below to create your placement brief. The
                  clearer your information, the better the results.
                </p>
              </div>
            </div>
            <fieldset className="placement-basic-fields" disabled={disabled}>
              <legend className="sr-only">Placement details</legend>
              <div className="placement-field">
                <label htmlFor={`${id}-url`}>
                  <Link2 size={22} aria-hidden="true" />
                  <span>
                    Promoted URL{" "}
                    <span className="placement-required" aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>
                <input
                  id={`${id}-url`}
                  type="url"
                  required
                  maxLength={2048}
                  placeholder="https://your-site.com/page/"
                  value={brief.promotedUrl}
                  onChange={(event) =>
                    update("promotedUrl", event.target.value)
                  }
                  aria-describedby={`${id}-url-help`}
                />
                <p id={`${id}-url-help`}>Enter the page you want to promote.</p>
              </div>
              <div className="placement-field">
                <label htmlFor={`${id}-keyword`}>
                  <Tag size={22} aria-hidden="true" />
                  <span>
                    Keyword or anchor text{" "}
                    <span className="placement-required" aria-hidden="true">
                      *
                    </span>
                  </span>
                </label>
                <input
                  id={`${id}-keyword`}
                  required
                  maxLength={200}
                  placeholder="e.g. best productivity tools"
                  value={brief.keyword}
                  onChange={(event) => update("keyword", event.target.value)}
                  aria-describedby={`${id}-keyword-help`}
                />
                <p id={`${id}-keyword-help`}>
                  The exact phrase you want to link to.
                </p>
              </div>
              <div className="placement-field placement-special-field">
                <label htmlFor={`${id}-requirements`}>
                  <FileText size={22} aria-hidden="true" />
                  <span>
                    Special requirements{" "}
                    <span className="optional">(optional)</span>
                  </span>
                </label>
                <div className="placement-counted-input">
                  <textarea
                    id={`${id}-requirements`}
                    rows={3}
                    maxLength={4000}
                    value={brief.specialRequirements}
                    onChange={(event) =>
                      update("specialRequirements", event.target.value)
                    }
                    placeholder="Suggested title, audience, tone and any placement constraints..."
                  />
                  <span
                    className="placement-character-count"
                    aria-hidden="true"
                  >
                    {brief.specialRequirements.length.toLocaleString("en-US")}
                    /4,000
                  </span>
                </div>
              </div>
            </fieldset>
            <fieldset className="placement-pricing" disabled={disabled}>
              <legend>
                <Coins size={23} aria-hidden="true" />
                Select pricing option
              </legend>
              <div className="placement-pricing-options">
                <label>
                  <input
                    type="radio"
                    name={`${id}-mode`}
                    checked={words === 0}
                    onChange={() => setWords(0)}
                  />
                  <span className="placement-price-option-copy">
                    <span>Link only</span>
                    <small>Supply your own article.</small>
                  </span>
                  <strong>{usd(options.placementCents)}</strong>
                </label>
                <label
                  className={
                    !options.writingOptions.length
                      ? "placement-price-unavailable"
                      : undefined
                  }
                >
                  <input
                    type="radio"
                    name={`${id}-mode`}
                    disabled={!options.writingOptions.length}
                    checked={words !== 0}
                    onChange={() =>
                      setWords(options.writingOptions[0]?.words || 0)
                    }
                  />
                  <span className="placement-price-option-copy">
                    <span>Link + article</span>
                    <small>Placement plus the allocated writing charge.</small>
                  </span>
                  <strong>
                    {words && addon !== undefined
                      ? usd(options.placementCents + addon)
                      : options.writingOptions.length
                        ? `From ${usd(options.placementCents + Math.min(...options.writingOptions.map((option) => option.priceCents)))}`
                        : "Unavailable"}
                  </strong>
                </label>
              </div>
              {words !== 0 && (
                <div className="placement-writing-length">
                  <label htmlFor={`${id}-words`}>Content length</label>
                  <select
                    id={`${id}-words`}
                    value={words}
                    onChange={(event) =>
                      setWords(Number(event.target.value) as WritingWords)
                    }
                  >
                    {options.writingOptions.map((option) => (
                      <option key={option.words} value={option.words}>
                        {option.words} words (+{usd(option.priceCents)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </fieldset>
            <fieldset className="placement-article-fields" disabled={disabled}>
              <legend className="sr-only">Article content</legend>
              <label
                className="placement-article-label"
                htmlFor={`${id}-article`}
              >
                <FileText size={23} aria-hidden="true" />
                <span>
                  {words ? (
                    "Article brief / theme suggestions"
                  ) : (
                    <>
                      Your article<span className="sr-only"> text</span>
                    </>
                  )}
                  {(words || !file) && (
                    <span className="placement-required" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  )}
                </span>
              </label>
              {!words && (
                <div
                  className="placement-article-tabs"
                  role="group"
                  aria-label="Article input method"
                >
                  <button
                    type="button"
                    aria-pressed={articleMode === "paste"}
                    onClick={() => {
                      setArticleMode("paste");
                      articleInput.current?.focus();
                    }}
                  >
                    Paste your article
                  </button>
                  <button
                    type="button"
                    aria-pressed={articleMode === "upload"}
                    onClick={() => {
                      setArticleMode("upload");
                      document.getElementById(`${id}-file`)?.focus();
                      document
                        .getElementById(`${id}-upload`)
                        ?.scrollIntoView({ block: "nearest" });
                    }}
                  >
                    Upload file
                  </button>
                </div>
              )}
              <div className="placement-article-editor">
                <ArticleEditor
                  id={`${id}-article`}
                  focusRef={articleInput}
                  value={brief.articleText}
                  disabled={disabled}
                  describedBy={`${id}-format-help`}
                  placeholder={
                    words
                      ? "Describe the topic, structure, audience and points the writer should cover."
                      : "Paste your article here, or upload a file below..."
                  }
                  onChange={(value) => update("articleText", value)}
                  onFocus={() => setArticleMode("paste")}
                />
                <span className="placement-character-count" aria-hidden="true">
                  {brief.articleText.length.toLocaleString("en-US")}/40,000
                </span>
              </div>
              <p className="placement-format-help" id={`${id}-format-help`}>
                Use the toolbar to format your text. Upload a document to keep its
                original styling.
              </p>
              {!words && (
                <div className="placement-upload" id={`${id}-upload`}>
                  <span className="placement-round-icon">
                    <Upload size={32} aria-hidden="true" />
                  </span>
                  <div className="placement-upload-content">
                    <label htmlFor={`${id}-file`}>
                      Or upload article{" "}
                      <span className="optional">(instead of pasted text)</span>
                    </label>
                    <input
                      key={file?.id || "empty"}
                      id={`${id}-file`}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      disabled={!signedIn}
                      onFocus={() => setArticleMode("upload")}
                      onChange={(event) => {
                        const picked = event.target.files?.[0] || null;
                        setChosen(picked);
                        if (picked) void upload(picked);
                      }}
                    />
                    {chosen && (
                      <div className="placement-upload-actions">
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => void upload(chosen)}
                        >
                          <Upload size={16} aria-hidden="true" />
                          Upload selected article
                        </button>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => {
                            setChosen(null);
                            const input = document.getElementById(
                              `${id}-file`,
                            ) as HTMLInputElement | null;
                            if (input) input.value = "";
                          }}
                        >
                          Clear selection
                        </button>
                      </div>
                    )}
                    {!!retainedFiles.length && (
                      <div className="placement-retained-files">
                        <label htmlFor={`${id}-retained-file`}>
                          Existing draft article file
                        </label>
                        <select
                          id={`${id}-retained-file`}
                          value={file?.id || ""}
                          onChange={(event) => {
                            const saved =
                              retainedFiles.find(
                                (value) => value.id === event.target.value,
                              ) || null;
                            setFile(saved);
                            setChosen(null);
                            setBrief((old) => ({
                              ...old,
                              fileId: saved?.id || null,
                            }));
                          }}
                        >
                          <option value="">No retained file selected</option>
                          {retainedFiles.map((saved) => (
                            <option key={saved.id} value={saved.id}>
                              {saved.name} · expires{" "}
                              {saved.expiresAt.slice(0, 10)}
                            </option>
                          ))}
                        </select>
                        <p className="customer-hint">
                          Choose an unused draft file to reuse or remove it.
                          Removing a file also invalidates any cart reference to
                          it.
                        </p>
                      </div>
                    )}
                    {file && (
                      <p className="placement-file">
                        <a href={`/api/cart/files/${file.id}/`}>
                          Download {file.name}
                        </a>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => void removeFile()}
                        >
                          Remove file
                        </button>
                      </p>
                    )}
                    {brief.fileId && !file && (
                      <p>
                        Previous file unavailable.{" "}
                        <button type="button" onClick={() => void removeFile()}>
                          Clear expired file
                        </button>
                      </p>
                    )}
                    <p className="customer-hint">
                      PDF, DOC, DOCX or TXT (up to 5 MiB). Files are private,
                      expire after 7 days and are not malware-scanned.
                      <br />
                      Do not upload confidential or executable content.
                    </p>
                    {!signedIn && (
                      <p className="placement-upload-signin">
                        <Link
                          href={`/my-account/?returnTo=cart&product=${options.productId}`}
                        >
                          Sign in
                        </Link>{" "}
                        to upload and save your article.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </fieldset>
          </section>
          <CustomerFeedback error={error} />
          <div className="placement-save-bar">
            <div className="placement-price-breakdown">
              <span>
                Placement<strong>{usd(options.placementCents)}</strong>
              </span>
              <span>
                Writing
                <strong>
                  {addon === undefined ? "Unavailable" : usd(addon)}
                </strong>
              </span>
            </div>
            <div className="placement-total">
              <span>Total (USD)</span>
              <strong>
                {addon === undefined
                  ? "Unavailable"
                  : usd(options.placementCents + addon)}
              </strong>
            </div>
            <div className="placement-save-action">
              {signedIn ? (
                <button
                  className="button button-primary"
                  disabled={disabled || addon === undefined}
                >
                  {uploading ? "Uploading…" : busy ? "Saving…" : submitLabel}
                  <ArrowRight size={19} aria-hidden="true" />
                </button>
              ) : (
                <Link
                  className="button button-primary"
                  href={`/my-account/?returnTo=cart&product=${options.productId}`}
                >
                  Sign in to save this placement
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              )}
              <p>
                <LockKeyhole size={15} aria-hidden="true" />
                One placement per publication. Prices are checked on the server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
