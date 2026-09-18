import { validGeography } from "@/lib/geography";
import { getSiteUrl } from "@/lib/site-url";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body))
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    const required = [
      "fullName",
      "email",
      "password",
      "businessName",
      "categorySlug",
      "zone",
      "city",
      "whatsapp",
    ];
    if (
      required.some(
        (field) => typeof body[field] !== "string" || !body[field].trim(),
      )
    )
      return NextResponse.json(
        { error: "Completá todos los campos." },
        { status: 400 },
      );
    if (!validGeography(body.zone, body.city)) return NextResponse.json({ error: "Seleccioná una zona y localidad válidas." }, { status: 400 });
    if (body.password.length < 6)
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 },
      );
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const admin = createAdminClient();
    if (!url || !anon || !admin)
      return NextResponse.json(
        { error: "Supabase Auth no está configurado." },
        { status: 503 },
      );
    const { data: category, error: categoryError } = await admin
      .from("categories")
      .select("id")
      .eq("slug", body.categorySlug)
      .eq("active", true)
      .maybeSingle();
    if (categoryError) throw categoryError;
    if (!category)
      return NextResponse.json(
        { error: "Elegí una categoría disponible." },
        { status: 400 },
      );
    const auth = createClient(url, anon, { auth: { persistSession: false } });
    const { data: signup, error: authError } = await auth.auth.signUp({
      email: body.email.trim(),
      password: body.password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/login?next=%2Fpublicar`,
        data: { full_name: body.fullName.trim(), role: "provider" },
      },
    });
    if (authError || !signup.user)
      return NextResponse.json(
        { error: authError?.message ?? "No se pudo crear el usuario." },
        { status: 400 },
      );
    if (signup.user.identities?.length === 0)
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 },
      );
    let slug = slugify(body.businessName);
    let suffix = 2;
    while (
      (
        await admin
          .from("providers")
          .select("id")
          .eq("slug", slug)
          .maybeSingle()
      ).data
    )
      slug = `${slugify(body.businessName)}-${suffix++}`;
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({
        id: signup.user.id,
        email: body.email.trim(),
        full_name: body.fullName.trim(),
        role: "provider",
      });
    if (profileError) throw profileError;
    const { error: providerError } = await admin
      .from("providers")
      .insert({
        user_id: signup.user.id,
        category_id: category?.id ?? null,
        business_name: body.businessName.trim(),
        slug,
        zone: body.zone.trim(),
        whatsapp: body.whatsapp.trim(),
        email: body.email.trim(),
        city: body.city.trim(),
        province: "Buenos Aires",
        status: "pending",
        published: false,
        verified: false,
        featured: false,
        schedule: "Horarios a coordinar",
        coverage: body.zone.trim(),
      });
    if (providerError) {
      console.error(
        "[Tiki Taka] Cuenta creada sin completar proveedor",
        providerError.code,
      );
      return NextResponse.json(
        {
          error:
            "La cuenta se creó, pero no pudimos completar tu perfil. Confirmá tu email, iniciá sesión y continuá desde Publicar mi servicio.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({
      ok: true,
      requiresEmailConfirmation: !signup.session,
    });
  } catch (error) {
    console.error("[Tiki Taka] Error de registro:", error);
    return NextResponse.json(
      {
        error:
          "No se pudo completar el registro. Si la cuenta ya se creó, confirmá tu email e iniciá sesión para continuar.",
      },
      { status: 500 },
    );
  }
}
