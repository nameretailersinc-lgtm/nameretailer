import { z } from "zod";
import { json } from "@/lib/api";
import { accountAuthenticated, accountMutationLimit } from "@/lib/account";
import {
  downloadArticleFile,
  deleteArticleFile,
} from "@/lib/commerce/article-files";
import { productHandle } from "@/lib/commerce/http";
type Context = { params: Promise<{ id: string }> };
export const runtime = "nodejs";
export const GET = (request: Request, context: Context) =>
  productHandle(async () =>
    downloadArticleFile(
      await accountAuthenticated(request),
      z.uuid().parse((await context.params).id),
    ),
  );
export const DELETE = (request: Request, context: Context) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    await accountMutationLimit(actor, "article-upload");
    return json(
      await deleteArticleFile(actor, z.uuid().parse((await context.params).id)),
    );
  });
