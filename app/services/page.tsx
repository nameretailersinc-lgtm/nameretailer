import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "Placement and content services",
  description: informationPages.services.description,
  robots: { index: false, follow: false },
};
export default function Page() {
  return <InformationPageView page={informationPages.services} />;
}
