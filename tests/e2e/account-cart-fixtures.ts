import { createHash } from "node:crypto";
import { expect, type APIRequestContext } from "@playwright/test";
import { PRODUCT_CSV_HEADERS } from "../../lib/commerce/csv";
import type { Product, ProductInput } from "../../lib/commerce/types";
import {
  actor,
  fixtures,
  key,
  mutation,
  origin,
  type Account,
} from "./helpers";

export function accountInput() {
  return {
    name: "Synthetic QA customer",
    email: `${key("account")}@example.com`,
    password: `${key("password")}-QA-private`,
    website: "",
  };
}
export async function challenge(api: APIRequestContext) {
  const response = await api.get("/api/account/registration-csrf/");
  expect(response.status()).toBe(200);
  return (await response.json()).token as string;
}
export async function accountMutation(
  api: APIRequestContext,
  method: "put" | "patch" | "delete",
  path: string,
  data: unknown,
) {
  const response = await api.get("/api/account/csrf/");
  expect(response.status()).toBe(200);
  const { token } = await response.json();
  return api[method](path, {
    data,
    headers: { Origin: origin, "x-csrf-token": token },
  });
}
function product(domain: string, status: ProductInput["status"]): ProductInput {
  return {
    externalId: null,
    domain,
    status,
    country: "QA cart country",
    language: "English",
    category: "QA cart topic",
    priceCents: 12345,
    currency: "USD",
    metrics: {
      da: null,
      dr: null,
      tf: null,
      ur: null,
      traffic: null,
      referringDomains: null,
      backlinks: null,
      spamScore: null,
    },
    linkType: "",
    turnaround: "",
    requirements:
      "Synthetic planning-cart fixture. Not genuine customer inventory.",
  };
}
export function savedInput(value: Product): ProductInput {
  return {
    externalId: value.externalId,
    domain: value.domain,
    status: value.status,
    country: value.country,
    language: value.language,
    category: value.category,
    priceCents: value.priceCents,
    currency: value.currency,
    metrics: value.metrics,
    linkType: value.linkType,
    turnaround: value.turnaround,
    requirements: value.requirements,
  };
}
export async function seedCartProducts() {
  const admin = await actor((await fixtures()).admin);
  const create = async (status: ProductInput["status"]) => {
    const response = await mutation(
      admin,
      "post",
      "/api/admin/products/",
      product(`${key("cart")}.com`, status),
    );
    expect(response.status()).toBe(201);
    return (await response.json()).data as Product;
  };
  const manual = await create("active"),
    draft = await create("draft");
  const hosts = [`${key("writing")}.com`, `${key("no-writing")}.com`];
  const rows = hosts.map((domain, index) => {
    const row: Record<string, string> = {
      id: BigInt(
        `0x${createHash("sha256").update(key("external")).digest("hex")}`,
      ).toString(),
      domain,
      Price: "123.45",
      Article_Price: index ? "0.00" : "20.01",
      Article_Price_2: "0.00",
      Article_Price_3: index ? "9007199254740992.00" : "malformed",
      da: "0",
      dr: "0",
      traffic: "0",
      date_added: "0000-00-00 00:00:00",
      Description: "PRIVATE_CART_SOURCE_NOT_PUBLIC",
    };
    return PRODUCT_CSV_HEADERS.map(
      (header) => `"${(row[header] ?? "").replaceAll('"', '""')}"`,
    ).join(",");
  });
  const csv = `${PRODUCT_CSV_HEADERS.join(",")}\r\n${rows.join("\r\n")}`;
  const csrf = (await (await admin.get("/api/admin/csrf/")).json()).data.token;
  const upload = (action: string, sha256?: string) =>
    admin.post("/api/admin/products/import/", {
      headers: { Origin: origin, "x-csrf-token": csrf },
      multipart: {
        file: {
          name: "synthetic-cart.csv",
          mimeType: "text/csv",
          buffer: Buffer.from(csv),
        },
        action,
        ...(sha256 ? { sha256 } : {}),
      },
    });
  const preview = await upload("preview");
  expect(preview.status()).toBe(200);
  const summary = (await preview.json()).data;
  expect(summary.valid).toBe(2);
  expect((await upload("commit", summary.sha256)).status()).toBe(201);
  const imported: Product[] = [];
  for (const host of hosts) {
    const item = (
      await (await admin.get(`/api/admin/products/?q=${host}`)).json()
    ).data[0] as Product;
    const response = await mutation(
      admin,
      "patch",
      `/api/admin/products/${item.id}/`,
      { ...savedInput(item), status: "active", version: item.version },
    );
    expect(response.status()).toBe(200);
    imported.push((await response.json()).data as Product);
  }
  await admin.dispose();
  return { manual, draft, writing: imported[0], invalidAddons: imported[1] };
}
export async function newCustomer(api: APIRequestContext) {
  const input = accountInput();
  const token = await challenge(api);
  const response = await api.post("/api/account/register/", {
    data: input,
    headers: { Origin: origin, "x-csrf-token": token },
  });
  expect(response.status()).toBe(202);
  // Caller signs in explicitly. Registration must not establish a session.
  expect(
    (await (await api.get("/api/auth/session")).json()).user,
  ).toBeUndefined();
  return {
    input,
    account: {
      email: input.email,
      password: input.password,
      id: "",
    } as Account,
  };
}
