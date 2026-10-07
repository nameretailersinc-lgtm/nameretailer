import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type {
  ArticleFileSummary,
  CartSelection,
  CartView,
  PlacementOptions,
} from "../../lib/commerce/cart-types";

const productId = "bdc43825-d1ac-4d26-8c12-ec1bf1b95c47";
const route = `/cart/?product=${productId}`;
const options: PlacementOptions = {
  productId,
  productVersion: 1,
  domain: "https://0000yic.com",
  placementCents: 8844,
  currency: "USD",
  writingOptions: [
    { words: 500, priceCents: 1200 },
    { words: 750, priceCents: 1800 },
    { words: 1000, priceCents: 2400 },
  ],
  requirements: "",
  turnaround: "4 days",
  linkType: "03 DoFollow links",
};

// These browser checks never mutate the local database or upload real files.
async function mockPlacement(page: Page, signedIn = true) {
  const state: {
    cart: CartView;
    files: ArticleFileSummary[];
    selection: CartSelection | null;
    saveError: boolean;
  } = {
    cart: {
      version: 0,
      currency: "USD",
      items: [],
      totalCents: 0,
      checkoutAvailable: false,
    },
    files: [],
    selection: null,
    saveError: false,
  };
  await page.route("**/api/**", async (request) => {
    const path = new URL(request.request().url()).pathname;
    const method = request.request().method();
    const json = (data: unknown, status = 200) =>
      request.fulfill({ status, json: data });
    if (path === "/api/account/profile/")
      return signedIn
        ? json({
            user: {
              id: "fixture-customer",
              name: "Preview customer",
              email: "preview@example.com",
              role: "customer",
              active: true,
              createdAt: "2026-01-01T00:00:00Z",
            },
          })
        : json({ error: "Sign in to continue." }, 401);
    if (path === "/api/account/csrf/")
      return json({ token: "browser-fixture-token" });
    if (/^\/api\/products\/[^/]+\/options\/$/.test(path)) return json(options);
    if (path === "/api/cart/") {
      if (method === "PUT") {
        if (state.saveError)
          return json(
            {
              error:
                "The publication price changed. Review current options and try again.",
            },
            409,
          );
        const data = request.request().postDataJSON() as {
          item: CartSelection;
        };
        state.selection = data.item;
        const writingCents =
          options.writingOptions.find(
            (option) => option.words === data.item.writingWords,
          )?.priceCents || 0;
        state.cart = {
          ...state.cart,
          version: state.cart.version + 1,
          totalCents: options.placementCents + writingCents,
          items: [
            {
              ...data.item,
              domain: options.domain,
              status: "ready",
              placementCents: options.placementCents,
              writingCents,
              totalCents: options.placementCents + writingCents,
              options,
              file:
                state.files.find(
                  (file) => file.id === data.item.brief?.fileId,
                ) || null,
            },
          ],
        };
      }
      return json(state.cart);
    }
    if (path === "/api/cart/files/") {
      if (method === "POST") {
        const file = {
          id: "93883a73-62ac-4c2d-9b20-6be7fe7ecad6",
          name: "article.txt",
          size: 28,
          expiresAt: "2026-10-13T00:00:00Z",
        };
        state.files = [file];
        return json(file, 201);
      }
      return json(state.files);
    }
    if (path.startsWith("/api/cart/files/") && method === "DELETE") {
      state.files = [];
      return json({ success: true });
    }
    if (path === "/api/checkout/")
      return json({
        draft: null,
        cart: state.cart,
        issues: [],
        paymentAvailable: false,
        orderSubmissionAvailable: false,
      });
    if (method !== "GET") return request.abort();
    return request.continue();
  });
  return state;
}

async function openPlacement(page: Page) {
  await page.goto(route);
  const form = page.getByRole("region", { name: "Configure placement" });
  await expect(
    form.getByRole("heading", { name: "Create Your Placement Brief" }),
  ).toBeVisible();
  return form;
}

test.describe("reference placement form", () => {
  test("formatting, writing prices and save continue to checkout with the correct brief", async ({
    page,
  }) => {
    const state = await mockPlacement(page);
    const form = await openPlacement(page);
    await form.getByLabel("Promoted URL").fill("https://example.com/article/");
    await form.getByLabel("Keyword or anchor text").fill("productivity tools");
    const article = form.getByLabel("Your article text");
    await article.fill("A clear article");
    await article.evaluate((element: HTMLTextAreaElement) =>
      element.setSelectionRange(8, 15),
    );
    await form.getByRole("button", { name: "Bold", exact: true }).click();
    await expect(article).toHaveValue("A clear **article**");
    await expect(article).toBeFocused();
    await form.getByRole("radio", { name: /Link \+ article/ }).check();
    await expect(form.getByLabel("Content length")).toHaveValue("500");
    await expect(form.locator(".placement-total")).toContainText("$100.44");
    await form.getByLabel("Content length").selectOption("1000");
    await expect(form.locator(".placement-total")).toContainText("$112.44");
    await expect(form.locator(".placement-price-breakdown")).toContainText(
      "$24.00",
    );
    await form.getByRole("button", { name: "Save and continue" }).click();
    await expect(page).toHaveURL(/\/checkout\/$/);
    expect(state.selection?.writingWords).toBe(1000);
    expect(state.selection?.brief?.articleText).toBe("A clear **article**");
    expect(state.selection?.brief?.promotedUrl).toBe(
      "https://example.com/article/",
    );
    expect(state.selection?.brief?.fileId).toBeNull();
  });

  test("upload controls support choosing, clearing, uploading and removing an article", async ({
    page,
  }) => {
    const state = await mockPlacement(page);
    const form = await openPlacement(page);
    await form
      .getByRole("button", { name: "Upload file", exact: true })
      .click();
    const input = form.getByLabel("Or upload article");
    await expect(input).toBeFocused();
    await input.setInputFiles({
      name: "article.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("A private test article only."),
    });
    await form.getByRole("button", { name: "Clear selection" }).click();
    await expect(input).toHaveValue("");
    await expect(
      form.getByRole("button", { name: "Upload selected article" }),
    ).toHaveCount(0);
    await input.setInputFiles({
      name: "article.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("A private test article only."),
    });
    await form.getByRole("button", { name: "Upload selected article" }).click();
    await expect(
      form.getByRole("link", { name: "Download article.txt" }),
    ).toBeVisible();
    await expect(form.getByLabel("Your article text")).not.toHaveAttribute(
      "required",
      "",
    );
    await form.getByRole("button", { name: "Remove file" }).click();
    await expect(
      form.getByRole("link", { name: "Download article.txt" }),
    ).toHaveCount(0);
    await expect(form.getByLabel("Your article text")).toHaveAttribute(
      "required",
      "",
    );
    expect(state.files).toEqual([]);
  });

  test("a rejected save keeps the brief available for review and retry", async ({
    page,
  }) => {
    const state = await mockPlacement(page);
    state.saveError = true;
    const form = await openPlacement(page);
    await form.getByLabel("Promoted URL").fill("https://example.com/article/");
    await form.getByLabel("Keyword or anchor text").fill("productivity tools");
    await form
      .getByLabel("Your article text")
      .fill("Keep this article after a failed save.");
    await form.getByRole("button", { name: "Save and continue" }).click();
    await expect(page.locator(".customer-error")).toContainText(
      "publication price changed",
    );
    await expect(page).toHaveURL(/\/cart\//);
    await expect(form.getByLabel("Your article text")).toHaveValue(
      "Keep this article after a failed save.",
    );
    state.saveError = false;
    await form.getByRole("button", { name: "Save and continue" }).click();
    await expect(page).toHaveURL(/\/checkout\/$/);
  });

  test("signed-out visitors can inspect prices and receive the correct sign-in return link", async ({
    page,
  }) => {
    await mockPlacement(page, false);
    const form = await openPlacement(page);
    await expect(form.getByLabel("Or upload article")).toBeDisabled();
    await expect(
      form.getByRole("link", { name: /Sign in to save/ }),
    ).toHaveAttribute(
      "href",
      `/my-account/?returnTo=cart&product=${productId}`,
    );
    await expect(form.locator(".placement-total")).toContainText("$88.44");
  });

  for (const width of [375, 1280]) {
    test(`the shared purchase dialog keeps the brief and total usable at ${width}px`, async ({
      page,
    }) => {
      await mockPlacement(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/products/?q=0000yic.com");
      const buy = page.locator(".placement-buy:visible").first();
      await buy.click();
      const dialog = page.getByRole("dialog", {
        name: "Create a placement brief",
      });
      await expect(dialog.getByLabel("Promoted URL")).toBeVisible();
      await dialog.getByRole("radio", { name: /Link \+ article/ }).check();
      await expect(dialog.locator(".placement-total")).toContainText("$100.44");
      const save = dialog.getByRole("button", {
        name: "Save placement to cart",
      });
      await save.scrollIntoViewIfNeeded();
      await expect(save).toBeVisible();
      expect(
        await dialog.evaluate(
          (element) => element.scrollWidth <= element.clientWidth + 1,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .include(".placement-dialog")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations.map((issue) => issue.id),
      ).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(buy).toBeFocused();
    });
  }

  for (const width of [320, 375, 768, 1280, 1536]) {
    test(`accessible placement form reflows at ${width}px`, async ({
      page,
    }, info) => {
      await mockPlacement(page);
      await page.setViewportSize({ width, height: 1050 });
      const form = await openPlacement(page);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      const inputBox = await form.locator(".placement-inputs").boundingBox();
      const totalBox = await form.locator(".placement-save-bar").boundingBox();
      expect(totalBox!.y).toBeGreaterThanOrEqual(
        inputBox!.y + inputBox!.height - 1,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        accessibility.violations.map((issue) => ({
          id: issue.id,
          nodes: issue.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
      await form.getByRole("radio", { name: /Link \+ article/ }).check();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await form.getByRole("radio", { name: /Link only/ }).check();
      await page.screenshot({
        path: info.outputPath(`placement-${width}.png`),
        fullPage: true,
      });
    });
  }

  test("the compact mobile form remains accessible in dark mode", async ({
    page,
  }) => {
    await mockPlacement(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await openPlacement(page);
    await page.getByRole("button", { name: "Use dark appearance" }).click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-site-theme",
      "dark",
    );
    await page.setViewportSize({ width: 320, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations.map((issue) => ({
        id: issue.id,
        nodes: issue.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  });
});
