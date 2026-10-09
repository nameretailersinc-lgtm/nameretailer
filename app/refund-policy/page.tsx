import { InformationShell } from "@/components/site/information-page";
// TODO(owner): publish approved refund policy text. See OWNER_DECISIONS.md.
export const metadata = {title: "Refund policy | Name Retailer", description: "Refund policy availability and policy questions for Name Retailer.", alternates: {canonical: "https://nameretailer.com/refund-policy/"}, robots: {index:false,follow:true}};
export default function Page(){return <InformationShell title="Refund policy" label="Refund policy" description="This policy is not yet published." active="help" image="/01_guest_post_checklist.png"><section className="reference-card"><h2>Policy questions</h2><p>Contact <a href="mailto:info@nameretailer.com">info@nameretailer.com</a> for policy questions.</p></section></InformationShell>;}
