import { z } from 'zod';
import { json } from '@/lib/api';
import { accountMutationLimit } from '@/lib/account';
import { mobileAuthenticated } from '@/lib/mobile-auth';
import { deleteArticleFile, downloadArticleFile } from '@/lib/commerce/article-files';
import { productHandle } from '@/lib/commerce/http';
export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
export const GET = (request: Request, { params }: Context) => productHandle(async () =>
  downloadArticleFile(await mobileAuthenticated(request), z.uuid().parse((await params).id)));
export const DELETE = (request: Request, { params }: Context) => productHandle(async () => {
  const actor = await mobileAuthenticated(request);
  await accountMutationLimit(actor, 'article-files');
  return json(await deleteArticleFile(actor, z.uuid().parse((await params).id)));
});
