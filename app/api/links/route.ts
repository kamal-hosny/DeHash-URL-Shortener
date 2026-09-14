import { NextRequest, NextResponse } from "next/server";
import {
  getStoredLinks,
  saveLink,
  generateUniqueShortCode,
  isShortCodeTaken,
} from "@/lib/storage/links";
import { checkCanCreateLink } from "@/lib/storage/billing";
import { Link } from "@/store/linkStore";
import { normalizeUrl } from "@/lib/utils";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const links = await getStoredLinks(userId);
    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    // Check quota before allowing link creation
    const quotaCheck = await checkCanCreateLink(userId, userEmail);
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: quotaCheck.reason, quotaExceeded: true },
        { status: 403 }
      );
    }

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
    const existingLinks = await getStoredLinks(userId);
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

    // Generate Code -> Check Database -> Exists? -> Yes: Generate Again / No: Save
    let shortCode = body.shortCode?.trim();
    if (!shortCode) {
      shortCode = await generateUniqueShortCode();
    } else {
      const isTaken = await isShortCodeTaken(shortCode);
      if (isTaken) {
        return NextResponse.json(
          { error: "This short code is already in use." },
          { status: 409 }
        );
      }
    }

    const newLink: Link = {
      id: body.id || Math.random().toString(36).substring(2, 11),
      name: body.name?.trim() || undefined,
      originalUrl: cleanUrl,
      shortCode,
      clicks: body.clicks ?? 0,
      isActive: body.isActive ?? true,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const saved = await saveLink(newLink, userId);

    return NextResponse.json({ success: true, link: saved });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}
