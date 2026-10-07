import { storage } from "@/lib/storage";
export const GET = async (
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) => {
  try {
    const key = (await context.params).path.join("/");
    const buffer = await storage.get(key);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": key.endsWith(".avif") ? "image/avif" : "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};
