import { ApiError, handle } from "@/lib/api";
import { ProductError } from "./errors";

export function productHandle(fn: () => Promise<Response>) {
  return handle(async () => {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof ProductError)
        throw new ApiError(error.status, error.message);
      throw error;
    }
  });
}
export async function productUpload(request: Request) {
  const limit = 32 * 1024 * 1024 + 128 * 1024;
  if (Number(request.headers.get("content-length") || 0) > limit)
    throw new ProductError(413, "CSV uploads must be at most 32 MiB.");
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;"))
    throw new ProductError(400, "Upload a CSV using multipart form data.");
  const reader = request.body?.getReader();
  if (!reader) throw new ProductError(400, "Choose a CSV file.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new ProductError(413, "CSV uploads must be at most 32 MiB.");
    }
    chunks.push(value);
  }
  const bytes = Buffer.concat(chunks);
  let data: FormData;
  try {
    data = await new Response(bytes, {
      headers: { "content-type": request.headers.get("content-type")! },
    }).formData();
  } catch {
    throw new ProductError(400, "Invalid CSV upload.");
  }
  const file = data.get("file");
  if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".csv"))
    throw new ProductError(422, "Choose a .csv file.");
  if (!file.size || file.size > 32 * 1024 * 1024)
    throw new ProductError(
      413,
      "Choose a nonempty CSV file of at most 32 MiB.",
    );
  let csv: string;
  try {
    csv = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
      await file.arrayBuffer(),
    );
  } catch {
    throw new ProductError(422, "The CSV must use UTF-8 text encoding.");
  }
  return { csv, data };
}
