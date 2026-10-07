import { body, handle, json } from "@/lib/api";
import {
  accountAuthenticated,
  accountMutationLimit,
  accountSummary,
  updateOwnProfile,
} from "@/lib/account";
export const GET = (request: Request) =>
  handle(async () =>
    json({ user: accountSummary(await accountAuthenticated(request)) }),
  );
export const PATCH = (request: Request) =>
  handle(async () => {
    const actor = await accountAuthenticated(request);
    await accountMutationLimit(actor, "profile");
    return json({ user: await updateOwnProfile(actor, await body(request)) });
  });
