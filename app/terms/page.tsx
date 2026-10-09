import { pageMetadata } from "@/lib/seo/page-metadata";
import { facetMetadata } from "@/lib/seo/facets";
import type { SearchParams } from "@/lib/commerce/marketplace-query";
import type { Metadata } from "next";
import { InformationShell } from "@/components/site/information-page";
// TODO(owner): publish approved terms of service text. See OWNER_DECISIONS.md.
const baseMetadata: Metadata = {title: "Terms of service | Name Retailer", description: "Terms of service availability and policy questions for Name Retailer.", alternates: {canonical: "https://nameretailer.com/terms/"}, robots: {index:false,follow:true}};
export default function Page(){return <InformationShell title="Terms of service" label="Terms of service" description="This policy is not yet published." active="help" image="/01_guest_post_checklist.png"><section className="reference-card"><h2>Policy questions</h2><p>Contact <a href="mailto:info@nameretailer.com">info@nameretailer.com</a> for policy questions.</p></section></InformationShell>;}

export async function generateMetadata({searchParams}: {searchParams: Promise<SearchParams>}) {const facets=facetMetadata("/terms/",await searchParams);return pageMetadata({...baseMetadata, alternates: facets.alternates, robots: {...facets.robots as object,...baseMetadata.robots as object}},"/terms/");}
