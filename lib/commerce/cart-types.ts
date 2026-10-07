export type WritingWords = 0 | 500 | 750 | 1000;
export interface PlacementOptions {
  productId: string;
  productVersion: number;
  domain: string;
  placementCents: number;
  currency: "USD";
  writingOptions: { words: Exclude<WritingWords, 0>; priceCents: number }[];
  requirements: string;
  turnaround: string;
  linkType: string;
}
export interface CartSelection {
  productId: string;
  productVersion: number;
  writingWords: WritingWords;
  brief?: PlacementBrief;
}
export interface PlacementBrief {
  promotedUrl: string;
  keyword: string;
  specialRequirements: string;
  articleText: string;
  fileId: string | null;
}
export interface ArticleFileSummary {
  id: string;
  name: string;
  size: number;
  expiresAt: string;
}
export interface CartItem extends CartSelection {
  domain: string | null;
  placementCents: number | null;
  writingCents: number | null;
  totalCents: number | null;
  status: "ready" | "changed" | "unavailable";
  options: PlacementOptions | null;
  file?: ArticleFileSummary | null;
}
export interface CartView {
  version: number;
  currency: "USD";
  items: CartItem[];
  totalCents: number | null;
  checkoutAvailable: false;
}
