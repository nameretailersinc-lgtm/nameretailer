import type { Metadata } from "next";
import { AdminPage } from "@/lib/admin-page";
import { DesignGallery } from "@/components/design-gallery";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Workspace design system",
  description:
    "Private component and style reference for the Name Retailer workspace.",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <AdminPage>
      <DesignGallery />
    </AdminPage>
  );
}
