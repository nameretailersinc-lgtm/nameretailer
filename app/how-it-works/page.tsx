import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "How Name Retailer works",
  description: informationPages["how-it-works"].description,
  robots: { index: false, follow: false },
};
export default function Page() {
  return <InformationPageView page={informationPages["how-it-works"]} />;
}
