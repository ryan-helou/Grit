import { NextRequest, NextResponse } from "next/server";
import { secured, SESSION_COOKIE } from "@/lib/config";

// Gate page routes only when the app is actually secured (auth + DB configured).
// In demo mode everything is open. API routes do their own auth.
export function proxy(req: NextRequest) {
  if (!secured) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api") || pathname === "/login") {
    return NextResponse.next();
  }

  const hasSession = !!req.cookies.get(SESSION_COOKIE)?.value;
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sw.js).*)",
  ],
};
