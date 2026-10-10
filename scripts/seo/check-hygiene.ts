import { unfinishedCopy } from "../../lib/site/public-copy";
import { bodyText } from "../../lib/cms/content";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import ts from "typescript";
import { publicRoutes } from "./routes";
import { pageHtml, visibleHtml, withProductionServer } from "./server";

// Presence can be automated; whether an informative alt describes its image
// still needs editorial review. Empty alt is valid for decorative artwork.
async function checkSourceImages(directory: string): Promise<string[]> {
  const problems: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) problems.push(...(await checkSourceImages(path)));
    else if (entry.name.endsWith(".tsx")) {
      const source = ts.createSourceFile(
        path,
        await readFile(path, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const imageNames = new Set(["img"]);
      for (const statement of source.statements) {
        if (
          ts.isImportDeclaration(statement) &&
          ts.isStringLiteral(statement.moduleSpecifier) &&
          statement.moduleSpecifier.text === "next/image" &&
          statement.importClause?.name
        )
          imageNames.add(statement.importClause.name.text);
      }
      const visit = (node: ts.Node) => {
        if (
          (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
          imageNames.has(node.tagName.getText(source))
        ) {
          const attributes = node.attributes.properties;
          const has = (name: string) =>
            attributes.some(
              (attribute) =>
                ts.isJsxAttribute(attribute) &&
                attribute.name.getText(source) === name,
            );
          const line =
            source.getLineAndCharacterOfPosition(node.getStart(source)).line +
            1;
          if (!has("alt"))
            problems.push(`${path}:${line}: missing explicit alt`);
          if (
            node.tagName.getText(source) !== "img" &&
            !has("sizes") &&
            !has("unoptimized")
          )
            problems.push(`${path}:${line}: missing Image sizes`);
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
    }
  }
  return problems;
}

const sourceProblems = [
  ...(await checkSourceImages("app")),
  ...(await checkSourceImages("components")),
];
assert.equal(sourceProblems.length, 0, sourceProblems.join("\n"));
await withProductionServer(async (base) => {
  const problems: string[] = [];
  const routes = await publicRoutes(base);
  for (const path of routes) {
    const html = visibleHtml(await pageHtml(base, path));
    if (!/<html\b[^>]*\blang="[a-z][a-z-]*"/i.test(html))
      problems.push(`${path}: missing document language`);
    if (unfinishedCopy.test(bodyText(html)))
      problems.push(path + ": unfinished public copy");
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    if (!main) {
      problems.push(`${path}: missing main`);
      continue;
    }
    const headings = [...main.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
    if (headings.filter((item) => item[1] === "1").length !== 1)
      problems.push(`${path}: expected one main H1`);
    let previous = 0;
    for (const heading of headings) {
      const level = Number(heading[1]);
      if (level > previous + 1)
        problems.push(
          `${path}: heading skips H${previous} to H${level} (${heading[2].replace(/<[^>]+>/g, "").slice(0, 80)})`,
        );
      previous = level;
    }
    for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\balt="[^"]*"/.test(image[0]))
        problems.push(`${path}: image missing alt`);
      for (const width of image[0].matchAll(/[?&](?:amp;)?w=(\d+)/g))
        if (Number(width[1]) > 1920)
          problems.push(`${path}: oversized image width ${width[1]}`);
    }
    const preloads = [
      ...html.matchAll(/<link\b[^>]*rel="preload"[^>]*as="image"[^>]*>/g),
    ];
    if (preloads.length > 1)
      problems.push(`${path}: more than one preloaded image`);
  }
  assert.equal(problems.length, 0, problems.join("\n"));
  console.log(
    `${routes.length} pages pass language, heading, image-alt and image-width checks; source images declare alt and sizes.`,
  );
});
