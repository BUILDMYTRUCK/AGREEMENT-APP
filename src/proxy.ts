import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, isStaffTokenValid } from "@/lib/session";

// Next.js 16 renamed `middleware` -> `proxy`. This runs on the Node.js runtime.
// We gate every route behind staff login EXCEPT the login page, login API,
// and Next internals / public assets.

const PUBLIC_PATHS = ["/login", "/api/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (isStaffTokenValid(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") {
    loginUrl.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
