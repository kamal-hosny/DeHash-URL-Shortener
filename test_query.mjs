import { Redis } from "@upstash/redis";
import postgres from "postgres";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function run() {
  console.log("=== CHECKING REDIS ===");
  try {
    const ping = await redis.ping();
    console.log("Redis ping:", ping);
    const keys = await redis.keys("*");
    console.log("Redis keys count:", keys.length, keys);
    for (const key of keys) {
      const type = await redis.type(key);
      if (type === "string") {
        const val = await redis.get(key);
        console.log(`Key [${key}] (string):`, val);
      } else if (type === "hash") {
        const val = await redis.hgetall(key);
        console.log(`Key [${key}] (hash):`, val);
      }
    }
  } catch (e) {
    console.error("Redis err:", e);
  }

  console.log("\n=== CHECKING NEON POSTGRES ===");
  try {
    const users = await sql`SELECT id, name, email FROM users`;
    console.log("Users:", users);

    const links = await sql`SELECT id, user_id, short_code, original_url, is_active FROM short_links`;
    console.log("Short links in DB:", links);

    const analytics = await sql`SELECT * FROM link_analytics LIMIT 10`;
    console.log("Analytics in DB count:", analytics.length, analytics);
  } catch (e) {
    console.error("DB err:", e);
  }

  await sql.end();
}

run();

