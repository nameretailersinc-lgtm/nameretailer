export type ReadinessCheck = { label: string; passed: boolean; detail: string };
export type ReadinessReport = { category: string; checks: ReadinessCheck[] };

/** Inspect an inert parsed document; never insert submitted markup into the page. */
export function inspectSearchReadiness(doc: Document): ReadinessReport[] {
  const text = (node: Element | null) => node?.textContent?.trim() || "";
  const meta = (name: string) =>
    Array.from(doc.querySelectorAll("meta"))
      .find((node) => node.getAttribute("name")?.toLowerCase() === name)
      ?.getAttribute("content")
      ?.trim() || "";
  const title = text(doc.querySelector("title"));
  const description = meta("description");
  const h1 = doc.querySelectorAll("h1");
  const robots = meta("robots");
  const images = Array.from(doc.querySelectorAll("img"));
  const missingAlt = images.filter(
    (image) => !image.hasAttribute("alt"),
  ).length;
  const canonical =
    Array.from(doc.querySelectorAll("link[rel]"))
      .find((link) =>
        link
          .getAttribute("rel")
          ?.toLowerCase()
          .split(/\s+/)
          .includes("canonical"),
      )
      ?.getAttribute("href") || "";
  let validSchema = 0;
  let invalidSchema = 0;
  const schemaTypes = new Set<string>();
  const visit = (value: unknown, depth = 0): void => {
    if (!value || typeof value !== "object" || depth > 30) return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, depth + 1));
      return;
    }
    const record = value as Record<string, unknown>;
    const types = Array.isArray(record["@type"])
      ? record["@type"]
      : [record["@type"]];
    types.forEach((type) => {
      if (typeof type === "string") schemaTypes.add(type);
    });
    Object.values(record).forEach((item) => visit(item, depth + 1));
  };
  doc
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((script) => {
      try {
        const data: unknown = JSON.parse(text(script));
        if (!data || typeof data !== "object") throw new Error();
        visit(data);
        validSchema++;
      } catch {
        invalidSchema++;
      }
    });
  // Exclude scripts and template content from visible-content heuristics.
  const body = doc.body.cloneNode(true) as HTMLElement;
  body
    .querySelectorAll(
      "script,style,template,noscript,nav,footer,header,[hidden]",
    )
    .forEach((node) => node.remove());
  const headings = Array.from(body.querySelectorAll("h2,h3"));
  const paragraphs = Array.from(body.querySelectorAll("p"));
  const directAnswers = headings.filter(
    (heading) =>
      /\?\s*$/.test(text(heading)) &&
      heading.nextElementSibling?.tagName === "P" &&
      text(heading.nextElementSibling).split(/\s+/).length >= 15 &&
      text(heading.nextElementSibling).split(/\s+/).length <= 80,
  ).length;
  const links = Array.from(body.querySelectorAll("a[href]"));
  const externalSources = links.filter(
    (link) =>
      /^https?:\/\//i.test(link.getAttribute("href") || "") &&
      text(link).length > 3,
  ).length;
  const check = (
    label: string,
    passed: boolean,
    detail: string,
  ): ReadinessCheck => ({ label, passed, detail });
  return [
    {
      category: "SEO · Search engine optimization",
      checks: [
        check(
          "Page title",
          title.length >= 15 && title.length <= 65,
          `${title.length} characters. Aim for a descriptive, unique title; 15–65 characters is a rough editing guide.`,
        ),
        check(
          "Meta description",
          description.length >= 70 && description.length <= 170,
          `${description.length} characters. Summarize the page clearly; 70–170 characters is a rough guide, not a ranking rule.`,
        ),
        check(
          "One descriptive H1",
          h1.length === 1 && text(h1[0]).length > 0,
          `${h1.length} H1 elements found. Use one clear main heading for this checklist.`,
        ),
        check(
          "Absolute canonical URL",
          /^https?:\/\/[^\s]+$/i.test(canonical),
          "Provide an absolute HTTP(S) canonical URL and verify it points to the preferred indexable page.",
        ),
        check(
          "No HTML indexing block",
          !/(?:^|[\s,])(noindex|none)(?:$|[\s,])/i.test(robots),
          "Checks only the robots meta tag. HTTP headers, robots.txt and actual indexability are not tested.",
        ),
        check(
          "Image alt attributes",
          missingAlt === 0,
          `${missingAlt} of ${images.length} images lack alt attributes. Describe informative images; empty alt is appropriate for decorative images.`,
        ),
      ],
    },
    {
      category: "AEO · Answer engine optimization",
      checks: [
        check(
          "Question-led headings",
          headings.some((heading) => /\?\s*$/.test(text(heading))),
          "Use relevant questions as H2/H3 headings when they match the reader’s intent.",
        ),
        check(
          "Concise answers after questions",
          directAnswers > 0,
          `${directAnswers} question headings immediately followed by a 15–80 word paragraph. Answer the question directly before adding detail.`,
        ),
        check(
          "Scannable information",
          !!body.querySelector("ul li,ol li,table th"),
          "Use meaningful lists, steps or tables where they make an answer easier to understand.",
        ),
        check(
          "Parseable typed JSON-LD",
          validSchema > 0 && invalidSchema === 0 && schemaTypes.size > 0,
          `${validSchema} parseable blocks, ${invalidSchema} invalid blocks. Types: ${Array.from(schemaTypes).join(", ") || "none"}. This checks syntax and type presence, not schema validity or rich-result eligibility.`,
        ),
      ],
    },
    {
      category: "GEO · Generative engine optimization",
      checks: [
        check(
          "Source links for review",
          externalSources > 0,
          `${externalSources} descriptive absolute HTTP(S) links found. Manually verify that claims cite credible sources; links may belong to your own site.`,
        ),
        check(
          "Author attribution signal",
          !!meta("author") ||
            !!doc.querySelector('[rel~="author"],[itemprop="author"]'),
          "Include a visible author or reviewer with relevant expertise. This check detects explicit author metadata or markup only.",
        ),
        check(
          "Machine-readable date",
          !!doc.querySelector("time[datetime]"),
          "Use a time element with a datetime attribute for a meaningful published or updated date; verify accuracy manually.",
        ),
        check(
          "Explanatory paragraphs",
          paragraphs.some(
            (paragraph) => text(paragraph).split(/\s+/).length >= 40,
          ),
          "Provide useful explanations with specific evidence. Paragraph length is only a structural signal, not a quality judgment.",
        ),
      ],
    },
  ];
}
