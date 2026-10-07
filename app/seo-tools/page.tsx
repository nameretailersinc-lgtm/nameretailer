import { DirectoryHero, ToolsShell } from "@/components/tools/presentation";
import { ToolDirectory } from "@/components/tools/directory";
export const metadata = {
  title: "Name Retailer free tools",
  description:
    "Free writing, image, conversion, markup and SEO research tools with clear capabilities and privacy.",
  alternates: { canonical: "https://nameretailer.com/seo-tools/" },
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <ToolsShell>
      <DirectoryHero />
      <ToolDirectory />
    </ToolsShell>
  );
}
