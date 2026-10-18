import {
  rangeQuery,
  type MarketplaceRange,
} from "@/lib/commerce/marketplace-ranges";

/** Validate editable bounds together with bounds fixed by a curated range URL. */
export function validateFilterRanges(
  form: HTMLFormElement,
  range?: MarketplaceRange,
) {
  const query = new URLSearchParams();
  for (const [key, value] of new FormData(form))
    if (typeof value === "string" && value.trim()) query.set(key, value.trim());
  const effective = rangeQuery(query.toString(), range);
  for (const [minimum, maximum, label] of [
    ["minPrice", "maxPrice", "price"],
    ["minDr", "maxDr", "DR"],
    ["minDa", "maxDa", "DA"],
    ["minTraffic", "maxTraffic", "traffic"],
  ]) {
    const lower = effective.get(minimum);
    const upper = effective.get(maximum);
    if (lower === null || upper === null || Number(lower) <= Number(upper))
      continue;
    const maxInput = form.elements.namedItem(
      maximum,
    ) as HTMLInputElement | null;
    const minInput = form.elements.namedItem(
      minimum,
    ) as HTMLInputElement | null;
    const input = maxInput && !maxInput.disabled ? maxInput : minInput;
    if (!input || input.disabled) continue;
    input.setCustomValidity(
      input === maxInput
        ? `Maximum ${label} must be at least the minimum ${label} (${lower}).`
        : `Minimum ${label} must not exceed the maximum ${label} (${upper}).`,
    );
    input.reportValidity();
    return false;
  }
  return true;
}

export function clearFilterRangeErrors(form: HTMLFormElement) {
  for (const input of form.querySelectorAll<HTMLInputElement>(
    'input[type="number"]',
  ))
    input.setCustomValidity("");
}
