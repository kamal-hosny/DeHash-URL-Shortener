import { NextRequest, NextResponse } from "next/server";
import { getLinkByIdOrShortCode, deleteStoredLink } from "@/lib/storage/links";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Link identifier is required" }, { status: 400 });
    }

    const link = await getLinkByIdOrShortCode(id);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, link });
  } catch (error) {
    console.error("Error fetching link:", error);
    return NextResponse.json({ error: "Failed to fetch link" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Link identifier is required" }, { status: 400 });
    }

    const deleted = await deleteStoredLink(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}

