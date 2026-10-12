import { test, expect } from "@playwright/test";
import { fixtures, key, origin } from "./helpers";
import { randomUUID } from "node:crypto";
import { setServers } from "node:dns";
import dotenv from "dotenv";
import { MongoClient, type Collection } from "mongodb";
import type { Product, ProductPage } from "../../lib/commerce/types";

const seeded: Product[] = [];
let client: MongoClient | undefined;
let products: Collection<Product> | undefined;

test.beforeAll(async () => {
  const { database } = await fixtures(); // Enforces loopback and an isolated _test database.
  dotenv.config({ quiet: true });
  setServers((process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8").split(","));
  const uri = process.env.MONGODB_URI || process.env.MOngodb_URI;
  if (!uri)
    throw new Error(
      "The isolated test database requires MongoDB configuration.",
    );
  client = await new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  }).connect();
  products = client.db(database).collection<Product>("commerce_products");
  const prefix = key("seo-pagination");
  const now = new Date().toISOString();
  for (let index = 0; index < 61; index++) {
    seeded.push({
      id: randomUUID(),
      version: 1,
      createdAt: now,
      updatedAt: now,
      externalId: null,
      domain: `https://${prefix}-${index}.com`,
      status: "active",
      country: "QA",
      category: prefix,
      language: "English",
      priceCents: 10000 + index,
      currency: "USD",
      metrics: {
        da: null,
        dr: null,
        tf: null,
        ur: null,
        traffic: null,
        referringDomains: null,
        backlinks: null,
        spamScore: null,
      },
      linkType: "",
      turnaround: "",
      requirements:
        "Synthetic SEO pagination fixture in the isolated test database.",
    });
  }
  await products.insertMany(seeded);
});

test.afterAll(async () => {
  try {
    if (products && seeded.length)
      await products.deleteMany({
        id: { $in: seeded.map((product) => product.id) },
      });
  } finally {
    await client?.close();
  }
});

test("old catalogue URLs redirect directly to crawlable, self-canonical pages", async ({
  request,
}) => {
  const inventory = await request.get("/api/products/?page=2&pageSize=20");
  expect(inventory.status()).toBe(200);
  expect(((await inventory.json()) as ProductPage).data.length).toBeGreaterThan(
    0,
  );
  for (const [source, destination] of [
    ["/?sort=domain&page=2&pageSize=20", "/page/2/"],
    ["/?page=2", "/page/2/"],
    ["/page/2/?sort=domain&pageSize=20&page=8", "/page/2/"],
    ["/page/1/", "/"],
  ]) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(new URL(response.headers().location, origin).pathname).toBe(
      destination,
    );
    const final = await request.get(destination, {
      maxRedirects: 0,
      headers: { "user-agent": "Googlebot" },
    });
    expect(final.status()).toBe(200);
    const html = await final.text();
    expect(html).toContain(
      `rel="canonical" href="https://nameretailer.com${destination}"`,
    );
    expect(html).toContain('name="robots" content="index, follow"');
    expect(html).toMatch(/<a\b[^>]*href="\/page\/(?:2|3)\/"/);
  }
  for (const path of ["/page/2/?sort=priceAsc", "/page/2/?pageSize=50"]) {
    const response = await request.get(path, {
      headers: { "user-agent": "Googlebot" },
    });
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(
      'name="robots" content="noindex, follow"',
    );
  }
  for (const path of ["/page/invalid/", "/page/10000/"])
    expect(
      (
        await request.get(path, { headers: { "user-agent": "Googlebot" } })
      ).status(),
    ).toBe(404);
});

test("pagination, Back, refresh, sorting and reset preserve catalogue state", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const expected = (await (
    await request.get("/api/products/?page=2&pageSize=20")
  ).json()) as ProductPage;
  await page.goto("/");
  const pagination = page.getByRole("navigation", {
    name: "Publication result pages",
  });
  await expect(
    pagination.getByRole("link", { name: "Page 2", exact: true }),
  ).toHaveAttribute("href", "/page/2/");
  await pagination
    .getByRole("link", { name: "Next page", exact: true })
    .click();
  await expect(page).toHaveURL(/\/page\/2\/$/);
  await expect(page.locator(".marketplace-row-number").first()).toHaveText(
    "21",
  );
  await page.reload();
  await expect(page.locator(".marketplace-table tbody tr")).toHaveCount(
    expected.data.length,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://nameretailer.com/page/2/",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index, follow",
  );
  const domain = expected.data[0].domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  await expect(
    page.locator(".marketplace-table tbody tr").first(),
  ).toContainText(domain);
  await pagination
    .getByRole("link", { name: "Next page", exact: true })
    .click();
  await expect(page).toHaveURL(/\/page\/3\/$/);
  await expect(page.locator(".marketplace-row-number").first()).toHaveText(
    "41",
  );
  await page.goBack();
  await expect(page).toHaveURL(/\/page\/2\/$/);
  await expect(page.locator(".marketplace-row-number").first()).toHaveText(
    "21",
  );
  await page
    .getByLabel("Sort publications", { exact: true })
    .selectOption("priceAsc");
  await expect(page).toHaveURL(/\/\?sort=priceAsc$/);
  await page.getByLabel("Results per page", { exact: true }).selectOption("50");
  await expect(page).toHaveURL(/\/\?pageSize=50&sort=priceAsc$/);
  await page.reload();
  await expect(
    page.getByLabel("Sort publications", { exact: true }),
  ).toHaveValue("priceAsc");
  await expect(
    page.getByLabel("Results per page", { exact: true }),
  ).toHaveValue("50");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  await page.getByRole("button", { name: "Reset All", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByLabel("Sort publications", { exact: true }),
  ).toHaveValue("domain");
  await expect(
    page.getByLabel("Results per page", { exact: true }),
  ).toHaveValue("20");
});
