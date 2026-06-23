import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getAuthUrl } from "@/lib/google-oauth";
import { authConfigured } from "@/lib/config";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!authConfigured) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(getAuthUrl(state));
  res.cookies.set("grit_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
