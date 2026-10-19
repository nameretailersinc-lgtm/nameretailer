import { ApiError, body, handle, json } from "@/lib/api";
import { INQUIRY_SUCCESS, inquiryInput, saveInquiry } from "@/lib/inquiries";
import { sameOrigin } from "@/lib/security/csrf";
import { clientAddress, rateLimit } from "@/lib/security/rate-limit";

export const POST = (request: Request) =>
  handle(async () => {
    if (!sameOrigin(request))
      throw new ApiError(403, "Reload this page and try again.");
    if (Number(request.headers.get("content-length") || 0) > 20_000)
      throw new ApiError(413, "Request is too large.");
    const input = inquiryInput.parse(await body(request));
    if (input.companyWebsite)
      return json({ success: true, message: INQUIRY_SUCCESS });
    if (
      !(await rateLimit(
        `inquiry:address:${clientAddress(request.headers)}`,
        30,
        3600,
      )) ||
      !(await rateLimit(`inquiry:email:${input.email}`, 5, 3600))
    )
      throw new ApiError(429, "Too many requests. Please try again later.");
    await saveInquiry(input);
    return json({ success: true, message: INQUIRY_SUCCESS });
  });
