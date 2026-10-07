import { ApiError, authenticated, body, json } from "@/lib/api";
import { productHandle } from "@/lib/commerce/http";
import { previewActivation, commitActivation } from "@/lib/commerce/activation";
import { rateLimit } from "@/lib/security/rate-limit";
export const runtime = "nodejs";
export const GET = (request: Request) =>
  productHandle(async () => {
    const user = await authenticated(request, true);
    if (!(await rateLimit(`products:activate:preview:${user.id}`, 120, 3600)))
      throw new ApiError(429, "Too many activation previews. Try again later.");
    const params = new URL(request.url).searchParams;
    return json({
      data: await previewActivation(
        {
          importId: params.get("importId"),
          limit: Number(params.get("limit") || 100),
        },
        user.id,
      ),
    });
  });
export const POST = (request: Request) =>
  productHandle(async () => {
    const user = await authenticated(request, true);
    if (!(await rateLimit(`products:activate:commit:${user.id}`, 120, 3600)))
      throw new ApiError(429, "Too many activation requests. Try again later.");
    return json({ data: await commitActivation(await body(request), user.id) });
  });
