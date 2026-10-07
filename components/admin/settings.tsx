"use client";
import { useEffect, useState } from "react";
import { api, mutation, errorMessage, apiPath } from "./api";
import {
  PageHeading,
  Panel,
  Field,
  Input,
  Textarea,
  Button,
  Feedback,
  Loading,
  useDirtyGuard,
} from "./primitives";
const labels: Record<string, string> = {
  brandName: "Brand name",
  contactEmail: "Contact email",
  address: "Business address",
  logo: "Logo URL",
  ga4Id: "GA4 measurement ID",
  gtmId: "Google Tag Manager ID",
  googleVerification: "Search Console verification",
  metaPixelId: "Meta Pixel ID",
};
export function Settings() {
  const [data, setData] = useState<Record<string, unknown>>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [social, setSocial] = useState("");
  useDirtyGuard(dirty);
  useEffect(() => {
    api<{ data: Record<string, unknown> }>("/api/admin/settings")
      .then((r) => {
        setData(r.data);
        setSocial(
          Array.isArray(r.data.socialLinks)
            ? r.data.socialLinks.join("\n")
            : String(r.data.socialLinks || ""),
        );
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);
  function change(key: string, value: unknown) {
    setData((old) => ({ ...old, [key]: value }));
    setDirty(true);
    setSuccess("");
  }
  return (
    <>
      <PageHeading
        title="Site settings"
        description="Brand, contact details and stored search configuration. Integration secrets stay in environment variables."
      />
      <Feedback error={error} success={success} />
      {!data && !error ? (
        <Loading />
      ) : (
        data && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                const result = await mutation<{
                  data: Record<string, unknown>;
                }>("/api/admin/settings", "PATCH", {
                  ...data,
                  socialLinks: social
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                });
                setData(result.data);
                setDirty(false);
                setSuccess(
                  "Site settings saved. Public integrations and SEO endpoints are activated in the public-build phase.",
                );
              } catch (cause) {
                setError(errorMessage(cause));
              } finally {
                setBusy(false);
              }
            }}
          >
            <Panel title="Business & brand">
              <div className="grid-two">
                {["brandName", "contactEmail", "address", "logo"].map((key) => (
                  <Field label={labels[key]} key={key}>
                    <Input
                      type={key === "contactEmail" ? "email" : "text"}
                      value={String(data[key] || "")}
                      onChange={(e) => change(key, e.target.value)}
                    />
                  </Field>
                ))}
              </div>
              <Field
                label="Social profile links"
                hint="One confirmed URL per line."
              >
                <Textarea
                  value={social}
                  onChange={(e) => {
                    setSocial(e.target.value);
                    setDirty(true);
                  }}
                />
              </Field>
            </Panel>
            <Panel title="Analytics & verification">
              <p className="notice">
                Saving an ID does not load tracking. Public consent-aware
                integration follows in Phase 4.
              </p>
              <div className="grid-two">
                {["ga4Id", "gtmId", "googleVerification", "metaPixelId"].map(
                  (key) => (
                    <Field label={labels[key]} key={key}>
                      <Input
                        value={String(data[key] || "")}
                        onChange={(e) => change(key, e.target.value)}
                      />
                    </Field>
                  ),
                )}
              </div>
            </Panel>
            <Panel title="Search files">
              <div className="settings-code">
                {[
                  ["robotsText", "robots.txt configuration"],
                  ["llmsText", "llms.txt configuration"],
                  ["llmsFullText", "llms-full.txt configuration"],
                ].map(([key, label]) => (
                  <Field label={label} key={key}>
                    <Textarea
                      className="code-input"
                      value={String(data[key] || "")}
                      onChange={(e) => change(key, e.target.value)}
                    />
                  </Field>
                ))}
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={data.sitemapEnabled !== false}
                  onChange={(e) => change("sitemapEnabled", e.target.checked)}
                />
                Enable sitemap when public routes are available
              </label>
            </Panel>
            <div className="actions">
              <Button disabled={busy}>
                {busy ? "Saving…" : "Save settings"}
              </Button>
              <span className="status-line">
                {dirty ? "Unsaved changes" : "All loaded changes saved"}
              </span>
            </div>
          </form>
        )
      )}
      <Panel title="Backup & exports">
        <p className="muted">
          Download a server-generated export. Store it securely; it can contain
          business or personal information.
        </p>
        <div className="actions">
          <a
            className="button button-secondary"
            href={apiPath("/api/admin/export?format=json")}
          >
            Export all JSON
          </a>
          <a
            className="button button-secondary"
            href={apiPath("/api/admin/export?format=csv&collection=content")}
          >
            Export content CSV
          </a>
          <a
            className="button button-secondary"
            href={apiPath("/api/admin/export?format=wxr&collection=content")}
          >
            Export content WXR
          </a>
        </div>
      </Panel>
    </>
  );
}
