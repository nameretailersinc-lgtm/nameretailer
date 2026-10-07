import { authenticated, handle, json } from "@/lib/api";
import { store } from "@/lib/db";
import { escapeRegex, queryOptions } from "@/lib/cms/service";
import type { Filter } from "mongodb";
import type { AuditRow } from "@/lib/cms/types";
export const GET = (request: Request) =>
  handle(async () => {
    await authenticated(request, true);
    const { audit } = await store();
    const options = queryOptions(request);
    const filter: Filter<AuditRow> = {};
    if (options.q)
      filter.$or = [
        { action: { $regex: escapeRegex(options.q), $options: "i" } },
        { detail: { $regex: escapeRegex(options.q), $options: "i" } },
      ];
    const action =
      new URL(request.url).searchParams.get("action") || options.status;
    if (action) filter.action = action.slice(0, 150);
    const data = await audit
      .find(filter, { projection: { _id: 0 } })
      .sort({ createdAt: options.direction as 1 | -1 })
      .skip((options.page - 1) * options.pageSize)
      .limit(options.pageSize)
      .toArray();
    return json({
      data,
      total: await audit.countDocuments(filter),
      page: options.page,
      pageSize: options.pageSize,
    });
  });
