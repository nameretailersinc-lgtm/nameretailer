export type ArticleDraft = {
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  cluster:
    | "Marketplace"
    | "Content"
    | "Technical SEO"
    | "AEO"
    | "GEO"
    | "Measurement";
  answer: string;
  example: string;
  steps: [string, string, string];
  avoid: string;
  question: string;
  response: string;
  sections?: Array<{
    heading: string;
    body: string;
    code?: string;
    checklist?: string[];
    table?: { columns: string[]; rows: string[][] };
  }>;
  relatedLinks?: Array<[label: string, href: string]>;
  extraFaq?: Array<[question: string, answer: string]>;
  source?: { label: string; url: string };
  extraSources?: Array<{ label: string; url: string }>;
};
