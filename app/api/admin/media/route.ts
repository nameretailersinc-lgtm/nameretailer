import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { ApiError, authenticated, handle, json } from "@/lib/api";
import { store } from "@/lib/db";
import { storage } from "@/lib/storage";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/security/rate-limit";
import type { CmsRecord } from "@/lib/cms/types";
export const POST = (request: Request) =>
  handle(async () => {
    const user = await authenticated(request);
    if (!["admin", "editor"].includes(user.role))
      throw new ApiError(403, "Only admins and editors can upload media.");
    if (!(await rateLimit(`upload:${user.id}`, 30, 3600)))
      throw new ApiError(429, "Upload limit reached. Try again later.");
    if (Number(request.headers.get("content-length") || 0) > 11 * 1024 * 1024)
      throw new ApiError(413, "Upload an image smaller than 10 MB.");
    const form = await request.formData();
    const file = form.get("file");
    const alt = String(form.get("alt") || "").trim();
    const folder = String(form.get("folder") || "general").toLowerCase();
    const decorative = form.get("decorative") === "true";
    if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024)
      throw new ApiError(422, "Choose an image smaller than 10 MB.");
    if (
      !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
        file.type,
      )
    )
      throw new ApiError(
        422,
        "Only JPEG, PNG, WebP and AVIF images are allowed.",
      );
    if ((!alt && !decorative) || alt.length > 500 || (decorative && alt))
      throw new ApiError(
        422,
        "Add meaningful alt text (1–500 characters), or explicitly mark a decorative image with empty alt text.",
      );
    if (!/^[a-z0-9_-]{1,60}$/.test(folder))
      throw new ApiError(
        422,
        "Folder names may contain lowercase letters, numbers, underscores and hyphens.",
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    let metadata;
    try {
      metadata = await sharp(bytes, { limitInputPixels: 40000000 }).metadata();
    } catch {
      throw new ApiError(422, "This image could not be decoded safely.");
    }
    if (
      !["jpeg", "png", "webp", "avif", "heif"].includes(
        metadata.format || "",
      ) ||
      !metadata.width ||
      !metadata.height
    )
      throw new ApiError(422, "Unsupported image contents.");
    const id = randomUUID();
    const image = sharp(bytes, { limitInputPixels: 40000000 }).rotate().resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    });
    const [webp, avif] = await Promise.all([
      image.clone().webp({ quality: 82 }).toBuffer({ resolveWithObject: true }),
      image.clone().avif({ quality: 55 }).toBuffer(),
    ]);
    const key = `${folder}/${id}.webp`;
    const avifKey = `${folder}/${id}.avif`;
    await Promise.all([
      storage.put(key, webp.data),
      storage.put(avifKey, avif),
    ]);
    const now = new Date().toISOString();
    const record: CmsRecord = {
      id,
      collection: "media",
      title: file.name.slice(0, 150),
      slug: id,
      status: "active",
      ownerId: user.id,
      version: 1,
      createdAt: now,
      updatedAt: now,
      data: {
        alt,
        decorative,
        folder,
        url: `/media/${key}`,
        avifUrl: `/media/${avifKey}`,
        width: webp.info.width,
        height: webp.info.height,
        mime: "image/webp",
        size: webp.data.length,
      },
    };
    await (await store()).records.insertOne(record);
    await logAudit(user.id, "media.upload", "media", id, file.name);
    return json({ data: record }, 201);
  });
