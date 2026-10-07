export const collections = [
  "content",
  "categories",
  "tags",
  "authors",
  "media",
  "redirects",
  "notFound",
  "menus",
  "sections",
  "widgets",
  "leads",
  "subscribers",
] as const;
export type Collection = (typeof collections)[number];
export const roles = ["admin", "editor", "author", "customer"] as const;
export type Role = (typeof roles)[number];
export interface CmsRecord {
  id: string;
  collection: Collection;
  title: string;
  slug: string;
  status: string;
  ownerId: string;
  data: Record<string, unknown>;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}
export interface User extends UserSummary {
  passwordHash: string;
  sessionVersion: number;
  updatedAt: string;
}
export interface AuditRow {
  id: string;
  actorId: string;
  action: string;
  collection: string;
  recordId: string;
  detail: string;
  createdAt: string;
}
export interface Revision {
  id: string;
  recordId: string;
  version: number;
  snapshot: CmsRecord;
  actorId: string;
  createdAt: string;
}
export interface SeoWarning {
  code: string;
  message: string;
  recordId?: string;
  severity?: string;
}
export interface RecordInput {
  title: string;
  slug: string;
  status: string;
  data: Record<string, unknown>;
  version?: number;
}
