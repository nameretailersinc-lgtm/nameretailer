import { expect, it } from "vitest";
import {
  priceMedian,
  directoryIndexable,
} from "@/lib/commerce/catalogue-statistics";
it("computes medians without inventing a value for empty inventory", () => {
  expect(priceMedian([])).toBeNull();
  expect(priceMedian([300, 100, 200])).toBe(200);
  expect(priceMedian([301, 100, 201, 200])).toBe(200.5);
});
it("requires at least five active listings before directory indexing", () => {
  expect(directoryIndexable(0)).toBe(false);
  expect(directoryIndexable(14)).toBe(false);
  expect(directoryIndexable(15)).toBe(true);
});
