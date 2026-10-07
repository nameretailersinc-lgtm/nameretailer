import { test, expect, type APIRequestContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { actor, fixtures, key, mutation, origin } from "./helpers";
import { PRODUCT_CSV_HEADERS } from "../../lib/commerce/csv";
type Preview = {
  importId: string;
  limit: number;
  sha256: string;
  count: number;
  expires: number;
  signature: string;
  remainingDrafts: number;
  invalid: number;
  rows: Array<{ id: string; domain: string; version: number }>;
  canActivate: boolean;
};
async function seed(api: APIRequestContext, count = 3) {
  const group = key("activation");
  const rows = Array.from({ length: count }, (_, index) => ({
    id: `${BigInt("0x" + group.replace(/[^a-f0-9]/g, "").slice(-10))}${index}`,
    domain: `${group}-${index}.com`,
    Price: "85",
    language: "English",
    Country: "QA activation",
    Category: group,
    dr: "0",
    da: "0",
    Article_Price: "10",
    Article_Price_2: "0",
    Article_Price_3: "0",
    Description: "PRIVATE_QA_ACTIVATION_SOURCE",
  }));
  const csv = [
    PRODUCT_CSV_HEADERS.join(","),
    ...rows.map((row) =>
      PRODUCT_CSV_HEADERS.map(
        (header) => `"${(row as Record<string, string>)[header] || ""}"`,
      ).join(","),
    ),
  ].join("\r\n");
  const {
    data: { token },
  } = await (await api.get("/api/admin/csrf")).json();
  const upload = (action: string, sha256?: string) =>
    api.post("/api/admin/products/import", {
      headers: { Origin: origin, "x-csrf-token": token },
      multipart: {
        file: {
          name: "isolated-activation.csv",
          mimeType: "text/csv",
          buffer: Buffer.from(csv),
        },
        action,
        ...(sha256 ? { sha256 } : {}),
      },
    });
  const preview = await upload("preview");
  expect(preview.status()).toBe(200);
  const sha256 = (await preview.json()).data.sha256;
  const imported = await upload("commit", sha256);
  expect(imported.status()).toBe(201);
  return { group, importId: (await imported.json()).data.importId as string };
}
async function preview(api: APIRequestContext, importId: string, limit = 2) {
  const response = await api.get(
    `/api/admin/products/activate?importId=${importId}&limit=${limit}`,
  );
  expect(response.status()).toBe(200);
  return (await response.json()).data as Preview;
}
function confirmation(value: Preview) {
  const { importId, limit, sha256, count, expires, signature } = value;
  return {
    importId,
    limit,
    sha256,
    count,
    expires,
    signature,
    confirmation: "ACTIVATE REVIEWED LISTINGS",
    acknowledgeUnverifiedMetrics: true,
  };
}
test("activation is admin-only, CSRF/origin protected and refuses incomplete or forged confirmation", async ({
  request,
}) => {
  const accounts = await fixtures();
  const api = await actor(accounts.admin);
  const { importId } = await seed(api);
  expect(
    (
      await request.get(`/api/admin/products/activate?importId=${importId}`)
    ).status(),
  ).toBe(401);
  expect((await request.post("/api/admin/products/activate")).status()).toBe(
    401,
  );
  for (const role of ["editor", "author", "customer"] as const) {
    const other = await actor(accounts[role]);
    expect(
      (
        await other.get(`/api/admin/products/activate?importId=${importId}`)
      ).status(),
    ).toBe(403);
    expect((await other.post("/api/admin/products/activate")).status()).toBe(
      403,
    );
    await other.dispose();
  }
  const review = await preview(api, importId);
  expect(
    (
      await api.post("/api/admin/products/activate", {
        data: confirmation(review),
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(403);
  const {
    data: { token },
  } = await (await api.get("/api/admin/csrf")).json();
  expect(
    (
      await api.post("/api/admin/products/activate", {
        data: confirmation(review),
        headers: {
          Origin: "https://not-the-app.invalid",
          "x-csrf-token": token,
        },
      })
    ).status(),
  ).toBe(403);
  for (const change of [
    { confirmation: "yes" },
    { acknowledgeUnverifiedMetrics: false },
    { ownerId: accounts.customer.id },
    { count: 3 },
  ]) {
    const response = await mutation(
      api,
      "post",
      "/api/admin/products/activate",
      { ...confirmation(review), ...change },
    );
    expect([409, 422]).toContain(response.status());
  }
  expect((await preview(api, importId)).remainingDrafts).toBe(3);
  await api.dispose();
});
test("preview writes no products; commit activates the exact bounded scope once and preserves private source/missing metrics", async ({
  request,
}) => {
  const api = await actor((await fixtures()).admin);
  const { group, importId } = await seed(api);
  const before = await request.get(`/api/products?q=${group}`);
  expect((await before.json()).total).toBe(0);
  const review = await preview(api, importId);
  expect(review.count).toBe(2);
  expect(review.remainingDrafts).toBe(3);
  expect(review.invalid).toBe(0);
  expect(review.canActivate).toBe(true);
  expect(JSON.stringify(review).includes("PRIVATE_QA_ACTIVATION_SOURCE")).toBe(
    false,
  );
  expect(JSON.stringify(review).includes("Article_Price")).toBe(false);
  expect(
    (await (await request.get(`/api/products?q=${group}`)).json()).total,
  ).toBe(0);
  const committed = await mutation(
    api,
    "post",
    "/api/admin/products/activate",
    confirmation(review),
  );
  expect(committed.status()).toBe(200);
  expect((await committed.json()).data.activated).toBe(2);
  const catalog = await (await request.get(`/api/products?q=${group}`)).json();
  expect(catalog.total).toBe(2);
  expect(
    catalog.data.every(
      (row: { metrics: { dr: number | null }; version: number }) =>
        row.metrics.dr === null && row.version === 2,
    ),
  ).toBe(true);
  expect(JSON.stringify(catalog).includes("PRIVATE_QA_ACTIVATION_SOURCE")).toBe(
    false,
  );
  expect(
    (
      await mutation(
        api,
        "post",
        "/api/admin/products/activate",
        confirmation(review),
      )
    ).status(),
  ).toBe(409);
  const next = await preview(api, importId);
  expect(next.count).toBe(1);
  expect(next.remainingDrafts).toBe(1);
  const response = await api.get(
    `/api/admin/products?importId=${importId}&status=draft`,
  );
  expect((await response.json()).total).toBe(1);
  await api.dispose();
});
test("price/version changes invalidate the whole activation preview", async ({
  request,
}) => {
  const api = await actor((await fixtures()).admin);
  const { group, importId } = await seed(api);
  const review = await preview(api, importId);
  const selected = review.rows[0];
  const record = (
    await (await api.get(`/api/admin/products?importId=${importId}`)).json()
  ).data.find((row: { id: string }) => row.id === selected.id);
  const {
    id: _id,
    createdAt: _created,
    updatedAt: _updated,
    importId: _batch,
    ...input
  } = record;
  void _id;
  void _created;
  void _updated;
  void _batch;
  const changed = await mutation(
    api,
    "patch",
    `/api/admin/products/${selected.id}`,
    { ...input, priceCents: 8600 },
  );
  expect(changed.status()).toBe(200);
  expect(
    (
      await mutation(
        api,
        "post",
        "/api/admin/products/activate",
        confirmation(review),
      )
    ).status(),
  ).toBe(409);
  expect(
    (await (await request.get(`/api/products?q=${group}`)).json()).total,
  ).toBe(0);
  expect((await preview(api, importId)).remainingDrafts).toBe(3);
  await api.dispose();
});
test("admin review UI requires explicit acknowledgement and typed confirmation before activation", async ({
  page,
  context,
}, testInfo) => {
  test.setTimeout(120000);
  const accounts = await fixtures();
  const api = await actor(accounts.admin);
  const { importId } = await seed(api, 2);
  await context.addCookies((await api.storageState()).cookies);
  await page.goto("/admin/products/");
  await page.getByLabel("Completed import ID", { exact: true }).fill(importId);
  await page
    .getByLabel("Listings per activation batch", { exact: true })
    .fill("2");
  await page
    .getByRole("button", { name: "Preview activation", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Exact activation batch" }),
  ).toBeVisible();
  const commit = page.getByRole("button", {
    name: "Activate 2 reviewed listings",
    exact: true,
  });
  await expect(commit).toBeDisabled();
  await page
    .getByRole("checkbox", { name: /I reviewed these listings and prices/ })
    .check();
  await expect(commit).toBeDisabled();
  await page
    .getByLabel("Activation confirmation", { exact: true })
    .fill("ACTIVATE REVIEWED LISTINGS");
  await expect(commit).toBeEnabled();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  for (const width of [320, 375, 820, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
    ).toBe(false);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`activation-preview-${width}.png`),
      fullPage: true,
    });
  }
  await commit.click();
  await expect(page.getByText(/2 reviewed listings activated/)).toBeVisible();
  expect((await preview(api, importId)).count).toBe(0);
  await api.dispose();
});
