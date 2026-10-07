import type { CmsRecord, Collection, UserSummary } from "@/lib/cms/types";
export function canAccess(user: UserSummary, collection: Collection) {
  return (
    user.role === "admin" ||
    (user.role === "editor" &&
      ["content", "categories", "tags", "authors", "media"].includes(
        collection,
      )) ||
    (user.role === "author" && collection === "content")
  );
}
export function canEdit(user: UserSummary, record: CmsRecord) {
  return (
    canAccess(user, record.collection) &&
    (user.role !== "author" ||
      (record.ownerId === user.id &&
        ["draft", "archived"].includes(record.status)))
  );
}
export function canPublish(user: UserSummary) {
  return user.role === "admin" || user.role === "editor";
}
