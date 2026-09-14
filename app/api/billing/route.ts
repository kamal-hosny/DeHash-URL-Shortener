import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { getUserSubscription, getUserInvoices } from "@/lib/storage/billing";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    const sessionPlan = session?.user?.subscriptionPlan;

    const subscription = await getUserSubscription(userId, userEmail, sessionPlan);
    const invoices = await getUserInvoices(userId, userEmail);

    return NextResponse.json({
      success: true,
      subscription,
      invoices,
    });
  } catch (error) {
    console.error("Error in GET /api/billing:", error);
    return NextResponse.json(
      { error: "Failed to load billing information" },
      { status: 500 }
    );
  }
}

