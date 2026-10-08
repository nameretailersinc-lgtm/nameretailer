import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "Name Retailer Help Center: Accounts, Orders and Plans",
  description: informationPages["help-center"].description,
};
export default function Page() {
  return <InformationPageView page={informationPages["help-center"]} />;
}
