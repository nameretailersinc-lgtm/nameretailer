import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

export async function withProductionServer(check: (base: string) => Promise<void>) {
  if (process.env.SEO_BASE_URL) return check(process.env.SEO_BASE_URL.replace(/\/$/, ""));
  const port = process.env.SEO_PORT || "3210";
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", port, "-H", "127.0.0.1"], { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let log = "";
  child.stdout.on("data", chunk => { log = (log + String(chunk)).slice(-4000); });
  child.stderr.on("data", chunk => { log = (log + String(chunk)).slice(-4000); });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      if (child.exitCode !== null) throw new Error(`Production server exited (${child.exitCode}). ${log}`);
      try { ready = (await fetch(`${base}/robots.txt`, { signal: AbortSignal.timeout(2000) })).ok; } catch { /* starting */ }
      if (ready) break;
      await setTimeout(500);
    }
    if (!ready) throw new Error(`Production server failed to start. ${log}`);
    await check(base);
  } finally {
    child.kill();
  }
}
export function visibleHtml(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}
export async function pageHtml(base: string, path: string) {
  const response = await fetch(base + path, { headers: { "user-agent": "Googlebot" }, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.text();
}
