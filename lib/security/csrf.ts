import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { UserSummary } from "@/lib/cms/types";
import { authSecret } from "./secret";
function secret() {
  const value = authSecret();
  if (!value) throw new Error("Authentication secret is not configured.");
  return value;
}
type CsrfPurpose = "account" | "registration";
export function csrfToken(
  user: Pick<UserSummary, "id">,
  purpose: CsrfPurpose = "account",
) {
  const payload = `${user.id}.${Date.now() + 3600000}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${createHmac("sha256", secret()).update(`csrf:${purpose}:${payload}`).digest("hex")}`;
}
export function validCsrf(
  token: string | null,
  user: Pick<UserSummary, "id">,
  purpose: CsrfPurpose = "account",
) {
  if (!token || token.length > 500) return false;
  const [id, expires, nonce, signature, ...extra] = token.split(".");
  if (
    extra.length ||
    id !== user.id ||
    !/^[a-f0-9]{32}$/.test(nonce || "") ||
    !/^[a-f0-9]{64}$/.test(signature || "") ||
    !Number.isSafeInteger(Number(expires)) ||
    Number(expires) < Date.now() ||
    Number(expires) > Date.now() + 3600000
  )
    return false;
  const expected = createHmac("sha256", secret())
    .update(`csrf:${purpose}:${id}.${expires}.${nonce}`)
    .digest();
  const actual = Buffer.from(signature, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export function sameOrigin(request: Request) {
  const expected =
    process.env.NEXTAUTH_URL ||
    (process.env.NODE_ENV === "production" ? "" : new URL(request.url).origin);
  try {
    return (
      !!expected && request.headers.get("origin") === new URL(expected).origin
    );
  } catch {
    return false;
  }
}
