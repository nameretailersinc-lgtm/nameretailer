import { expect, test } from "@playwright/test";

for (const slug of [
  "headlines-that-describe-the-article-instead-of-overselling-it",
  "search-console-and-analytics-answer-different-questions",
]) {
  test(`expanded buyer article has matching metadata and FAQ schema: ${slug}`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.goto(`/blog/${slug}/`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, follow",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://nameretailer.com/blog/${slug}/`,
    );
    await expect(
      page.getByRole("link", { name: "Fahad Shaikh", exact: true }).first(),
    ).toHaveAttribute("href", "/authors/fahad-shaikh/");
    const title = await page.title();
    expect(title.length).toBeGreaterThanOrEqual(50);
    expect(title.length).toBeLessThanOrEqual(60);
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description!.length).toBeGreaterThanOrEqual(140);
    expect(description!.length).toBeLessThanOrEqual(160);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      title,
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      title,
    );
    const schema = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((elements) =>
        elements.flatMap((element) => {
          const value = JSON.parse(element.textContent || "{}");
          return Array.isArray(value) ? value : value["@graph"] || [value];
        }),
      );
    expect(schema.some((node) => node["@type"] === "BreadcrumbList")).toBe(
      true,
    );
    expect(
      schema.some(
        (node) =>
          ["Article", "BlogPosting"].includes(node["@type"]) &&
          node.headline === title,
      ),
    ).toBe(true);
    const faq = schema.find((node) => node["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(3);
    const questions = page.locator(".guide-faq-item");
    await expect(questions).toHaveCount(3);
    for (let index = 0; index < 3; index++) {
      await expect(questions.nth(index).locator("summary")).toContainText(
        faq.mainEntity[index].name,
      );
      await expect(questions.nth(index).locator("p")).toHaveText(
        faq.mainEntity[index].acceptedAnswer.text,
      );
    }
  });
}
