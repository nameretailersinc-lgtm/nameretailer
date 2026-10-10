import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicProduct } from "@/lib/commerce/types";
import {
  publicationHost,
  publicationPath,
} from "@/lib/commerce/publication-pages";
export function PublicationTable({
  products,
}: {
  products: Array<
    Pick<
      PublicProduct,
      "id" | "domain" | "priceCents" | "category" | "metrics"
    > &
      Partial<Pick<PublicProduct, "linkType">>
  >;
}) {
  return (
    <div className="directory-table-wrap">
      <table className="directory-table">
        <caption>
          Active publications with topic, supplied Domain Rating, traffic, links
          included and placement price in USD
        </caption>
        <thead>
          <tr>
            <th scope="col">Publication</th>
            <th scope="col">Topic</th>
            <th scope="col">DR</th>
            <th scope="col">Traffic</th>
            <th scope="col">Links</th>
            <th scope="col">Price (USD)</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const path = publicationPath(product);
            const name =
              publicationHost(product.domain) ||
              new URL(product.domain).hostname;
            return (
              <tr key={product.id}>
                <th scope="row">
                  {path ? (
                    <Link href={path} prefetch={false}>
                      {name}
                    </Link>
                  ) : (
                    <span>{name}</span>
                  )}
                </th>
                <td>{product.category || "Not provided"}</td>
                <td>
                  <span
                    className={
                      typeof product.metrics?.dr === "number"
                        ? "publication-metric-dr"
                        : undefined
                    }
                  >
                    {typeof product.metrics?.dr === "number"
                      ? product.metrics.dr
                      : "Not provided"}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      typeof product.metrics?.traffic === "number"
                        ? "publication-metric-traffic"
                        : undefined
                    }
                  >
                    {typeof product.metrics?.traffic === "number"
                      ? product.metrics.traffic.toLocaleString("en-US")
                      : "Not provided"}
                  </span>
                </td>
                <td>{product.linkType?.trim() || "Ask before ordering"}</td>
                <td className="publication-price">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(product.priceCents / 100)}
                </td>
                <td>
                  {path ? (
                    <Link
                      className="directory-view-details"
                      href={path}
                      prefetch={false}
                    >
                      View Details <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  ) : (
                    "Unavailable"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
