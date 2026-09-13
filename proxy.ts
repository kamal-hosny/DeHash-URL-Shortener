import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
  function onSuccess(req: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const protectedRoutes = ["/dashboard", "/admin"];
        const isProtected = protectedRoutes.some((route) =>
          req.nextUrl.pathname.startsWith(route)
        );

        if (isProtected) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/links/:path*"],
};

