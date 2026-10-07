import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  title: "Policy readiness · Rebuild preview",
  description: informationPages.policies.description,
  robots: { index: false, follow: false },
};
export default function Page() {
  return <InformationPageView page={informationPages.policies} />;
}
