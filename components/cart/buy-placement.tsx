import { PlacementInquiry } from "@/components/inquiries/placement-inquiry";

export function BuyPlacement({ productId }: { productId: string }) {
  return <PlacementInquiry productIds={[productId]} />;
}
