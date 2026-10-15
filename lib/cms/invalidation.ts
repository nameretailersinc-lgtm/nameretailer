import { revalidateTag, revalidatePath } from "next/cache";
import type { Collection } from "./types";
import { invalidateTtlCache } from "../cache/ttl";

export function invalidate(collection: Collection, slug: string) {
  if (["content", "categories", "redirects"].includes(collection))
    invalidateTtlCache("sitemap-files");
  // Phase 4 public readers use these tags. A standalone database runner has no
  // Next request context; use the secured in-app cron endpoint for ISR then.
  try {
    revalidateTag(`cms:${collection}`, { expire: 0 });
    if (["content", "categories", "redirects"].includes(collection)) {
      revalidatePath("/sitemap.xml");
    }
    if (collection === "content") {
      revalidateTag("cms:public", { expire: 0 });
      revalidatePath(`/${slug}/`);
    }
  } catch {}
}
