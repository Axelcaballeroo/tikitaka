import "server-only";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminDatabase } from "@/lib/data/admin-providers";
import { validateAdminDraft } from "@/lib/admin-provider";
import { normalizeWhatsapp } from "@/lib/onboarding";
import { slugify } from "@/lib/utils";
export class AdminInputError extends Error {
  constructor(
    message: string,
    public status = 400,
    public errors?: Record<string, string>,
  ) {
    super(message);
  }
}
export function adminFailure(error: unknown) {
  if (error instanceof AdminInputError)
    return NextResponse.json(
      { error: error.message, errors: error.errors },
      { status: error.status },
    );
  if (error instanceof Error && error.message === "No autorizado")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  console.error("[Tiki Taka] Operación admin fallida:", error);
  return NextResponse.json(
    { error: "No pudimos completar la operación. Intentá nuevamente." },
    { status: error instanceof SyntaxError ? 400 : 503 },
  );
}
export function validateId(id: unknown): asserts id is string {
  if (
    typeof id !== "string" ||
    !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)
  )
    throw new AdminInputError("Identificador inválido.");
}
export function refreshProvider(slug: string) {
  for (const path of [
    "/",
    "/servicios",
    "/admin",
    "/admin/solicitudes",
    "/admin/proveedores",
    `/proveedores/${slug}`,
  ])
    revalidatePath(path);
}
export async function saveAdminProvider(
  input: Record<string, unknown>,
  id: string,
  create = false,
) {
  const db = await adminDatabase();
  validateId(id);
  if (!input || !["save", "publish"].includes(String(input.intent)))
    throw new AdminInputError("Acción inválida.");
  const publish = input.intent === "publish";
  const { data: existing, error: readError } = await db
    .from("providers")
    .select("id,slug,status,published,cover_image,user_id")
    .eq("id", id)
    .maybeSingle();
  if (readError) throw readError;
  if (!existing && !create)
    throw new AdminInputError("Proveedor no encontrado.", 404);
  if (existing && create)
    throw new AdminInputError(
      "El proveedor ya se guardó. Abrilo desde el listado.",
      409,
    );
  const checked = validateAdminDraft(
    input,
    publish || existing?.published === true,
  );
  if (!checked.valid)
    throw new AdminInputError(
      "Revisá los campos indicados.",
      400,
      checked.errors,
    );
  const { draft } = checked;
  const { data: category, error: categoryError } = await db
    .from("categories")
    .select("id")
    .eq("slug", draft.categorySlug)
    .eq("active", true)
    .maybeSingle();
  if (categoryError) throw categoryError;
  if (!category)
    throw new AdminInputError("Elegí una categoría activa.", 400, {
      categorySlug: "Categoría no disponible.",
    });
  if (publish && !existing?.cover_image)
    throw new AdminInputError(
      "Guardá el borrador y cargá una portada antes de publicar.",
    );
  const ids = draft.services.map((s) => s.id);
  if (ids.length) {
    const { data: owners, error } = await db
      .from("provider_services")
      .select("id,provider_id")
      .in("id", ids);
    if (error) throw error;
    if (owners?.some((s) => s.provider_id !== id))
      throw new AdminInputError("Un servicio pertenece a otro proveedor.", 403);
  }
  const values = {
    business_name: draft.businessName,
    category_id: category.id,
    description: draft.description,
    zone: draft.zone || null,
    city: draft.city || null,
    province: draft.province || null,
    address: checked.address || null,
    whatsapp: normalizeWhatsapp(draft.whatsapp),
    email: draft.email || null,
    coverage: draft.coverage || null,
    schedule: draft.schedule || null,
    price_from: checked.priceFrom === "" ? null : Number(checked.priceFrom),
  };
  const slug =
    existing?.slug ?? `${slugify(draft.businessName)}-${id.slice(0, 8)}`;
  const result = create
    ? await db
        .from("providers")
        .insert({
          ...values,
          id,
          slug,
          user_id: null,
          status: "pending",
          published: false,
          verified: false,
          featured: false,
        })
    : await db.from("providers").update(values).eq("id", id);
  if (result.error) throw result.error;
  if (draft.services.length) {
    const { error } = await db.from("provider_services").upsert(
      draft.services.map((s) => ({
        id: s.id,
        provider_id: id,
        title: s.title,
        description: s.description || null,
        price_from: s.priceFrom === "" ? null : Number(s.priceFrom),
      })),
      { onConflict: "id" },
    );
    if (error) throw error;
  }
  const { data: services, error: servicesError } = await db
    .from("provider_services")
    .select("id")
    .eq("provider_id", id);
  if (servicesError) throw servicesError;
  const removed = (services ?? [])
    .filter((s) => !ids.includes(s.id))
    .map((s) => s.id);
  if (removed.length) {
    const { error } = await db
      .from("provider_services")
      .delete()
      .eq("provider_id", id)
      .in("id", removed);
    if (error) throw error;
  }
  if (publish) {
    const { error } = await db
      .from("providers")
      .update({ status: "approved", published: true })
      .eq("id", id);
    if (error) throw error;
  }
  refreshProvider(slug);
  return { ok: true, id, slug };
}
