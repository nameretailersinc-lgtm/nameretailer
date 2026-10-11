import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  auth: vi.fn(),
  limit: vi.fn(),
  start: vi.fn(),
  confirm: vi.fn(),
  order: vi.fn(),
  list: vi.fn(),
}));
vi.mock("@/lib/api", () => ({
  body: (request: Request) => request.json(),
  json: (value: unknown, status = 200) => Response.json(value, { status }),
}));
vi.mock("@/lib/mobile-auth", () => ({ mobileAuthenticated: state.auth }));
vi.mock("@/lib/account", () => ({ accountMutationLimit: state.limit }));
vi.mock("@/lib/commerce/http", () => ({
  productHandle: async (action: () => Promise<Response>) => {
    try {
      return await action();
    } catch {
      return Response.json({ error: "Sign in to continue." }, { status: 401 });
    }
  },
}));
vi.mock("@/lib/commerce/payments", () => ({
  startPayment: state.start,
  confirmPayment: state.confirm,
  getOrder: state.order,
  listOrders: state.list,
}));
import { POST as start } from "../../app/api/mobile/payments/route";
import { POST as confirm } from "../../app/api/mobile/payments/confirm/route";
import { GET as getOrder } from "../../app/api/mobile/orders/[id]/route";
import { GET as listOrders } from "../../app/api/mobile/orders/route";
const actor = { id: "mobile-customer", sessionVersion: 2 };
beforeEach(() => {
  vi.clearAllMocks();
  state.auth.mockResolvedValue(actor);
  state.limit.mockResolvedValue(undefined);
  state.start.mockResolvedValue({
    orderId: "a".repeat(64),
    url: "https://checkout.stripe.com/c/pay/fixture",
  });
  state.confirm.mockResolvedValue({ status: "paid" });
  state.order.mockResolvedValue({ id: "a".repeat(64) });
  state.list.mockResolvedValue([]);
});
const request = (path: string, data: unknown) =>
  new Request(`https://shop.example.com${path}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer fixture",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
describe("authenticated mobile payment routes", () => {
  it.each(["stripe", "paypal"])(
    "starts %s using only the authenticated owner and versioned selection",
    async (provider) => {
      const input = {
        cartVersion: 5,
        draftVersion: 2,
        provider,
        termsAccepted: true,
      };
      const incoming = request("/api/mobile/payments/", input);
      expect((await start(incoming)).status).toBe(201);
      expect(state.auth).toHaveBeenCalledWith(incoming);
      expect(state.limit).toHaveBeenCalledWith(actor, "payments");
      expect(state.start).toHaveBeenCalledWith(actor, input);
    },
  );
  it("rejects a request with no mobile identity before creating a payment", async () => {
    state.auth.mockRejectedValueOnce(new Error("No mobile session"));
    expect((await start(request("/api/mobile/payments/", {}))).status).toBe(
      401,
    );
    expect(state.start).not.toHaveBeenCalled();
    expect(state.limit).not.toHaveBeenCalled();
  });
  it("verifies payment server side for the mobile identity", async () => {
    const input = { orderId: "a".repeat(64) };
    await confirm(request("/api/mobile/payments/confirm/", input));
    expect(state.confirm).toHaveBeenCalledWith(actor, input);
    expect(state.limit).toHaveBeenCalledWith(actor, "payments");
  });
  it("scopes order retrieval and history to the mobile identity", async () => {
    const incoming = new Request(
      "https://shop.example.com/api/mobile/orders/",
      { headers: { Authorization: "Bearer fixture" } },
    );
    await getOrder(incoming, {
      params: Promise.resolve({ id: "a".repeat(64) }),
    });
    await listOrders(incoming);
    expect(state.order).toHaveBeenCalledWith(actor, "a".repeat(64));
    expect(state.list).toHaveBeenCalledWith(actor);
  });
});
