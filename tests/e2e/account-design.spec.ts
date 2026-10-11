import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function signedOut(page: Page) {
  await page.addInitScript(() =>
    localStorage.setItem("nr-analytics-consent-v1", "denied"),
  );
  await page.route("**/api/account/profile/", (route) =>
    route.fulfill({ status: 401, json: { error: "Sign in to continue." } }),
  );
  await page.route("**/api/auth/session/**", (route) =>
    route.fulfill({ json: null }),
  );
}

test("password visibility and registration keep the existing account flow", async ({
  page,
}) => {
  await signedOut(page);
  await page.goto("/my-account/");
  const password = page.getByLabel("Password", { exact: true });
  await password.fill("Synthetic-preview-password");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "text");
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "password");
  await page
    .getByRole("button", { name: "Create a customer account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Create your customer account" }),
  ).toBeVisible();
  await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
  await expect(password).toHaveValue("");
  await expect(password).toHaveAttribute("autocomplete", "new-password");
  await page
    .getByRole("button", {
      name: "Already have an account? Sign in",
      exact: true,
    })
    .click();
  await expect(password).toHaveAttribute("autocomplete", "current-password");
  await expect(
    page.getByRole("link", { name: "Forgot your password?", exact: true }),
  ).toHaveAttribute("href", "/my-account/forgot-password/");
});

for (const width of [320, 375, 1536])
  for (const theme of ["light", "dark"]) {
    test(`sign-in reference layout ${width}px ${theme}`, async ({
      page,
    }, info) => {
      await signedOut(page);
      await page.setViewportSize({ width, height: 1024 });
      await page.goto("/my-account/");
      await expect(
        page.getByRole("heading", { name: "Sign in to your account" }),
      ).toBeVisible();
      if (theme === "dark")
        await page
          .getByRole("button", { name: "Use dark appearance", exact: true })
          .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
      ).toBe(false);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        result.violations.map((issue) => ({
          id: issue.id,
          nodes: issue.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
      await page.screenshot({
        path: info.outputPath(`sign-in-${width}-${theme}.png`),
        fullPage: true,
      });
    });
  }
