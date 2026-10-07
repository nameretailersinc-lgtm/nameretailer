import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
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
export const metadata: Metadata = {
  title: {
    default: "Name Retailer — Guest-post marketplace",
    template: "%s | Name Retailer",
  },
  description:
    "Compare guest-post publications by topic, audience, placement price and supplied metrics with Name Retailer.",
  robots: { index: false, follow: false },
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
        {children}
      </body>
    </html>
  );
}
