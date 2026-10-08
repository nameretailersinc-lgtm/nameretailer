import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "About Name Retailer: Guest Post Marketplace Team",
  description: informationPages.about.description,
};
export default function Page() {
  return <InformationPageView page={informationPages.about} />;
}
