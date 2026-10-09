import { InformationShell } from "@/components/site/information-page";
// TODO(owner): publish approved terms of service text. See OWNER_DECISIONS.md.
export const metadata = {title: "Terms of service | Name Retailer", description: "Terms of service availability and policy questions for Name Retailer.", alternates: {canonical: "https://nameretailer.com/terms/"}, robots: {index:false,follow:true}};
export default function Page(){return <InformationShell title="Terms of service" label="Terms of service" description="This policy is not yet published." active="help" image="/01_guest_post_checklist.png"><section className="reference-card"><h2>Policy questions</h2><p>Contact <a href="mailto:info@nameretailer.com">info@nameretailer.com</a> for policy questions.</p></section></InformationShell>;}
