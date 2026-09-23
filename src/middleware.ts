import { parseRole } from "@/lib/auth/roles";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request }); const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.redirect(new URL("/login?error=config", request.url));
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => { items.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  const { data: { user } } = await supabase.auth.getUser(); const pathname = request.nextUrl.pathname;
  if (!user) { const login = new URL("/login", request.url); login.searchParams.set("next", pathname); return NextResponse.redirect(login); }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(); const role = parseRole(profile?.role);
  if (!role) return NextResponse.redirect(new URL("/login?error=profile", request.url));
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (role !== "admin") return NextResponse.redirect(new URL("/cuenta", request.url));
  } else if (role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const { data: provider } = await supabase.from("providers").select("id").eq("user_id", user.id).maybeSingle();
    if (!provider) return NextResponse.redirect(new URL("/publicar", request.url));
  }
  return response;
}
export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/cuenta/:path*"] };
