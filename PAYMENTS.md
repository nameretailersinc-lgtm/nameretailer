# Stripe and PayPal checkout

Checkout uses hosted Stripe card payments and PayPal approval. All amounts are calculated from the authenticated cart on the server. Orders remain pending until a signed webhook or a server-to-server payment lookup verifies the order, USD amount and completed payment. Returning to the website alone does not mark an order paid.

## Environment

Add these keys to your private `.env` or hosting environment, then restart the application. Keep them out of `NEXT_PUBLIC_*` variables.

```dotenv
NEXTAUTH_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_ENV=sandbox
PAYPAL_WEBHOOK_ID=...
```

Each payment method becomes available only when all its keys are present. Either method can be configured independently. Hosted checkout needs no Stripe publishable key. Production requires an HTTPS return origin; localhost HTTP is accepted in development. MongoDB must support transactions, as the existing cart and account flows require.

## Stripe

Create a webhook endpoint at `https://your-domain.com/api/payments/stripe/webhook/` and copy its signing secret into `STRIPE_WEBHOOK_SECRET`. Subscribe to `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`.

For local testing, use Stripe test credentials and forward events with `stripe listen --forward-to localhost:3000/api/payments/stripe/webhook/`. Use that listener's signing secret locally. Complete a checkout with Stripe's documented test cards. Live mode requires the live secret key and the live endpoint's signing secret. See [Stripe Checkout](https://docs.stripe.com/payments/checkout) and [Stripe webhooks](https://docs.stripe.com/webhooks).

## PayPal

Create a REST app in the PayPal Developer Dashboard. Use its sandbox client ID and secret first. Register `https://your-domain.com/api/payments/paypal/webhook/` on the same app and copy the resulting webhook ID into `PAYPAL_WEBHOOK_ID`. Subscribe to `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.PENDING` and `PAYMENT.CAPTURE.DENIED`.

PayPal webhooks require a publicly reachable HTTPS endpoint; localhost is not reachable from PayPal. Approve checkout with a separate sandbox buyer account. The server validates the order before capture and verifies completed captures before marking it paid. Live mode requires `PAYPAL_ENV=live`, live app credentials and the live webhook ID. See [PayPal Orders v2](https://developer.paypal.com/api/orders/v2/) and [webhook signature verification](https://developer.paypal.com/api/rest/webhooks/rest/#link-verifysignature).

## Order processing

Customers can find private receipts under **My account → Your orders**. Administrators can search and filter orders, review payments, billing and placement briefs under **Placement orders** at `/admin/orders/`. Test payments are labeled. Verified paid orders can move through Queued, Processing, On hold and Completed. Completion requires a published URL for every placement. Customers can view their fulfillment status and published URLs; internal notes stay private to administrators. Changes use revision checks and are recorded in the audit log. A paid order means payment was received; publication processing remains manual.

Payment retries reuse one provider attempt per cart revision. Switching providers after starting an attempt is blocked to avoid duplicate charges. Check the existing order before changing the cart to create another attempt. Canceling hosted checkout preserves the planning cart. Confirmed payment clears only the cart revision used for that order, preserving changes made in another tab.

Order details and uploaded articles are saved separately from expiring planning drafts. Unpaid order uploads expire after seven days; paid order uploads remain available for processing. Configure an operational retention policy for paid orders and files. Payment state and order creation appear in the audit log.

The displayed total includes placement and selected writing prices in USD. Automatic tax calculation, refunds, disputes, automated publisher fulfillment and email notifications are not implemented. Manage refunds and disputes in the payment provider dashboard and reconcile them operationally; they do not automatically change the saved order status.

Before enabling live mode, complete a sandbox checkout for each method, confirm the provider's webhook delivery, verify the paid receipt and admin brief, and confirm cancellation leaves the cart intact. This code is tested with mocked provider responses; a real provider transaction requires your credentials and configured webhooks.
