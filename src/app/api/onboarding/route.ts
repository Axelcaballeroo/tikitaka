import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { emptyDraft, normalizeWhatsapp, validateDraft } from "@/lib/onboarding";
import { slugify } from "@/lib/utils";

class OnboardingError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}
async function context() {
  const supabase = await createAuthServerClient();
  if (!supabase)
    throw new OnboardingError(
      "El servicio no está disponible. Intentá nuevamente.",
      503,
    );
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user)
    throw new OnboardingError("Iniciá sesión para continuar.", 401);
  const { data: role, error: roleError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (roleError)
    throw new OnboardingError("No pudimos verificar tu cuenta.", 503);
  if (role?.role === "admin")
    throw new OnboardingError(
      "Administrá los proveedores desde tu panel.",
      403,
    );
  const { data: provider, error: providerError } = await supabase
    .from("providers")
    .select("*,categories(slug)")
    .eq("user_id", user.id)
    .maybeSingle();
  if (providerError)
    throw new OnboardingError("No pudimos cargar tu perfil.", 503);
  return { supabase, user, provider };
}
function fail(error: unknown) {
  if (error instanceof OnboardingError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  console.error(
    "[Tiki Taka] Onboarding:",
    error instanceof Error ? error.message : "error",
  );
  return NextResponse.json(
    {
      error:
        "No pudimos guardar los cambios. Tu progreso sigue disponible para reintentar.",
    },
    { status: 503 },
  );
}
export async function GET() {
  try {
    const { supabase, user, provider } = await context();
    if (!provider)
      return NextResponse.json({
        provider: null,
        draft: { ...emptyDraft, email: user.email ?? "" },
        images: [],
      });
    const [services, images] = await Promise.all([
      supabase
        .from("provider_services")
        .select("id,title,description,price_from")
        .eq("provider_id", provider.id)
        .order("created_at"),
      supabase
        .from("provider_images")
        .select("id,image_url,sort_order")
        .eq("provider_id", provider.id)
        .order("sort_order"),
    ]);
    if (services.error || images.error)
      throw new OnboardingError(
        "No pudimos cargar tus servicios y fotos.",
        503,
      );
    return NextResponse.json({
      provider: {
        id: provider.id,
        slug: provider.slug,
        status: provider.status,
        published: provider.published,
        coverImage: provider.cover_image ?? "",
      },
      draft: {
        businessName: provider.business_name ?? "",
        categorySlug: provider.categories?.slug ?? "",
        description: provider.description ?? "",
        whatsapp: provider.whatsapp ?? "",
        email: provider.email ?? user.email ?? "",
        city: provider.city ?? "",
        province: provider.province ?? "",
        zone: provider.zone ?? "",
        coverage: provider.coverage ?? "",
        schedule: provider.schedule ?? "",
        services: (services.data ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? "",
          priceFrom: item.price_from === null ? "" : String(item.price_from),
        })),
      },
      images: (images.data ?? []).map((item) => ({
        id: item.id,
        imageUrl: item.image_url,
        sortOrder: item.sort_order,
      })),
    });
  } catch (error) {
    return fail(error);
  }
}
export async function POST(request: Request) {
  try {
    const { supabase, user, provider: existing } = await context();
    if (existing && (existing.published || existing.status === "approved"))
      throw new OnboardingError(
        "Tu perfil ya fue aprobado. Podés editarlo desde tu panel.",
        409,
      );
    const body = await request.json();
    if (!["save", "submit"].includes(body.intent))
      throw new OnboardingError("Acción inválida.", 400);
    const final = body.intent === "submit";
    const checked = validateDraft(body.draft, final);
    if (!checked.valid)
      return NextResponse.json(
        { error: "Revisá los campos indicados.", errors: checked.errors },
        { status: 400 },
      );
    if (final && body.confirmed !== true)
      return NextResponse.json(
        {
          error: "Confirmá que la información es correcta.",
          errors: { confirmed: "Confirmá que la información es correcta." },
        },
        { status: 400 },
      );
    const draft = checked.draft;
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", draft.categorySlug)
      .eq("active", true)
      .maybeSingle();
    if (categoryError)
      throw new OnboardingError("No pudimos verificar la categoría.", 503);
    if (!category)
      return NextResponse.json(
        {
          error: "Elegí una categoría disponible.",
          errors: { categorySlug: "Esta categoría no está disponible." },
        },
        { status: 400 },
      );
    let provider = existing;
    if (!provider) {
      const slug = `${slugify(draft.businessName) || "servicio"}-${user.id}`;
      const { data: created, error } = await supabase
        .from("providers")
        .insert({
          user_id: user.id,
          business_name: draft.businessName,
          slug,
          category_id: category.id,
          email: user.email ?? null,
          status: "pending",
          published: false,
          verified: false,
          featured: false,
        })
        .select("*")
        .single();
      if (error) {
        if (error.code !== "23505") throw error;
        const { data: found, error: readError } = await supabase
          .from("providers")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (readError || !found)
          throw new OnboardingError(
            "No pudimos iniciar tu perfil. Reintentá.",
            409,
          );
        provider = found;
      } else provider = created;
    }
    if (
      !provider ||
      provider.published ||
      !["pending", "rejected"].includes(provider.status)
    )
      throw new OnboardingError(
        "El estado del perfil cambió. Recargá para continuar.",
        409,
      );
    const { data: currentServices, error: serviceReadError } = await supabase
      .from("provider_services")
      .select("id")
      .eq("provider_id", provider.id);
    if (serviceReadError) throw serviceReadError;
    // IDs persist across retries. RLS and explicit ownership checks protect other providers.
    const submittedIds = draft.services.map((service) => service.id);
    if (submittedIds.length) {
      const { data: owners, error } = await supabase
        .from("provider_services")
        .select("id,provider_id")
        .in("id", submittedIds);
      if (error) throw error;
      if (owners?.some((item) => item.provider_id !== provider.id))
        throw new OnboardingError(
          "Uno de los servicios no pertenece a tu perfil.",
          403,
        );
    }
    const prices = draft.services
      .filter((service) => service.priceFrom !== "")
      .map((service) => Number(service.priceFrom));
    const values = {
      business_name: draft.businessName,
      category_id: category.id,
      description: draft.description,
      whatsapp: normalizeWhatsapp(draft.whatsapp),
      email: draft.email || null,
      city: draft.city || null,
      province: draft.province || null,
      zone: draft.zone || null,
      coverage: draft.coverage || null,
      schedule: draft.schedule || null,
      price_from: prices.length ? Math.min(...prices) : null,
    };
    const { data: updated, error: updateError } = await supabase
      .from("providers")
      .update(values)
      .eq("id", provider.id)
      .eq("user_id", user.id)
      .eq("published", false)
      .eq("status", provider.status)
      .select("id")
      .maybeSingle();
    if (updateError) throw updateError;
    if (!updated)
      throw new OnboardingError(
        "Tu perfil cambió de estado. Recargá para continuar.",
        409,
      );
    if (draft.services.length) {
      const { error } = await supabase.from("provider_services").upsert(
        draft.services.map((service) => ({
          id: service.id,
          provider_id: provider.id,
          title: service.title,
          description: service.description || null,
          price_from:
            service.priceFrom === "" ? null : Number(service.priceFrom),
        })),
        { onConflict: "id" },
      );
      if (error) throw error;
    }
    const remove = (currentServices ?? [])
      .filter((item) => !submittedIds.includes(item.id))
      .map((item) => item.id);
    if (remove.length) {
      const { error } = await supabase
        .from("provider_services")
        .delete()
        .eq("provider_id", provider.id)
        .in("id", remove);
      if (error) throw error;
    }
    if (final) {
      const { data: submitted, error } = await supabase
        .from("providers")
        .update({ status: "pending", published: false })
        .eq("id", provider.id)
        .eq("user_id", user.id)
        .eq("published", false)
        .eq("status", provider.status)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      if (!submitted)
        throw new OnboardingError(
          "Tu perfil cambió de estado. Revisalo desde tu panel.",
          409,
        );
    }
    return NextResponse.json({
      ok: true,
      provider: {
        id: provider.id,
        slug: provider.slug,
        status: final ? "pending" : provider.status,
        published: false,
        coverImage: provider.cover_image ?? "",
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError)
      return NextResponse.json(
        { error: "Solicitud inválida." },
        { status: 400 },
      );
    return fail(error);
  }
}
