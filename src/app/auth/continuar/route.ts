import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth/profile";
import { roleHome } from "@/lib/auth/roles";
export async function GET(request: Request) {
  const profile = await getCurrentUserProfile();
  const next = new URL(request.url).searchParams.get("next");
  const destination = !profile ? "/login?error=profile"
    : profile.role === "provider" && next === "/publicar" ? "/publicar" : roleHome(profile.role);
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
