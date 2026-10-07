import { handle, json } from "@/lib/api";
import { accountAuthenticated } from "@/lib/account";
import { csrfToken } from "@/lib/security/csrf";
export const GET = (request: Request) =>
  handle(async () =>
    json({ token: csrfToken(await accountAuthenticated(request)) }),
  );
