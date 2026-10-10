import { expect, it } from "vitest";
import { cookiePolicy } from "@/lib/site/legal/cookies";
import { privacyPolicy } from "@/lib/site/legal/privacy";

const text = (blocks: typeof cookiePolicy) => JSON.stringify(blocks);

it("lists only cookies the new site sets", () => {
  const cookies = text(cookiePolicy);
  for (const legacy of ["PHPSESSID", "Google Ads", "Facebook"])
    expect(cookies).not.toContain(legacy);
  const table = cookiePolicy.find((block) => block.type === "table");
  expect(table && "rows" in table && table.rows.map((row) => row[0])).toEqual([
    "_ga and _ga_*",
    "__Secure-next-auth.session-token",
    "__Host-next-auth.csrf-token",
    "__Secure-next-auth.callback-url",
    "__Host-nr-registration",
  ]);
});

it("keeps the owner-confirmed data controller in the privacy policy", () => {
  const privacy = text(privacyPolicy);
  expect(privacy).toContain("Name Retailer Inc");
  expect(privacy).toContain("Delaware");
  expect(privacy).not.toMatch(/deleted as soon as"/);
});
