import type { CartView } from "./cart-types";
import type { BillingDetails } from "./checkout-validation";
import type { PaymentMethods } from "./payment-types";
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
  paymentAvailable: boolean;
  orderSubmissionAvailable: boolean;
  paymentMethods: PaymentMethods;
}
