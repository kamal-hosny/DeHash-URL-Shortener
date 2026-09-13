import { NextRequest, NextResponse } from "next/server";
import {
  getLinkByIdOrShortCode,
  getLinkAnalyticsData,
} from "@/lib/storage/links";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Link identifier is required" },
        { status: 400 }
      );
    }

    // Lookup link by ID or shortCode across Redis, Neon DB, and Local backup
    const targetLink = await getLinkByIdOrShortCode(id);

    if (!targetLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const analytics = await getLinkAnalyticsData(targetLink.shortCode);

    return NextResponse.json({
      success: true,
      link: targetLink,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching link analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch link analytics" },
      { status: 500 }
    );
  }
}
