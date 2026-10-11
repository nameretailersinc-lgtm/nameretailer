import { body, handle, json } from "@/lib/api";
import { accountMutationLimit, accountSummary, updateOwnProfile } from "@/lib/account";
import { mobileAuthenticated } from "@/lib/mobile-auth";

export const GET = (request: Request) =>
  handle(async () => {
    const actor = await mobileAuthenticated(request);
    return json({ user: accountSummary(actor) });
  });

export const PATCH = (request: Request) =>
  handle(async () => {
    const actor = await mobileAuthenticated(request);
    await accountMutationLimit(actor, "profile");
    const raw = await body(request);
    const updated = await updateOwnProfile(actor, raw);
    return json({ user: updated });
  });
