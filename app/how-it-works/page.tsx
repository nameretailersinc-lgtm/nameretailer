import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "How Name Retailer Works: Buy Guest Posts Step by Step",
  description: informationPages["how-it-works"].description,
};
export default function Page() {
  return <InformationPageView page={informationPages["how-it-works"]} />;
}
