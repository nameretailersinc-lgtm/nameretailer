import { ApiError, body, handle, json } from "@/lib/api";
import { registerAccount, registrationMessage, registrationSchema } from "@/lib/account";

export const POST = (request: Request) =>
  handle(async () => {
    const raw = await body(request);
    const parsed = registrationSchema.safeParse({
      ...((raw && typeof raw === "object") ? raw : {}),
      website: "",
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid registration data.";
      throw new ApiError(422, issue);
    }

    await registerAccount(parsed.data, request);

    return json({
      message: registrationMessage,
      success: true,
    });
  });
