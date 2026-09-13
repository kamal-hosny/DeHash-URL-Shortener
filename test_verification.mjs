import { Redis } from "@upstash/redis";
import postgres from "postgres";
import fs from "fs";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

async function verify() {
  console.log("=== 1. CHECK REDIS CONNECTION ===");
  const pong = await redis.ping();
  console.log("Redis Ping:", pong);

  console.log("\n=== 2. CHECK USERS IN NEON DB ===");
  const users = await sql`SELECT id, email FROM users`;
  console.log("Users in Neon:", users.length, users[0]?.email);

  console.log("\n=== 3. SYNC LINKS FROM JSON TO NEON DB & REDIS ===");
  const rawLinks = JSON.parse(fs.readFileSync("./data/links.json", "utf-8"));
  const defaultUserId = users[0]?.id;

  for (const link of rawLinks) {
    // Check if shortCode in short_links
    const existing = await sql`SELECT id FROM short_links WHERE short_code = ${link.shortCode}`;
    let linkId;
    if (existing.length === 0) {
      const crypto = await import("crypto");
      const hash = crypto.createHash("sha256").update(link.originalUrl).digest("hex");
      const inserted = await sql`
        INSERT INTO short_links (user_id, original_url, original_url_hash, short_code, is_active, created_at)
        VALUES (${defaultUserId}, ${link.originalUrl}, ${hash}, ${link.shortCode}, ${link.isActive ?? true}, ${new Date(link.createdAt || Date.now())})
        RETURNING id
      `;
      linkId = inserted[0].id;
      console.log(`Synced link to DB: ${link.shortCode} -> id: ${linkId}`);
    } else {
      linkId = existing[0].id;
      console.log(`Link already in DB: ${link.shortCode} -> id: ${linkId}`);
    }

    // Cache in Redis
    await redis.set(`link:${link.shortCode.toLowerCase()}`, JSON.stringify(link), { ex: 60 * 60 * 24 * 7 });
  }

  console.log("\n=== 4. SIMULATE CLICKS & RECORD ANALYTICS ===");
  const testCode = "4rtxf5"; // User's shortCode "ixon"
  
  // Simulated visit 1: Egypt, Desktop, Chrome, Twitter
  const visit1 = {
    ip: "156.204.10.25",
    country: "Egypt",
    city: "Cairo",
    device: "Desktop",
    browser: "Chrome",
    referrer: "Twitter / X",
  };

  // Simulated visit 2: Saudi Arabia, Mobile, Safari, WhatsApp
  const visit2 = {
    ip: "151.254.12.8",
    country: "Saudi Arabia",
    city: "Riyadh",
    device: "Mobile",
    browser: "Safari",
    referrer: "WhatsApp",
  };

  const code = testCode.toLowerCase();
  
  // Pipeline Redis increments
  for (const v of [visit1, visit2]) {
    await redis.incr(`clicks:${code}`);
    const pipeline = redis.pipeline();
    pipeline.sadd(`analytics:${code}:ips`, v.ip);
    pipeline.hincrby(`analytics:${code}:countries`, v.country, 1);
    pipeline.hincrby(`analytics:${code}:cities`, v.city, 1);
    pipeline.hincrby(`analytics:${code}:devices`, v.device, 1);
    pipeline.hincrby(`analytics:${code}:browsers`, v.browser, 1);
    pipeline.hincrby(`analytics:${code}:referrers`, v.referrer, 1);
    await pipeline.exec();

    // Insert DB event
    const linkRow = await sql`SELECT id FROM short_links WHERE short_code = ${testCode}`;
    if (linkRow.length > 0) {
      await sql`
        INSERT INTO link_analytics (link_id, referrer, country, city, device_type, browser, ip_address, clicked_at)
        VALUES (${linkRow[0].id}, ${v.referrer}, ${v.country}, ${v.city}, ${v.device}, ${v.browser}, ${v.ip}, ${new Date()})
      `;
    }
  }

  console.log("\n=== 5. RETRIEVE ANALYTICS FROM REDIS & DB ===");
  const [countries, cities, devices, browsers, referrers, totalClicks, uniqueIps] = await Promise.all([
    redis.hgetall(`analytics:${code}:countries`),
    redis.hgetall(`analytics:${code}:cities`),
    redis.hgetall(`analytics:${code}:devices`),
    redis.hgetall(`analytics:${code}:browsers`),
    redis.hgetall(`analytics:${code}:referrers`),
    redis.get(`clicks:${code}`),
    redis.scard(`analytics:${code}:ips`),
  ]);

  console.log("Redis Analytics for", testCode, ":");
  console.log("- Total Clicks:", totalClicks);
  console.log("- Unique Visitors:", uniqueIps);
  console.log("- Countries:", countries);
  console.log("- Devices:", devices);
  console.log("- Browsers:", browsers);
  console.log("- Referrers:", referrers);

  const dbEvents = await sql`
    SELECT a.* FROM link_analytics a
    JOIN short_links s ON a.link_id = s.id
    WHERE s.short_code = ${testCode}
    ORDER BY a.clicked_at DESC
  `;
  console.log(`Neon DB Analytics for ${testCode}: ${dbEvents.length} events found.`);
  dbEvents.forEach((e) => {
    console.log(`  Click at ${e.clicked_at.toISOString()}: ${e.country} (${e.city}), ${e.device_type}, ${e.browser}, ${e.referrer}`);
  });

  await sql.end();
  console.log("\n=== VERIFICATION COMPLETE ===");
}

verify().catch(console.error);

