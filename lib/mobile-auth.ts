import { createHmac, timingSafeEqual } from "node:crypto";
import { authSecret } from "./security/secret";
import { store } from "./db";
import { ApiError } from "./api";
import type { AccountIdentity } from "./account";

function secret(): string {
  const s = authSecret();
  if (!s) throw new Error("Authentication secret is not configured.");
  return s;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf8").toString("base64url");
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf8");
}

export interface MobileJwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  sessionVersion: number;
  iat: number;
  exp: number;
}

export function signMobileToken(actor: {
  id: string;
  name: string;
  email: string;
  role: string;
  sessionVersion: number;
}): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadData: MobileJwtPayload = {
    sub: actor.id,
    name: actor.name,
    email: actor.email,
    role: actor.role,
    sessionVersion: actor.sessionVersion,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600, // 30 days
  };
  const payload = base64UrlEncode(JSON.stringify(payloadData));
  const data = `${header}.${payload}`;
  const signature = createHmac("sha256", secret())
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export async function verifyMobileToken(
  token: string,
): Promise<AccountIdentity> {
  if (!token || typeof token !== "string") {
    throw new ApiError(401, "Sign in to continue.");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new ApiError(401, "Invalid session token format.");
  }

  const [header, payload, signature] = parts;
  const expectedSig = createHmac("sha256", secret())
    .update(`${header}.${payload}`)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expSigBuf = Buffer.from(expectedSig);
  if (
    sigBuf.length !== expSigBuf.length ||
    !timingSafeEqual(sigBuf, expSigBuf)
  ) {
    throw new ApiError(401, "Invalid session token signature.");
  }

  let data: MobileJwtPayload;
  try {
    data = JSON.parse(base64UrlDecode(payload));
  } catch {
    throw new ApiError(401, "Malformed session payload.");
  }

  if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  const { users } = await store();
  const user = await users.findOne({
    id: data.sub,
    active: true,
    sessionVersion: data.sessionVersion,
  });

  if (!user) {
    throw new ApiError(401, "Your account session has expired. Sign in again.");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    sessionVersion: user.sessionVersion,
  };
}

export async function mobileAuthenticated(
  request: Request,
): Promise<AccountIdentity> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Sign in to continue.");
  }
  const token = authHeader.slice(7).trim();
  return verifyMobileToken(token);
}

export async function optionalMobileIdentity(
  request: Request,
): Promise<AccountIdentity | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  try {
    return await verifyMobileToken(token);
  } catch {
    return null;
  }
}
