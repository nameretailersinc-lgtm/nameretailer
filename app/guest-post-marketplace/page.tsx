import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "Guest Post Marketplace Directory by DA, DR and Price",
  description: informationPages["guest-post-marketplace"].description,
};
export default function Page() {
  return (
    <InformationPageView page={informationPages["guest-post-marketplace"]} />
  );
}
