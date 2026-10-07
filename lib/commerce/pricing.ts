import { parseUsdCents } from "./validation";
import { ProductError } from "./errors";
import type { Product } from "./types";
import type { PlacementOptions, WritingWords } from "./cart-types";

export function placementOptions(product: Product): PlacementOptions {
  if (
    !Number.isSafeInteger(product.priceCents) ||
    product.priceCents <= 0 ||
    product.currency !== "USD"
  )
    throw new ProductError(
      422,
      "This placement does not have an available price.",
    );
  const writingOptions: PlacementOptions["writingOptions"] = [];
  for (const [words, field] of [
    [500, "Article_Price"],
    [750, "Article_Price_2"],
    [1000, "Article_Price_3"],
  ] as const) {
    try {
      const priceCents = parseUsdCents(product.source?.[field] || "");
      if (Number.isSafeInteger(product.priceCents + priceCents))
        writingOptions.push({ words, priceCents });
    } catch {
      /* Unknown, zero and malformed source prices are not free writing. */
    }
  }
  return {
    productId: product.id,
    productVersion: product.version,
    domain: product.domain,
    placementCents: product.priceCents,
    currency: "USD",
    writingOptions,
    requirements: product.requirements,
    turnaround: product.turnaround,
    linkType: product.linkType,
  };
}
export function quotePlacement(options: PlacementOptions, words: WritingWords) {
  const writingCents =
    words === 0
      ? 0
      : options.writingOptions.find((option) => option.words === words)
          ?.priceCents;
  if (writingCents === undefined)
    throw new ProductError(
      422,
      "This writing option is unavailable. Choose placement only or an available option.",
    );
  const totalCents = options.placementCents + writingCents;
  if (!Number.isSafeInteger(totalCents))
    throw new ProductError(
      422,
      "This total exceeds the supported price range.",
    );
  return { placementCents: options.placementCents, writingCents, totalCents };
}
