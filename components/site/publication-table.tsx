import type { PublicProduct } from "@/lib/commerce/types";
export function PublicationTable({ products }: { products: Pick<PublicProduct, "id" | "domain" | "priceCents">[] }) {
  return <div className="directory-table-wrap"><table className="directory-table"><caption>Active publication placement prices in USD</caption><thead><tr><th scope="col">Publication</th><th scope="col">Price (USD)</th></tr></thead><tbody>{products.map(product => <tr key={product.id}><th scope="row"><a href={product.domain} rel="nofollow noopener noreferrer" target="_blank">{new URL(product.domain).hostname}</a></th><td>{new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(product.priceCents / 100)}</td></tr>)}</tbody></table></div>;
}
