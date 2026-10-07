import { getDb } from "./db";
export const defaultSettings = {
  brandName: "Name Retailer",
  contactEmail: "info@nameretailer.com",
  address: "26 - G Hamriyah Freezone, Sharjah, United Arab Emirates",
  logo: "",
  socialLinks: [],
  ga4Id: "",
  gtmId: "",
  googleVerification: "",
  metaPixelId: "",
  robotsText:
    "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /my-account/\nDisallow: /cart/\nDisallow: /checkout/\n",
  llmsText:
    "# Name Retailer\n\nGuest-post marketplace and content services. Public content migration is pending.\n",
  llmsFullText: "",
  sitemapEnabled: true,
};
export async function getSettings() {
  const saved = await (
    await getDb()
  )
    .collection<{ key: string; data: Record<string, unknown> }>("cms_settings")
    .findOne({ key: "site" });
  return { ...defaultSettings, ...(saved?.data || {}) };
}
