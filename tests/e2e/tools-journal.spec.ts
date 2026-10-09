import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";
import { tools } from "../../lib/tools/catalog";
import { imageAction } from "../../lib/tools/presentation";
import { technicalArticleSlugs } from "../../lib/blog/indexing-policy";
import { blogLibrary } from "../../lib/blog/library";
import { fixtures, origin, actor, mutation, key } from "./helpers";
const domain = key("rating") + ".com";
test.beforeAll(async () => {
  const api = await actor((await fixtures()).admin);
  expect(
    (
      await mutation(api, "post", "/api/admin/products/", {
        externalId: null,
        domain,
        language: "English",
        country: "QA",
        category: "QA",
        priceCents: 100,
        currency: "USD",
        status: "active",
        metrics: {
          dr: 0,
          da: 42,
          tf: null,
          ur: null,
          traffic: null,
          referringDomains: null,
          backlinks: null,
          spamScore: null,
        },
        linkType: "",
        turnaround: "",
        requirements: "Isolated tool lookup fixture.",
      })
    ).status(),
  ).toBe(201);
});
for (const tool of tools.filter((item) => item.slug !== "word-counter"))
  test(`${tool.title} produces a real result in its stated mode`, async ({
    page,
  }) => {
    const response = await page.goto(`/${tool.slug}/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(tool.title);
    if (tool.kind === "image") {
      const inputFormat =
        tool.slug === "jpg-to-png-converter"
          ? "jpeg"
          : tool.slug === "webp-to-png-converter"
            ? "webp"
            : "png";
      const file = await sharp({
        create: {
          width: 6,
          height: 4,
          channels: 4,
          background: { r: 180, g: 10, b: 30, alpha: 1 },
        },
      })
        .toFormat(inputFormat)
        .toBuffer();
      await page.getByLabel(/Image file/).setInputFiles({
        name: `sample.${inputFormat}`,
        mimeType: `image/${inputFormat}`,
        buffer: file,
      });
      await expect(
        page.getByRole("button", { name: imageAction(tool.slug), exact: true }),
      ).toBeEnabled();
      if (tool.slug === "resize-image")
        await page.getByLabel("Width (pixels)").fill("12");
      if (tool.slug === "crop-image") {
        await page.getByLabel("Width (pixels)").fill("4");
        await page.getByLabel("Height (pixels)").fill("2");
        await page.getByLabel("Left offset (pixels)").fill("1");
        await page.getByLabel("Top offset (pixels)").fill("1");
      }
      await page
        .getByRole("button", { name: imageAction(tool.slug), exact: true })
        .click();
      const preview = page.getByAltText("Preview of your processed image");
      await expect(preview).toBeVisible();
      const result = await preview.evaluate(async (element) => {
        const image = element as HTMLImageElement;
        await image.decode();
        const blob = await (await fetch(image.src)).blob();
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        return {
          width: image.naturalWidth,
          height: image.naturalHeight,
          type: blob.type,
          pixel: [...context.getImageData(0, 0, 1, 1).data],
        };
      });
      expect(result.width).toBe(
        tool.slug === "resize-image"
          ? 12
          : ["crop-image", "rotate-image"].includes(tool.slug)
            ? 4
            : 6,
      );
      expect(result.height).toBe(
        tool.slug === "resize-image"
          ? 8
          : tool.slug === "crop-image"
            ? 2
            : tool.slug === "rotate-image"
              ? 6
              : 4,
      );
      expect(result.type).toBe(
        ["compress-image", "image-to-webp-converter"].includes(tool.slug)
          ? "image/webp"
          : "image/png",
      );
      if (tool.slug === "image-to-black-and-white")
        expect(result.pixel[0]).toBe(result.pixel[1]);
      const download = page.waitForEvent("download");
      await page.getByRole("link", { name: "Download image" }).click();
      expect((await download).suggestedFilename()).toMatch(/\.(png|webp)$/);
      return;
    }
    const input = page.locator(".tool-form input, .tool-form textarea").first();
    if (tool.kind === "markup" && tool.slug !== "schema-markup-validator") {
      await page.getByLabel("Page title").fill('Useful "guide"');
      await page
        .getByLabel("Description", { exact: true })
        .fill("A useful article.");
      await page
        .getByLabel("Page URL", { exact: true })
        .fill("https://example.com/guide/");
      if (tool.slug === "schema-generator")
        await page
          .getByLabel("Real organization / organizational author")
          .fill("Example Organization");
    } else {
      const value =
        tool.kind === "number"
          ? tool.slug === "hex-to-rgb"
            ? "#abc"
            : "24"
          : tool.kind === "rating"
            ? domain
            : tool.kind === "amp"
              ? "<html><body>Test</body></html>"
              : tool.kind === "alt"
                ? '<img src="https://example.com/x.png"><img alt="" src="x.png">'
                : tool.kind === "backlinks"
                  ? "source_url,rel\nhttps://example.com/a,nofollow"
                  : tool.slug === "schema-markup-validator"
                    ? '{"@context":"https://schema.org","@type":"Organization","name":"Example","url":"https://example.com/"}'
                    : tool.kind === "outreach" || tool.kind === "keywords"
                      ? "guest posts"
                      : "Hello world";
      await input.fill(value);
      if (tool.kind === "outreach") {
        await page.getByLabel("Publication name").fill("Example editor");
        await page
          .getByLabel("Resource URL")
          .fill("https://example.com/guide/");
      }
    }
    await page
      .getByRole("button", { name: /Run tool|Generate result/ })
      .click();
    const result = page.getByLabel("Result", { exact: true });
    await expect(result).toBeVisible({ timeout: 25000 });
    const value = await result.inputValue();
    expect(value.length).toBeGreaterThan(0);
    if (tool.kind === "amp") {
      expect(value).toContain("Official AMP validation: FAIL");
      expect(value).toContain("line 1");
    }
    if (tool.kind === "rating") {
      expect(value).toContain("0\t42");
      expect(value).toContain("NOT a live Ahrefs check");
    }
    if (tool.kind === "alt") expect(value).toContain("Missing alt: 1");
    if (tool.kind === "backlinks")
      expect(value).toContain("Referring domains: 1");
    if (tool.kind === "keywords") expect(value).toContain("No search volume");
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await expect(result).toHaveCount(0);
  });
test("browser-local HTML inspection is inert and makes no external requests", async ({
  page,
}) => {
  await fixtures();
  const outbound: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("example.com")) outbound.push(request.url());
  });
  await page.goto("/image-alt-checker/");
  await page
    .getByLabel("HTML to inspect")
    .fill(
      '<img src="https://example.com/x"><iframe src="https://example.com/frame"></iframe><script>window.badToolInput=true</script>',
    );
  await page.getByRole("button", { name: "Run tool" }).click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    /Images: 1/,
  );
  expect(await page.evaluate(() => "badToolInput" in window)).toBe(false);
  expect(outbound).toEqual([]);
});
test("server tools reject cross-origin, invalid and excessive inputs without fetching arbitrary URLs", async ({
  request,
}) => {
  await fixtures();
  expect(
    (
      await request.post("/api/tools/rating/", {
        data: { input: domain },
        headers: { Origin: "https://example.com" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/tools/rating/", {
        data: { input: Array(31).fill(domain).join("\n") },
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await request.post("/api/tools/rating/", {
        data: { input: "127.0.0.1" },
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await request.post("/api/tools/amp/", {
        data: { input: "a".repeat(100001) },
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(422);
});
test("image and schema tools expose actionable validation errors", async ({
  page,
}) => {
  await fixtures();
  await page.goto("/crop-image/");
  const buffer = await sharp({
    create: { width: 6, height: 4, channels: 3, background: "red" },
  })
    .png()
    .toBuffer();
  await page
    .getByLabel(/Image file/)
    .setInputFiles({ name: "sample.png", mimeType: "image/png", buffer });
  await expect(
    page.getByRole("button", { name: "Crop image", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("Left offset (pixels)").fill("1");
  await page.getByRole("button", { name: "Crop image", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(/inside the original/);
  await page.goto("/schema-markup-validator/");
  await page.getByLabel("Your text").fill("not JSON");
  await page.getByRole("button", { name: "Run tool" }).click();
  await expect(page.getByRole("alert")).toHaveText(/Invalid JSON/);
});
test("all 60 CMS article routes expose real content, metadata and organization schema", async ({
  request,
}) => {
  test.setTimeout(180000);
  await fixtures();
  for (const article of blogLibrary) {
    const response = await request.get(`/blog/${article.slug}/`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(
      article.title.replaceAll("'", "&#x27;").replaceAll('"', "&quot;"),
    );
    expect(html).toContain('id="section-1"');
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain(`https://nameretailer.com/blog/${article.slug}/`);
    expect(html).toMatch(
      technicalArticleSlugs.has("blog/" + article.slug)
        ? /name="robots" content="noindex, follow"/
        : /name="robots" content="index, follow"/,
    );
  }
  expect((await request.get("/blog/not-a-real-article/")).status()).toBe(404);
});
test("journal search, categories, pagination and related reading work", async ({
  page,
}) => {
  await fixtures();
  await page.goto("/blog/");
  await expect(page.getByText("60 articles · Page 1 of 5")).toBeVisible();
  await expect(page.locator(".journal-card")).toHaveCount(12);
  await page.getByRole("link", { name: "Next articles" }).click();
  await expect(page.getByText("60 articles · Page 2 of 5")).toBeVisible();
  await page
    .getByLabel("Topic", { exact: true })
    .selectOption({ label: "GEO" });
  await page.getByRole("button", { name: "Find articles" }).click();
  await expect(page.getByText("10 articles · Page 1 of 1")).toBeVisible();
  await page.getByLabel("Search articles").fill("unmatchable search phrase");
  await page.getByRole("button", { name: "Find articles" }).click();
  await expect(
    page.getByRole("heading", { name: "No articles match this search" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "View all articles" }).click();
  await page.locator(".journal-card h3 a").first().click();
  await expect(page.locator(".journal-prose h2")).toHaveCount(5);
  await page
    .getByRole("link", { name: "A practical checklist", exact: true })
    .click();
  await expect(page).toHaveURL(/#section-3$/);
  await expect(page.locator(".journal-aside")).toBeVisible();
});
for (const width of [320, 375, 768, 820, 1024, 1280])
  test(`tools and journal share accessible design at ${width}px`, async ({
    page,
  }, info) => {
    test.setTimeout(180000);
    await fixtures();
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/seo-tools/",
      "/blog/",
      `/blog/${blogLibrary[0].slug}/`,
      "/text-case-converter/",
      "/crop-image/",
      "/schema-generator/",
      "/bulk-domain-rating-checker/",
    ]) {
      expect((await page.goto(route))?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
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
        path: info.outputPath(`${route.replaceAll("/", "")}-${width}.png`),
        fullPage: true,
      });
    }
  });
