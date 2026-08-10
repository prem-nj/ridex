import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

const PUBLIC_ROUTES = ["/"];

export const proxy = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  const session = await auth();
  const role = session?.user?.role;

  console.log("PROXY PATH:", pathname);
  console.log("PROXY ROLE:", role);

  // Static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Auth APIs
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // Partner routes
  if (pathname.startsWith("/partner")) {
    // onboarding routes
    if (pathname.startsWith("/partner/onboarding")) {
      return NextResponse.next();
    }

    if (role !== "partner") {
      console.log("PARTNER ACCESS DENIED. ROLE:", role);

      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // API routes
  if (pathname.startsWith("/api")) {
    if (!session?.user) {
      return NextResponse.json(
        { message: "unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};