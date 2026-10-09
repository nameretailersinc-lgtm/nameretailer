/**
 * Single switch for the purchase flow. Payment adapters are not connected, so the
 * listing button describes the real action (saving a plan). Turn on only after
 * checkout can take and fulfil real orders.
 */
export const CHECKOUT_ENABLED = false;
export const placementActionLabel = CHECKOUT_ENABLED
  ? "Buy now"
  : "Add to plan";
