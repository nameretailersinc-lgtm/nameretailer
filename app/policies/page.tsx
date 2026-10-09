import { InformationPageView } from "@/components/site/information-page";
import { informationPages } from "@/lib/site/pages";
export const metadata = {
  robots: { index: false, follow: true },
  title: "Policy readiness · Rebuild preview",
  description: informationPages.policies.description,
};
export default function Page() {
  return <InformationPageView page={informationPages.policies} />;
}
