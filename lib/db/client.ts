import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: DrizzleClient | null = null;

export const getDb = (): DrizzleClient => {
  if (cachedDb) {
    return cachedDb;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL env variable is not set. Please define it to connect to Neon."
    );
  }

  const sql = neon(connectionString);
  cachedDb = drizzle(sql, { schema });

  return cachedDb;
};
