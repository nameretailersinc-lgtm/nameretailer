export type ToolKind =
  | "text"
  | "image"
  | "number"
  | "markup"
  | "alt"
  | "amp"
  | "backlinks"
  | "keywords"
  | "rating"
  | "outreach";
export type Tool = {
  slug: string;
  title: string;
  group: string;
  kind: ToolKind;
  description: string;
  mode: string;
};
const group = (
  name: string,
  kind: ToolKind,
  rows: Array<[string, string, string]>,
  mode = "Browser-local",
) =>
  rows.map(([slug, title, description]) => ({
    slug,
    title,
    description,
    group: name,
    kind,
    mode,
  }));
export const tools: Tool[] = [
  {
    slug: "word-counter",
    title: "Word counter",
    group: "Writing and text",
    kind: "text",
    description:
      "Count words, characters, paragraphs and reading time as you write.",
    mode: "Browser-local",
  },
  ...group("Writing and text", "text", [
    [
      "text-case-converter",
      "Text case converter",
      "Convert text to sentence case, title case, uppercase or lowercase.",
    ],
    [
      "reverse-text",
      "Reverse text",
      "Reverse graphemes, words or lines without breaking emoji.",
    ],
    [
      "keyword-density-checker",
      "Keyword density checker",
      "Measure single-word frequency and exact phrase occurrences in your text.",
    ],
    [
      "base64-encode-decode",
      "Base64 encode / decode",
      "Encode and decode UTF-8 text. Base64 is an encoding, not encryption.",
    ],
  ]),
  ...group("Images", "image", [
    [
      "jpg-to-png-converter",
      "JPG to PNG converter",
      "Convert a JPG image into a downloadable PNG without uploading it.",
    ],
    [
      "image-to-webp-converter",
      "Image to WebP converter",
      "Create a WebP copy and choose the quality setting.",
    ],
    [
      "webp-to-png-converter",
      "WebP to PNG converter",
      "Convert a WebP image into a PNG copy in your browser.",
    ],
    [
      "resize-image",
      "Resize image",
      "Set image dimensions while optionally preserving the aspect ratio.",
    ],
    [
      "compress-image",
      "Compress image",
      "Create a smaller JPEG or WebP copy and compare output size.",
    ],
    [
      "rotate-image",
      "Rotate image",
      "Rotate by 90, 180 or 270 degrees without clipping the image.",
    ],
    [
      "crop-image",
      "Crop image",
      "Choose an exact pixel rectangle and download the cropped image.",
    ],
    [
      "image-to-black-and-white",
      "Image to black and white",
      "Create a grayscale copy while retaining transparency in PNG output.",
    ],
  ]),
  ...group("Images", "alt", [
    [
      "image-alt-checker",
      "Image alt checker",
      "Inspect pasted HTML for missing, empty and descriptive image alt attributes.",
    ],
  ]),
  ...group("Units and values", "number", [
    [
      "hex-to-rgb",
      "HEX to RGB",
      "Convert 3-, 4-, 6- or 8-digit hexadecimal colors to RGB or RGBA.",
    ],
    [
      "px-to-rem",
      "PX to REM",
      "Convert pixels to rem using the root font size you specify.",
    ],
    [
      "length-converter",
      "Length converter",
      "Convert meters, centimeters, millimeters, kilometers, inches and feet.",
    ],
    [
      "temperature-converter",
      "Temperature converter",
      "Convert Celsius, Fahrenheit and Kelvin with absolute-zero validation.",
    ],
    [
      "file-size-converter",
      "File size converter",
      "Convert decimal and binary storage units with an explicit unit basis.",
    ],
  ]),
  ...group("Markup and sharing", "markup", [
    [
      "twitter-card-generator",
      "Twitter card generator",
      "Generate escaped summary or large-image card meta tags.",
    ],
    [
      "open-graph-generator",
      "Open Graph generator",
      "Generate page-sharing tags with validated URLs and image description.",
    ],
    [
      "schema-markup-validator",
      "Schema markup validator",
      "Check JSON-LD syntax, context, type and common structural fields.",
    ],
    [
      "schema-generator",
      "Schema generator",
      "Create Organization, Article, BreadcrumbList or FAQPage JSON-LD.",
    ],
  ]),
  ...group(
    "Markup and sharing",
    "amp",
    [
      [
        "amp-validator",
        "AMP validator",
        "Validate pasted HTML with the official AMP project's validator.",
      ],
    ],
    "Official validator · server",
  ),
  ...group(
    "SEO research and planning",
    "backlinks",
    [
      [
        "competitor-backlink-analyzer",
        "Competitor backlink analyzer",
        "Analyze a CSV export from your backlink provider locally. No live crawl is performed.",
      ],
    ],
    "Report analysis",
  ),
  ...group(
    "SEO research and planning",
    "keywords",
    [
      [
        "keyword-suggestion-tool",
        "Keyword suggestion tool",
        "Build question and intent-based keyword ideas from a seed topic, without invented search volumes.",
      ],
    ],
    "Local brainstorming",
  ),
  ...group(
    "SEO research and planning",
    "rating",
    [
      [
        "bulk-domain-rating-checker",
        "Bulk Domain Rating checker",
        "Look up owner-supplied scores in the active marketplace. Not live Ahrefs measurements.",
      ],
    ],
    "Catalog lookup",
  ),
  ...group(
    "SEO research and planning",
    "outreach",
    [
      [
        "backlink-generator",
        "Link outreach planner",
        "Prepare a relevant outreach brief and qualified link markup. This does not create external backlinks.",
      ],
    ],
    "Planning · no automatic links",
  ),
];
export const toolBySlug = (slug: string) =>
  tools.find((tool) => tool.slug === slug);
