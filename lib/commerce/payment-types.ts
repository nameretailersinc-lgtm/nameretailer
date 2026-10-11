import type { CartItem } from "./cart-types";
import type { BillingDetails } from "./checkout-validation";

export type PaymentProvider = "stripe" | "paypal";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";
export type FulfillmentStatus =
  "queued" | "processing" | "on_hold" | "completed";
export const fulfillmentLabels: Record<FulfillmentStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  on_hold: "On hold",
  completed: "Completed",
};
export interface PublishedPlacement {
  productId: string;
  url: string;
}
export interface PaymentMethods {
  stripe: boolean;
  paypal: boolean;
}
export interface OrderView {
  id: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  currency: "USD";
  totalCents: number;
  items: CartItem[];
  billing: BillingDetails;
  notes: string;
  createdAt: string;
  paidAt: string | null;
  version: number;
  fulfillmentStatus: FulfillmentStatus;
  publishedPlacements: PublishedPlacement[];
}
export interface PaymentRedirect {
  orderId: string;
  url: string;
}
export type OrderSummary = Pick<
  OrderView,
  | "id"
  | "provider"
  | "status"
  | "currency"
  | "totalCents"
  | "createdAt"
  | "paidAt"
  | "fulfillmentStatus"
> & { placementCount: number };
export type AdminOrderSummary = OrderSummary & {
  billingEmail: string;
  live: boolean;
};
export type AdminOrderView = OrderView & {
  live: boolean;
  paymentReference: string | null;
  internalNotes: string;
};
