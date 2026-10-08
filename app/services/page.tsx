import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "Guest Post Placement and Content Writing Services",
  description: informationPages.services.description,
};
export default function Page() {
  return <InformationPageView page={informationPages.services} />;
}
