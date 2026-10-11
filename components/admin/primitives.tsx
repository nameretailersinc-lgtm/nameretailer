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
import { Home, FileText, Database, ShoppingCart, LayoutGrid, Tags, Users, Image, Link2, Settings, History, PanelsTopLeft, Inbox, LoaderCircle, ChevronRight, type LucideIcon } from "lucide-react";

const headingIcons: Record<string, LucideIcon> = {
  "Workspace overview": Home, Content: FileText, "Create content": FileText,
  "Edit content": FileText, "Publications & inventory": Database,
  "Placement orders": ShoppingCart, Categories: LayoutGrid, Tags,
  Authors: Users, "Media library": Image, Redirects: Link2,
  "Site settings": Settings, Users, "Audit log": History,
  "Homepage sections": PanelsTopLeft, "Leads inbox": Inbox,
};

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
  const Icon = headingIcons[title] || LayoutGrid;
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow workspace-breadcrumb"><Link href="/admin/">Name Retailer</Link><ChevronRight size={12} aria-hidden="true" /><span>Editorial workspace</span></p>
        <div className="workspace-heading-copy">
          <span className="workspace-heading-icon"><Icon size={23} aria-hidden="true" /></span>
          <div><h1>{title}</h1>{description && <p className="muted">{description}</p>}</div>
        </div>
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
export function Panel({
  title,
  children,
  className,
  icon,
  actions,
  description,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  description?: string;
}) {
  return (
    <section className={clsx("panel", className)}>
      {title && <div className="panel-heading"><div className="panel-heading-copy">{icon && <span className="panel-heading-icon">{icon}</span>}<div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>{actions}</div>}
      {children}
    </section>
  );
}
export function Loading({ label = "Loading records…" }: { label?: string }) {
  return (
    <p role="status" className="loading" aria-live="polite">
      <LoaderCircle size={20} aria-hidden="true" />
      {label}
    </p>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty-state"><Inbox size={28} aria-hidden="true" /><div>{children}</div></div>;
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge" data-status={typeof children === "string" ? children.toLowerCase() : undefined}>{children}</span>;
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
