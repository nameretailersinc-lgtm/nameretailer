"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { createContext, useContext, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  Image,
  Settings as SettingsIcon,
  Users as UsersIcon,
  List,
  Menu,
  LogOut,
} from "lucide-react";
import type { UserSummary } from "@/lib/cms/types";
import { Button } from "./primitives";

const links = [
  ["/admin/", "Overview", LayoutDashboard, "author"],
  ["/admin/content/", "Content", FileText, "author"],
  ["/admin/products/", "Publications & inventory", List, "admin"],
  ["/admin/categories/", "Categories", List, "editor"],
  ["/admin/tags/", "Tags", List, "editor"],
  ["/admin/authors/", "Authors", UsersIcon, "editor"],
  ["/admin/media/", "Media library", Image, "editor"],
  ["/admin/redirects/", "Redirects", List, "admin"],
  ["/admin/notFound/", "404 log", List, "admin"],
  ["/admin/menus/", "Menus", List, "admin"],
  ["/admin/sections/", "Homepage sections", List, "admin"],
  ["/admin/widgets/", "Footer & widgets", List, "admin"],
  ["/admin/leads/", "Leads inbox", List, "admin"],
  ["/admin/subscribers/", "Subscribers", UsersIcon, "admin"],
  ["/admin/settings/", "Site settings", SettingsIcon, "admin"],
  ["/admin/users/", "Users", UsersIcon, "admin"],
  ["/admin/audit/", "Audit log", List, "admin"],
  ["/design-system/", "Design system", List, "admin"],
] as const;
const WorkspaceUser = createContext<UserSummary | null>(null);
export function useWorkspaceUser() {
  return useContext(WorkspaceUser);
}
export function AdminShell({
  children,
  user,
}: {
  children: ReactNode;
  user: UserSummary;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const rank = { customer: 0, author: 1, editor: 2, admin: 3 };
  return (
    <WorkspaceUser.Provider value={user}>
      <div className="admin-shell">
        <header className="workspace-header">
          <Link href="/admin/" className="wordmark">
            Name Retailer<span>Editorial workspace</span>
          </Link>
          <div className="header-utilities">
            <span>
              {user.name} <span className="badge">{user.role}</span>
            </span>
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/admin/login/" })}
            >
              <LogOut size={16} aria-hidden="true" /> Sign out
            </Button>
            <Button
              className="mobile-menu-button"
              variant="secondary"
              aria-expanded={open}
              aria-controls="workspace-navigation"
              onClick={() => setOpen(!open)}
            >
              <Menu size={18} aria-hidden="true" /> Menu
            </Button>
          </div>
        </header>
        <aside
          className={`workspace-sidebar ${open ? "sidebar-open" : ""}`}
          id="workspace-navigation"
        >
          <nav aria-label="Workspace navigation">
            {links
              .filter(([, , , role]) => rank[user.role] >= rank[role])
              .map(([href, label, Icon]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={
                    path === href ||
                    (href !== "/admin/" && path.startsWith(href))
                      ? "page"
                      : undefined
                  }
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </a>
              ))}
          </nav>
          <p className="small muted">
            Private CMS. Publishing content and storing redirect rules does not
            activate the public migration in this phase.
          </p>
        </aside>
        <main id="main" tabIndex={-1} className="workspace-main">
          {children}
        </main>
      </div>
    </WorkspaceUser.Provider>
  );
}
