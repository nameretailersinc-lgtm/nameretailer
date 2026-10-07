import { randomUUID } from "node:crypto";
import { Binary, type ClientSession } from "mongodb";
import { getDb, transaction, userTransaction } from "@/lib/db";
import { freshAccount, type AccountIdentity } from "@/lib/account";
import { logAudit } from "@/lib/audit";
import { ProductError } from "./errors";
import {
  ARTICLE_FILE_LIMIT,
  validateArticleFile,
} from "./article-file-validation";
import type { ArticleFileSummary } from "./cart-types";
interface SavedFile {
  _id: string;
  ownerId: string;
  name: string;
  size: number;
  expiresAt: Date;
  bytes: Binary;
}
async function files() {
  return (await getDb()).collection<SavedFile>("commerce_article_files");
}
export function fileSummary(
  value: Omit<SavedFile, "bytes">,
): ArticleFileSummary {
  return {
    id: value._id,
    name: value.name,
    size: value.size,
    expiresAt: value.expiresAt.toISOString(),
  };
}
export async function ownArticleFile(
  actor: AccountIdentity,
  id: string,
  session?: ClientSession,
) {
  const saved = await (
    await files()
  ).findOne(
    { _id: id, ownerId: actor.id, expiresAt: { $gt: new Date() } },
    { session, projection: { bytes: 0 } },
  );
  return saved ? fileSummary(saved) : null;
}
export async function listArticleFiles(actor: AccountIdentity) {
  return transaction(async (session) => {
    await freshAccount(actor, session);
    const saved = await (
      await files()
    )
      .find(
        { ownerId: actor.id, expiresAt: { $gt: new Date() } },
        { session, projection: { bytes: 0 } },
      )
      .sort({ expiresAt: -1 })
      .limit(20)
      .toArray();
    return saved.map(fileSummary);
  });
}
export async function uploadArticleFile(
  actor: AccountIdentity,
  request: Request,
) {
  const limit = ARTICLE_FILE_LIMIT + 128 * 1024;
  if (Number(request.headers.get("content-length") || 0) > limit)
    throw new ProductError(413, "Article uploads must be at most 5 MiB.");
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data;"))
    throw new ProductError(400, "Use a multipart article upload.");
  const reader = request.body?.getReader();
  if (!reader) throw new ProductError(400, "Choose an article file.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new ProductError(413, "Article uploads must be at most 5 MiB.");
    }
    chunks.push(value);
  }
  let form: FormData;
  try {
    form = await new Response(Buffer.concat(chunks), {
      headers: { "content-type": contentType },
    }).formData();
  } catch {
    throw new ProductError(400, "Invalid article upload.");
  }
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    Array.from(form.keys()).some((key) => key !== "file") ||
    form.getAll("file").length !== 1
  )
    throw new ProductError(422, "Upload one article file.");
  const bytes = Buffer.from(await file.arrayBuffer());
  validateArticleFile(file.name, bytes);
  const collection = await files();
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await collection.createIndex({ ownerId: 1, expiresAt: -1 });
  const saved: SavedFile = {
    _id: randomUUID(),
    ownerId: actor.id,
    name: file.name,
    size: bytes.length,
    expiresAt: new Date(Date.now() + 7 * 86400000),
    bytes: new Binary(bytes),
  };
  return userTransaction(async (session) => {
    await freshAccount(actor, session);
    if (
      (await collection.countDocuments(
        { ownerId: actor.id, expiresAt: { $gt: new Date() } },
        { session },
      )) >= 20
    )
      throw new ProductError(
        422,
        "You already have 20 retained draft files. Remove an unused file before uploading another.",
      );
    await collection.insertOne(saved, { session });
    await logAudit(
      actor.id,
      "article-file.upload",
      "article-files",
      saved._id,
      "Private draft article; seven-day retention.",
      session,
    );
    return fileSummary(saved);
  });
}
export async function downloadArticleFile(actor: AccountIdentity, id: string) {
  return transaction(async (session) => {
    await freshAccount(actor, session);
    const saved = await (
      await files()
    ).findOne(
      { _id: id, ownerId: actor.id, expiresAt: { $gt: new Date() } },
      { session },
    );
    if (!saved)
      throw new ProductError(
        404,
        "This article file expired or is unavailable.",
      );
    return new Response(new Uint8Array(saved.bytes.buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="article.${saved.name.split(".").at(-1)}"; filename*=UTF-8''${encodeURIComponent(saved.name).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16)}`)}`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  });
}
export async function deleteArticleFile(actor: AccountIdentity, id: string) {
  return userTransaction(async (session) => {
    await freshAccount(actor, session);
    await (
      await files()
    ).deleteOne({ _id: id, ownerId: actor.id }, { session });
    await logAudit(
      actor.id,
      "article-file.delete",
      "article-files",
      id,
      "",
      session,
    );
    return { removed: true };
  });
}
