import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  updateUserPlan,
  createInvoice,
  incrementCouponUsage,
  getInvoices,
} from "@/lib/storage/billing";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();

    if (webhookSecret && !webhookSecret.includes("...") && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // If secret not configured yet, parse body directly (for local development)
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: `Webhook error: ${error.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata || {};
        const userId = meta.userId;
        const userEmail = meta.userEmail || session.customer_email || undefined;
        const plan: "PRO" | "ENTERPRISE" =
          meta.plan === "ENTERPRISE" ? "ENTERPRISE" : "PRO";
        const billingCycle: "monthly" | "yearly" =
          meta.billingCycle === "yearly" ? "yearly" : "monthly";
        const couponCode = meta.couponCode || null;

        if (userId || userEmail) {
          const invoices = await getInvoices();
          const alreadyProcessed = invoices.some(
            (inv) => inv.id === session.id || inv.id === `stripe_${session.id}`
          );

          if (!alreadyProcessed) {
            await updateUserPlan(userId || userEmail!, userEmail, plan, {
              billingCycle,
            });

            if (couponCode) {
              await incrementCouponUsage(couponCode);
            }

            const amountPaid = (session.amount_total || 0) / 100;
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
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const meta = subscription.metadata || {};
        const userId = meta.userId;
        const userEmail = meta.userEmail;

        if (userId || userEmail) {
          await updateUserPlan(userId || userEmail!, userEmail, "FREE");
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
