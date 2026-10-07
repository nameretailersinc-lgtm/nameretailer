import { ApiError, authenticated, body, handle, json } from "@/lib/api";
import { store, userTransaction } from "@/lib/db";
import { hashPassword } from "@/lib/security/password";
import { logAudit } from "@/lib/audit";
import { roles } from "@/lib/cms/types";
import { z } from "zod";
export const PATCH = (
  request: Request,
  context: { params: Promise<{ id: string }> },
) =>
  handle(async () => {
    const actor = await authenticated(request, true);
    const { id } = await context.params;
    const { users } = await store();
    const input = z
      .object({
        name: z.string().trim().min(1).max(150).optional(),
        email: z.email().max(254).optional(),
        role: z.enum(roles).optional(),
        active: z.boolean().optional(),
        password: z.string().min(12).max(256).optional(),
      })
      .strict()
      .parse(await body(request));
    if (
      actor.id === id &&
      (input.active === false || (input.role && input.role !== "admin"))
    )
      throw new ApiError(
        422,
        "You cannot disable or demote your own admin account.",
      );
    const { password, ...fields } = input;
    const set = {
      ...fields,
      ...(fields.email ? { email: fields.email.toLowerCase() } : {}),
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
      updatedAt: new Date().toISOString(),
    };
    await userTransaction(async (session) => {
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
      const old = await users.findOne({ id }, { session });
      if (!old) throw new ApiError(404, "User not found.");
      if (
        old.role === "admin" &&
        old.active &&
        (input.active === false || (input.role && input.role !== "admin")) &&
        (await users.countDocuments(
          { role: "admin", active: true },
          { session },
        )) <= 1
      )
        throw new ApiError(422, "At least one active admin is required.");
      await users.updateOne(
        { id },
        { $set: set, $inc: { sessionVersion: 1 } },
        { session },
      );
      await logAudit(actor.id, "user.update", "users", id, "", session);
    });
    const user = await users.findOne(
      { id },
      {
        projection: {
          _id: 0,
          passwordHash: 0,
          sessionVersion: 0,
          updatedAt: 0,
        },
      },
    );
    return json({ data: user });
  });
