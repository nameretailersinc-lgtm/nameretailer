import "dotenv/config";
import { setupDatabase } from "../../lib/db";
try {
  await setupDatabase();
  console.log("MongoDB CMS indexes created. No sample content inserted.");
  process.exit(0);
} catch (error) {
  console.error(
    "Database setup failed:",
    error instanceof Error ? error.name : "UnknownError",
    "(connection details redacted)",
  );
  process.exit(1);
}
