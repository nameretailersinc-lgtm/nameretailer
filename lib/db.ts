import { MongoClient, type Db, type ClientSession } from "mongodb";
import { setServers } from "node:dns";
import type { AuditRow, CmsRecord, Revision, User } from "./cms/types";

const globals = globalThis as typeof globalThis & {
  cmsMongo?: Promise<MongoClient>;
};
async function connect(uri: string) {
  if (process.env.MONGODB_DNS_SERVERS)
    setServers(
      process.env.MONGODB_DNS_SERVERS.split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    );
  let client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
  });
  try {
    return await client.connect();
  } catch (error) {
    await client.close();
    // The owner's Windows resolver refuses SRV queries. This process-only development
    // fallback does not modify Windows DNS and never affects production implicitly.
    if (
      process.env.NODE_ENV !== "production" &&
      uri.startsWith("mongodb+srv:") &&
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ECONNREFUSED"
    ) {
      setServers(["1.1.1.1", "8.8.8.8"]);
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
      });
      console.info(
        "Development MongoDB SRV lookup uses process-only public DNS fallback.",
      );
      return client.connect();
    }
    throw error;
  }
}
export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI || process.env.MOngodb_URI;
  if (!uri)
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI in the private environment.",
    );
  if (!globals.cmsMongo) {
    globals.cmsMongo = connect(uri);
    globals.cmsMongo.catch(() => {
      globals.cmsMongo = undefined;
    });
  }
  return (await globals.cmsMongo).db(
    process.env.MONGODB_DB || "nameretailer_cms",
  );
}
export async function store() {
  const db = await getDb();
  return {
    db,
    records: db.collection<CmsRecord>("cms_records"),
    users: db.collection<User>("cms_users"),
    audit: db.collection<AuditRow>("cms_audit"),
    revisions: db.collection<Revision>("cms_revisions"),
  };
}
export async function transaction<T>(
  callback: (session: ClientSession) => Promise<T>,
): Promise<T> {
  await getDb();
  const client = await globals.cmsMongo!;
  const session = client.startSession();
  try {
    return await session.withTransaction(() => callback(session));
  } finally {
    await session.endSession();
  }
}
export async function recordTransaction<T>(
  callback: (session: ClientSession) => Promise<T>,
): Promise<T> {
  return constraintTransaction("records", callback);
}
export async function userTransaction<T>(
  callback: (session: ClientSession) => Promise<T>,
): Promise<T> {
  return constraintTransaction("users", callback);
}
async function constraintTransaction<T>(
  name: string,
  callback: (session: ClientSession) => Promise<T>,
): Promise<T> {
  return transaction(async (session) => {
    // Serialize cross-record invariants. Conflicted transactions retry with a new snapshot.
    await (
      await getDb()
    )
      .collection<{ _id: string; version: number }>("cms_constraints")
      .updateOne(
        { _id: name },
        { $inc: { version: 1 } },
        { upsert: true, session },
      );
    return callback(session);
  });
}
export async function setupDatabase() {
  await (await import("./commerce/products")).setupProducts();
  const { db, records, users, audit, revisions } = await store();
  await Promise.all([
    records.createIndex({ id: 1 }, { unique: true }),
    records.createIndex({ collection: 1, slug: 1 }, { unique: true }),
    records.createIndex(
      { "data.source": 1 },
      { unique: true, partialFilterExpression: { collection: "redirects" } },
    ),
    records.createIndex({ collection: 1, status: 1, updatedAt: -1 }),
    records.createIndex({ ownerId: 1, collection: 1 }),
    users.createIndex({ id: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { unique: true }),
    audit.createIndex({ createdAt: -1 }),
    revisions.createIndex({ recordId: 1, version: -1 }),
    db
      .collection("cms_limits")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db
      .collection("cms_resets")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("cms_resets").createIndex({ digest: 1 }, { unique: true }),
  ]);
  await db
    .collection<{ _id: string; version: number }>("cms_constraints")
    .updateOne(
      { _id: "records" },
      { $setOnInsert: { version: 0 } },
      { upsert: true },
    );
  await db
    .collection<{ _id: string; version: number }>("cms_constraints")
    .updateOne(
      { _id: "users" },
      { $setOnInsert: { version: 0 } },
      { upsert: true },
    );
}
