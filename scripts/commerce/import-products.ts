import "dotenv/config";
import { readFile } from "node:fs/promises";
import { analyzeProductCsv } from "../../lib/commerce/csv";
import { importProducts } from "../../lib/commerce/products";

const args = process.argv.slice(2);
const sourcePath = args.find((value) => !value.startsWith("--"));
if (!sourcePath) {
  console.error(
    "Usage: npm run products:import -- path.csv [--commit] [--accept-valid-rows] [--sha256=preview-hash]",
  );
  process.exit(1);
}
try {
  const bytes = await readFile(sourcePath);
  if (bytes.length > 32 * 1024 * 1024)
    throw new Error("CSV exceeds the 32 MiB limit.");
  const analysis = analyzeProductCsv(
    new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes),
  );
  const { products: _products, ...summary } = analysis;
  void _products;
  console.log(JSON.stringify(summary, null, 2));
  if (args.includes("--commit")) {
    if (
      args.find((value) => value.startsWith("--sha256="))?.slice(9) !==
      analysis.sha256
    )
      throw new Error(
        "Pass the exact preview SHA256 using --sha256= before committing.",
      );
    const result = await importProducts(analysis, "csv-import-cli", {
      acceptValidRows: args.includes("--accept-valid-rows"),
      cli: true,
    });
    console.log(JSON.stringify(result));
  } else console.log("Dry run only. No MongoDB records changed.");
  process.exit(0);
} catch (error) {
  console.error(
    "Product import failed:",
    error instanceof Error ? error.name : "UnknownError",
    "(sensitive diagnostic details omitted)",
  );
  process.exit(1);
}
