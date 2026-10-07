import { test, expect, type APIRequestContext } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  actor,
  draft,
  fixtures,
  key,
  mutation,
  validBody,
  type CmsRecord,
} from "./helpers";

const runFile = promisify(execFile);
test.describe("Scheduled runner and configuration boundaries", () => {
  let admin: APIRequestContext;
  test.beforeAll(async () => {
    admin = await actor((await fixtures()).admin);
  });
  test.afterAll(async () => {
    await admin?.dispose();
  });

  test("cron publishing refuses missing and invalid bearer credentials", async ({
    request,
  }) => {
    expect((await request.post("/api/cron/publish/")).status()).toBe(401);
    expect(
      (
        await request.post("/api/cron/publish/", {
          headers: { Authorization: "Bearer invalid-test-token" },
        })
      ).status(),
    ).toBe(401);
  });

  test("redirect CSV validates optional reserved slug and overlong title before committing the batch", async () => {
    for (const kind of ["slug", "title"]) {
      const prefix = key(`csv-${kind}`);
      const value =
        kind === "slug" ? "admin/forbidden" : `"${"x".repeat(301)}"`;
      const csv = `source,target,statusCode,${kind}\n/${prefix}-good/,/qa-destination/,301,${prefix}-valid\n/${prefix}-bad/,/qa-destination/,301,${value}`;
      const response = await mutation(
        admin,
        "post",
        "/api/admin/import/redirects",
        { csv },
      );
      expect(response.status()).toBe(422);
      const rows = (await (
        await admin.get(`/api/admin/records/redirects?q=${prefix}`)
      ).json()) as { total: number };
      expect(rows.total).toBe(0);
    }
  });

  test("real CLI publishes a due scheduled record and stores a publication revision", async () => {
    test.setTimeout(90000);
    const { database } = await fixtures();
    // The child cannot inherit an owner content database. Do not drop, rename or
    // modify unrelated accounts; this runner acts only on due test content.
    if (!/_test(?:_|$)/.test(database))
      throw new Error("Scheduled CLI QA requires a dedicated test database.");
    const payload = draft(key("scheduled-runner"));
    const due = Date.now() + 5000;
    const created = await mutation(
      admin,
      "post",
      "/api/admin/records/content",
      {
        ...payload,
        status: "scheduled",
        data: {
          ...payload.data,
          body: validBody,
          scheduledAt: new Date(due).toISOString(),
        },
      },
    );
    expect(created.status()).toBe(201);
    const original = ((await created.json()) as { data: CmsRecord }).data;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(0, due - Date.now()) + 100),
    );
    const result = await runFile(
      process.execPath,
      ["--import", "tsx", "scripts/db/publish-scheduled.ts"],
      {
        cwd: process.cwd(),
        env: { ...process.env, MONGODB_DB: database },
        timeout: 45000,
        maxBuffer: 10000,
      },
    );
    expect(result.stdout).toMatch(/"published":\s*\d+/);
    const record = (
      (await (
        await admin.get(`/api/admin/records/content/${original.id}`)
      ).json()) as { data: CmsRecord }
    ).data;
    expect(record.status).toBe("published");
    expect(record.version).toBe(original.version + 1);
    expect(record.data.scheduledAt).toBeNull();
    const publishedAt = Date.parse(String(record.data.publishedAt));
    expect(publishedAt).toBeGreaterThanOrEqual(due);
    expect(publishedAt).toBeLessThanOrEqual(Date.now());
    const revisions = (
      (await (
        await admin.get(`/api/admin/records/content/${original.id}/revisions`)
      ).json()) as { data: { version: number; snapshot: { status: string } }[] }
    ).data;
    expect(
      revisions.some(
        (revision) =>
          revision.version === original.version &&
          revision.snapshot.status === "scheduled",
      ),
    ).toBe(true);
  });
});
