import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  updateUserPlan,
  createInvoice,
  incrementCouponUsage,
  getInvoices,
} from "@/lib/storage/billing";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    if (!stripe || !isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured on this server" },
        { status: 503 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (
      checkoutSession.payment_status !== "paid" &&
      checkoutSession.status !== "complete"
    ) {
      return NextResponse.json(
        {
          error: "Payment has not been completed",
          status: checkoutSession.payment_status,
        },
        { status: 400 }
      );
    }

    const meta = checkoutSession.metadata || {};
    const plan: "PRO" | "ENTERPRISE" =
      meta.plan === "ENTERPRISE" ? "ENTERPRISE" : "PRO";
    const billingCycle: "monthly" | "yearly" =
      meta.billingCycle === "yearly" ? "yearly" : "monthly";
    const couponCode = meta.couponCode || null;

    // Check if invoice already created for this session to prevent duplicates
    const existingInvoices = await getInvoices();
    const isAlreadyProcessed = existingInvoices.some(
      (inv) => inv.id === sessionId || inv.id === `stripe_${sessionId}`
    );

    if (!isAlreadyProcessed) {
      // 1. Update user plan
      await updateUserPlan(userId || userEmail!, userEmail, plan, {
        billingCycle,
      });

      // 2. Increment coupon usage if one was recorded
      if (couponCode) {
        await incrementCouponUsage(couponCode);
      }

      // 3. Create invoice record
      const amountPaid = (checkoutSession.amount_total || 0) / 100;
      await createInvoice({
        userId: userId || userEmail!,
        userEmail,
        plan,
        amount: amountPaid,
        originalAmount: amountPaid,
        discountAmount: 0,
        couponCode,
        status: "paid",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Your ${plan} subscription has been activated successfully!`,
      plan,
      billingCycle,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Stripe verify error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}
