import { test, expect, request as requests } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  rangeQuery,
  marketplaceGroups,
  marketplaceRanges,
} from "../../lib/commerce/marketplace-ranges";
import { MIN_DIRECTORY_LISTINGS } from "../../lib/commerce/catalogue-statistics";
import { fixtures, key, mutation, origin, signIn } from "./helpers";

test.beforeAll(async () => {
  expect(origin).toBe("http://localhost:3003");
  expect((await fixtures()).database).toMatch(/_test(?:_|$)/);
});

test("DA, DR, traffic and price bounds include endpoints, exclude missing/outside values and validate ranges through the API", async ({
  request,
}) => {
  const admin = await requests.newContext({ baseURL: origin });
  await signIn(admin, (await fixtures()).admin);
  const prefix = key("range");
  for (const { da, dr, traffic, priceCents } of [
    { da: null, dr: null, traffic: null, priceCents: 4999 },
    { da: 1, dr: 20, traffic: 50000, priceCents: 5000 },
    { da: 10, dr: 50, traffic: 100000, priceCents: 10000 },
    { da: 11, dr: 51, traffic: 100001, priceCents: 10001 },
  ]) {
    const response = await mutation(admin, "post", "/api/admin/products/", {
      externalId: null,
      domain: `https://${prefix}-${da ?? "missing"}.com/`,
      status: "active",
      country: "QA",
      language: "English",
      category: prefix,
      priceCents,
      currency: "USD",
      metrics: {
        da,
        dr,
        traffic,
        tf: null,
        ur: null,
        backlinks: null,
        referringDomains: null,
        spamScore: null,
      },
      linkType: "",
      turnaround: "",
      requirements: "Synthetic range fixture, not real inventory.",
    });
    expect(response.status()).toBe(201);
  }
  const response = await request.get(
    `/api/products/?category=${prefix}&minDa=1&maxDa=10`,
  );
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.total).toBe(2);
  expect(
    data.data
      .map((product: { metrics: { da: number } }) => product.metrics.da)
      .sort((a: number, b: number) => a - b),
  ).toEqual([1, 10]);
  for (const query of [
    "minDa=11&maxDa=10",
    "maxDr=101",
    "minTraffic=100&maxTraffic=99",
    "minPrice=101&maxPrice=100",
  ])
    expect((await request.get(`/api/products/?${query}`)).status()).toBe(422);
  for (const [query, expected] of [
    ["minDr=20&maxDr=50", 2],
    ["minTraffic=50000&maxTraffic=100000", 2],
    ["minPrice=50&maxPrice=100", 2],
    ["minPrice=100&maxPrice=100", 1],
    ["minPrice=100.01", 1],
    ["maxDr=20", 1],
    ["maxTraffic=50000", 1],
  ] as const) {
    const result = await request.get(
      `/api/products/?category=${prefix}&${query}`,
    );
    expect(result.status()).toBe(200);
    expect((await result.json()).total).toBe(expected);
  }
  await admin.dispose();
});

test("all canonical ranges render with their own title and canonical; tools and unknown routes still work", async ({
  request,
}) => {
  for (const range of marketplaceRanges) {
    const response = await request.get(`/${range.slug}/`);
    expect(response.status(), range.slug).toBe(200);
    const html = await response.text();
    expect(html).toContain(range.title);
    expect(html).toContain(`https://nameretailer.com/${range.slug}/`);
    const inventory = await (
      await request.get(`/api/products/?${rangeQuery("", range)}`)
    ).json();
    expect(html).toMatch(
      inventory.total < MIN_DIRECTORY_LISTINGS
        ? /name="robots" content="noindex, follow"/
        : /name="robots" content="index, follow"/,
    );
  }
  expect((await request.get("/text-case-converter/")).status()).toBe(200);
  expect(
    (await request.get("/not-a-tool-or-marketplace-range/")).status(),
  ).toBe(404);
});

for (const width of [320, 375, 768, 1280])
  test(`marketplace navigation and bounded filters are accessible at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/products/");
    const trigger = page.getByRole("button", {
      name: "Browse marketplace",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("region", { name: "Marketplace ranges" });
    await expect(menu).toBeVisible();
    for (const group of marketplaceGroups) {
      const category = menu.getByRole("region", {
        name: group.title,
        exact: true,
      });
      for (const range of group.ranges)
        await expect(
          category.getByRole("link", { name: range.label, exact: true }),
        ).toHaveAttribute("href", `/${range.slug}/`);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.getByRole("link", { name: "DA 1–10", exact: true }).click();
    await expect(page).toHaveURL(/\/da-1-to-10\//);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Guest post sites: DA 1–10",
    );
    await expect(page.getByLabel("Selected marketplace range")).toBeVisible();
    if (width <= 800)
      await page.locator(".marketplace-filter-panel > summary").click();
    await expect(
      page.getByRole("spinbutton", { name: "Minimum DA", exact: true }),
    ).toHaveValue("1");
    await expect(
      page.getByRole("spinbutton", { name: "Maximum DA", exact: true }),
    ).toHaveValue("10");
    await expect(
      page.getByRole("spinbutton", { name: "Maximum DA", exact: true }),
    ).toBeDisabled();
    const apiRequest = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/api/products/" &&
        response.status() === 200 &&
        new URL(response.url()).searchParams.get("sort") === "priceAsc",
    );
    await page.getByLabel("Sort publications").selectOption("priceAsc");
    const params = new URL((await apiRequest).url()).searchParams;
    expect(params.get("minDa")).toBe("1");
    expect(params.get("maxDa")).toBe("10");
    await page.getByLabel("Results per page").selectOption("20");
    await expect(page).toHaveURL(/pageSize=20/);
    await page.goto("/da-1-to-10/?q=range-reset-check&page=2");
    const resetRequest = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname.startsWith("/api/products") &&
        !url.pathname.includes("facets") &&
        url.searchParams.get("minDa") === "1" &&
        !url.searchParams.has("q")
      );
    });
    await page.getByRole("button", { name: "Reset All", exact: true }).click();
    const resetParams = new URL((await resetRequest).url()).searchParams;
    expect(resetParams.get("maxDa")).toBe("10");
    expect(resetParams.get("page")).toBe("1");
    await expect(page).toHaveURL(/\/da-1-to-10\/$/);
    await page.goto("/da-1-to-10/?minDa=0&maxDa=100");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Guest post sites: DA 1–10",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
