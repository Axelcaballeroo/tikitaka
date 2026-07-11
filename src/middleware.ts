import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request }); const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.redirect(new URL("/login?error=config", request.url));
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => { items.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  const { data: { user } } = await supabase.auth.getUser(); const pathname = request.nextUrl.pathname;
  if (!user) { const login = new URL("/login", request.url); login.searchParams.set("next", pathname); return NextResponse.redirect(login); }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(); const role = profile?.role === "admin" ? "admin" : "provider";
  if (pathname.startsWith("/admin") && role !== "admin") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (pathname.startsWith("/dashboard") && role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
  return response;
}
export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
