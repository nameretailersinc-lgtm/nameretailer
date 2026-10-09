import { cache } from "react";
import { listProducts } from "./products";
export const publicProductPage = cache((query: string) =>
  listProducts(new URLSearchParams(query)),
);
