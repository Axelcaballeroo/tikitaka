import { getSiteUrl } from "@/lib/site-url";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { signupFailure } from "@/lib/auth/signup-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !["provider", "customer"].includes(body.accountType)
      || ["fullName", "email", "password"].some(key => typeof body[key] !== "string" || !body[key].trim())
      || body.fullName.trim().length > 120 || body.email.length > 254
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) || body.password.length < 6 || body.password.length > 128) {
      return NextResponse.json({ error: "Revisá el tipo de cuenta, nombre, email y contraseña (mínimo 6 caracteres)." }, { status: 400 });
    }
    if (body.accountType === "customer" && process.env.CUSTOMER_ACCOUNTS_ENABLED !== "true")
      return NextResponse.json({ error: "Las cuentas de familia estarán disponibles pronto. Mientras tanto, podés explorar y guardar favoritos." }, { status: 503 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const admin = createAdminClient();
    if (!url || !anon || !admin) return NextResponse.json({ error: "El registro no está disponible." }, { status: 503 });
    const auth = createClient(url, anon, { auth: { persistSession: false } });
    const { data, error } = await auth.auth.signUp({
      email: body.email.trim(), password: body.password,
      options: { emailRedirectTo: `${getSiteUrl()}/login${body.accountType === "provider" ? "?next=%2Fpublicar" : ""}`,
        data: { full_name: body.fullName.trim(), account_type: body.accountType } },
    });
    if (error || !data.user) {
      const failure = signupFailure(error);
      console.error("[Tiki Taka] Auth signup rejected", { accountType: body.accountType, code: error?.code ?? "missing_user", status: error?.status ?? null });
      return NextResponse.json({ error: failure.message, code: failure.code }, { status: failure.status });
    }
    if (data.user.identities?.length === 0) return NextResponse.json({ error: "Ese email ya tiene una cuenta. Iniciá sesión para continuar.", code: "email_exists" }, { status: 409 });
    // Profile creation belongs to the Auth trigger, atomically. Never overwrite roles.
    const { data: profile, error: profileError } = await admin.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    if (profileError || profile?.role !== body.accountType) {
      console.error("[Tiki Taka] Auth profile verification failed", { accountType: body.accountType, userId: data.user.id, code: profileError?.code ?? "role_mismatch" });
      return NextResponse.json({ error: "La cuenta necesita revisión antes de continuar. Contactá a Tiki Taka." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, requiresEmailConfirmation: !data.session });
  } catch {
    return NextResponse.json({ error: "No pudimos completar el registro. Revisá tu email antes de reintentar." }, { status: 400 });
  }
}
