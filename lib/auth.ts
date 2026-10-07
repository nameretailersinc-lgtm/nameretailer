import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { store } from "./db";
import { verifyPassword } from "./security/password";
import { rateLimit } from "./security/rate-limit";
import type { UserSummary } from "./cms/types";
import { authSecret } from "./security/secret";
const configuredSecret = authSecret();

export const authOptions: NextAuthOptions = {
  secret: configuredSecret,
  debug: false,
  logger: {
    error(code) {
      console.error("Authentication operation failed:", code);
    },
    warn(code) {
      console.warn("Authentication configuration:", code);
    },
    debug() {},
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login/" },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!configuredSecret) return null;
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password || email.length > 254 || password.length > 256)
          return null;
        if (
          !(await rateLimit(`login:${email}`, 8, 900)) ||
          !(await rateLimit("login:global", 500, 900))
        )
          return null;
        const { users } = await store();
        const user = await users.findOne({ email, active: true });
        // Run the same expensive hash when there is no account, reducing timing disclosure.
        const valid = await verifyPassword(
          password,
          user?.passwordHash || `scrypt:${"0".repeat(64)}:${"0".repeat(128)}`,
        );
        if (!user || !valid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sessionVersion = (
          user as unknown as { sessionVersion: number }
        ).sessionVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.sessionVersion = Number(token.sessionVersion);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/") && !url.startsWith("//"))
        return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {}
      return `${baseUrl}/admin/`;
    },
  },
};
export async function currentIdentity(): Promise<
  (UserSummary & { sessionVersion: number }) | null
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await (
    await store()
  ).users.findOne({
    id: session.user.id,
    active: true,
    sessionVersion: session.user.sessionVersion,
  });
  if (!user) return null;
  const { id, name, email, role, active, createdAt, sessionVersion } = user;
  return { id, name, email, role, active, createdAt, sessionVersion };
}
export async function currentUser(): Promise<UserSummary | null> {
  const identity = await currentIdentity();
  if (!identity) return null;
  const { sessionVersion: _version, ...user } = identity;
  void _version;
  return user;
}
