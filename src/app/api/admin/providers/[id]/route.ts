import { NextResponse } from "next/server";
import { adminDatabase, getAdminProvider } from "@/lib/data/admin-providers";
import { moderationPatch } from "@/lib/admin-provider";
import { validateDraft } from "@/lib/onboarding";
import {
  AdminInputError,
  adminFailure,
  refreshProvider,
  saveAdminProvider,
  validateId,
} from "@/lib/admin-provider-api";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Context) {
  try {
    const db = await adminDatabase();
    const { id } = await params;
    validateId(id);
    const body = await request.json();
    if (!body || typeof body !== "object")
      throw new AdminInputError("Solicitud inválida.");
    if (
      !["approve", "reject", "hide", "publish", "verify", "feature"].includes(
        body.action,
      )
    )
      throw new AdminInputError("Acción inválida.");
    if (["reject", "verify"].includes(body.action) && body.confirmed !== true)
      throw new AdminInputError("Confirmá esta acción.");
    const record = await getAdminProvider(id);
    if (!record) throw new AdminInputError("Proveedor no encontrado.", 404);
    if (body.action === "publish" && record.provider.status !== "approved")
      throw new AdminInputError("Primero aprobá la solicitud.", 409);
    if (body.action === "approve" || body.action === "publish") {
      if (record.userId === null && !record.coverImage)
        throw new AdminInputError(
          "Cargá una portada antes de publicar este proveedor de alta manual.",
        );
      const checked = validateDraft(record.draft, true, false);
      if (!checked.valid)
        throw new AdminInputError(
          "Completá los datos obligatorios antes de publicar.",
          400,
          checked.errors,
        );
    }
    let patch;
    try {
      patch = moderationPatch(body.action, body.value);
    } catch {
      throw new AdminInputError("Valor inválido.");
    }
    const { data, error } = await db
      .from("providers")
      .update(patch)
      .eq("id", id)
      .eq("updated_at", record.updatedAt)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data)
      throw new AdminInputError(
        "Otro cambio modificó este perfil. Recargá e intentá nuevamente.",
        409,
      );
    refreshProvider(record.provider.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminFailure(error);
  }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    await adminDatabase();
    const { id } = await params;
    return NextResponse.json(await saveAdminProvider(await request.json(), id));
  } catch (error) {
    return adminFailure(error);
  }
}
export async function DELETE() {
  try {
    await adminDatabase();
    return NextResponse.json(
      {
        error:
          "El borrado destruiría reseñas y contactos asociados. Usá Ocultar perfil para conservarlos.",
      },
      { status: 409 },
    );
  } catch (error) {
    return adminFailure(error);
  }
}
