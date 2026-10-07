export type ArticleDraft = {
  title: string;
  cluster:
    "Marketplace" | "Content" | "Technical SEO" | "AEO" | "GEO" | "Measurement";
  answer: string;
  example: string;
  steps: [string, string, string];
  avoid: string;
  question: string;
  response: string;
  source?: { label: string; url: string };
};
