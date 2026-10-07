"use client";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public issues?: unknown,
  ) {
    super(message);
  }
}
export function apiPath(path: string) {
  const [pathname, query] = path.split("?");
  return `${pathname.endsWith("/") ? pathname : pathname + "/"}${query ? "?" + query : ""}`;
}
let csrf: Promise<string> | undefined;
async function csrfToken() {
  csrf ??= fetch(apiPath("/api/admin/csrf"), {
    credentials: "same-origin",
    cache: "no-store",
  })
    .then(async (response) => {
      const body = await response.json();
      if (!response.ok || !body.data?.token)
        throw new ApiError(
          body.error || "Unable to prepare a secure request. Sign in again.",
          response.status,
        );
      return body.data.token as string;
    })
    .catch((error) => {
      csrf = undefined;
      throw error;
    });
  return csrf;
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const method = (options.method || "GET").toUpperCase();
  if (!["GET", "HEAD"].includes(method) && path.startsWith("/api/admin/"))
    headers.set("x-csrf-token", await csrfToken());
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await fetch(apiPath(path), {
    ...options,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) csrf = undefined;
    throw new ApiError(
      body.error ||
        `Request failed (${response.status}). Your changes have not been confirmed.`,
      response.status,
      body.issues,
    );
  }
  return body as T;
}
export function mutation<T>(path: string, method: string, value?: unknown) {
  return api<T>(path, {
    method,
    ...(value === undefined ? {} : { body: JSON.stringify(value) }),
  });
}
export function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.issues) {
    const issues = Array.isArray(error.issues)
      ? error.issues
          .map((issue) => {
            const item = issue as { path?: unknown[]; message?: string };
            return `${item.path?.join(".") || "Form"}: ${item.message || "Check this value."}`;
          })
          .join(" ")
      : JSON.stringify(error.issues);
    return `${error.message} ${issues}`;
  }
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please retry.";
}
