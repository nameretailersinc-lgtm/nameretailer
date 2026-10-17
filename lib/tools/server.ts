import { ApiError, body } from "@/lib/api";
import { sameOrigin } from "@/lib/security/csrf";
import { clientAddress, rateLimit } from "@/lib/security/rate-limit";
export async function toolInput(
  request: Request,
  name: string,
): Promise<string> {
  // A production NEXTAUTH_URL in .env must not disable local tool development.
  const requestUrl = new URL(request.url);
  const localOrigin =
    process.env.NODE_ENV === "development" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(requestUrl.hostname) &&
    request.headers.get("origin") === requestUrl.origin;
  if (!sameOrigin(request) && !localOrigin)
    throw new ApiError(403, "Use this tool from the site.");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError(415, "Send JSON input.");
  if (
    !(await rateLimit(
      `tool:${name}:${clientAddress(request.headers)}`,
      60,
      3600,
    ))
  )
    throw new ApiError(429, "Too many requests. Please try again later.");
  const value = await body(request);
  if (
    !value ||
    typeof value !== "object" ||
    !("input" in value) ||
    typeof value.input !== "string" ||
    !value.input.trim() ||
    value.input.length > 100000
  )
    throw new ApiError(
      422,
      "Provide nonempty input, at most 100,000 characters.",
    );
  return value.input;
}
