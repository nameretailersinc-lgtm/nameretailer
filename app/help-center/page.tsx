import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "Name Retailer help center",
  description: informationPages["help-center"].description,
};
export default function Page() {
  return <InformationPageView page={informationPages["help-center"]} />;
}
