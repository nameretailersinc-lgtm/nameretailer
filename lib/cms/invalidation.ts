import { revalidateTag, revalidatePath } from "next/cache";
import type { Collection } from "./types";

export function invalidate(collection: Collection, slug: string) {
  // Phase 4 public readers use these tags. A standalone database runner has no
  // Next request context; use the secured in-app cron endpoint for ISR then.
  try {
    revalidateTag(`cms:${collection}`, { expire: 0 });
    if (collection === "content") {
      revalidateTag("cms:public", { expire: 0 });
      revalidatePath(`/${slug}/`);
    }
  } catch {}
}
