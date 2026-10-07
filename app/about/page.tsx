import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "About Name Retailer",
  description: informationPages.about.description,
  robots: { index: false, follow: false },
};
export default function Page() {
  return <InformationPageView page={informationPages.about} />;
}
