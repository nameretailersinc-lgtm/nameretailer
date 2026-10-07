import type { Filter } from "mongodb";
import type { Product } from "./types";
import { ProductError } from "./errors";

function amount(raw: string, key: string, maximum: number, money: boolean) {
  if (!(money ? /^\d{1,7}(?:\.\d{1,2})?$/ : /^\d+$/).test(raw))
    throw new ProductError(422, `Invalid ${key} filter.`);
  const value = money
    ? Number(raw.split(".")[0]) * 100 +
      Number((raw.split(".")[1] || "").padEnd(2, "0"))
    : Number(raw);
  if (!Number.isSafeInteger(value) || value > maximum)
    throw new ProductError(422, `Invalid ${key} filter.`);
  return value;
}
export function applyProductRanges(
  filter: Filter<Product>,
  params: URLSearchParams,
) {
  for (const [minKey, maxKey, field, maximum, money] of [
    ["minDa", "maxDa", "metrics.da", 100, false],
    ["minDr", "maxDr", "metrics.dr", 100, false],
    [
      "minTraffic",
      "maxTraffic",
      "metrics.traffic",
      Number.MAX_SAFE_INTEGER,
      false,
    ],
    ["minPrice", "maxPrice", "priceCents", 999999999, true],
  ] as const) {
    const lower = params.get(minKey),
      upper = params.get(maxKey);
    const min = lower ? amount(lower, minKey, maximum, money) : undefined;
    const max = upper ? amount(upper, maxKey, maximum, money) : undefined;
    if (min !== undefined && max !== undefined && min > max)
      throw new ProductError(422, `${minKey} must not exceed ${maxKey}.`);
    if (min !== undefined || max !== undefined)
      filter[field] = {
        $type: "number",
        ...(min !== undefined ? { $gte: min } : {}),
        ...(max !== undefined ? { $lte: max } : {}),
      };
  }
}
