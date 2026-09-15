import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { getStripe, isStripeConfigured, STRIPE_PRICES } from "@/lib/stripe";
import { siteConfig } from "@/config/site";
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
        { error: "You must be signed in to start a subscription" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const plan: "PRO" | "ENTERPRISE" =
      body.plan === "ENTERPRISE" ? "ENTERPRISE" : "PRO";
    const billingCycle: "monthly" | "yearly" =
      body.billingCycle === "yearly" ? "yearly" : "monthly";
    const couponCode: string | undefined = body.couponCode?.trim();

    const planConfig = STRIPE_PRICES[plan][billingCycle];
    let discountPercent = 0;
    let validatedCouponName: string | null = null;

    if (couponCode) {
      const val = await validateCoupon(couponCode, billingCycle);
      if (!val.valid || !val.coupon) {
        return NextResponse.json(
          { error: val.error || "Invalid coupon code" },
          { status: 400 }
        );
      }
      discountPercent = val.coupon.discountPercent;
      validatedCouponName = val.coupon.code;
    }

    // 100% discount handling (free upgrade without needing credit card)
    if (discountPercent === 100) {
      if (validatedCouponName) {
        await incrementCouponUsage(validatedCouponName);
      }
      const updatedSub = await updateUserPlan(
        userId || userEmail!,
        userEmail,
        plan,
        { billingCycle }
      );
      await createInvoice({
        userId: userId || userEmail!,
        userEmail,
        plan,
        amount: 0,
        originalAmount: planConfig.amount / 100,
        discountAmount: planConfig.amount / 100,
        couponCode: validatedCouponName,
        status: "paid",
      });

      return NextResponse.json({
        success: true,
        isFree: true,
        message: `100% discount applied! Your ${plan} plan is active.`,
        url: "/dashboard/billing?success=true",
      });
    }

    // Check if Stripe is configured
    const stripe = getStripe();
    if (!stripe || !isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not yet configured. Please set your STRIPE_SECRET_KEY in your .env file to enable live payments.",
          needsConfiguration: true,
        },
        { status: 503 }
      );
    }

    const discountAmountCents = Math.round(
      (planConfig.amount * discountPercent) / 100
    );
    const finalAmountCents = Math.max(
      planConfig.amount - discountAmountCents,
      50 // Stripe minimum charge is 50 cents
    );

    const baseUrl = siteConfig.url;

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: planConfig.currency,
            product_data: {
              name: planConfig.name,
              description: planConfig.description,
            },
            unit_amount: finalAmountCents,
            recurring: {
              interval: planConfig.interval,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId || userEmail!,
        userEmail: userEmail || "",
        plan,
        billingCycle,
        couponCode: validatedCouponName || "",
      },
      subscription_data: {
        metadata: {
          userId: userId || userEmail!,
          userEmail: userEmail || "",
          plan,
          billingCycle,
        },
      },
      success_url: `${baseUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Stripe checkout session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
