import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { findBlogCategory, categorySlug } from "@/lib/blog/categories";
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/blog") || request.nextUrl.pathname.startsWith("/guides")) {
    const value = request.nextUrl.searchParams.get("category");
    if (value) {
      const category = await findBlogCategory(value);
      if (category) {
        const target = request.nextUrl.clone();
        target.pathname = `/blog/category/${categorySlug(category)}/`;
        target.searchParams.delete("category");
        return NextResponse.redirect(target, 301);
      }
    }
    return NextResponse.next();
  }
  const nonce = randomBytes(16).toString("base64");
  const dev = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  if (
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/design-system") ||
    request.nextUrl.pathname.startsWith("/my-account") ||
    request.nextUrl.pathname.startsWith("/cart") ||
    request.nextUrl.pathname.startsWith("/checkout")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}
// Private pages are dynamic. Do not put nonce-based CSP on future public ISR pages:
// their cached HTML cannot contain a fresh per-request nonce.
export const config = {
  matcher: [
    "/blog/:path*",
    "/guides/:path*",
    "/admin/:path*",
    "/design-system/:path*",
    "/my-account/:path*",
    "/cart/:path*",
    "/checkout/:path*",
  ],
};
