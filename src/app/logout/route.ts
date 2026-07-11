import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
export async function GET(request: Request) { const supabase = await createAuthServerClient(); if (supabase) await supabase.auth.signOut(); return NextResponse.redirect(new URL("/", request.url)); }
