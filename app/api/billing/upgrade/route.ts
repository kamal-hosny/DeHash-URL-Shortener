import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import {
  validateCoupon,
  incrementCouponUsage,
  createInvoice,
  updateUserPlan,
} from "@/lib/storage/billing";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "You must be signed in to upgrade your subscription" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const targetPlan = body.plan === "ENTERPRISE" ? "ENTERPRISE" : "PRO";
    const billingCycle: "monthly" | "yearly" = body.billingCycle === "yearly" ? "yearly" : "monthly";
    const couponCode = body.couponCode?.trim();

    // Monthly: $12 (1,000 links/mo), Yearly: $9/mo billed annually = $108 (2,000 links/mo)
    const originalAmount =
      targetPlan === "PRO"
        ? billingCycle === "yearly"
          ? 108
          : 12
        : billingCycle === "yearly"
        ? 490
        : 49;

    let discountPercent = 0;
    let validatedCouponName: string | null = null;

    if (couponCode) {
      const valResult = await validateCoupon(couponCode);
      if (!valResult.valid || !valResult.coupon) {
        return NextResponse.json(
          { error: valResult.error || "Invalid coupon code" },
          { status: 400 }
        );
      }
      discountPercent = valResult.coupon.discountPercent;
      validatedCouponName = valResult.coupon.code;
    }

    const discountAmount = Math.round((originalAmount * discountPercent) / 100);
    const finalAmount = Math.max(originalAmount - discountAmount, 0);

    // 1. Update user plan in DB & local store with cycle options
    const updatedSub = await updateUserPlan(userId || userEmail!, userEmail, targetPlan, {
      billingCycle,
    });

    // 2. Increment coupon usage if used
    if (validatedCouponName) {
      await incrementCouponUsage(validatedCouponName);
    }

    // 3. Create paid invoice record
    const invoice = await createInvoice({
      userId: userId || userEmail!,
      userEmail,
      plan: targetPlan,
      amount: finalAmount,
      originalAmount,
      discountAmount,
      couponCode: validatedCouponName,
      status: "paid",
    });

    return NextResponse.json({
      success: true,
      message:
        discountPercent === 100
          ? `Congratulations! 100% discount applied. Your ${targetPlan} plan (${billingCycle === "yearly" ? "Yearly - 2,000 links/mo" : "Monthly - 1,000 links/mo"}) is now active for FREE!`
          : `Your subscription to ${targetPlan} (${billingCycle}) has been activated successfully!`,
      plan: targetPlan,
      billingCycle,
      allocatedQuota: updatedSub.allocatedQuota,
      priorLinksCount: updatedSub.priorLinksCount,
      amount: finalAmount,
      discountPercent,
      couponCode: validatedCouponName,
      invoice,
    });
  } catch (error) {
    console.error("Error in POST /api/billing/upgrade:", error);
    return NextResponse.json(
      { error: "Failed to process plan upgrade" },
      { status: 500 }
    );
  }
}

