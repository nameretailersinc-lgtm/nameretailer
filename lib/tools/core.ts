export function escapeMarkup(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}
export function httpUrl(value: string): string {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Use an HTTP(S) URL without credentials.");
  return url.href;
}
export function tokens(value: string): string[] {
  return [
    ...new Intl.Segmenter(undefined, { granularity: "word" }).segment(value),
  ]
    .filter((segment) => segment.isWordLike)
    .map((segment) => segment.segment.toLocaleLowerCase());
}
export function transformText(
  slug: string,
  text: string,
  mode: string,
  phrase = "",
): string {
  if (text.length > 100000) throw new Error("Use at most 100,000 characters.");
  if (slug === "text-case-converter") {
    if (mode === "upper") return text.toLocaleUpperCase();
    if (mode === "lower") return text.toLocaleLowerCase();
    if (mode === "title")
      return text
        .toLocaleLowerCase()
        .replace(
          /\p{L}[\p{L}\p{M}'’-]*/gu,
          (word) => word[0].toLocaleUpperCase() + word.slice(1),
        );
    return text
      .toLocaleLowerCase()
      .replace(
        /(^|[.!?]\s+)(\p{L})/gu,
        (_, prefix: string, char: string) => prefix + char.toLocaleUpperCase(),
      );
  }
  if (slug === "reverse-text") {
    if (mode === "lines") return text.split(/\r?\n/).reverse().join("\n");
    if (mode === "words") return text.trim().split(/\s+/u).reverse().join(" ");
    return [
      ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
        text,
      ),
    ]
      .map((part) => part.segment)
      .reverse()
      .join("");
  }
  if (slug === "base64-encode-decode") {
    if (mode !== "decode")
      return btoa(
        Array.from(new TextEncoder().encode(text), (byte) =>
          String.fromCharCode(byte),
        ).join(""),
      );
    const compact = text.replace(/\s/g, "");
    if (
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        compact,
      )
    )
      throw new Error("Enter valid padded Base64 text.");
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(
        Uint8Array.from(atob(compact), (char) => char.charCodeAt(0)),
      );
    } catch {
      throw new Error("This value does not decode to valid UTF-8 text.");
    }
  }
  const words = tokens(text);
  if (!words.length) throw new Error("Add some readable text first.");
  const needle = tokens(phrase);
  if (needle.length) {
    let count = 0;
    for (let index = 0; index <= words.length - needle.length; index++)
      if (needle.every((word, offset) => words[index + offset] === word))
        count++;
    return `Words: ${words.length}\nPhrase: ${phrase}\nOccurrences: ${count}\nOccurrences / total words: ${((count / words.length) * 100).toFixed(2)}%\nOverlapping token sequences counted; punctuation and case ignored. This is not an ideal-density recommendation.`;
  }
  const counts = new Map<string, number>();
  for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
  return (
    `Total words: ${words.length}\nWord\tOccurrences\tShare of words\n` +
    [...counts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 50)
      .map(
        ([word, count]) =>
          `${word}\t${count}\t${((count / words.length) * 100).toFixed(2)}%`,
      )
      .join("\n")
  );
}
export const lengthUnits: Record<string, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};
export const sizeUnits: Record<string, number> = {
  B: 1,
  kB: 1000,
  MB: 1e6,
  GB: 1e9,
  TB: 1e12,
  KiB: 1024,
  MiB: 1024 ** 2,
  GiB: 1024 ** 3,
  TiB: 1024 ** 4,
};
export function convertNumber(
  slug: string,
  input: string,
  from: string,
  to: string,
  root = "16",
): string {
  if (slug === "hex-to-rgb") {
    const hex = input.trim().replace(/^#/, "");
    if (!/^(?:[a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})$/i.test(hex))
      throw new Error("Use a 3-, 4-, 6- or 8-digit HEX color.");
    const full =
      hex.length <= 4 ? [...hex].map((char) => char + char).join("") : hex;
    const values = full.match(/../g)!.map((pair) => parseInt(pair, 16));
    return values.length === 4
      ? `rgba(${values.slice(0, 3).join(", ")}, ${+(values[3] / 255).toFixed(4)})`
      : `rgb(${values.join(", ")})`;
  }
  if (!input.trim() || !Number.isFinite(Number(input)))
    throw new Error("Enter a finite numeric value.");
  const value = Number(input);
  let converted: number;
  if (slug === "px-to-rem") {
    if (!root.trim() || !Number.isFinite(Number(root)) || Number(root) <= 0)
      throw new Error("Root font size must be positive.");
    converted = from === "rem" ? value * Number(root) : value / Number(root);
    to = from === "rem" ? "px" : "rem";
  } else if (slug === "temperature-converter") {
    if (!["C", "F", "K"].includes(from) || !["C", "F", "K"].includes(to))
      throw new Error("Choose valid temperature units.");
    const kelvin =
      from === "C"
        ? value + 273.15
        : from === "F"
          ? ((value - 32) * 5) / 9 + 273.15
          : value;
    if (kelvin < -1e-10)
      throw new Error("Temperature cannot be below absolute zero.");
    converted =
      to === "C"
        ? kelvin - 273.15
        : to === "F"
          ? ((kelvin - 273.15) * 9) / 5 + 32
          : kelvin;
  } else {
    const units = slug === "length-converter" ? lengthUnits : sizeUnits;
    if (!units[from] || !units[to]) throw new Error("Choose valid units.");
    if (value < 0) throw new Error("Length and file size cannot be negative.");
    converted = (value * units[from]) / units[to];
  }
  if (!Number.isFinite(converted))
    throw new Error("Result is outside the supported numeric range.");
  return `${+converted.toPrecision(12)} ${to}`;
}
export function parseCsv(text: string): string[][] {
  if (text.length > 1000000)
    throw new Error("CSV reports must be under 1 MB of text.");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index++;
      } else if (quoted || !field) quoted = !quoted;
      else throw new Error("Malformed CSV quote.");
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index++;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (quoted) throw new Error("CSV contains an unclosed quote.");
  row.push(field);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
export function analyzeBacklinks(text: string): string {
  const rows = parseCsv(text);
  const header = rows.shift()?.map((value) =>
    value
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase(),
  );
  const sourceIndex =
    header?.findIndex((value) =>
      [
        "source",
        "source_url",
        "referring page",
        "referring page url",
        "url_from",
        "source url",
      ].includes(value),
    ) ?? -1;
  if (sourceIndex < 0)
    throw new Error(
      "Include a source_url, referring page URL, or url_from column.",
    );
  const typeIndex = header!.findIndex((value) =>
    ["rel", "link_type", "nofollow"].includes(value),
  );
  const domains = new Map<string, number>();
  const urls = new Set<string>();
  let invalid = 0;
  let qualified = 0;
  for (const row of rows) {
    try {
      const source = httpUrl(row[sourceIndex] || "");
      urls.add(source);
      const domain = new URL(source).hostname;
      domains.set(domain, (domains.get(domain) || 0) + 1);
      if (
        typeIndex >= 0 &&
        /nofollow|sponsored|ugc|true|^1$/i.test(row[typeIndex] || "")
      )
        qualified++;
    } catch {
      invalid++;
    }
  }
  return `Report rows: ${rows.length}\nValid rows: ${rows.length - invalid}\nInvalid URL rows: ${invalid}\nDistinct source URLs: ${urls.size}\nReferring domains: ${domains.size}\nQualified/nofollow rows: ${typeIndex >= 0 ? qualified : "Not supplied"}\n\nTop referring domains\n${[
    ...domains,
  ]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([domain, count]) => `${domain}\t${count}`)
    .join(
      "\n",
    )}\n\nReport-only analysis. No live backlink checks, authority score or ranking prediction.`;
}
export function keywordIdeas(seed: string, audience: string): string {
  const topic = seed.trim();
  if (!topic || topic.length > 160 || audience.length > 160)
    throw new Error("Use a topic and audience of at most 160 characters.");
  return [
    "Question ideas",
    `what is ${topic}`,
    `how to choose ${topic}`,
    `when to use ${topic}`,
    `how does ${topic} work`,
    `common ${topic} mistakes`,
    "",
    "Comparison ideas",
    `${topic} alternatives`,
    `${topic} comparison checklist`,
    `${topic} vs an alternative`,
    "",
    "Planning ideas",
    `${topic} for ${audience.trim() || "beginners"}`,
    `${topic} requirements`,
    `${topic} cost considerations`,
    `${topic} implementation checklist`,
    "",
    "Locally generated brainstorming prompts. No search volume, competition or search-engine suggestions are measured.",
  ].join("\n");
}
export type SharingFields = {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  type: string;
  name: string;
};
export function sharingMarkup(slug: string, fields: SharingFields): string {
  if (!fields.title.trim() || !fields.description.trim())
    throw new Error("Add a title and description.");
  const url = httpUrl(fields.url);
  const image = fields.image.trim() ? httpUrl(fields.image) : "";
  if (image && !fields.imageAlt.trim())
    throw new Error("Describe the sharing image.");
  if (slug === "schema-generator") {
    let data: object;
    if (fields.type === "Organization") {
      if (!fields.name.trim())
        throw new Error("Add the real organization name.");
      data = {
        "@type": "Organization",
        name: fields.name,
        url,
        description: fields.description,
      };
    } else if (fields.type === "BreadcrumbList") {
      const origin = new URL(url).origin;
      data = {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: origin + "/",
          },
          { "@type": "ListItem", position: 2, name: fields.title, item: url },
        ],
      };
    } else if (fields.type === "FAQPage") {
      data = {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: fields.title,
            acceptedAnswer: { "@type": "Answer", text: fields.description },
          },
        ],
      };
    } else {
      if (!fields.name.trim())
        throw new Error("Add the actual author or organization name.");
      data = {
        "@type": "Article",
        headline: fields.title,
        description: fields.description,
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: fields.name },
        ...(image ? { image } : {}),
      };
    }
    return JSON.stringify(
      { "@context": "https://schema.org", ...data },
      null,
      2,
    ).replaceAll("<", "\\u003c");
  }
  const entries: Array<[string, string]> =
    slug === "twitter-card-generator"
      ? [
          ["twitter:card", image ? "summary_large_image" : "summary"],
          ["twitter:title", fields.title],
          ["twitter:description", fields.description],
          ...(image
            ? ([
                ["twitter:image", image],
                ["twitter:image:alt", fields.imageAlt],
              ] as Array<[string, string]>)
            : []),
        ]
      : [
          ["og:type", fields.type === "article" ? "article" : "website"],
          ["og:title", fields.title],
          ["og:description", fields.description],
          ["og:url", url],
          ...(image
            ? ([
                ["og:image", image],
                ["og:image:alt", fields.imageAlt],
              ] as Array<[string, string]>)
            : []),
        ];
  return entries
    .map(
      ([key, value]) =>
        `<meta ${slug === "twitter-card-generator" ? "name" : "property"}="${key}" content="${escapeMarkup(value)}">`,
    )
    .join("\n");
}
export function validateSchema(text: string): string {
  if (text.length > 100000) throw new Error("Use at most 100,000 characters.");
  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch {
    throw new Error(
      "Invalid JSON. Paste JSON-LD without the enclosing script tag.",
    );
  }
  const warnings: string[] = [];
  let count = 0;
  function walk(value: unknown, path: string, inherited = false, depth = 0) {
    if (depth > 15) throw new Error("JSON-LD is nested too deeply.");
    if (Array.isArray(value)) {
      value.forEach((item, index) =>
        walk(item, `${path}[${index}]`, inherited, depth + 1),
      );
      return;
    }
    if (!value || typeof value !== "object") {
      warnings.push(`${path}: expected an object.`);
      return;
    }
    const node = value as Record<string, unknown>;
    const context =
      inherited ||
      node["@context"] === "https://schema.org" ||
      node["@context"] === "http://schema.org";
    if (!context) warnings.push(`${path}: use a Schema.org context.`);
    if ("@graph" in node) {
      walk(node["@graph"], `${path}.@graph`, context, depth + 1);
      return;
    }
    count++;
    if (
      !(typeof node["@type"] === "string" && node["@type"]) &&
      !(
        Array.isArray(node["@type"]) &&
        node["@type"].every((type) => typeof type === "string") &&
        node["@type"].length
      )
    )
      warnings.push(`${path}: missing valid @type.`);
    const type = node["@type"];
    for (const key of type === "Article" || type === "BlogPosting"
      ? ["headline", "author"]
      : type === "Organization"
        ? ["name", "url"]
        : type === "FAQPage"
          ? ["mainEntity"]
          : type === "BreadcrumbList"
            ? ["itemListElement"]
            : [])
      if (!node[key]) warnings.push(`${path}: missing ${key}.`);
    for (const key of ["url", "mainEntityOfPage"])
      if (typeof node[key] === "string") {
        try {
          httpUrl(node[key]);
        } catch {
          warnings.push(`${path}.${key}: invalid HTTP(S) URL.`);
        }
      }
  }
  walk(root, "root");
  return `JSON syntax: valid\nNodes inspected: ${count}\n${warnings.length ? "Structural warnings:\n" + warnings.join("\n") : "Basic structural checks passed."}\n\nThis is a local structural checker, not the full Schema.org vocabulary validator or a Google Rich Results eligibility test. Compare markup with visible page content.`;
}
export function analyzeAlt(html: string): string {
  if (html.length > 100000)
    throw new Error("Use at most 100,000 characters of HTML.");
  // Template contents are inert, including resource-bearing elements. Never attach this content.
  const template = document.createElement("template");
  template.innerHTML = html;
  const images = [...template.content.querySelectorAll("img")];
  let missing = 0;
  let empty = 0;
  const rows = images.map((image, index) => {
    const alt = image.getAttribute("alt");
    if (alt === null) missing++;
    else if (!alt.trim()) empty++;
    const context = image.closest("a,button")
      ? " · inside interactive element; inspect accessible name"
      : "";
    return `${index + 1}. ${image.getAttribute("src") || "No src"}\n   ${alt === null ? "MISSING alt" : !alt.trim() ? "Empty alt: confirm this image is decorative" : `Alt: ${alt}`}${context}`;
  });
  return `Images: ${images.length}\nMissing alt: ${missing}\nEmpty alt: ${empty}\nNonempty alt: ${images.length - missing - empty}\n\n${rows.join("\n")}\n\nDescriptive accuracy needs human review. Empty alt is appropriate for purely decorative images. No live website is fetched.`;
}
export function outreachBrief(
  topic: string,
  url: string,
  publication: string,
): string {
  if (!topic.trim() || !publication.trim())
    throw new Error("Add your proposed topic and publication name.");
  const target = httpUrl(url);
  return `Subject: Article idea for ${publication}\n\nHello ${publication} editorial team,\n\nI'd like to propose an article about ${topic}. Before proceeding, I will share an outline explaining the reader's problem, the evidence available and why this fits your publication.\n\nReference resource: ${target}\n\nPlease confirm editorial requirements, any commercial arrangement, disclosure and link qualification, revision scope and final approval.\n\nThank you.\n\nQualified paid-link markup example:\n<a href="${escapeMarkup(target)}" rel="sponsored">${escapeMarkup(topic)}</a>\n\nThis prepares a brief only. It does not send emails, create external backlinks or promise link equity.`;
}
