import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth/profile";
import { roleHome } from "@/lib/auth/roles";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
export async function GET(request: Request) {
  const profile = await getCurrentUserProfile();
  const next = new URL(request.url).searchParams.get("next");
  let destination = !profile ? "/login?error=profile" : roleHome(profile.role);
  if (profile && profile.role !== "admin") {
    const db = await createAuthServerClient();
    const { data: provider } = await db!.from("providers").select("id").eq("user_id", profile.id).maybeSingle();
    if (next === "/publicar") destination = provider ? "/dashboard" : "/publicar";
    else if (profile.role === "provider") destination = provider ? "/dashboard" : "/publicar";
    else destination = "/cuenta";
  }
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
