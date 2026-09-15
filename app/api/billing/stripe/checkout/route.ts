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
  getUserSubscription,
  topUpUserQuota,
} from "@/lib/storage/billing";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "You must be signed in to proceed with checkout" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const isTopUp = body.type === "TOPUP" || body.plan === "TOPUP";

    // Handle One-Time Paid Top-Up (+1,000 Links)
    if (isTopUp) {
      const sub = await getUserSubscription(userId || userEmail!, userEmail);
      if (sub.plan === "FREE") {
        return NextResponse.json(
          { error: "You must have an active Pro plan to purchase top-up links. Please upgrade to Pro first." },
          { status: 400 }
        );
      }
      if (sub.allocatedQuota >= 10000) {
        return NextResponse.json(
          { error: "Maximum cap of 10,000 points reached. You cannot add more points at this time." },
          { status: 400 }
        );
      }

      const couponCode: string | undefined = body.couponCode?.trim();
      let discountPercent = 0;
      let validatedCouponName: string | null = null;

      if (couponCode) {
        const val = await validateCoupon(couponCode, "monthly");
        if (val.valid && val.coupon) {
          discountPercent = val.coupon.discountPercent;
          validatedCouponName = val.coupon.code;
        }
      }

      const topUpConfig = STRIPE_PRICES.TOPUP;

      // 100% discount handling
      if (discountPercent === 100) {
        if (validatedCouponName) {
          await incrementCouponUsage(validatedCouponName);
        }
        await topUpUserQuota(userId || userEmail!, userEmail, topUpConfig.points);
        await createInvoice({
          userId: userId || userEmail!,
          userEmail,
          plan: "TOPUP",
          amount: 0,
          originalAmount: topUpConfig.amount / 100,
          discountAmount: topUpConfig.amount / 100,
          couponCode: validatedCouponName,
          status: "paid",
        });

        return NextResponse.json({
          success: true,
          isFree: true,
          message: `100% discount applied! +${topUpConfig.points.toLocaleString()} links have been added to your cycle.`,
          url: "/dashboard/billing?success=true&type=topup",
        });
      }

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
        (topUpConfig.amount * discountPercent) / 100
      );
      const finalAmountCents = Math.max(
        topUpConfig.amount - discountAmountCents,
        50 // Stripe minimum charge
      );

      const baseUrl = siteConfig.url;

      // One-time payment checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: userEmail || undefined,
        line_items: [
          {
            price_data: {
              currency: topUpConfig.currency,
              product_data: {
                name: topUpConfig.name,
                description: topUpConfig.description,
              },
              unit_amount: finalAmountCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "TOPUP",
          userId: userId || userEmail!,
          userEmail: userEmail || "",
          points: String(topUpConfig.points),
          couponCode: validatedCouponName || "",
        },
        success_url: `${baseUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}&type=topup`,
        cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
      });

      return NextResponse.json({
        success: true,
        url: checkoutSession.url,
        sessionId: checkoutSession.id,
      });
    }

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
