import { NextResponse, type NextRequest } from "next/server";
import { isValidSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

// The whole site sits behind the admin sign-in. Pages like `/` and `/nba` are
// prerendered, so a check inside them would never run — this is the only
// place that sees every request.
export default async function proxy(req: NextRequest) {
  const signedIn = await isValidSessionToken(
    req.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  const onLogin = req.nextUrl.pathname === "/login";

  if (!signedIn && !onLogin) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (signedIn && onLogin) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
