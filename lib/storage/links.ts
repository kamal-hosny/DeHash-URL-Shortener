import fs from "fs/promises";
import path from "path";
import { Link } from "@/store/linkStore";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "links.json");

const initialLinks: Link[] = [];

export async function getStoredLinks(): Promise<Link[]> {
  try {
    const content = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return initialLinks;
  } catch {
    // If file doesn't exist, create it with initialLinks
    try {
      await fs.writeFile(
        DATA_FILE_PATH,
        JSON.stringify(initialLinks, null, 2),
        "utf-8"
      );
    } catch (e) {
      console.error("Error writing initial links file:", e);
    }
    return initialLinks;
  }
}

export async function getLinkByShortCode(
  shortCode: string
): Promise<Link | null> {
  if (!shortCode) return null;

  // 1. Try Neon DB if DATABASE_URL is configured
  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/lib/db/client");
      const { shortLinks } = await import("@/lib/db/schema");
      const { eq } = await import("drizzle-orm");
      const db = getDb();
      const found = await db.query.shortLinks.findFirst({
        where: eq(shortLinks.shortCode, shortCode),
      });
      if (found) {
        return {
          id: found.id,
          originalUrl: found.originalUrl,
          shortCode: found.shortCode,
          clicks: 0,
          isActive: found.isActive,
          createdAt: found.createdAt.toISOString(),
        };
      }
    } catch (dbErr) {
      console.warn("DB lookup failed, falling back to local file:", dbErr);
    }
  }

  // 2. Fallback to local persistent JSON file
  const links = await getStoredLinks();
  const found = links.find(
    (l) => l.shortCode.toLowerCase() === shortCode.toLowerCase()
  );
  return found || null;
}

export async function saveLink(newLink: Link): Promise<Link> {
  const links = await getStoredLinks();
  const existingIndex = links.findIndex(
    (l) => l.shortCode.toLowerCase() === newLink.shortCode.toLowerCase()
  );

  let updatedLinks: Link[];
  if (existingIndex >= 0) {
    updatedLinks = [...links];
    updatedLinks[existingIndex] = { ...updatedLinks[existingIndex], ...newLink };
  } else {
    updatedLinks = [newLink, ...links];
  }

  try {
    await fs.writeFile(
      DATA_FILE_PATH,
      JSON.stringify(updatedLinks, null, 2),
      "utf-8"
    );
  } catch (e) {
    console.error("Error saving link to file:", e);
  }

  return newLink;
}

export async function recordLinkClick(shortCode: string): Promise<void> {
  try {
    const links = await getStoredLinks();
    const link = links.find(
      (l) => l.shortCode.toLowerCase() === shortCode.toLowerCase()
    );
    if (link) {
      link.clicks = (link.clicks || 0) + 1;
      await fs.writeFile(
        DATA_FILE_PATH,
        JSON.stringify(links, null, 2),
        "utf-8"
      );
    }
  } catch (e) {
    console.error("Error recording click:", e);
  }
}

