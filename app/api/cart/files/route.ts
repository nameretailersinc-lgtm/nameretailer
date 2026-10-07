import { json } from "@/lib/api";
import { accountAuthenticated, accountMutationLimit } from "@/lib/account";
import {
  uploadArticleFile,
  listArticleFiles,
} from "@/lib/commerce/article-files";
import { productHandle } from "@/lib/commerce/http";
export const runtime = "nodejs";
export const GET = (request: Request) =>
  productHandle(async () =>
    json(await listArticleFiles(await accountAuthenticated(request))),
  );
export const POST = (request: Request) =>
  productHandle(async () => {
    const actor = await accountAuthenticated(request);
    await accountMutationLimit(actor, "article-upload");
    return json(await uploadArticleFile(actor, request), 201);
  });
