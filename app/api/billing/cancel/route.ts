import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { updateUserPlan } from "@/lib/storage/billing";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "You must be signed in to manage your subscription" },
        { status: 401 }
      );
    }

    await updateUserPlan(userId || userEmail!, userEmail, "FREE");

    return NextResponse.json({
      success: true,
      message: "Subscription canceled. Your plan has been downgraded to Free.",
      plan: "FREE",
    });
  } catch (error) {
    console.error("Error in POST /api/billing/cancel:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

