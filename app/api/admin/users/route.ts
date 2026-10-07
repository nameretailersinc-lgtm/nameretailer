import { randomUUID } from "node:crypto";
import { ApiError, authenticated, body, handle, json } from "@/lib/api";
import { store, userTransaction } from "@/lib/db";
import { hashPassword } from "@/lib/security/password";
import { logAudit } from "@/lib/audit";
import { userInputSchema } from "@/lib/cms/validation";
import { escapeRegex, queryOptions } from "@/lib/cms/service";
import type { Filter } from "mongodb";
import type { User } from "@/lib/cms/types";
export const GET = (request: Request) =>
  handle(async () => {
    await authenticated(request, true);
    const { users } = await store();
    const options = queryOptions(request, [
      "createdAt",
      "name",
      "email",
      "title",
      "updatedAt",
    ]);
    const filter: Filter<User> = {};
    if (options.q)
      filter.$or = [
        { name: { $regex: escapeRegex(options.q), $options: "i" } },
        { email: { $regex: escapeRegex(options.q), $options: "i" } },
      ];
    if (options.status) filter.role = options.status as User["role"];
    const data = await users
      .find(filter, {
        projection: {
          _id: 0,
          passwordHash: 0,
          sessionVersion: 0,
          updatedAt: 0,
        },
      })
      .sort({
        [options.sort === "title" ? "name" : options.sort]:
          options.direction as 1 | -1,
        id: 1,
      })
      .skip((options.page - 1) * options.pageSize)
      .limit(options.pageSize)
      .toArray();
    return json({
      data,
      total: await users.countDocuments(filter),
      page: options.page,
      pageSize: options.pageSize,
    });
  });
export const POST = (request: Request) =>
  handle(async () => {
    const actor = await authenticated(request, true);
    const input = userInputSchema.parse(await body(request));
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      active: input.active ?? true,
      passwordHash: await hashPassword(input.password),
      sessionVersion: 1,
      createdAt: now,
      updatedAt: now,
    };
    await userTransaction(async (session) => {
      const { users } = await store();
      if (
        !(await users.findOne(
          { id: actor.id, role: "admin", active: true },
          { session },
        ))
      )
        throw new ApiError(
          403,
          "Your admin permissions changed. Sign in again.",
        );
      await users.insertOne(user, { session });
      await logAudit(actor.id, "user.create", "users", user.id, "", session);
    });
    const { id, name, email, role, active, createdAt } = user;
    return json({ data: { id, name, email, role, active, createdAt } }, 201);
  });
