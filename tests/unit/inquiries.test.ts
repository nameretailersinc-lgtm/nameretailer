import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rows: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  mail: vi.fn(),
  rate: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  getDb: async () => ({
    collection: () => ({ insertOne: mocks.insert, updateOne: mocks.update }),
  }),
}));
vi.mock("@/lib/commerce/products", () => ({
  productStore: async () => ({
    products: { find: () => ({ toArray: mocks.rows }) },
  }),
}));
vi.mock("@/lib/commerce/publication-profiles", () => ({
  activePublicationFilter: async () => ({ status: "active" }),
}));
vi.mock("@/lib/mail", () => ({ sendInquiryMail: mocks.mail }));
vi.mock("@/lib/security/rate-limit", () => ({
  rateLimit: mocks.rate,
  clientAddress: () => "unit-client",
}));
vi.mock("@/lib/auth", () => ({ currentUser: vi.fn() }));
vi.mock("@/lib/mobile-auth", () => ({
  optionalMobileIdentity: async () => null,
}));
import { inquiryInput, saveInquiry, INQUIRY_SUCCESS } from "@/lib/inquiries";
import { POST } from "@/app/api/inquiries/route";
import { POST as mobilePost } from "@/app/api/mobile/inquiries/route";

const first = "11111111-1111-4111-8111-111111111111";
const second = "22222222-2222-4222-8222-222222222222";
const input = {
  name: "Test buyer",
  email: "BUYER@example.com",
  websiteUrl: "https://example.com/resource",
  anchor: "Useful resource",
  budget: "USD 300 total",
  message: "Please confirm the article scope.",
  companyWebsite: "",
  productIds: [first, second],
};
const request = (data: unknown, origin = "http://localhost:3000") =>
  new Request("http://localhost:3000/api/inquiries/", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(data),
  });
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("NEXTAUTH_URL", "http://localhost:3000");
  mocks.rows.mockResolvedValue([
    {
      id: second,
      domain: "https://publisher-two.example",
      priceCents: 20000,
      currency: "USD",
    },
    {
      id: first,
      domain: "https://publisher-one.example",
      priceCents: 10000,
      currency: "USD",
    },
  ]);
  mocks.insert.mockResolvedValue({});
  mocks.update.mockResolvedValue({});
  mocks.mail.mockResolvedValue(false);
  mocks.rate.mockResolvedValue(true);
});
afterEach(() => vi.unstubAllEnvs());
it("validates required fields and rejects unsafe URLs, HTML, spoofed prices and oversized shortlists", () => {
  expect(inquiryInput.parse(input).email).toBe("buyer@example.com");
  for (const value of [
    { ...input, name: " " },
    { ...input, email: "invalid" },
    { ...input, websiteUrl: "javascript:alert(1)" },
    { ...input, websiteUrl: "https://user:password@example.com" },
    { ...input, message: "<img src=x>" },
    { ...input, priceCents: 1 },
    { ...input, productIds: Array(51).fill(first) },
  ])
    expect(inquiryInput.safeParse(value).success).toBe(false);
});
it("stores every selected publication with server prices and normalized buyer details", async () => {
  const response = await POST(request(input));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    success: true,
    message: INQUIRY_SUCCESS,
  });
  const saved = mocks.insert.mock.calls[0][0];
  expect(saved.email).toBe("buyer@example.com");
  expect(saved.placements.map((item: { id: string }) => item.id)).toEqual([
    first,
    second,
  ]);
  expect(
    saved.placements.map((item: { priceCents: number }) => item.priceCents),
  ).toEqual([10000, 20000]);
  expect(saved).not.toHaveProperty("companyWebsite");
  expect(mocks.update).toHaveBeenCalledWith(
    { id: saved.id },
    { $set: { notification: "not-configured" } },
  );
});
it("keeps a saved inquiry successful if SMTP fails", async () => {
  mocks.mail.mockRejectedValue(new Error("mail failed"));
  expect((await POST(request(input))).status).toBe(200);
  expect(mocks.insert).toHaveBeenCalledOnce();
  expect(mocks.update.mock.calls[0][1]).toEqual({
    $set: { notification: "failed" },
  });
});
it("rejects missing publications before storing an incomplete shortlist", async () => {
  mocks.rows.mockResolvedValue([{ id: first }]);
  await expect(saveInquiry(inquiryInput.parse(input))).rejects.toMatchObject({
    status: 409,
  });
  expect(mocks.insert).not.toHaveBeenCalled();
});
it("rejects cross-origin, invalid and rate-limited submissions without inserting", async () => {
  expect((await POST(request(input, "https://other.example"))).status).toBe(
    403,
  );
  expect((await POST(request({ ...input, email: "bad" }))).status).toBe(422);
  mocks.rate.mockResolvedValue(false);
  expect((await POST(request(input))).status).toBe(429);
  expect(mocks.insert).not.toHaveBeenCalled();
});
it("silently discards honeypot submissions", async () => {
  expect(
    (await POST(request({ ...input, companyWebsite: "spam" }))).status,
  ).toBe(200);
  expect(mocks.insert).not.toHaveBeenCalled();
  expect(mocks.mail).not.toHaveBeenCalled();
});

it("preserves the mobile inquiry format while sharing spam limits and notifications", async () => {
  const response = await mobilePost(
    request({
      name: input.name,
      email: input.email,
      domain: "https://example.com",
      message: input.message,
      phone: "",
    }),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    success: true,
    message: INQUIRY_SUCCESS,
  });
  expect(mocks.insert.mock.calls[0][0]).toMatchObject({
    domain: "https://example.com",
    source: "mobile-app",
  });
  expect(mocks.insert.mock.calls[0][0]).not.toHaveProperty("companyWebsite");
  expect(mocks.rate).toHaveBeenCalledWith(
    "inquiry:email:buyer@example.com",
    5,
    3600,
  );
  expect(mocks.mail).toHaveBeenCalledOnce();
});
