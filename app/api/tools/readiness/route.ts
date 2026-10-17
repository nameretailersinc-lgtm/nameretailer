import { handle, json } from "@/lib/api";
import { toolInput } from "@/lib/tools/server";
import { fetchPage } from "@/lib/tools/fetch-page";

export const runtime = "nodejs";

export function POST(request: Request) {
  return handle(async () => {
    const url = await toolInput(request, "readiness");
    return json(await fetchPage(url.trim()));
  });
}
