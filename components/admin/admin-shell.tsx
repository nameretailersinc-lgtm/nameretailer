"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Home, FileText, Image, Settings, Users, Menu, LogOut, Database, ShoppingCart, LayoutGrid, Tags, Link2, TriangleAlert, ListTree, PanelsTopLeft, PanelBottom, Mail, History, Palette, LockKeyhole, Search, Sun, Moon, Bell, ChevronDown, ExternalLink, X, PanelLeftClose } from "lucide-react";
import type { UserSummary } from "@/lib/cms/types";

const links = [
  ["/admin/", "Overview", Home, "author"],
  ["/admin/content/", "Content", FileText, "author"],
  ["/admin/products/", "Publications & inventory", Database, "admin"],
  ["/admin/orders/", "Placement orders", ShoppingCart, "admin"],
  ["/admin/categories/", "Categories", LayoutGrid, "editor"],
  ["/admin/tags/", "Tags", Tags, "editor"],
  ["/admin/authors/", "Authors", Users, "editor"],
  ["/admin/media/", "Media library", Image, "editor"],
  ["/admin/redirects/", "Redirects", Link2, "admin"],
  ["/admin/notFound/", "404 log", TriangleAlert, "admin"],
  ["/admin/menus/", "Menus", ListTree, "admin"],
  ["/admin/sections/", "Homepage sections", PanelsTopLeft, "admin"],
  ["/admin/widgets/", "Footer & widgets", PanelBottom, "admin"],
  ["/admin/leads/", "Leads inbox", Mail, "admin"],
  ["/admin/subscribers/", "Subscribers", Users, "admin"],
  ["/admin/settings/", "Site settings", Settings, "admin"],
  ["/admin/users/", "Users", Users, "admin"],
  ["/admin/audit/", "Audit log", History, "admin"],
  ["/design-system/", "Design system", Palette, "admin"],
] as const;
const rank = { customer: 0, author: 1, editor: 2, admin: 3 };
const WorkspaceUser = createContext<UserSummary | null>(null);
export function useWorkspaceUser() { return useContext(WorkspaceUser); }

function subscribeTheme(callback: () => void) {
  window.addEventListener("admin-theme-change", callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener("admin-theme-change", callback); window.removeEventListener("storage", callback); };
}
function currentTheme() {
  try { return localStorage.getItem("admin-theme") === "dark"; } catch { return false; }
}

export function WorkspaceBrand() {
  return (
    <Link href="/admin/" className="workspace-brand" aria-label="Name Retailer workspace overview">
      <svg viewBox="0 0 36 36" width="34" height="34" fill="none" aria-hidden="true">
        <path d="M4 4 19 15 30 32 15 26 6 17l4-2L4 4Z" fill="#36B5EF" />
        <path d="M30 5 21 13l9 19V5Z" fill="#16D5A0" />
        <path d="m11 18 19 14-11-17" fill="#0785C1" />
      </svg>
      <span className="workspace-brand-copy">Name Retailer<small>Editorial workspace</small></span>
    </Link>
  );
}

export function AdminShell({ children, user }: { children: ReactNode; user: UserSummary }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchIn, setSearchIn] = useState(["products", "authors", "categories"].find((value) => path.startsWith(`/admin/${value}/`)) || "content");
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const profileRef = useRef<HTMLDetailsElement>(null);
  const dark = useSyncExternalStore(subscribeTheme, currentTheme, () => false);

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === "Escape") {
        if (open) { setOpen(false); menuRef.current?.focus(); }
        if (profileRef.current) profileRef.current.open = false;
      }
    };
    const outside = (event: PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) profileRef.current.open = false;
    };
    document.addEventListener("keydown", keyboard);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", keyboard); document.removeEventListener("pointerdown", outside); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sidebar = sidebarRef.current;
    sidebar?.querySelector<HTMLButtonElement>("button")?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !sidebar) return;
      const controls = sidebar.querySelectorAll<HTMLElement>("a[href], button");
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", trapFocus);
    const resize = () => { if (window.innerWidth > 900) setOpen(false); };
    window.addEventListener("resize", resize);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", trapFocus); window.removeEventListener("resize", resize); };
  }, [open]);

  return (
    <WorkspaceUser.Provider value={user}>
      <div className="admin-shell" data-theme={dark ? "dark" : "light"} data-collapsed={collapsed}>
        {open && <button className="workspace-scrim" aria-label="Close navigation" onClick={() => { setOpen(false); menuRef.current?.focus(); }} />}
        <aside ref={sidebarRef} className={`workspace-sidebar ${open ? "sidebar-open" : ""}`} id="workspace-navigation" aria-label="Workspace sidebar">
          <div className="workspace-brand-row">
            <WorkspaceBrand />
            <button className="workspace-icon-button sidebar-close" aria-label="Close menu" onClick={() => { setOpen(false); menuRef.current?.focus(); }}><X size={20} aria-hidden="true" /></button>
          </div>
          <nav aria-label="Workspace navigation">
            {links.filter(([, , , role]) => rank[user.role] >= rank[role]).map(([href, label, Icon]) => (
              <a key={href} href={href} title={collapsed ? label : undefined} onClick={() => setOpen(false)} aria-current={path.replace(/\/$/, "") === href.replace(/\/$/, "") || (href !== "/admin/" && path.startsWith(href)) ? "page" : undefined}>
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" /><span className="workspace-nav-label">{label}</span>
              </a>
            ))}
          </nav>
          <div className="workspace-private-note"><span className="workspace-lock"><LockKeyhole size={17} aria-hidden="true" /></span><div><strong>Private workspace</strong><p>Your content, publications, and team in one place.</p></div></div>
          <a className="workspace-site-link" href="/" target="_blank" rel="noreferrer"><ExternalLink size={15} aria-hidden="true" /><span className="workspace-nav-label">Visit website</span></a>
        </aside>
        <header className="workspace-header">
          <button className="workspace-icon-button desktop-sidebar-toggle" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} aria-controls="workspace-navigation" onClick={() => setCollapsed(!collapsed)}><PanelLeftClose size={19} aria-hidden="true" /></button>
          <button ref={menuRef} className="workspace-icon-button mobile-menu-button" aria-label="Menu" aria-expanded={open} aria-controls="workspace-navigation" onClick={() => setOpen(!open)}><Menu size={21} aria-hidden="true" /></button>
          <form className="workspace-search" role="search" aria-label="Workspace search" action={`/admin/${searchIn}/`}>
            <Search size={17} aria-hidden="true" />
            <input ref={searchRef} type="search" name="q" aria-label="Search workspace" placeholder="Search your workspace…" />
            <select aria-label="Search in" value={searchIn} onChange={(event) => setSearchIn(event.target.value)}>
              <option value="content">Content</option>
              {user.role === "admin" && <option value="products">Publications</option>}
              {rank[user.role] >= rank.editor && <><option value="authors">Authors</option><option value="categories">Categories</option></>}
            </select>
            <kbd>Ctrl K</kbd>
            <button className="workspace-search-submit" type="submit" aria-label="Submit workspace search"><Search size={16} aria-hidden="true" /></button>
          </form>
          <div className="header-utilities">
            {user.role === "admin" && <Link className="workspace-icon-button workspace-activity-link" href="/admin/audit/" aria-label="View workspace activity"><Bell size={19} aria-hidden="true" /></Link>}
            <button className="workspace-icon-button" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => { try { localStorage.setItem("admin-theme", dark ? "light" : "dark"); } catch { return; } window.dispatchEvent(new Event("admin-theme-change")); }}>{dark ? <Sun size={20} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}</button>
            <details className="workspace-profile" ref={profileRef}>
              <summary aria-label="Account menu"><span className="workspace-avatar">{user.name.trim().charAt(0).toUpperCase() || "U"}</span><span className="workspace-user-copy"><strong>{user.name}</strong><small><i />{user.role === "admin" ? "Administrator" : user.role}</small></span><ChevronDown size={15} aria-hidden="true" /></summary>
              <div className="workspace-profile-menu">
                <p>{user.name}<small>{user.email}</small></p>
                {user.role === "admin" && <Link href="/admin/settings/"><Settings size={16} aria-hidden="true" />Site settings</Link>}
                <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" />Visit website</a>
                <button onClick={() => signOut({ callbackUrl: "/admin/login/" })}><LogOut size={16} aria-hidden="true" />Sign out</button>
              </div>
            </details>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="workspace-main">{children}</main>
      </div>
    </WorkspaceUser.Provider>
  );
}
