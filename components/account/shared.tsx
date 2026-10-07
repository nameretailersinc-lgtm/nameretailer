"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/site/chrome";
export class CustomerRequestError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function customerRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await response.json();
  if (!response.ok) {
    const issues = Array.isArray(data.issues)
      ? data.issues
          .map(
            (issue: { path?: string[]; message?: string }) =>
              `${issue.path?.join(".") || "Form"}: ${issue.message}`,
          )
          .join(" ")
      : "";
    throw new CustomerRequestError(
      issues || data.error || "Please try again.",
      response.status,
    );
  }
  return data as T;
}
export async function customerMutation<T>(
  path: string,
  method: string,
  data: unknown,
): Promise<T> {
  const { token } = await customerRequest<{ token: string }>(
    "/api/account/csrf/",
  );
  return customerRequest<T>(path, {
    method,
    body: JSON.stringify(data),
    headers: { "x-csrf-token": token },
  });
}
export function customerError(cause: unknown) {
  return cause instanceof Error
    ? cause.message
    : "The request failed. Please try again.";
}
export function CustomerFeedback({
  error,
  message,
}: {
  error: string;
  message?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) ref.current?.focus();
  }, [error]);
  return (
    <>
      {error && (
        <div className="customer-error" role="alert" tabIndex={-1} ref={ref}>
          {error}
        </div>
      )}
      {message && (
        <p className="customer-success" role="status">
          {message}
        </p>
      )}
    </>
  );
}
export function CustomerShell({
  title,
  header,
  children,
}: {
  title: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="reference-site reference-customer customer-site">
      <SiteHeader
        active={
          pathname.startsWith("/cart") || pathname.startsWith("/checkout")
            ? "cart"
            : "account"
        }
      />
      <main id="main" tabIndex={-1}>
        {header || (
          <>
            <p className="eyebrow">Your publication desk</p>
            <h1>{title}</h1>
          </>
        )}
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
