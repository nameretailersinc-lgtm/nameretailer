export type ProductStatus = "draft" | "active" | "archived";
export interface ProductMetrics {
  da: number | null;
  dr: number | null;
  tf: number | null;
  ur: number | null;
  traffic: number | null;
  referringDomains: number | null;
  backlinks: number | null;
  spamScore: number | null;
}
export interface ProductInput {
  externalId: string | null;
  domain: string;
  language: string;
  country: string;
  category: string;
  priceCents: number;
  currency: "USD";
  status: ProductStatus;
  metrics: ProductMetrics;
  linkType: string;
  turnaround: string;
  requirements: string;
}
export interface Product extends ProductInput {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  importId?: string;
  source?: Record<string, string>;
  /** ISO date the supplier measured `metrics`; absent until the supplier provides it. */
  metricsUpdatedAt?: string | null;
  /** Set by the data-quality review; listings are only excluded after owner confirmation. */
  needsReview?: boolean;
}
export type PublicProduct = Omit<Product, "source" | "externalId" | "importId">;
export interface ProductPage {
  data: PublicProduct[];
  total: number;
  page: number;
  pageSize: number;
}
export interface ProductFacets {
  countries: string[];
  languages: string[];
  categories: string[];
}
export interface ImportIssue {
  row: number;
  code: string;
  message: string;
}
export interface ProductImportAnalysis {
  rows: number;
  valid: number;
  skipped: number;
  errors: number;
  fatal: boolean;
  warnings: number;
  issues: ImportIssue[];
  issueCounts: Record<string, number>;
  products: Array<ProductInput & { source: Record<string, string> }>;
  sha256: string;
}
