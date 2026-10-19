import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { actor, fixtures, key, mutation } from "./helpers";
import type { Product, ProductInput } from "../../lib/commerce/types";
import { publicationPath } from "../../lib/commerce/publication-pages";

const group = key("profile");
const topic = `Synthetic QA topic ${group}`;
let primary: Product, sparse: Product, section: Product;
const input = (domain: string, rich = true): ProductInput => ({
  externalId: null, domain, category: topic, country: "United States", language: "English",
  priceCents: rich ? 15000 : 9000, currency: "USD", status: "active",
  metrics: { dr: rich ? 70 : null, da: rich ? 60 : null, traffic: rich ? 600000 : null, spamScore: rich ? 3 : null, tf: null, ur: null, referringDomains: null, backlinks: null },
  linkType: rich ? "Supplied QA package" : "", turnaround: rich ? "5 days" : "", requirements: "",
});
const reviewed = {
  state: "reviewed", publisherName: "Synthetic QA publication", description: "Synthetic QA profile: a fictional publication used only to verify source-backed rendering in the isolated test database.",
  editorialGuidelines: "Synthetic QA guideline: demonstrate reproducible examples and cite the evidence.",
  acceptedTopics: "Synthetic QA tutorials only.", restrictedTopics: "Synthetic QA restriction: unsupported result claims.",
  wordCountRequirements: "Synthetic QA requirement: confirm length with the test editor.", imageRequirements: "Synthetic QA requirement: permissioned images.",
  audienceDetails: "Synthetic QA audience information, not real readership data.", priceIncludes: "Synthetic QA inclusion: placement scope agreed in writing.",
  sourceUrl: "https://example.com/qa-editorial-evidence", checkedAt: "2026-10-18",
  faqs: [{ question: "Which synthetic QA evidence supports this profile?", answer: "Only isolated test evidence; this is not a real publisher review." }],
};

test.beforeAll(async () => {
  test.setTimeout(120000);
  const api = await actor((await fixtures()).admin);
  const create = async (data: ProductInput) => {
    const response = await mutation(api, "post", "/api/admin/products/", data);
    expect(response.status()).toBe(201);
    return (await response.json()).data as Product;
  };
  primary = await create(input(`${group}.com`));
  sparse = await create(input(`${group}-sparse.com`, false));
  section = await create(input(`${group}.com/tutorials/`));
  await create({ ...input(`${group}-alternative.com`), priceCents: 16000 });
  const response = await mutation(api, "patch", `/api/admin/products/${primary.id}/profile/`, { ...reviewed, version: primary.version });
  expect(response.status()).toBe(200);
  primary.version = (await response.json()).data.version;
  await api.dispose();
});

for (const width of [375, 1280]) test(`rich, sparse and section profiles render accurately and accessibly at ${width}px`, async ({ page, request }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width, height: 950 });
  const descriptions = new Set<string>();
  for (const product of [primary, sparse, section]) {
    const path = publicationPath(product)!;
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(product.domain);
    expect(html).not.toContain("private-account-id");
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://nameretailer.com${path}`);
    descriptions.add((await page.locator('meta[name="description"]').getAttribute("content"))!);
    await expect(page.getByRole("main")).not.toContainText(/estimated monthly visits|per 100,000/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const types = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.flatMap(node => {
      const data = JSON.parse(node.textContent || "{}");
      return data["@type"] || [];
    }));
    expect(types).toContain("WebPage"); expect(types).toContain("BreadcrumbList"); expect(types).not.toContain("FAQPage");
    expect((await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    if (product.id === primary.id) await expect(page.getByRole("heading", { name: "About Synthetic QA publication", exact: true })).toBeVisible();
    if (product.id === sparse.id) await expect(page.getByRole("main")).toContainText("Unavailable");
    if (product.id === section.id) await expect(page.getByRole("main")).toContainText("section-specific listing");
  }
  expect(descriptions.size).toBe(3);
});

test("shortlist and the existing placement planner remain functional", async ({ page }) => {
  await page.goto(publicationPath(primary)!);
  const sidebar = page.getByRole("complementary");
  await sidebar.getByRole("button", { name: "Shortlist", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your publication comparison (1/4)" })).toBeVisible();
  const alternativeButtons = page.getByRole("button", { name: "Shortlist", exact: true });
  await alternativeButtons.first().click();
  await expect(page.getByRole("heading", { name: "Your publication comparison (2/4)" })).toBeVisible();
  await sidebar.getByRole("button", { name: "Remove from shortlist", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your publication comparison (1/4)" })).toBeVisible();
  await sidebar.getByRole("button", { name: "Add to plan", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Create a placement brief");
  await page.getByRole("button", { name: "Close placement brief" }).click();
});

test("admin review keeps drafts private, publishes sourced fields and rejects stale updates", async ({ page, request }) => {
  test.setTimeout(120000);
  const api = await actor((await fixtures()).admin);
  await page.context().addCookies((await api.storageState()).cookies);
  await page.goto(`/admin/products/?q=${new URL(sparse.domain).hostname}`);
  await page.getByRole("button", { name: "Edit profile content", exact: true }).click();
  await expect(page.getByLabel("Profile review state")).toHaveValue("draft");
  const draftText = "PRIVATE SYNTHETIC QA DRAFT, never a public publisher description.";
  await page.getByLabel("Publisher description", { exact: true }).fill(draftText);
  await page.getByRole("button", { name: "Save profile content", exact: true }).click();
  await expect(page.getByText("Profile draft saved. Draft content is private.", { exact: true })).toBeVisible();
  expect(await (await request.get(publicationPath(sparse)!)).text()).not.toContain(draftText);
  const adminRecord = (await (await api.get(`/api/admin/products/${sparse.id}/profile/`)).json()).data;
  const stale = await mutation(api, "patch", `/api/admin/products/${sparse.id}/profile/`, { ...reviewed, version: sparse.version });
  expect(stale.status()).toBe(409);
  const published = await mutation(api, "patch", `/api/admin/products/${sparse.id}/profile/`, { ...reviewed, version: adminRecord.version });
  expect(published.status()).toBe(200);
  const publishedData = (await published.json()).data;
  const html = await (await request.get(publicationPath(sparse)!)).text();
  expect(html).toContain(reviewed.description); expect(html).toContain(reviewed.wordCountRequirements);
  const mobile = (await (await request.get(`/api/mobile/products/${sparse.id}/`)).json()).product;
  for (const field of ["source", "externalId", "importId"]) expect(mobile).not.toHaveProperty(field);
  expect(mobile.publicationContent).not.toHaveProperty("reviewedBy");
  const changed = await mutation(api, "patch", `/api/admin/products/${sparse.id}/`, { ...input(sparse.domain, false), priceCents: 10000, version: publishedData.version });
  expect(changed.status()).toBe(200);
  expect(await (await request.get(publicationPath(sparse)!)).text()).not.toContain(reviewed.description);
  await api.dispose();
});

test("profile endpoints enforce roles and CSRF, and detail aliases preserve canonicals", async ({ request }) => {
  test.setTimeout(120000);
  expect((await request.get(`/api/admin/products/${primary.id}/profile/`)).status()).toBe(401);
  const accounts = await fixtures();
  const editor = await actor(accounts.editor);
  expect((await editor.get(`/api/admin/products/${primary.id}/profile/`)).status()).toBe(403);
  await editor.dispose();
  const admin = await actor(accounts.admin);
  expect((await admin.patch(`/api/admin/products/${primary.id}/profile/`, { data: { ...reviewed, version: primary.version } })).status()).toBe(403);
  await admin.dispose();
  for (const domain of [new URL(primary.domain).hostname, new URL(primary.domain).hostname.replaceAll(".", "-").toUpperCase()]) {
    const response = await request.get(`/publication/${domain}/`, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(publicationPath(primary));
  }
  const query = await request.get(publicationPath(primary)! + "?page=2");
  expect(await query.text()).toContain('content="noindex, follow"');
  expect((await request.get("/publication/nonexistent-qa-host/")).status()).toBe(404);
});
