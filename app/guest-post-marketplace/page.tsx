import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "Name Retailer marketplace directory",
  description: informationPages["guest-post-marketplace"].description,
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <InformationPageView page={informationPages["guest-post-marketplace"]} />
  );
}
