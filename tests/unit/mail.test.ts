import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  createTransport: vi.fn(), sendMail: vi.fn(), verify: vi.fn(), close: vi.fn(),
  mkdir: vi.fn(), writeFile: vi.fn(),
}));
vi.mock("nodemailer", () => ({ default: { createTransport: state.createTransport } }));
vi.mock("node:fs/promises", () => ({ mkdir: state.mkdir, writeFile: state.writeFile }));
import { createSmtpTransport, resetMailAvailable, sendResetMail, verifySmtp } from "@/lib/mail";
beforeEach(() => {
  vi.clearAllMocks();
  state.createTransport.mockReturnValue({ sendMail: state.sendMail, verify: state.verify, close: state.close });
  state.sendMail.mockResolvedValue(undefined);
  state.verify.mockResolvedValue(true);
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("MAIL_TRANSPORT", "smtp");
  vi.stubEnv("SMTP_HOST", "smtp.gmail.com");
  vi.stubEnv("SMTP_PORT", "587");
  vi.stubEnv("SMTP_USER", "fixture@example.com");
  vi.stubEnv("SMTP_PASSWORD", "aaaa bbbb cccc dddd");
  vi.stubEnv("SMTP_FROM", "Name Retailer <fixture@example.com>");
});
afterEach(() => vi.unstubAllEnvs());
describe("SMTP configuration and delivery", () => {
  it("uses Gmail app passwords without display separators and requires STARTTLS", async () => {
    expect(resetMailAvailable()).toBe(true);
    await sendResetMail("buyer@example.com", "https://example.com/reset-password/?token=fixture");
    expect(state.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: "smtp.gmail.com", port: 587, secure: false, requireTLS: true,
      auth: { user: "fixture@example.com", pass: "aaaabbbbccccdddd" },
      disableFileAccess: true, disableUrlAccess: true,
    }));
    expect(state.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: "buyer@example.com", from: "Name Retailer <fixture@example.com>",
      subject: "Reset your Name Retailer password",
    }));
    expect(state.close).toHaveBeenCalledOnce();
  });
  it("preserves password spaces for other providers and uses TLS on port 465", () => {
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_PORT", "465");
    createSmtpTransport();
    expect(state.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      secure: true, requireTLS: false, auth: { user: "fixture@example.com", pass: "aaaa bbbb cccc dddd" },
    }));
  });
  it("verifies authentication without sending email and closes the connection", async () => {
    await verifySmtp();
    expect(state.verify).toHaveBeenCalledOnce();
    expect(state.sendMail).not.toHaveBeenCalled();
    expect(state.close).toHaveBeenCalledOnce();
  });
  it("closes the connection when delivery or verification fails", async () => {
    state.sendMail.mockRejectedValueOnce(new Error("Delivery failed"));
    await expect(sendResetMail("buyer@example.com", "https://example.com/reset")).rejects.toThrow("Delivery failed");
    state.verify.mockRejectedValueOnce(new Error("Authentication failed"));
    await expect(verifySmtp()).rejects.toThrow("Authentication failed");
    expect(state.close).toHaveBeenCalledTimes(2);
  });
  it.each(["0", "65536", "invalid"])("rejects invalid SMTP port %s", (port) => {
    vi.stubEnv("SMTP_PORT", port);
    expect(resetMailAvailable()).toBe(false);
    expect(createSmtpTransport).toThrow("SMTP is not configured");
    expect(state.createTransport).not.toHaveBeenCalled();
  });
  it("keeps disabled email off even when credentials are present", async () => {
    vi.stubEnv("MAIL_TRANSPORT", "disabled");
    expect(resetMailAvailable()).toBe(false);
    await expect(sendResetMail("buyer@example.com", "https://example.com/reset")).rejects.toThrow("SMTP is not configured");
    expect(state.createTransport).not.toHaveBeenCalled();
  });
  it("requires a password for authenticated SMTP", () => {
    vi.stubEnv("SMTP_PASSWORD", "");
    expect(resetMailAvailable()).toBe(false);
  });
  it("keeps local mail in development without connecting to SMTP", async () => {
    vi.stubEnv("MAIL_TRANSPORT", "local");
    await sendResetMail("buyer@example.com", "https://example.com/reset");
    expect(state.writeFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), { mode: 0o600 });
    expect(state.createTransport).not.toHaveBeenCalled();
  });
  it("never captures password resets locally in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MAIL_TRANSPORT", "local");
    vi.stubEnv("SMTP_HOST", "");
    expect(resetMailAvailable()).toBe(false);
    await expect(sendResetMail("buyer@example.com", "https://example.com/reset")).rejects.toThrow("SMTP is not configured");
    expect(state.writeFile).not.toHaveBeenCalled();
  });
});
