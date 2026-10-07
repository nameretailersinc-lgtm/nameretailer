import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { currentUser } from "./auth";
import { validCsrf, sameOrigin } from "./security/csrf";
import type { UserSummary } from "./cms/types";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
export async function authenticated(
  request: Request,
  adminOnly = false,
): Promise<UserSummary> {
  const user = await currentUser();
  if (!user) throw new ApiError(401, "Sign in to continue.");
  if (user.role === "customer" || (adminOnly && user.role !== "admin"))
    throw new ApiError(403, "You do not have permission for this action.");
  if (
    !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
    (!sameOrigin(request) ||
      !validCsrf(request.headers.get("x-csrf-token"), user))
  )
    throw new ApiError(
      403,
      "Your security token expired or the request origin is invalid. Reload and try again.",
    );
  return user;
}
export async function body(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 2_000_000)
    throw new ApiError(413, "Request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Send valid JSON.");
  const decoder = new TextDecoder();
  let raw = "";
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 2_000_000) {
      await reader.cancel();
      throw new ApiError(413, "Request is too large.");
    }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new ApiError(400, "Send valid JSON.");
  }
}
export function handle(fn: () => Promise<Response>) {
  return fn().catch((error: unknown) => {
    if (error instanceof ApiError)
      return json({ error: error.message }, error.status);
    if (error instanceof ZodError)
      return json(
        { error: "Check the highlighted fields.", issues: error.issues },
        422,
      );
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    )
      return json({ error: "That slug or email is already used." }, 409);
    // Never serialize driver errors: they can contain connection details or user content.
    console.error(
      "CMS operation failed:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return json(
      {
        error:
          "The operation could not be completed. Check server configuration and try again.",
      },
      500,
    );
  });
}
