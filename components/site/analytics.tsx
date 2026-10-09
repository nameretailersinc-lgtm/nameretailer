import Script from "next/script";

const id = process.env.NEXT_PUBLIC_GA4_ID;
const validId = !!id && /^G-[A-Z0-9]{4,16}$/.test(id);

/**
 * GA4, off unless NEXT_PUBLIC_GA4_ID is set. There is no consent banner yet,
 * so Consent Mode defaults every storage type to "denied": GA4 sends cookieless
 * pings and sets no cookies. Granting analytics_storage needs a consent UI and
 * a cookie-policy update first. AI-assistant referrals (chatgpt.com,
 * perplexity.ai, copilot.microsoft.com, gemini.google.com) appear in GA4
 * as session sources without extra tagging.
 */
export function Analytics() {
  if (!validId) return null;
  return (
    <>
      <Script id="ga4-consent" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
gtag('js',new Date());gtag('config','${id}');`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
    </>
  );
}
