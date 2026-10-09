import { cache } from "react";
import { publicProductStatistics } from "./products";
import { directoryBySlug } from "../site/directories";
export const catalogueSummary = cache((query: string, directorySlug = "") =>
  publicProductStatistics(
    new URLSearchParams(query),
    directoryBySlug(directorySlug)?.filter,
  ),
);
