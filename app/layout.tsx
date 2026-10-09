import type { Metadata } from "next";
import { canonicalOrigin as origin } from "@/lib/seo/origin";
import { Inter, Source_Serif_4 } from "next/font/google";
import { serializeJsonLd, organizationNode } from "@/lib/seo/json-ld";
import { Analytics } from "@/components/site/analytics";
import "./globals.css";
import "./marketplace.css";
import "./customer.css";
import "./reference.css";
import "./journal.css";
import "./products.css";
import "./tools.css";
import "./navigation.css";
import "./marketplace-menu.css";
import "./commerce-flow.css";
import "./placement.css";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ui",
  adjustFontFallback: true,
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-editorial",
  adjustFontFallback: true,
});
const siteTitle =
  "Name Retailer | Guest Post Marketplace for Quality Backlinks";
const siteDescription =
  "Compare guest-post publications by topic, audience, placement price and supplied metrics, then prepare a placement plan or contact Name Retailer.";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: siteTitle,
    template: "%s | Name Retailer",
  },
  description: siteDescription,
  alternates: { canonical: "./" },
  // Search Console / Bing Webmaster ownership tokens; set in the deployment environment.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
};
const siteSchema = organizationNode();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteSchema) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
