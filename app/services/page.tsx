import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "Placement and content services",
  description: informationPages.services.description,
};
export default function Page() {
  return <InformationPageView page={informationPages.services} />;
}
