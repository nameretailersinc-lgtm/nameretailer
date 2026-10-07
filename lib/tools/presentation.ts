import type { Tool } from "./catalog";

export const toolIcons: Record<string, string> = {
  "word-counter": "13_word_counter_icon.png",
  "text-case-converter": "14_text_case_icon.png",
  "reverse-text": "15_reverse_text_icon.png",
  "keyword-density-checker": "16_keyword_density_icon.png",
  "base64-encode-decode": "17_base64_icon.png",
  "jpg-to-png-converter": "18_jpg_to_png_icon.png",
  "image-to-webp-converter": "19_image_to_webp_icon.png",
  "webp-to-png-converter": "20_webp_to_png_icon.png",
  "resize-image": "21_resize_image_icon.png",
  "compress-image": "22_compress_image_icon.png",
  "rotate-image": "23_rotate_image_icon.png",
  "crop-image": "24_crop_image_icon.png",
  "image-to-black-and-white": "25_black_white_icon.png",
  "image-alt-checker": "26_alt_checker_icon.png",
  "hex-to-rgb": "27_hex_rgb_icon.png",
  "px-to-rem": "28_px_rem_icon.png",
  "length-converter": "29_length_converter_icon.png",
  "temperature-converter": "30_temperature_icon.png",
  "file-size-converter": "31_file_size_icon.png",
  "twitter-card-generator": "32_twitter_card_icon.png",
  "open-graph-generator": "33_open_graph_icon.png",
  "schema-markup-validator": "34_schema_validator_icon.png",
  "schema-generator": "35_schema_generator_icon.png",
  "amp-validator": "36_amp_validator_icon.png",
  "competitor-backlink-analyzer": "37_backlink_analyzer_icon.png",
  "keyword-suggestion-tool": "38_keyword_suggestion_icon.png",
  "bulk-domain-rating-checker": "39_domain_rating_icon.png",
  "backlink-generator": "40_link_outreach_icon.png",
};

export const toolGroups = [
  {
    name: "Writing and text",
    description: "Work with text, encoding and keyword analysis.",
    icon: "09_writing_text_category_icon.png",
    tone: "blue",
  },
  {
    name: "Images",
    description: "Convert, resize and edit images in your browser.",
    icon: "10_images_category_icon.png",
    tone: "coral",
  },
  {
    name: "Units and values",
    description: "Convert between different units and values.",
    icon: "11_units_values_category_icon.png",
    tone: "purple",
  },
  {
    name: "Markup and sharing",
    description: "Generate, validate and share markup and social data.",
    icon: "12_markup_sharing_category_icon.png",
    tone: "amber",
  },
  {
    name: "SEO research and planning",
    description: "Research keywords, analyze reports and plan your strategy.",
    icon: "13_seo_category_icon.png",
    tone: "green",
  },
];

export const toolIcon = (tool: Tool) => `/tools/${toolIcons[tool.slug]}`;

export function imageAction(slug: string) {
  if (slug === "image-to-webp-converter") return "Create WebP";
  if (slug === "compress-image") return "Compress image";
  if (slug === "rotate-image") return "Rotate image";
  if (slug === "resize-image") return "Resize image";
  if (slug === "crop-image") return "Crop image";
  if (slug === "image-to-black-and-white") return "Create grayscale image";
  return "Create PNG";
}
