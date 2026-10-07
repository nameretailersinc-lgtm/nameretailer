import { cookies } from "next/headers";
import { ApiError, body, handle, json } from "@/lib/api";
import { registerAccount, registrationMessage } from "@/lib/account";
import { sameOrigin, validCsrf } from "@/lib/security/csrf";
import { registrationCookie } from "@/lib/security/registration";
export const POST = (request: Request) =>
  handle(async () => {
    const jar = await cookies();
    const cookie = registrationCookie();
    const id = jar.get(cookie.name)?.value;
    if (
      !sameOrigin(request) ||
      !id ||
      !/^[a-f0-9-]{36}$/.test(id) ||
      !validCsrf(request.headers.get("x-csrf-token"), { id }, "registration")
    )
      throw new ApiError(403, "Reload the form and try again.");
    await registerAccount(await body(request), request);
    jar.delete(cookie.name);
    return json({ message: registrationMessage }, 202);
  });
