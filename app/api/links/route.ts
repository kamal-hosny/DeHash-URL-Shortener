import { NextRequest, NextResponse } from "next/server";
import { getStoredLinks, saveLink } from "@/lib/storage/links";
import { Link } from "@/store/linkStore";
import { normalizeUrl } from "@/lib/utils";

export async function GET() {
  try {
    const links = await getStoredLinks();
    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.originalUrl) {
      return NextResponse.json(
        { error: "Destination URL is required" },
        { status: 400 }
      );
    }

    const cleanUrl = body.originalUrl.trim();
    const normalizedInput = normalizeUrl(cleanUrl);

    // Check for existing link with identical original URL
    const existingLinks = await getStoredLinks();
    const existing = existingLinks.find(
      (l) => normalizeUrl(l.originalUrl) === normalizedInput
    );

    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        link: existing,
      });
    }

    const shortCode =
      body.shortCode || Math.random().toString(36).substring(2, 8);

    const newLink: Link = {
      id: body.id || Math.random().toString(36).substring(2, 11),
      name: body.name?.trim() || undefined,
      originalUrl: cleanUrl,
      shortCode,
      clicks: body.clicks ?? 0,
      isActive: body.isActive ?? true,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const saved = await saveLink(newLink);

    return NextResponse.json({ success: true, link: saved });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}
