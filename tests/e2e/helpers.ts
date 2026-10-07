import { readFile, mkdir, writeFile } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import {
  expect,
  request as playwrightRequest,
  type APIRequestContext,
} from "@playwright/test";

export type Account = { email: string; password: string; id: string };
export type Fixtures = {
  database: string;
  runId: string;
  admin: Account;
  editor: Account;
  author: Account;
  customer: Account;
};
export type CmsRecord = {
  id: string;
  title: string;
  slug: string;
  status: string;
  version: number;
  ownerId: string;
  data: Record<string, unknown>;
};
export const origin = process.env.TEST_BASE_URL || "http://localhost:3000";
const sessions = new Map<
  string,
  Awaited<ReturnType<APIRequestContext["storageState"]>>
>();

export async function fixtures(): Promise<Fixtures> {
  const data = JSON.parse(
    await readFile(".local/e2e.json", "utf8"),
  ) as Fixtures;
  if (
    !/_test(?:_|$)/.test(data.database) ||
    !["localhost", "127.0.0.1"].includes(new URL(origin).hostname)
  ) {
    throw new Error(
      "CMS regression tests require a dedicated _test database and a loopback server.",
    );
  }
  return data;
}

export async function signIn(api: APIRequestContext, account: Account) {
  const csrfResponse = await api.get("/api/auth/csrf");
  expect(csrfResponse.status()).toBe(200);
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
  const response = await api.post("/api/auth/callback/credentials", {
    form: {
      csrfToken,
      email: account.email,
      password: account.password,
      callbackUrl: `${origin}/admin/`,
      json: "true",
    },
    headers: { Origin: origin },
  });
  expect(response.status()).toBe(200);
  const session = await api.get("/api/auth/session");
  const data = (await session.json()) as { user?: { id?: string } };
  // Never include submitted credentials or reset URLs in assertion output.
  expect(
    Boolean(data.user?.id),
    "Credentials establish a real Auth.js session",
  ).toBe(true);
}

export async function actor(account: Account) {
  // Workers restart after a failure. Preserve private test sessions rather than
  // disabling the real login rate limiter or retrying credentials for every page.
  const file = `.local/qa-sessions/${createHash("sha256").update(`${origin}:${account.id}`).digest("hex")}.json`;
  let saved = sessions.get(account.id);
  if (!saved) {
    try {
      saved = JSON.parse(await readFile(file, "utf8")) as Awaited<
        ReturnType<APIRequestContext["storageState"]>
      >;
    } catch {
      /* First session for this fixture. */
    }
  }
  const api = await playwrightRequest.newContext({
    baseURL: origin,
    ...(saved ? { storageState: saved } : {}),
  });
  if (!saved) {
    await signIn(api, account);
    saved = await api.storageState();
    await mkdir(".local/qa-sessions", { recursive: true });
    await writeFile(file, JSON.stringify(saved), { mode: 0o600 });
  }
  sessions.set(account.id, saved);
  return api;
}

export async function mutation(
  api: APIRequestContext,
  method: "post" | "patch" | "delete",
  url: string,
  data?: unknown,
) {
  const response = await api.get("/api/admin/csrf");
  expect(response.status()).toBe(200);
  const {
    data: { token },
  } = (await response.json()) as { data: { token: string } };
  return api[method](url, {
    data,
    headers: { Origin: origin, "x-csrf-token": token },
  });
}

export function key(prefix: string) {
  return `qa-${prefix}-${randomUUID().slice(0, 12)}`;
}

export function draft(title = key("draft")) {
  return {
    title,
    slug: title.toLowerCase(),
    status: "draft",
    data: {
      type: "page",
      body: "<p>Isolated test draft. Do not publish this fixture on a live site.</p>",
      robotsIndex: false,
      robotsFollow: false,
      schemaType: "WebPage",
    },
  };
}

export async function createDraft(api: APIRequestContext, title?: string) {
  const response = await mutation(
    api,
    "post",
    "/api/admin/records/content",
    draft(title),
  );
  expect(response.status()).toBe(201);
  return ((await response.json()) as { data: CmsRecord }).data;
}

export const validBody =
  "<h2>Documented fixture publishing workflow</h2>" +
  "<p>This original test-only page records how the isolated CMS regression suite checks content editing. " +
  "An administrator creates a private draft, changes its title, reviews the stored version and publishes it in the test database. " +
  "A stale writer must receive a conflict rather than silently overwrite the latest content. The suite then inspects version history " +
  "and restores the initial draft. No public migration, genuine author attribution, live publication or search indexing is implied. " +
  "This page is a disposable quality-assurance fixture and must remain excluded from real customer-facing content.</p>";
