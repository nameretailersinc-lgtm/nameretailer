import type { Product, PublicProduct } from "./types";
import { publicPublicationContent } from "./publication-content";

/** Explicit allowlist: imports, drafts and reviewer IDs never enter public responses. */
export function publicProduct(product: Product): PublicProduct {
  const content = publicPublicationContent(product.publicationContent, product.domain);
  return {
    id: product.id, domain: product.domain, category: product.category,
    country: product.country, language: product.language,
    priceCents: product.priceCents, currency: product.currency, status: product.status,
    metrics: product.metrics, linkType: product.linkType, turnaround: product.turnaround,
    requirements: product.requirements, version: product.version,
    createdAt: product.createdAt, updatedAt: product.updatedAt,
    ...(product.metricsUpdatedAt ? { metricsUpdatedAt: product.metricsUpdatedAt } : {}),
    ...(content ? { publicationContent: content } : {}),
  };
}
