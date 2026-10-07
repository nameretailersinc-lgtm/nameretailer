import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import nodemailer from "nodemailer";
export function resetMailAvailable() {
  return (
    (process.env.MAIL_TRANSPORT === "local" &&
      process.env.NODE_ENV !== "production") ||
    !!process.env.SMTP_HOST
  );
}
export async function sendResetMail(email: string, url: string) {
  const message = {
    to: email,
    from: process.env.SMTP_FROM || "Name Retailer <info@nameretailer.com>",
    subject: "Reset your Name Retailer password",
    text: `You requested a password reset. This link expires in 30 minutes:\n\n${url}\n\nIf you did not request this, ignore this message.`,
  };
  if (
    process.env.MAIL_TRANSPORT === "local" &&
    process.env.NODE_ENV !== "production"
  ) {
    const folder = path.resolve(".local/mail");
    await mkdir(folder, { recursive: true });
    await writeFile(
      path.join(folder, `${Date.now()}-${randomUUID()}.json`),
      JSON.stringify(message),
      { mode: 0o600 },
    );
    return;
  }
  if (!process.env.SMTP_HOST) throw new Error("SMTP is not configured.");
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  await transport.sendMail(message);
}
