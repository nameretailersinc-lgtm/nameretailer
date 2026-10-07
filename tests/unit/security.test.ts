import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { canAccess, canEdit, canPublish } from "@/lib/security/permissions";
import { csrfToken, validCsrf, sameOrigin } from "@/lib/security/csrf";
import type { CmsRecord, UserSummary } from "@/lib/cms/types";
const user: UserSummary = {
  id: "author-one",
  name: "Test only",
  email: "author@example.invalid",
  role: "author",
  active: true,
  createdAt: "2026-10-05T00:00:00.000Z",
};
const record: CmsRecord = {
  id: "record",
  collection: "content",
  title: "Test",
  slug: "test",
  status: "draft",
  ownerId: user.id,
  data: {},
  version: 1,
  createdAt: user.createdAt,
  updatedAt: user.createdAt,
};
describe("authentication security", () => {
  it("salts passwords and checks credentials without plaintext storage", async () => {
    const one = await hashPassword("A long test-only password");
    const two = await hashPassword("A long test-only password");
    expect(one).not.toBe(two);
    expect(await verifyPassword("A long test-only password", one)).toBe(true);
    expect(await verifyPassword("wrong", one)).toBe(false);
  });
  it("rejects weak passwords", async () => {
    await expect(hashPassword("short")).rejects.toThrow();
  });
  it("enforces author ownership and draft scope", () => {
    expect(canEdit(user, record)).toBe(true);
    expect(canEdit(user, { ...record, ownerId: "someone-else" })).toBe(false);
    expect(canEdit(user, { ...record, status: "published" })).toBe(false);
    expect(canEdit(user, { ...record, status: "scheduled" })).toBe(false);
    expect(canPublish(user)).toBe(false);
    expect(canAccess(user, "users" as never)).toBe(false);
    expect(canAccess({ ...user, role: "customer" }, "content")).toBe(false);
  });
  it("binds signed CSRF to identity, expiration and integrity", () => {
    process.env.NEXTAUTH_SECRET = "test-secret-not-production-".repeat(3);
    const token = csrfToken(user);
    expect(validCsrf(token, user)).toBe(true);
    expect(validCsrf(token, { ...user, id: "other" })).toBe(false);
    expect(validCsrf(token.slice(0, -2) + "ab", user)).toBe(false);
    expect(validCsrf(null, user)).toBe(false);
  });
  it("rejects cross-origin writes", () => {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    expect(
      sameOrigin(
        new Request("http://localhost:3000/api/admin/settings", {
          headers: { Origin: "https://attacker.invalid" },
        }),
      ),
    ).toBe(false);
    expect(
      sameOrigin(
        new Request("http://localhost:3000/api/admin/settings", {
          headers: { Origin: "http://localhost:3000" },
        }),
      ),
    ).toBe(true);
  });
});
