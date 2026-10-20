"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function CatalogueRetry() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="button button-secondary"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {pending ? "Retrying…" : "Try again"}
    </button>
  );
}
