import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";
import {
  actor,
  createDraft,
  fixtures,
  key,
  validBody,
  mutation,
} from "./helpers";

async function authenticatedPage(page: Page) {
  const accounts = await fixtures();
  const api = await actor(accounts.admin);
  const state = await api.storageState();
  await page.context().addCookies(state.cookies);
  await api.dispose();
}

async function checkSemantics(page: Page, allowErrorDemo = false) {
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  if (!allowErrorDemo)
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  const unlabelled = await page
    .locator(
      "main input:not([type=hidden]):not([type=checkbox]):not([type=file]), main select, main textarea",
    )
    .evaluateAll(
      (elements) =>
        elements.filter((element) => {
          const control = element as HTMLInputElement;
          return (
            !control.labels?.length &&
            !control.getAttribute("aria-label") &&
            !control.getAttribute("aria-labelledby")
          );
        }).length,
    );
  expect(unlabelled, "Every visible form field has an associated label").toBe(
    0,
  );
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(
    overflow,
    "Page reflows without document-level horizontal overflow",
  ).toBe(false);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    result.violations.map((issue) => ({
      id: issue.id,
      impact: issue.impact,
      targets: issue.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
}

test("login accepts password-manager input, reports invalid credentials and signs in", async ({
  page,
}) => {
  const accounts = await fixtures();
  await page.goto("/admin/login/");
  await page.getByLabel("Email", { exact: true }).fill(accounts.admin.email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("incorrect-test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Unable to sign in",
  );
  await expect(page.getByRole("main").getByRole("alert")).toBeFocused();
  await page
    .getByLabel("Password", { exact: true })
    .fill(accounts.admin.password);
  await page.getByLabel("Show password").check();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("keyboard skip link reaches main; mobile menu opens and closes after navigation", async ({
  page,
}) => {
  await authenticatedPage(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/admin/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("main");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("navigation", { name: "Workspace navigation" })
    .getByRole("link", { name: "Users", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Users", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Menu", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("user list search/filter and create/edit workflow persists actual server data", async ({
  page,
}) => {
  await authenticatedPage(page);
  await page.goto("/admin/users/");
  await expect(page.getByRole("table")).toBeVisible();
  await page.getByRole("button", { name: "Create user", exact: true }).click();
  const name = key("ui-user");
  await page.getByLabel("User name", { exact: true }).fill(name);
  await page
    .getByLabel("User email", { exact: true })
    .fill(`${name}@example.invalid`);
  await page
    .getByRole("combobox", { name: "User role", exact: true })
    .selectOption("author");
  await page
    .getByLabel(/^Initial password/)
    .fill(`Local-only-${key("password")}`);
  await page.getByRole("button", { name: "Save user", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "User saved." }),
  ).toBeVisible();
  await page.getByLabel("Search users").fill(name);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("table")).toContainText(name);
  await page.getByLabel("Role filter").selectOption("editor");
  await expect(page.getByText("No users match your search.")).toBeVisible();
  await page.getByLabel("Role filter").selectOption("author");
  await page.getByRole("button", { name: `Edit ${name}`, exact: true }).click();
  await page.getByLabel("User name", { exact: true }).fill(`${name} revised`);
  await page.getByRole("button", { name: "Save user", exact: true }).click();
  await expect(page.getByRole("table")).toContainText(`${name} revised`);
});

test("settings reports successful persistence and protects an unsaved navigation", async ({
  page,
}) => {
  await authenticatedPage(page);
  await page.goto("/admin/settings/");
  const brand = page.getByLabel("Brand name", { exact: true });
  await expect(brand).toBeVisible();
  const original = await brand.inputValue();
  await brand.fill("Name Retailer QA");
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Site settings saved.");
  await page.reload();
  await expect(brand).toHaveValue("Name Retailer QA");
  await brand.fill("Unsaved QA change");
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("unsaved");
    await dialog.dismiss();
  });
  await page
    .getByRole("navigation", { name: "Workspace navigation" })
    .getByRole("link", { name: "Users", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/settings\/$/);
  await brand.fill(original);
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Site settings saved.");
});

test("content list searches, sorts, paginates and resets filters with actual records", async ({
  page,
}) => {
  test.setTimeout(120000);
  const accounts = await fixtures();
  const api = await actor(accounts.admin);
  const prefix = key("ui-paging");
  for (let index = 0; index < 21; index++)
    await createDraft(api, `${prefix}-${String(index).padStart(2, "0")}`);
  await api.dispose();
  await authenticatedPage(page);
  await page.goto("/admin/content/");
  await page.getByLabel("Search records").fill(prefix);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Sort records", exact: true })
    .selectOption("title");
  await page
    .getByRole("combobox", { name: "Sort direction", exact: true })
    .selectOption("asc");
  await expect(page.getByRole("table")).toContainText("21 matching content");
  await expect(
    page.getByRole("table").getByRole("rowheader").first(),
  ).toContainText(`${prefix}-00`);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("table").getByRole("rowheader")).toHaveCount(1);
  await expect(page.getByRole("table")).toContainText(`${prefix}-20`);
  await expect(
    page.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Search records").fill(key("no-result"));
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByText("No records match these criteria."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reset filters", exact: true })
    .click();
  await expect(page.getByRole("table")).toBeVisible();
});

test("media upload makes the informative/decorative decision explicit and persists optimized image", async ({
  page,
}) => {
  await authenticatedPage(page);
  await page.goto("/admin/media/");
  const name = `${key("ui-media")}.png`;
  const png = await sharp({
    create: { width: 4, height: 4, channels: 3, background: "#195844" },
  })
    .png()
    .toBuffer();
  await page
    .getByLabel(/^Image file/)
    .setInputFiles({ name, mimeType: "image/png", buffer: png });
  await expect(page.getByLabel("Upload alternative text")).toHaveAttribute(
    "required",
    "",
  );
  await page
    .getByLabel("Decorative upload (empty alternative text)", { exact: true })
    .check();
  await expect(page.getByLabel("Upload alternative text")).toBeDisabled();
  await page.getByLabel("Upload folder").fill("qa");
  await page.getByRole("button", { name: "Upload image", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Image uploaded and optimized" }),
  ).toBeVisible();
  await page.getByLabel("Search records").fill(name);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("table")).toContainText(name);
  await expect(page.getByRole("table")).toContainText("Decorative image");
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
});

test("redirect CSV reports invalid input then saves disabled configuration only", async ({
  page,
}) => {
  await authenticatedPage(page);
  await page.goto("/admin/redirects/");
  const prefix = key("ui-redirect");
  await page
    .getByLabel("Redirect CSV")
    .fill(`source,target,statusCode\n/${prefix}/,https://foreign.example/,301`);
  await page.getByRole("button", { name: "Import CSV", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await expect(page.getByRole("main").getByRole("alert")).toBeFocused();
  await page
    .getByLabel("Redirect CSV")
    .fill(`source,target,statusCode\n/${prefix}/,/qa-destination/,301`);
  await page.getByRole("button", { name: "Import CSV", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Redirect configuration imported" }),
  ).toBeVisible();
  await page.getByLabel("Search records").fill(prefix);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("table")).toContainText("Disabled");
  await expect(page.getByRole("table")).toContainText(prefix);
  expect(
    (await page.request.get(`/${prefix}/`, { maxRedirects: 0 })).status(),
  ).toBe(404);
});

test("taxonomy and menu builders save values, including keyboard-friendly item ordering", async ({
  page,
}) => {
  await authenticatedPage(page);
  await page.goto("/admin/categories/");
  const title = key("ui-category");
  await page
    .getByRole("button", { name: "Create record", exact: true })
    .click();
  await page.getByLabel("Record title").fill(title);
  await page
    .getByLabel("Description")
    .fill("An isolated QA category, not a real editorial classification.");
  await page
    .getByRole("combobox", { name: "Record status", exact: true })
    .selectOption("active");
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Record saved." }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toContainText(title);
  await page.goto("/admin/menus/");
  const menuTitle = key("ui-menu");
  await page
    .getByRole("button", { name: "Create record", exact: true })
    .click();
  await page.getByLabel("Record title").fill(menuTitle);
  await page
    .getByRole("button", { name: "Add menu item", exact: true })
    .click();
  await page.getByLabel("Menu label 1.1", { exact: true }).fill("QA first");
  await page.getByLabel("Menu URL 1.1", { exact: true }).fill("/qa-first/");
  await page
    .getByRole("button", { name: "Add menu item", exact: true })
    .click();
  await page.getByLabel("Menu label 1.2", { exact: true }).fill("QA second");
  await page.getByLabel("Menu URL 1.2", { exact: true }).fill("/qa-second/");
  await page
    .getByRole("button", { name: "Move up", exact: true })
    .nth(1)
    .click();
  await expect(page.getByLabel("Menu label 1.1", { exact: true })).toHaveValue(
    "QA second",
  );
  await page.getByRole("button", { name: "Save record", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Record saved." }),
  ).toBeVisible();
  const accounts = await fixtures();
  const api = await actor(accounts.admin);
  const records = (await (
    await api.get(`/api/admin/records/menus?q=${menuTitle}`)
  ).json()) as { data: { data: { items: { label: string }[] } }[] };
  expect(records.data[0].data.items.map((item) => item.label)).toEqual([
    "QA second",
    "QA first",
  ]);
  await api.dispose();
});

test("editor saves a real draft, publishes, previews and restores an earlier revision", async ({
  page,
}) => {
  test.setTimeout(120000);
  await authenticatedPage(page);
  await page.goto("/admin/content/new/");
  const title = key("ui-content");
  await page.getByLabel("Content title", { exact: true }).fill(title);
  await page.getByRole("button", { name: "Edit HTML", exact: true }).click();
  await page.getByLabel(/^HTML source/).fill(validBody);
  await page
    .getByRole("button", { name: "Apply HTML to editor", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Body (rich text)", exact: true }),
  ).toContainText("Documented fixture publishing workflow");
  await page.getByLabel(/^SEO title/).fill(title);
  await page
    .getByLabel(/^Meta description/)
    .fill(
      "An isolated QA page demonstrates saving, publication and history restoration without public content activation.",
    );
  await page.getByLabel("Allow search indexing", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Add FAQ", exact: true }).click();
  await page
    .getByLabel("FAQ question 1", { exact: true })
    .fill("Is this a real customer-facing page?");
  await page
    .getByLabel("FAQ answer 1", { exact: true })
    .fill("No. This is clearly labelled isolated quality-assurance content.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Content saved as draft." }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/content\/[0-9a-f-]+\/(?:\?.*)?$/);
  await page
    .getByLabel("Content title", { exact: true })
    .fill(`${title} revised`);
  await page.keyboard.press("Control+s");
  await expect(
    page.getByRole("status").filter({ hasText: "Saved version 2" }),
  ).toBeVisible();
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("Publish");
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Content saved as published." }),
  ).toBeVisible();
  const [preview] = await Promise.all([
    page.waitForEvent("popup"),
    page
      .getByRole("link", { name: "Preview saved content", exact: true })
      .click(),
  ]);
  await expect(preview.getByRole("heading", { level: 1 })).toHaveText(
    `${title} revised`,
  );
  await expect(preview.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await preview.close();
  await page.getByRole("button", { name: "Revisions", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Revision history", exact: true }),
  ).toBeVisible();
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("Restore");
    await dialog.accept();
  });
  await page
    .getByRole("button", { name: "Restore version 1", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Revision restored as a new saved version." }),
  ).toBeVisible();
  await expect(page.getByLabel("Content title", { exact: true })).toHaveValue(
    title,
  );
  await page.reload();
  await expect(page.locator("main .loading")).toHaveCount(0, {
    timeout: 30000,
  });
  await expect(page.getByLabel("Content title", { exact: true })).toHaveValue(
    title,
    { timeout: 30000 },
  );
  await expect(page.getByLabel("FAQ answer 1", { exact: true })).toHaveValue(
    "No. This is clearly labelled isolated quality-assurance content.",
  );
});

test("user sorting and exact audit action filters return the selected records", async ({
  page,
}) => {
  await authenticatedPage(page);
  const account = (await fixtures()).admin;
  const api = await actor(account);
  const prefix = key("ui-sort-users");
  for (const suffix of ["b", "a"]) {
    const name = `${prefix}-${suffix}`;
    const created = await mutation(api, "post", "/api/admin/users", {
      name,
      email: `${name}@example.invalid`,
      password: `Local-only-${key("password")}`,
      role: "author",
      active: true,
    });
    expect(created.status()).toBe(201);
  }
  await api.dispose();
  await page.goto("/admin/users/");
  await page.getByLabel("Search users").fill(prefix);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Sort users", exact: true })
    .selectOption("name");
  await page
    .getByRole("combobox", { name: "User sort direction", exact: true })
    .selectOption("asc");
  await expect(
    page.getByRole("table").getByRole("rowheader").first(),
  ).toHaveText(`${prefix}-a`);
  await page
    .getByRole("combobox", { name: "User sort direction", exact: true })
    .selectOption("desc");
  await expect(
    page.getByRole("table").getByRole("rowheader").first(),
  ).toHaveText(`${prefix}-b`);
  await page.goto("/admin/audit/");
  await page
    .getByRole("combobox", { name: "Action filter", exact: true })
    .selectOption("user.create");
  await expect(page.locator("main .loading")).toHaveCount(0, {
    timeout: 30000,
  });
  const actions = await page
    .getByRole("table")
    .getByRole("rowheader")
    .allTextContents();
  expect(actions.length).toBeGreaterThan(0);
  expect(actions.every((action) => action.trim() === "user.create")).toBe(true);
});

test("editing a duplicated record changes the copy rather than overwriting the original", async ({
  page,
}) => {
  await authenticatedPage(page);
  const api = await actor((await fixtures()).admin);
  const original = await createDraft(api, key("ui-duplicate"));
  await page.goto(`/admin/content/${original.id}/`);
  await expect(page.getByLabel("Content title", { exact: true })).toHaveValue(
    original.title,
    { timeout: 30000 },
  );
  await page
    .getByRole("button", { name: "Duplicate content", exact: true })
    .click();
  await page.waitForURL(
    (url) =>
      /^\/admin\/content\/[0-9a-f-]+\/$/.test(url.pathname) &&
      !url.pathname.includes(original.id),
  );
  const copyId = new URL(page.url()).pathname.split("/").filter(Boolean)[2];
  await expect(page.getByLabel("Content title", { exact: true })).toHaveValue(
    `${original.title} (copy)`,
    { timeout: 30000 },
  );
  await page
    .getByLabel("Content title", { exact: true })
    .fill(`${original.title} copy revised`);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Content saved as draft." }),
  ).toBeVisible();
  const source = (
    (await (
      await api.get(`/api/admin/records/content/${original.id}`)
    ).json()) as { data: { title: string; version: number } }
  ).data;
  const copy = (
    (await (await api.get(`/api/admin/records/content/${copyId}`)).json()) as {
      data: { title: string; version: number };
    }
  ).data;
  expect(source.title).toBe(original.title);
  expect(source.version).toBe(original.version);
  expect(copy.title).toBe(`${original.title} copy revised`);
  expect(copy.version).toBe(2);
  await api.dispose();
});

test("dashboard warning preview stays bounded while reporting the actual larger dataset", async ({
  page,
}) => {
  await authenticatedPage(page);
  const api = await actor((await fixtures()).admin);
  const response = (await (await api.get("/api/admin/dashboard")).json()) as {
    data: { warnings: unknown[] };
  };
  expect(response.data.warnings.length).toBeGreaterThan(10);
  await api.dispose();
  await page.goto("/admin/");
  await expect(page.locator("main .loading")).toHaveCount(0, {
    timeout: 30000,
  });
  const panel = page
    .getByRole("heading", { name: "SEO & editorial checks", exact: true })
    .locator("..");
  await expect(panel.getByRole("listitem")).toHaveCount(10);
  await expect(panel).toContainText(
    `Showing 10 of ${response.data.warnings.length} current warnings.`,
  );
  await expect(
    panel.getByRole("link", { name: "Review content", exact: true }),
  ).toHaveAttribute("href", "/admin/content/");
});

test("mobile content table preserves a readable title width and supports keyboard horizontal scrolling", async ({
  page,
}) => {
  await authenticatedPage(page);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/admin/content/");
  const region = page.getByRole("region", { name: /Content records table/ });
  await expect(region).toBeVisible();
  await expect(region).toHaveAttribute("tabindex", "0");
  const title = page.getByRole("table").getByRole("rowheader").first();
  const box = await title.boundingBox();
  expect(box?.width || 0).toBeGreaterThanOrEqual(220);
  await region.focus();
  await expect(region).toBeFocused();
  const before = await region.evaluate((element) => element.scrollLeft);
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => region.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(before);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    ),
  ).toBe(false);
});

test.describe("admin template semantics, reflow and targeted axe", () => {
  for (const width of [320, 375, 1280]) {
    test(`all staff screens at ${width}px`, async ({ page }, testInfo) => {
      test.setTimeout(180000);
      await authenticatedPage(page);
      await page.setViewportSize({ width, height: 900 });
      const accounts = await fixtures();
      const api = await actor(accounts.admin);
      const record = await createDraft(api);
      await api.dispose();
      const paths = [
        "/admin/",
        "/admin/content/",
        "/admin/content/new/",
        `/admin/content/${record.id}/`,
        "/admin/categories/",
        "/admin/tags/",
        "/admin/authors/",
        "/admin/media/",
        "/admin/redirects/",
        "/admin/notFound/",
        "/admin/menus/",
        "/admin/sections/",
        "/admin/widgets/",
        "/admin/leads/",
        "/admin/subscribers/",
        "/admin/settings/",
        "/admin/users/",
        "/admin/audit/",
        "/design-system/",
      ];
      for (const path of paths) {
        await test.step(path, async () => {
          await page.goto(path);
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
          await expect(page.locator("main .loading")).toHaveCount(0, {
            timeout: 30000,
          });
          await checkSemantics(page, path === "/design-system/");
          if (
            [375, 1280].includes(width) &&
            [
              "/admin/",
              "/admin/content/",
              "/admin/content/new/",
              "/admin/media/",
              "/admin/redirects/",
            ].includes(path)
          ) {
            const name = `${path.split("/").filter(Boolean).join("-")}-${width}`;
            const screenshot = testInfo.outputPath(`${name}.png`);
            await page.screenshot({ path: screenshot, fullPage: true });
            await testInfo.attach(name, {
              path: screenshot,
              contentType: "image/png",
            });
          }
        });
      }
    });
  }
});

test("anonymous login and reset templates have labels, landmarks and no axe violations", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [320, 375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/admin/login/",
      "/admin/forgot-password/",
      "/admin/reset-password/",
    ]) {
      await page.goto(path);
      await checkSemantics(page);
    }
  }
});
