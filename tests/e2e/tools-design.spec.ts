import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";
import { tools } from "../../lib/tools/catalog";
import { imageAction } from "../../lib/tools/presentation";

test("directory search filters all categories and restores the full catalog", async ({
  page,
}) => {
  await page.goto("/seo-tools/");
  await expect(page.locator(".tools-directory-link")).toHaveCount(28);
  await expect(page.locator(".tools-category")).toHaveCount(5);
  await expect(page.locator("#images .tools-count-badge")).toHaveText(
    "9 tools",
  );
  await page.getByRole("searchbox", { name: "Search tools" }).fill("schema");
  await expect(page.locator(".tools-directory-link")).toHaveCount(2);
  await expect(page.getByRole("status")).toContainText("2 tools found");
  await page.getByRole("button", { name: "Search Tools", exact: true }).click();
  await expect(page.locator("#tools-results")).toBeFocused();
  await page
    .getByRole("searchbox", { name: "Search tools" })
    .fill("unmatchedtoolname");
  await expect(
    page.getByRole("heading", { name: "No tools found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.locator(".tools-directory-link")).toHaveCount(28);
  await expect(
    page.getByRole("searchbox", { name: "Search tools" }),
  ).toBeFocused();
  await page.getByRole("link", { name: "Open word counter" }).click();
  await expect(page).toHaveURL(/\/word-counter\/$/);
});

for (const width of [320, 1280]) {
  test(`directory and all 28 tool pages reflow with working artwork at ${width}px`, async ({
    page,
  }, info) => {
    test.setTimeout(240000);
    await page.setViewportSize({ width, height: 900 });
    const accessible = new Set([
      "seo-tools",
      "jpg-to-png-converter",
      "text-case-converter",
      "schema-generator",
      "amp-validator",
      "bulk-domain-rating-checker",
    ]);
    for (const slug of ["seo-tools", ...tools.map((tool) => tool.slug)]) {
      const response = await page.goto(`/${slug}/`);
      expect(response?.status(), slug).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      if (slug !== "seo-tools") {
        const tool = tools.find((entry) => entry.slug === slug)!;
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          tool.title,
        );
        await expect(
          page.getByRole("region", {
            name: `${tool.title} workspace`,
            exact: true,
          }),
        ).toBeVisible();
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
        document
          .querySelectorAll<HTMLImageElement>("main img")
          .forEach((img) => (img.loading = "eager"));
      });
      await expect
        .poll(
          () =>
            page
              .locator("main img")
              .evaluateAll((images) =>
                images.every(
                  (img) =>
                    (img as HTMLImageElement).complete &&
                    (img as HTMLImageElement).naturalWidth > 0,
                ),
              ),
          { message: `${slug} artwork loads` },
        )
        .toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        `${slug} horizontal overflow`,
      ).toBe(false);
      if (accessible.has(slug)) {
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(
          axe.violations.map((issue) => ({
            id: issue.id,
            targets: issue.nodes.map((node) => node.target),
          })),
          `${slug} accessibility`,
        ).toEqual([]);
      }
      if (
        [
          "seo-tools",
          "jpg-to-png-converter",
          "word-counter",
          "schema-generator",
        ].includes(slug)
      ) {
        await page.screenshot({
          path: info.outputPath(`${slug}-${width}.png`),
          fullPage: true,
        });
      }
    }
  });
}

test("text, unit and markup workspaces retain their conversions and clear results", async ({
  page,
}) => {
  await page.goto("/text-case-converter/");
  await page
    .getByLabel("Your text", { exact: true })
    .fill("Hello private writing");
  await page
    .getByRole("combobox", { name: "Conversion", exact: true })
    .selectOption("upper");
  await page.getByRole("button", { name: "Run tool", exact: true }).click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    "HELLO PRIVATE WRITING",
  );
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByLabel("Your text", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Result", { exact: true })).toHaveCount(0);
  await page.goto("/px-to-rem/");
  await page.getByLabel("Value", { exact: true }).fill("32");
  await page.getByRole("button", { name: "Run tool", exact: true }).click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue("2 rem");
  await page.goto("/schema-generator/");
  await page.getByLabel("Page title", { exact: true }).fill("Example article");
  await page
    .getByLabel("Description", { exact: true })
    .fill("An editorial example.");
  await page
    .getByLabel("Page URL", { exact: true })
    .fill("https://example.com/article/");
  await page
    .getByLabel("Real organization / organizational author", { exact: true })
    .fill("Example Publisher");
  await page
    .getByRole("button", { name: "Generate result", exact: true })
    .click();
  await expect(page.getByLabel("Result", { exact: true })).toHaveValue(
    /"@type": "Article"/,
  );
});

for (const tool of tools.filter((entry) => entry.kind === "image")) {
  test(`${tool.title} previews, processes, downloads and accepts the same file after clearing`, async ({
    page,
  }) => {
    await page.goto(`/${tool.slug}/`);
    const inputType =
      tool.slug === "jpg-to-png-converter"
        ? "jpeg"
        : tool.slug === "webp-to-png-converter"
          ? "webp"
          : "png";
    const buffer = await sharp({
      create: { width: 120, height: 80, channels: 3, background: "#008b65" },
    })
      .toFormat(inputType)
      .toBuffer();
    const file = {
      name: `example.${inputType}`,
      mimeType: `image/${inputType}`,
      buffer,
    };
    const sent: string[] = [];
    page.on("request", (request) => {
      if (request.postData()) sent.push(request.postData()!);
    });
    await page
      .getByLabel("Image file · maximum 20 MiB", { exact: true })
      .setInputFiles(file);
    await expect(
      page.getByAltText("Preview of your original image"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: imageAction(tool.slug), exact: true }),
    ).toBeEnabled();
    if (tool.slug === "resize-image")
      await page.getByLabel("Width (pixels)", { exact: true }).fill("60");
    if (tool.slug === "crop-image") {
      await page.getByLabel("Width (pixels)", { exact: true }).fill("60");
      await page.getByLabel("Height (pixels)", { exact: true }).fill("40");
    }
    await page
      .getByRole("button", { name: imageAction(tool.slug), exact: true })
      .click();
    const preview = page.getByAltText("Preview of your processed image");
    await expect(preview).toBeVisible();
    const expected =
      tool.slug === "resize-image" || tool.slug === "crop-image"
        ? [60, 40]
        : tool.slug === "rotate-image"
          ? [80, 120]
          : [120, 80];
    await expect
      .poll(() =>
        preview.evaluate((img: HTMLImageElement) => [
          img.naturalWidth,
          img.naturalHeight,
        ]),
      )
      .toEqual(expected);
    const downloadEvent = page.waitForEvent("download");
    await page
      .getByRole("link", { name: "Download image", exact: true })
      .click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toMatch(
      new RegExp(
        `\\.${["image-to-webp-converter", "compress-image"].includes(tool.slug) ? "webp" : "png"}$`,
      ),
    );
    expect(sent).toEqual([]);
    await page
      .getByRole("button", { name: "Clear image", exact: true })
      .click();
    await expect(preview).toHaveCount(0);
    await expect(
      page.getByAltText("Preview of your original image"),
    ).toHaveCount(0);
    await page
      .getByLabel("Image file · maximum 20 MiB", { exact: true })
      .setInputFiles(file);
    await expect(
      page.getByAltText("Preview of your original image"),
    ).toBeVisible();
  });
}

test("image drop zone accepts a dropped image and rejects an unsupported file", async ({
  page,
}) => {
  await page.goto("/jpg-to-png-converter/");
  await page
    .getByLabel("Image file · maximum 20 MiB", { exact: true })
    .setInputFiles({
      name: "invalid.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("invalid"),
    });
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Choose a nonempty JPG, PNG or WebP",
  );
  const buffer = await sharp({
    create: { width: 16, height: 8, channels: 3, background: "#008b65" },
  })
    .jpeg()
    .toBuffer();
  const data = await page.evaluateHandle(
    (bytes) => {
      const transfer = new DataTransfer();
      transfer.items.add(
        new File([new Uint8Array(bytes)], "dropped.jpg", {
          type: "image/jpeg",
        }),
      );
      return transfer;
    },
    [...buffer],
  );
  await page
    .locator(".tools-dropzone")
    .dispatchEvent("drop", { dataTransfer: data });
  await expect(
    page.getByAltText("Preview of your original image"),
  ).toBeVisible();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Create PNG", exact: true }).click();
  await expect(
    page.getByAltText("Preview of your processed image"),
  ).toBeVisible();
});
