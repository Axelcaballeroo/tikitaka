import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { safeAccountAvatar } from "@/lib/account-menu";

export const dynamic = "force-dynamic";
export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const db = await createAuthServerClient();
    if (!db) return NextResponse.json({ account: null }, { headers });
    const { data: { user } } = await db.auth.getUser();
    if (!user) return NextResponse.json({ account: null }, { headers });
    const { data, error } = await db.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle();
    if (error) throw error;
    const role = data?.role === "admin" ? "admin" : "provider";
    let avatarUrl: string | null = null;
    let hasProvider = false;
    if (role === "provider") {
      const { data: provider, error: providerError } = await db.from("providers")
        .select("id,logo,cover_image").eq("user_id", user.id).maybeSingle();
      if (!providerError && provider) {
        hasProvider = true;
        avatarUrl = safeAccountAvatar(provider.logo, process.env.NEXT_PUBLIC_SUPABASE_URL)
          ?? safeAccountAvatar(provider.cover_image, process.env.NEXT_PUBLIC_SUPABASE_URL);
      }
    }
    return NextResponse.json({ account: { fullName: data?.full_name ?? "", role,
      email: user.email ?? "", avatarUrl, hasProvider } }, { headers });
  } catch {
    return NextResponse.json({ account: null }, { status: 503, headers });
  }
}
