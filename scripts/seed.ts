import { validateEnvironmentVariables } from "../app/lib/env.server";
import * as models from "../app/models";
import dotenv from "dotenv";
import { getDatabaseInstance } from "~/lib/db.server";

export async function seedDatabase() {
  dotenv.config();
  validateEnvironmentVariables();

  const db = await getDatabaseInstance();

  // Register tables
  for (const [name, schema] of Object.entries(models)) {
    console.info(`⚙️ Register schema: ${name}`);
    await db.query(schema).catch(reason => {
      console.error(`🚨 Failed to register schema ${name}: ${reason}`);
    });
  }
}
