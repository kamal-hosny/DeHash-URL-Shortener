import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { getCoupons, createCoupon, deleteCoupon } from "@/lib/storage/billing";

// Helper to check administrator permissions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isUserAdmin(session: any): boolean {
  if (!session?.user) return false;
  const email = session.user.email?.toLowerCase().trim();
  if (session.user.isAdmin === true || session.user.role === "ADMIN") return true;
  if (email === "ixonhosny@gmail.com") return true;
  if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase().trim()) return true;
  return false;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isUserAdmin(session)) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const coupons = await getCoupons();
    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Error in GET /api/billing/coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isUserAdmin(session)) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body.code || !body.discountPercent) {
      return NextResponse.json(
        { error: "Coupon code and discount percentage are required" },
        { status: 400 }
      );
    }

    const discountPercent = Number(body.discountPercent);
    if (isNaN(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
      return NextResponse.json(
        { error: "Discount percentage must be between 1 and 100" },
        { status: 400 }
      );
    }

    const applicableCycle =
      body.applicableCycle === "yearly"
        ? "yearly"
        : body.applicableCycle === "monthly"
        ? "monthly"
        : "all";

    const newCoupon = await createCoupon({
      code: body.code,
      discountPercent,
      applicableCycle,
      description: body.description,
      maxUses: body.maxUses ? Number(body.maxUses) : null,
      expiresAt: body.expiresAt || null,
    });

    return NextResponse.json({
      success: true,
      coupon: newCoupon,
      message: `Coupon "${newCoupon.code}" (${applicableCycle} cycle) created successfully!`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in POST /api/billing/coupons:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create coupon" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!isUserAdmin(session)) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const idOrCode = searchParams.get("code") || searchParams.get("id");

    if (!idOrCode) {
      return NextResponse.json(
        { error: "Coupon code or ID is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteCoupon(idOrCode);
    if (!deleted) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/billing/coupons:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

