import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "./api";
export function mediaPath(key: string) {
  if (!/^[a-z0-9_-]+\/[a-f0-9-]+\.(webp|avif)$/.test(key))
    throw new ApiError(404, "Media not found.");
  const root = path.resolve(
    /* turbopackIgnore: true */ process.env.MEDIA_ROOT || "uploads",
  );
  const target = path.resolve(root, key);
  if (!target.startsWith(root + path.sep))
    throw new ApiError(404, "Media not found.");
  return target;
}
export const storage = {
  async put(key: string, buffer: Buffer) {
    const target = mediaPath(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buffer, { flag: "wx" });
  },
  async get(key: string) {
    return readFile(/* turbopackIgnore: true */ mediaPath(key));
  },
};
