import { getCheckout, putCheckout } from "@/lib/commerce/checkout";
import { paymentMethods } from "@/lib/commerce/payment-config";
import type { AccountIdentity } from "@/lib/account";
import type { CheckoutView } from "@/lib/commerce/checkout-types";
import { countryCodes } from "@/lib/commerce/countries";
export function mobileCheckoutView(view: CheckoutView) {
  const methods = paymentMethods();
  const paymentAvailable = methods.stripe || methods.paypal;
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const billingCountries = countryCodes
    .map((code) => ({ code, name: names.of(code) || code }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    ...view,
    paymentMethods: methods,
    paymentAvailable,
    billingCountries,
    orderSubmissionAvailable:
      paymentAvailable &&
      view.issues.length === 0 &&
      view.cart.items.length > 0 &&
      view.cart.totalCents !== null,
  };
}
export async function getMobileCheckout(actor: AccountIdentity) {
  return mobileCheckoutView(await getCheckout(actor));
}
export async function putMobileCheckout(actor: AccountIdentity, raw: unknown) {
  return mobileCheckoutView(await putCheckout(actor, raw));
}
