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

    const body = await req.json();
    const code = body.code?.trim();
    const redeemDirectly = Boolean(body.redeemDirectly);
    const requestedCycle: "monthly" | "yearly" | undefined =
      body.billingCycle === "yearly"
        ? "yearly"
        : body.billingCycle === "monthly"
        ? "monthly"
        : undefined;

    if (!code) {
      return NextResponse.json(
        { error: "Please provide a discount code" },
        { status: 400 }
      );
    }

    const valResult = await validateCoupon(code, requestedCycle);
    if (!valResult.valid || !valResult.coupon) {
      return NextResponse.json(
        { error: valResult.error || "Invalid coupon code" },
        { status: 400 }
      );
    }

    const coupon = valResult.coupon;

    // If redeemDirectly is requested and coupon is 100%, execute instant free subscription
    if (redeemDirectly && coupon.discountPercent === 100) {
      if (!userId && !userEmail) {
        return NextResponse.json(
          { error: "You must be signed in to activate your free subscription" },
          { status: 401 }
        );
      }

      // Determine appropriate cycle from coupon or user request
      const targetCycle: "monthly" | "yearly" =
        coupon.applicableCycle === "yearly"
          ? "yearly"
          : coupon.applicableCycle === "monthly"
          ? "monthly"
          : requestedCycle || "yearly";

      const originalAmount = targetCycle === "yearly" ? 108 : 12;

      await updateUserPlan(userId || userEmail!, userEmail, "PRO", {
        billingCycle: targetCycle,
      });
      await incrementCouponUsage(coupon.code);

      const invoice = await createInvoice({
        userId: userId || userEmail!,
        userEmail,
        plan: "PRO",
        amount: 0,
        originalAmount,
        discountAmount: originalAmount,
        couponCode: coupon.code,
        status: "paid",
      });

      return NextResponse.json({
        success: true,
        redeemed: true,
        discountPercent: 100,
        plan: "PRO",
        billingCycle: targetCycle,
        message: `🎉 Success! Code ${coupon.code} (100% OFF) activated. You now have full PRO access (${targetCycle === "yearly" ? "Yearly - 2,000 links/mo" : "Monthly - 1,000 links/mo"}) for FREE!`,
        coupon,
        invoice,
      });
    }

    return NextResponse.json({
      success: true,
      redeemed: false,
      discountPercent: coupon.discountPercent,
      coupon,
      message: `Coupon "${coupon.code}" applied! ${coupon.discountPercent}% discount.`,
    });
  } catch (error) {
    console.error("Error in POST /api/billing/coupons/apply:", error);
    return NextResponse.json(
      { error: "Failed to apply discount code" },
      { status: 500 }
    );
  }
}

