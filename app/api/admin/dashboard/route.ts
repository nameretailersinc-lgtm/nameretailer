import { authenticated, handle, json } from "@/lib/api";
import { store } from "@/lib/db";
import { seoHealth } from "@/lib/cms/content";
export const GET = (request: Request) =>
  handle(async () => {
    const user = await authenticated(request);
    const { records, audit } = await store();
    const filter =
      user.role === "author"
        ? { ownerId: user.id, collection: "content" as const }
        : {};
    const all = await records
      .find(filter, { projection: { _id: 0 } })
      .toArray();
    const content = all.filter((record) => record.collection === "content");
    const count = (collection: string) =>
      all.filter((record) => record.collection === collection).length;
    const stats = {
      content: content.length,
      published: content.filter((record) => record.status === "published")
        .length,
      drafts: content.filter((record) => record.status === "draft").length,
      scheduled: content.filter((record) => record.status === "scheduled")
        .length,
      media: count("media"),
      leads: user.role === "admin" ? count("leads") : 0,
      subscribers: user.role === "admin" ? count("subscribers") : 0,
    };
    return json({
      data: {
        stats,
        recentActivity: await audit
          .find(user.role === "admin" ? {} : { actorId: user.id }, {
            projection: { _id: 0 },
          })
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray(),
        warnings: seoHealth(all),
      },
    });
  });
