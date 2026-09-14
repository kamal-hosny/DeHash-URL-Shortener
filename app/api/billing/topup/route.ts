import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { topUpUserQuota } from "@/lib/storage/billing";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "You must be signed in to top up points." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const points = Number(body.points) || 1000;

    const result = await topUpUserQuota(userId || userEmail!, userEmail, points);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in POST /api/billing/topup:", err);
    return NextResponse.json(
      { error: err.message || "Failed to top up quota" },
      { status: 400 }
    );
  }
}

