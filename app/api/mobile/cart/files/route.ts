import { json } from '@/lib/api';
import { accountMutationLimit } from '@/lib/account';
import { mobileAuthenticated } from '@/lib/mobile-auth';
import { listArticleFiles, uploadArticleFile } from '@/lib/commerce/article-files';
import { productHandle } from '@/lib/commerce/http';
export const runtime = 'nodejs';
export const GET = (request: Request) => productHandle(async () =>
  json(await listArticleFiles(await mobileAuthenticated(request))));
export const POST = (request: Request) => productHandle(async () => {
  const actor = await mobileAuthenticated(request);
  await accountMutationLimit(actor, 'article-files');
  return json(await uploadArticleFile(actor, request), 201);
});
