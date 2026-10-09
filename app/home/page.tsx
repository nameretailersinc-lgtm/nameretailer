import { redirect } from "next/navigation";
export default function Page() {
  redirect("/");
}







// import type { Metadata } from "next";
// import { Suspense } from "react";
// import { Marketplace } from "@/components/marketplace/marketplace";
// import { HomeLanding } from "@/components/site/home";
// export const metadata: Metadata = {
//   title: { absolute: "Guest Post Marketplace: Compare Sites & Prices | Name Retailer" },
//   description:
//     "Browse guest-post publisher listings by topic, location, language, price and metrics, then plan your placements with Name Retailer.",
// };
// export default function Home() {
//   return (
//     <Suspense
//       fallback={
//         <main id="main" tabIndex={-1}>
//           <p>Loading marketplace…</p>
//         </main>
//       }
//     >
//    <HomeLanding />
//     </Suspense>
//   );
// }