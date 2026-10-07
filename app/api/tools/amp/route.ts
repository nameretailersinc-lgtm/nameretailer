import { ApiError, handle, json } from "@/lib/api";
import { toolInput } from "@/lib/tools/server";
import { newInstance, type Validator } from "amphtml-validator";
export const runtime = "nodejs";
let validatorPromise: Promise<Validator> | undefined;
function validator() {
  if (!validatorPromise) {
    validatorPromise = (async () => {
      const response = await fetch(
        "https://cdn.ampproject.org/v0/validator_wasm.js",
        { signal: AbortSignal.timeout(10000), redirect: "error" },
      );
      if (!response.ok) throw new Error("Validator unavailable.");
      const code = await response.text();
      if (code.length > 10000000)
        throw new Error("Validator exceeds size limit.");
      const instance = newInstance(code);
      await instance.init();
      return instance;
    })();
    validatorPromise.catch(() => {
      validatorPromise = undefined;
    });
  }
  return validatorPromise;
}
export function POST(request: Request) {
  return handle(async () => {
    const html = await toolInput(request, "amp");
    let instance: Validator;
    try {
      instance = await validator();
    } catch {
      throw new ApiError(
        503,
        "The official AMP validator could not be loaded. Check server access to cdn.ampproject.org and retry.",
      );
    }
    const result = instance.validateString(html);
    return json({
      result: `Official AMP validation: ${result.status}\n${result.errors
        .slice(0, 100)
        .map(
          (error) =>
            `${error.severity} · line ${error.line}, column ${error.col}: ${error.message}${error.specUrl ? "\n" + error.specUrl : ""}`,
        )
        .join(
          "\n",
        )}\n\n${result.errors.length > 100 ? "Showing the first 100 issues.\n" : ""}AMP conformance only; this does not test accessibility, performance, indexing or ranking.`,
    });
  });
}
