"use client";

import {
  useEffect,
  useRef,
  useId,
  isValidElement,
  cloneElement,
  type ReactElement,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { clsx } from "clsx";
import Link from "next/link";
import { Button as BaseButton } from "@/components/ui/button";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <BaseButton
      {...props}
      variant={
        variant === "primary"
          ? "default"
          : variant === "danger"
            ? "destructive"
            : variant
      }
      className={className}
    />
  );
}
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const generated = useId();
  const child = isValidElement(children)
    ? (children as ReactElement<{ id?: string; "aria-describedby"?: string }>)
    : null;
  const id = child?.props.id || generated;
  const hintId = `${id}-hint`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {child
        ? cloneElement(child, {
            id,
            ...(hint
              ? {
                  "aria-describedby": [child.props["aria-describedby"], hintId]
                    .filter(Boolean)
                    .join(" "),
                }
              : {}),
          })
        : children}
      {hint && <small id={hintId}>{hint}</small>}
    </div>
  );
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx("input", props.className)} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx("input", props.className)} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx("input", props.className)} />;
}
export function Feedback({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) ref.current?.focus();
  }, [error]);
  return (
    <>
      {error && (
        <div
          ref={ref}
          tabIndex={-1}
          className="feedback feedback-error"
          role="alert"
        >
          <strong>Unable to complete this action.</strong>
          <p>{error}</p>
          <Link href="/admin/login/">Sign in if your session expired</Link>
        </div>
      )}
      {success && (
        <div className="feedback feedback-success" role="status">
          {success}
        </div>
      )}
    </>
  );
}
export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">Name Retailer / Editorial workspace</p>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("panel", className)}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
export function Loading({ label = "Loading records…" }: { label?: string }) {
  return (
    <p role="status" className="loading" aria-live="polite">
      {label}
    </p>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}
export function date(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf())
    ? value
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsed);
}
export function useDirtyGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const leave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const navigate = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest?.("a");
      if (
        anchor &&
        anchor.href &&
        !anchor.hash &&
        anchor.target !== "_blank" &&
        !window.confirm("You have unsaved changes. Leave this page?")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", leave);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", leave);
      document.removeEventListener("click", navigate, true);
    };
  }, [dirty]);
}
