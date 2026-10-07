import { ProductError } from "./errors";
export const ARTICLE_FILE_LIMIT = 5 * 1024 * 1024;
// Format identification, not malware scanning. Never parse/execute these files.
export function validateArticleFile(name: string, bytes: Uint8Array) {
  if (!bytes.length || bytes.length > ARTICLE_FILE_LIMIT)
    throw new ProductError(413, "Choose a nonempty article file up to 5 MiB.");
  if (
    name.length > 160 ||
    !/^[\p{L}\p{N} _.()-]+\.(pdf|doc|docx|txt)$/iu.test(name)
  )
    throw new ProductError(
      422,
      "Use a simple filename with PDF, DOC, DOCX or TXT extension.",
    );
  const ext = name.split(".").at(-1)!.toLowerCase();
  const buffer = Buffer.from(bytes);
  if (ext === "pdf" && buffer.subarray(0, 5).toString("ascii") === "%PDF-")
    return;
  if (
    ext === "doc" &&
    buffer.subarray(0, 8).equals(Buffer.from("d0cf11e0a1b11ae1", "hex"))
  )
    return;
  if (
    ext === "docx" &&
    buffer.length >= 4 &&
    buffer.readUInt32LE(0) === 0x04034b50
  ) {
    const names: string[] = [];
    let cursor = 0,
      expanded = 0,
      invalid = false;
    while (
      (cursor = buffer.indexOf(Buffer.from("504b0102", "hex"), cursor)) !== -1
    ) {
      if (cursor + 46 > buffer.length) {
        invalid = true;
        break;
      }
      const length = buffer.readUInt16LE(cursor + 28);
      const end = cursor + 46 + length;
      if (
        end > buffer.length ||
        names.length >= 200 ||
        buffer.readUInt16LE(cursor + 8) & 1
      ) {
        invalid = true;
        break;
      }
      expanded += buffer.readUInt32LE(cursor + 24);
      names.push(buffer.subarray(cursor + 46, end).toString("utf8"));
      cursor = end;
    }
    if (
      !invalid &&
      names.includes("[Content_Types].xml") &&
      names.includes("word/document.xml") &&
      expanded <= 50 * 1024 * 1024 &&
      names.length < 200 &&
      !names.some((value) =>
        /(?:^\/|\\|(?:^|\/)\.\.(?:\/|$)|vbaProject|\.exe$)/i.test(value),
      )
    )
      return;
  }
  if (ext === "txt") {
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (
        !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text) &&
        !/<\/?(?:script|html|iframe|svg)\b/i.test(text)
      )
        return;
    } catch {
      /* Not UTF-8 text. */
    }
  }
  throw new ProductError(
    422,
    "The file content does not match a supported article format.",
  );
}
