import { ApiError, authenticated, json } from "@/lib/api";
import { rateLimit } from "@/lib/security/rate-limit";
import { analyzeProductCsv } from "@/lib/commerce/csv";
import { importProducts } from "@/lib/commerce/products";
import { productHandle, productUpload } from "@/lib/commerce/http";
export const runtime = "nodejs";
export const POST = (request: Request) =>
  productHandle(async () => {
    const user = await authenticated(request, true);
    if (!(await rateLimit(`products:import:${user.id}`, 30, 3600)))
      throw new ApiError(429, "Too many CSV requests. Try again later.");
    const { csv, data } = await productUpload(request);
    const action = data.get("action");
    if (action !== "preview" && action !== "commit")
      throw new ApiError(422, "Preview the file before importing.");
    let analysis;
    try {
      analysis = analyzeProductCsv(csv);
    } catch {
      throw new ApiError(
        422,
        "The CSV structure is invalid. Check required columns, quoting, file size and row limits.",
      );
    }
    if (action === "preview") {
      const { products, ...summary } = analysis;
      return json({
        data: {
          ...summary,
          sample: products
            .slice(0, 5)
            .map(({ source: _source, ...product }) => {
              void _source;
              return product;
            }),
        },
      });
    }
    if (data.get("sha256") !== analysis.sha256)
      throw new ApiError(
        409,
        "The CSV changed. Preview it again before importing.",
      );
    return json(
      {
        data: await importProducts(analysis, user.id, {
          acceptValidRows: data.get("acceptValidRows") === "true",
        }),
      },
      201,
    );
  });
