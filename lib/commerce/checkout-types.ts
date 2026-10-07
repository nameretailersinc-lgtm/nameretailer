import type { CartView } from "./cart-types";
import type { BillingDetails } from "./checkout-validation";
export interface CheckoutDraft {
  version: number;
  cartVersion: number;
  billing: BillingDetails;
  notes: string;
  paymentPreference: "stripe" | "paypal";
  updatedAt: string;
  expiresAt: string;
}
export interface CheckoutView {
  draft: CheckoutDraft | null;
  cart: CartView;
  issues: string[];
  paymentAvailable: false;
  orderSubmissionAvailable: false;
}
