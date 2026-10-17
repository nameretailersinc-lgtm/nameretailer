import dotenv from "dotenv";
import { spawn } from "node:child_process";
dotenv.config({ quiet: true });
const port = process.argv[2] || "3250";
if (!/^\d{4,5}$/.test(port)) throw new Error("Use a valid local QA port.");
// Resolver selection is explicit: production must use its own network configuration.
const dns = process.env.MONGODB_DNS_SERVERS;
if (!dns)
  throw new Error(
    "Set MONGODB_DNS_SERVERS explicitly for this local production QA run. This Windows host refuses the default MongoDB SRV lookup.",
  );
const child = spawn(process.execPath, [".next/standalone/server.js"], {
  windowsHide: true,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: port,
    HOSTNAME: "127.0.0.1",
    MAIL_TRANSPORT: "disabled",
    SMTP_HOST: "",
    STRIPE_SECRET_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
    PAYPAL_CLIENT_ID: "",
    PAYPAL_CLIENT_SECRET: "",
    PAYPAL_WEBHOOK_ID: "",
  },
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code || 0));
