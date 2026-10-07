import { test, expect, type APIRequestContext } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import {
  actor,
  createDraft,
  draft,
  fixtures,
  key,
  mutation,
  origin,
  signIn,
  validBody,
  type Account,
  type CmsRecord,
} from "./helpers";

test.describe("CMS API permissions and state regression", () => {
  let admin: APIRequestContext;
  let editor: APIRequestContext;
  let author: APIRequestContext;
  let customer: APIRequestContext;

  test.beforeAll(async () => {
    const accounts = await fixtures();
    [admin, editor, author, customer] = await Promise.all([
      actor(accounts.admin),
      actor(accounts.editor),
      actor(accounts.author),
      actor(accounts.customer),
    ]);
  });
  test.afterAll(async () => {
    await Promise.all(
      [admin, editor, author, customer]
        .filter(Boolean)
        .map((api) => api.dispose()),
    );
  });

  test("anonymous endpoints deny access; customer cannot enter staff APIs", async ({
    request,
  }) => {
    for (const url of [
      "/api/admin/dashboard",
      "/api/admin/records/content",
      "/api/admin/settings",
      "/api/admin/users",
      "/api/admin/export?format=json",
    ]) {
      expect((await request.get(url)).status(), url).toBe(401);
      expect((await customer.get(url)).status(), url).toBe(403);
    }
    const response = await customer.post("/api/admin/records/content", {
      data: draft(),
      headers: { Origin: origin },
    });
    expect(response.status()).toBe(403);
  });

  test("CSRF rejects missing tokens, foreign origins and tokens from another actor", async () => {
    const payload = draft();
    const response = await admin.post("/api/admin/records/content", {
      data: payload,
      headers: { Origin: origin },
    });
    expect(response.status()).toBe(403);
    const {
      data: { token },
    } = (await (await admin.get("/api/admin/csrf")).json()) as {
      data: { token: string };
    };
    expect(
      (
        await admin.post("/api/admin/records/content", {
          data: payload,
          headers: { Origin: "https://foreign.example", "x-csrf-token": token },
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await author.post("/api/admin/records/content", {
          data: payload,
          headers: { Origin: origin, "x-csrf-token": token },
        })
      ).status(),
    ).toBe(403);
    const list = (await (
      await admin.get(`/api/admin/records/content?q=${payload.slug}`)
    ).json()) as { total: number };
    expect(list.total).toBe(0);
  });

  test("author sees only owned drafts and cannot publish or access admin configuration", async () => {
    const own = await createDraft(author);
    const other = await createDraft(admin);
    const account = (await fixtures()).author;
    expect(own.ownerId).toBe(account.id);
    const list = (await (
      await author.get("/api/admin/records/content?pageSize=100")
    ).json()) as { data: CmsRecord[] };
    expect(list.data.every((record) => record.ownerId === account.id)).toBe(
      true,
    );
    expect(
      (await author.get(`/api/admin/records/content/${other.id}`)).status(),
    ).toBe(404);
    const restrictedPreview = await author.get(`/admin/preview/${other.id}/`, {
      maxRedirects: 0,
    });
    expect([403, 404]).toContain(restrictedPreview.status());
    const customerPreview = await customer.get(`/admin/preview/${other.id}/`, {
      maxRedirects: 0,
    });
    expect([302, 303, 307, 308, 403, 404]).toContain(customerPreview.status());
    expect(
      (
        await mutation(
          author,
          "patch",
          `/api/admin/records/content/${other.id}`,
          { ...draft(other.title), version: other.version },
        )
      ).status(),
    ).toBe(404);
    const publish = await mutation(
      author,
      "patch",
      `/api/admin/records/content/${own.id}`,
      {
        title: own.title,
        slug: own.slug,
        status: "published",
        version: own.version,
        data: {
          ...own.data,
          body: validBody,
          seoTitle: own.title,
          metaDescription: "Test-only original page verifying authorization.",
          schemaType: "WebPage",
        },
      },
    );
    expect(publish.status()).toBe(403);
    for (const url of [
      "/api/admin/settings",
      "/api/admin/users",
      "/api/admin/records/redirects",
      "/api/admin/records/media",
    ]) {
      expect((await author.get(url)).status(), url).toBe(403);
    }
    expect((await editor.get("/api/admin/settings")).status()).toBe(403);
    expect((await editor.get("/api/admin/users")).status()).toBe(403);
    expect((await editor.get("/api/admin/records/media")).status()).toBe(200);
  });

  test("draft preview is private, noindex and never publicly served by its slug", async ({
    request,
  }) => {
    const record = await createDraft(admin);
    const anonymousPreview = await request.get(`/admin/preview/${record.id}/`, {
      maxRedirects: 0,
    });
    expect([302, 303, 307, 308]).toContain(anonymousPreview.status());
    expect(anonymousPreview.headers().location).toContain("/admin/login");
    const publicPage = await request.get(`/${record.slug}/`);
    expect(publicPage.status()).toBe(404);
    const staffPreview = await admin.get(`/admin/preview/${record.id}/`);
    expect(staffPreview.status()).toBe(200);
    expect(staffPreview.headers()["cache-control"]).toMatch(/no-store/);
    expect(staffPreview.headers()["cache-control"]).toMatch(/private/);
    expect(await staffPreview.text()).toContain("noindex");
    const privateApi = await admin.get(
      `/api/admin/records/content/${record.id}`,
    );
    expect(privateApi.headers()["x-robots-tag"]).toContain("noindex");
    expect(privateApi.headers()["cache-control"]).toContain("no-store");
  });

  test("stale saves conflict; history can restore the original as a draft", async () => {
    const original = await createDraft(admin);
    const updatedResponse = await mutation(
      admin,
      "patch",
      `/api/admin/records/content/${original.id}`,
      {
        title: `${original.title} revised`,
        slug: original.slug,
        status: "draft",
        version: original.version,
        data: { ...original.data, body: validBody },
      },
    );
    expect(updatedResponse.status()).toBe(200);
    const updated = ((await updatedResponse.json()) as { data: CmsRecord })
      .data;
    const stale = await mutation(
      admin,
      "patch",
      `/api/admin/records/content/${original.id}`,
      {
        ...draft("stale-writer"),
        slug: original.slug,
        version: original.version,
      },
    );
    expect(stale.status()).toBe(409);
    const current = (
      (await (
        await admin.get(`/api/admin/records/content/${original.id}`)
      ).json()) as { data: CmsRecord }
    ).data;
    expect(current.title).toBe(updated.title);
    const revisions = (
      (await (
        await admin.get(`/api/admin/records/content/${original.id}/revisions`)
      ).json()) as { data: { id: string; version: number }[] }
    ).data;
    const revision = revisions.find(
      (value) => value.version === original.version,
    );
    expect(revision).toBeDefined();
    const restore = await mutation(
      admin,
      "post",
      `/api/admin/records/content/${original.id}/restore`,
      { revisionId: revision!.id, version: updated.version },
    );
    expect(restore.status()).toBe(200);
    const restored = ((await restore.json()) as { data: CmsRecord }).data;
    expect(restored.status).toBe("draft");
    expect(restored.title).toBe(original.title);
    expect(restored.version).toBe(updated.version + 1);
  });

  test("publishing persists the selected status and sanitizes hostile editor HTML", async () => {
    const record = await createDraft(admin);
    const publish = await mutation(
      editor,
      "patch",
      `/api/admin/records/content/${record.id}`,
      {
        title: record.title,
        slug: record.slug,
        status: "published",
        version: record.version,
        data: {
          ...record.data,
          body: `${validBody}<script>window.stolen=true</script><p onclick="alert(1)">Safe text</p>`,
          seoTitle: record.title,
          metaDescription:
            "A test-only page checks publishing permissions and HTML sanitization.",
          schemaType: "WebPage",
        },
      },
    );
    expect(publish.status()).toBe(200);
    const result = ((await publish.json()) as { data: CmsRecord }).data;
    expect(result.status).toBe("published");
    expect(String(result.data.body)).not.toMatch(/<script|onclick\s*=/i);
  });

  test("search, stable title sort and pagination return matching distinct records", async () => {
    const prefix = key("paging");
    await createDraft(admin, `${prefix}-b`);
    await createDraft(admin, `${prefix}-a`);
    const url = `/api/admin/records/content?q=${prefix}&sort=title&direction=asc&pageSize=1`;
    const first = (await (await admin.get(`${url}&page=1`)).json()) as {
      data: CmsRecord[];
      total: number;
    };
    const second = (await (await admin.get(`${url}&page=2`)).json()) as {
      data: CmsRecord[];
      total: number;
    };
    expect(first.total).toBe(2);
    expect(first.data[0].title).toBe(`${prefix}-a`);
    expect(second.data[0].title).toBe(`${prefix}-b`);
    expect(first.data[0].id).not.toBe(second.data[0].id);
    const literal = (await (
      await admin.get("/api/admin/records/content?q=%5B%2A%5D")
    ).json()) as { data: CmsRecord[] };
    expect(literal.data).toHaveLength(0);
  });

  test("duplicate stays private; invalid bulk publication is atomic; scheduling validates its date", async () => {
    const original = await createDraft(admin);
    const duplicated = await mutation(
      admin,
      "post",
      `/api/admin/records/content/${original.id}/duplicate`,
    );
    expect(duplicated.status()).toBe(201);
    const copy = ((await duplicated.json()) as { data: CmsRecord }).data;
    expect(copy.id).not.toBe(original.id);
    expect(copy.slug).not.toBe(original.slug);
    expect(copy.status).toBe("draft");
    const readyResponse = await mutation(
      admin,
      "patch",
      `/api/admin/records/content/${copy.id}`,
      { ...copy, data: { ...copy.data, body: validBody } },
    );
    expect(readyResponse.status()).toBe(200);
    const ready = ((await readyResponse.json()) as { data: CmsRecord }).data;
    const invalidBulk = await mutation(admin, "post", "/api/admin/bulk", {
      collection: "content",
      ids: [ready.id, original.id],
      action: "publish",
    });
    expect(invalidBulk.status()).toBe(422);
    const unchanged = (
      (await (
        await admin.get(`/api/admin/records/content/${ready.id}`)
      ).json()) as { data: CmsRecord }
    ).data;
    expect(unchanged.version).toBe(ready.version);
    expect(unchanged.status).toBe("draft");
    expect(
      (
        await mutation(author, "post", "/api/admin/bulk", {
          collection: "content",
          ids: [ready.id],
          action: "publish",
        })
      ).status(),
    ).toBe(403);
    const expired = await mutation(
      admin,
      "patch",
      `/api/admin/records/content/${ready.id}`,
      {
        ...ready,
        status: "scheduled",
        data: {
          ...ready.data,
          scheduledAt: new Date(Date.now() - 60000).toISOString(),
        },
      },
    );
    expect(expired.status()).toBe(422);
    const future = await mutation(
      admin,
      "patch",
      `/api/admin/records/content/${ready.id}`,
      {
        ...ready,
        status: "scheduled",
        data: {
          ...ready.data,
          scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        },
      },
    );
    expect(future.status()).toBe(200);
    expect(((await future.json()) as { data: CmsRecord }).data.status).toBe(
      "scheduled",
    );
  });

  test("media validates alt and actual image contents; stores optimized public assets", async () => {
    const png = await sharp({
      create: { width: 1, height: 1, channels: 3, background: "#ffffff" },
    })
      .png()
      .toBuffer();
    const {
      data: { token },
    } = (await (await admin.get("/api/admin/csrf")).json()) as {
      data: { token: string };
    };
    const headers = { Origin: origin, "x-csrf-token": token };
    const missing = await admin.post("/api/admin/media", {
      headers,
      multipart: {
        file: { name: "fixture.png", mimeType: "image/png", buffer: png },
        alt: "",
        folder: "qa",
      },
    });
    expect(missing.status()).toBe(422);
    const spoofed = await admin.post("/api/admin/media", {
      headers,
      multipart: {
        file: {
          name: "fixture.png",
          mimeType: "image/png",
          buffer: Buffer.from("<script>not an image</script>"),
        },
        alt: "Fixture image",
        folder: "qa",
      },
    });
    expect(spoofed.status()).toBe(422);
    const upload = await admin.post("/api/admin/media", {
      headers,
      multipart: {
        file: { name: "fixture.png", mimeType: "image/png", buffer: png },
        alt: "A one-pixel fixture for upload regression",
        folder: "qa",
      },
    });
    expect(upload.status()).toBe(201);
    const media = ((await upload.json()) as { data: CmsRecord }).data;
    expect(media.data.mime).toBe("image/webp");
    expect(media.data.alt).toBe("A one-pixel fixture for upload regression");
    const decorative = await admin.post("/api/admin/media", {
      headers,
      multipart: {
        file: { name: "decorative.png", mimeType: "image/png", buffer: png },
        alt: "",
        decorative: "true",
        folder: "qa",
      },
    });
    expect(decorative.status()).toBe(201);
    const decorativeRecord = ((await decorative.json()) as { data: CmsRecord })
      .data;
    expect(decorativeRecord.data.decorative).toBe(true);
    expect(decorativeRecord.data.alt).toBe("");
    const contradictory = await admin.post("/api/admin/media", {
      headers,
      multipart: {
        file: { name: "decorative.png", mimeType: "image/png", buffer: png },
        alt: "Contradictory informative alt",
        decorative: "true",
        folder: "qa",
      },
    });
    expect(contradictory.status()).toBe(422);
    for (const [field, mime] of [
      ["url", "image/webp"],
      ["avifUrl", "image/avif"],
    ]) {
      const asset = await admin.get(String(media.data[field]));
      expect(asset.status()).toBe(200);
      expect(asset.headers()["content-type"]).toContain(mime);
    }
    expect(
      (
        await author.post("/api/admin/media", {
          headers,
          multipart: {
            file: { name: "fixture.png", mimeType: "image/png", buffer: png },
            alt: "Fixture image",
          },
        })
      ).status(),
    ).toBe(403);
    expect(
      (await admin.get("/media/qa/not-a-valid-storage-key.webp")).status(),
    ).toBe(404);
  });

  test("redirect CSV rejects invalid batches atomically and stores configuration without activation", async ({
    request,
  }) => {
    const prefix = key("redirect");
    const csv = `source,target,statusCode\n/${prefix}-good/,/target/,301\n/${prefix}-bad/,https://foreign.example/,301`;
    const invalid = await mutation(
      admin,
      "post",
      "/api/admin/import/redirects",
      { csv },
    );
    expect(invalid.status()).toBe(422);
    const absent = (await (
      await admin.get(`/api/admin/records/redirects?q=${prefix}`)
    ).json()) as { total: number };
    expect(absent.total).toBe(0);
    const valid = await mutation(admin, "post", "/api/admin/import/redirects", {
      csv: `source,target,statusCode\n/${prefix}-good/,/target/,301`,
    });
    expect(valid.status()).toBe(201);
    const rows = (await (
      await admin.get(`/api/admin/records/redirects?q=${prefix}`)
    ).json()) as { data: CmsRecord[] };
    expect(rows.data).toHaveLength(1);
    const source = await request.get(`/${prefix}-good/`, { maxRedirects: 0 });
    expect(source.status()).toBe(404);
  });

  test("settings, users and exports protect secrets and administrative access", async () => {
    const settings = await admin.get("/api/admin/settings");
    expect(settings.status()).toBe(200);
    const existing = (
      (await settings.json()) as { data: Record<string, unknown> }
    ).data;
    const update = await mutation(admin, "patch", "/api/admin/settings", {
      ...existing,
      brandName: "Name Retailer QA",
    });
    expect(update.status()).toBe(200);
    expect(
      (
        await mutation(editor, "patch", "/api/admin/settings", {
          ...existing,
          brandName: "Unauthorized",
        })
      ).status(),
    ).toBe(403);
    expect(
      (
        await mutation(admin, "patch", "/api/admin/settings", existing)
      ).status(),
    ).toBe(200);
    const users = await admin.get("/api/admin/users");
    expect(users.status()).toBe(200);
    expect(await users.text()).not.toMatch(
      /passwordHash|sessionVersion|mongodb(?:\+srv)?:\/\//i,
    );
    const self = await mutation(
      admin,
      "patch",
      `/api/admin/users/${(await fixtures()).admin.id}`,
      { active: false },
    );
    expect(self.status()).toBe(422);
    const exported = await admin.get(
      "/api/admin/export?format=json&collection=content",
    );
    expect(exported.status()).toBe(200);
    expect(await exported.text()).not.toMatch(
      /passwordHash|mongodb(?:\+srv)?:\/\//i,
    );
  });

  test("reset responses resist account enumeration; single-use token revokes existing sessions", async ({
    request,
  }) => {
    test.skip(
      process.env.TEST_RESET_MAIL_CAPTURE === "false",
      "Local mail capture is deliberately disabled in production; this flow is verified separately on the isolated development server.",
    );
    const password = randomBytes(24).toString("base64url");
    const email = `${key("reset")}@example.invalid`;
    const created = await mutation(admin, "post", "/api/admin/users", {
      name: "Reset test fixture",
      email,
      password,
      role: "editor",
      active: true,
    });
    expect(created.status()).toBe(201);
    const account = {
      email,
      password,
      id: ((await created.json()) as { data: { id: string } }).data.id,
    } satisfies Account;
    const oldSession = await actor(account);
    try {
      const invalidOrigin = await request.post("/api/account/forgot-password", {
        data: { email },
        headers: { Origin: "https://foreign.example" },
      });
      expect(invalidOrigin.status()).toBe(403);
      const known = await request.post("/api/account/forgot-password", {
        data: { email },
        headers: { Origin: origin },
      });
      const unknown = await request.post("/api/account/forgot-password", {
        data: { email: `${key("unknown")}@example.invalid` },
        headers: { Origin: origin },
      });
      expect(known.status()).toBe(200);
      expect(unknown.status()).toBe(200);
      expect(await known.json()).toEqual(await unknown.json());
      const mailFiles = await readdir(".local/mail");
      let token: string | undefined;
      for (const file of mailFiles) {
        const mail = JSON.parse(
          await readFile(path.join(".local/mail", file), "utf8"),
        ) as { to: string; text: string };
        if (mail.to === email) {
          const link = mail.text.match(
            /https?:\/\/\S+\/admin\/reset-password\/\?token=\S+/,
          )?.[0];
          if (link)
            token = new URL(link).searchParams.get("token") || undefined;
        }
      }
      expect(
        Boolean(token),
        "Development mail transport captured one reset token",
      ).toBe(true);
      const nextPassword = randomBytes(24).toString("base64url");
      const reset = await request.post("/api/account/reset-password", {
        data: { token, password: nextPassword },
        headers: { Origin: origin },
      });
      expect(reset.status()).toBe(200);
      expect((await oldSession.get("/api/admin/dashboard")).status()).toBe(401);
      const repeat = await request.post("/api/account/reset-password", {
        data: { token, password: nextPassword },
        headers: { Origin: origin },
      });
      expect(repeat.status()).toBe(422);
      await signIn(request, { ...account, password: nextPassword });
      expect((await request.get("/api/admin/dashboard")).status()).toBe(200);
    } finally {
      await oldSession.dispose();
    }
  });

  test("concurrent cross-demotion rechecks actor roles and preserves the primary administrator", async () => {
    const accounts: Account[] = [];
    for (let index = 0; index < 2; index++) {
      const email = `${key("race-admin")}@example.invalid`;
      const password = randomBytes(24).toString("base64url");
      const response = await mutation(admin, "post", "/api/admin/users", {
        name: "Concurrent admin fixture",
        email,
        password,
        role: "admin",
        active: true,
      });
      expect(response.status()).toBe(201);
      accounts.push({
        email,
        password,
        id: ((await response.json()) as { data: { id: string } }).data.id,
      });
    }
    const [left, right] = await Promise.all(
      accounts.map((account) => actor(account)),
    );
    try {
      const [leftCsrf, rightCsrf] = await Promise.all(
        [left, right].map(
          async (api) =>
            (
              (await (await api.get("/api/admin/csrf")).json()) as {
                data: { token: string };
              }
            ).data.token,
        ),
      );
      const responses = await Promise.all([
        left.patch(`/api/admin/users/${accounts[1].id}`, {
          data: { role: "editor" },
          headers: { Origin: origin, "x-csrf-token": leftCsrf },
        }),
        right.patch(`/api/admin/users/${accounts[0].id}`, {
          data: { role: "editor" },
          headers: { Origin: origin, "x-csrf-token": rightCsrf },
        }),
      ]);
      const statuses = responses.map((response) => response.status());
      expect(statuses.filter((status) => status === 200)).toHaveLength(1);
      expect(
        statuses.filter((status) => [401, 403].includes(status)),
      ).toHaveLength(1);
      const remaining = (
        (await (
          await admin.get("/api/admin/users?status=admin&pageSize=100")
        ).json()) as { data: { id: string }[] }
      ).data;
      expect(
        remaining.some((user) =>
          accounts.some((account) => account.id === user.id),
        ),
      ).toBe(true);
      const primary = (await fixtures()).admin;
      const preserved = (
        (await (
          await admin.get(
            `/api/admin/users?q=${encodeURIComponent(primary.email)}&status=admin`,
          )
        ).json()) as { data: { id: string; active: boolean }[] }
      ).data;
      expect(
        preserved.some((user) => user.id === primary.id && user.active),
      ).toBe(true);
      expect((await admin.get("/api/admin/dashboard")).status()).toBe(200);
    } finally {
      await Promise.all([left.dispose(), right.dispose()]);
    }
  });

  test("production without configured SMTP rejects reset safely without account-specific output", async ({
    request,
  }) => {
    test.skip(
      process.env.TEST_RESET_MAIL_CAPTURE !== "false",
      "Only applies to the production fixture server with no SMTP transport.",
    );
    const known = await request.post("/api/account/forgot-password", {
      data: { email: (await fixtures()).admin.email },
      headers: { Origin: origin },
    });
    const unknown = await request.post("/api/account/forgot-password", {
      data: { email: `${key("smtp-unconfigured")}@example.invalid` },
      headers: { Origin: origin },
    });
    expect(known.status()).toBe(503);
    expect(unknown.status()).toBe(503);
    expect(await known.json()).toEqual(await unknown.json());
  });
});
