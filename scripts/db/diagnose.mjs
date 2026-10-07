import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { setServers } from "node:dns";
dotenv.config({ quiet: true });
if (process.argv.includes("--public-dns")) setServers(["1.1.1.1", "8.8.8.8"]);
const uri = process.env.MONGODB_URI || process.env.MOngodb_URI || "";
console.log(
  JSON.stringify({
    srv: uri.startsWith("mongodb+srv://"),
    hasPlaceholder: /<[^>]+>/.test(uri),
    hasUsernameSetting: !!process.env.dbUsername,
    hasPasswordSetting: !!process.env.db_password,
  }),
);
let client;
try {
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 7000,
    connectTimeoutMS: 7000,
  });
  await client.connect();
  await client
    .db(process.env.MONGODB_DB || "nameretailer_cms")
    .command({ ping: 1 });
  console.log("MongoDB connection verified; credentials not displayed.");
} catch (error) {
  console.log(
    JSON.stringify({
      name: error.name,
      code:
        typeof error.code === "string" || typeof error.code === "number"
          ? error.code
          : undefined,
      syscall: error.syscall,
      authentication: /auth|bad auth|credentials/i.test(error.message),
      dns: /querySrv|ENOTFOUND|ECONNREFUSED|ETIMEOUT/i.test(error.message),
      tls: /certificate|TLS|SSL/i.test(error.message),
    }),
  );
  process.exitCode = 1;
} finally {
  if (client) await client.close();
}
