import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import nodemailer from "nodemailer";
function localMail() {
  return (
    process.env.MAIL_TRANSPORT === "local" &&
    process.env.NODE_ENV !== "production"
  );
}
function smtpOptions() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || 587);
  const user = process.env.SMTP_USER?.trim();
  let pass = process.env.SMTP_PASSWORD || "";
  // Google displays app passwords in four groups. The separators are not
  // part of the password; other SMTP providers may use meaningful spaces.
  if (
    host?.toLowerCase() === "smtp.gmail.com" &&
    /^[a-zA-Z0-9]{4}(?:[ \t]+[a-zA-Z0-9]{4}){3}$/.test(pass)
  )
    pass = pass.replace(/[ \t]/g, "");
  if (
    process.env.MAIL_TRANSPORT === "disabled" ||
    !host ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    (user && !pass)
  )
    return null;
  return {
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: user ? { user, pass } : undefined,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    disableFileAccess: true,
    disableUrlAccess: true,
  };
}
export function resetMailAvailable() {
  return localMail() || smtpOptions() !== null;
}
export function createSmtpTransport() {
  const options = smtpOptions();
  if (!options) throw new Error("SMTP is not configured.");
  return nodemailer.createTransport(options);
}
export async function verifySmtp() {
  const transport = createSmtpTransport();
  try {
    await transport.verify();
  } finally {
    transport.close();
  }
}
export async function sendResetMail(email: string, url: string) {
  const message = {
    to: email,
    from: process.env.SMTP_FROM || "Name Retailer <info@nameretailer.com>",
    subject: "Reset your Name Retailer password",
    text: `You requested a password reset. This link expires in 30 minutes:\n\n${url}\n\nIf you did not request this, ignore this message.`,
  };
  if (localMail()) {
    const folder = path.resolve(".local/mail");
    await mkdir(folder, { recursive: true });
    await writeFile(
      path.join(folder, `${Date.now()}-${randomUUID()}.json`),
      JSON.stringify(message),
      { mode: 0o600 },
    );
    return;
  }
  const transport = createSmtpTransport();
  try {
    await transport.sendMail(message);
  } finally {
    transport.close();
  }
}
