import { authenticated, handle, json } from "@/lib/api";
import { csrfToken } from "@/lib/security/csrf";
export const GET = (request: Request) =>
  handle(async () =>
    json({ data: { token: csrfToken(await authenticated(request)) } }),
  );
