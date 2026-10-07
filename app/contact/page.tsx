import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "Contact Name Retailer",
  description: informationPages.contact.description,
  robots: { index: false, follow: false },
};
export default function Page() {
  return <InformationPageView page={informationPages.contact} />;
}
