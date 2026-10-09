import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { serializeJsonLd } from "@/lib/seo/structured-data";
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
const origin = "https://nameretailer.com";
const siteTitle =
  "Name Retailer | Guest Post Marketplace for Quality Backlinks";
const siteDescription =
  "Compare guest-post publications by topic, audience, placement price and supplied metrics, then plan and order placements and content services with Name Retailer.";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: siteTitle,
    template: "%s | Name Retailer",
  },
  description: siteDescription,
  alternates: { canonical: "./" },

};
const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": `${origin}/#organization`,
      name: "Name Retailer",
      url: `${origin}/`,
      logo: `${origin}/icon.png`,
      image: `${origin}/logo.jpg`,
      description: siteDescription,
      email: "info@nameretailer.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "26 - G Hamriyah Freezone",
        addressLocality: "Sharjah",
        addressCountry: "AE",
      },
      areaServed: "Worldwide",
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      url: `${origin}/`,
      name: "Name Retailer",
      description: siteDescription,
      inLanguage: "en",
      publisher: { "@id": `${origin}/#organization` },
    },
  ],
};
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
      </body>
    </html>
  );
}
