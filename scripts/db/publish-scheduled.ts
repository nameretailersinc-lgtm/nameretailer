import "dotenv/config";
import { publishScheduled } from "../../lib/cms/scheduled";
try {
  console.log(JSON.stringify(await publishScheduled()));
  process.exit(0);
} catch (error) {
  console.error(
    "Scheduled publication failed:",
    error instanceof Error ? error.name : "UnknownError",
  );
  process.exit(1);
}
