import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { handle, json } from "@/lib/api";
import { csrfToken } from "@/lib/security/csrf";
import { registrationCookie } from "@/lib/security/registration";
export const dynamic = "force-dynamic";
export const GET = () =>
  handle(async () => {
    const cookie = registrationCookie();
    const jar = await cookies();
    const old = jar.get(cookie.name)?.value;
    const id = old && /^[a-f0-9-]{36}$/.test(old) ? old : randomUUID();
    jar.set(cookie.name, id, {
      httpOnly: true,
      secure: cookie.secure,
      sameSite: "strict",
      path: "/",
      maxAge: 3600,
    });
    return json({ token: csrfToken({ id }, "registration") });
  });
