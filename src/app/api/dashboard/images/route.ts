import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { adminDatabase } from "@/lib/data/admin-providers";
import { requireAdminApi } from "@/lib/auth/profile";
import { adminFailure, validateId } from "@/lib/admin-provider-api";
import { providerStoragePath } from "@/lib/provider-storage";

const BUCKET = "provider-images";
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSize = 5 * 1024 * 1024;

async function getContext(request: Request) {
  const adminProviderId = new URL(request.url).searchParams.get(
    "adminProviderId",
  );
  if (adminProviderId) {
    const user = await requireAdminApi();
    validateId(adminProviderId);
    const supabase = await adminDatabase();
    const { data: provider, error } = await supabase
      .from("providers")
      .select("id,cover_image,logo")
      .eq("id", adminProviderId)
      .maybeSingle();
    if (error || !provider) throw new Error("Proveedor no disponible.");
    return { supabase, user, provider };
  }
  const supabase = await createAuthServerClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");
  const { data: profile, error: roleError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (roleError || profile?.role !== "provider") throw new Error("No autorizado");
  const { data: provider } = await supabase
    .from("providers")
    .select("id,cover_image,logo")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!provider) throw new Error("No encontramos tu perfil de proveedor.");
  return { supabase, user, provider };
}

const pathFromUrl = (url: string | null, providerId: string) =>
  providerStoragePath(url, providerId, process.env.NEXT_PUBLIC_SUPABASE_URL);

export async function POST(request: Request) {
  try {
    const { supabase, user, provider } = await getContext(request);
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    if (
      !(file instanceof File) ||
      !["cover", "logo", "gallery"].includes(String(kind))
    )
      return NextResponse.json(
        { error: "Archivo o tipo inválido." },
        { status: 400 },
      );
    if (!allowed.has(file.type))
      return NextResponse.json(
        { error: "Solo se permiten imágenes JPG, PNG o WEBP." },
        { status: 400 },
      );
    if (file.size > maxSize)
      return NextResponse.json(
        { error: "La imagen supera el máximo de 5 MB." },
        { status: 400 },
      );
    if (kind === "gallery") {
      const { count, error: countError } = await supabase
        .from("provider_images")
        .select("*", { count: "exact", head: true })
        .eq("provider_id", provider.id);
      if (countError) throw countError;
      if ((count ?? 0) >= 8)
        return NextResponse.json(
          { error: "La galería admite un máximo de 8 imágenes." },
          { status: 400 },
        );
    }
    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${user.id}/${provider.id}/${kind}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) throw new Error(uploadError.message);
    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);
    const url = publicData.publicUrl;
    if (kind === "gallery") {
      const { count } = await supabase
        .from("provider_images")
        .select("*", { count: "exact", head: true })
        .eq("provider_id", provider.id);
      const { data, error } = await supabase
        .from("provider_images")
        .insert({
          provider_id: provider.id,
          image_url: url,
          sort_order: count ?? 0,
        })
        .select("id,image_url,sort_order")
        .single();
      if (error) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw new Error(error.message);
      }
      return NextResponse.json({
        image: {
          id: data.id,
          imageUrl: data.image_url,
          sortOrder: data.sort_order,
        },
      });
    }
    const field = kind === "cover" ? "cover_image" : "logo";
    const previous = kind === "cover" ? provider.cover_image : provider.logo;
    const { error: updateError } = await supabase
      .from("providers")
      .update({ [field]: url })
      .eq("id", provider.id);
    if (updateError) {
      await supabase.storage.from(BUCKET).remove([path]);
      throw new Error(updateError.message);
    }
    const oldPath = pathFromUrl(previous, provider.id);
    if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
    return NextResponse.json({ url });
  } catch (error) {
    if (new URL(request.url).searchParams.has("adminProviderId"))
      return adminFailure(error);
    const message =
      error instanceof Error ? error.message : "No se pudo subir la imagen.";
    return NextResponse.json(
      { error: message },
      { status: message === "No autorizado" ? 401 : 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase, provider } = await getContext(request);
    const { imageId, kind } = await request.json();
    if (kind === "cover") {
      const { error } = await supabase
        .from("providers")
        .update({ cover_image: null })
        .eq("id", provider.id);
      if (error) throw error;
      const oldPath = pathFromUrl(provider.cover_image, provider.id);
      if (oldPath) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET)
          .remove([oldPath]);
        if (storageError) throw storageError;
      }
      return NextResponse.json({ ok: true });
    }
    const { data: image } = await supabase
      .from("provider_images")
      .select("id,image_url")
      .eq("id", imageId)
      .eq("provider_id", provider.id)
      .maybeSingle();
    if (!image)
      return NextResponse.json(
        { error: "Imagen no encontrada." },
        { status: 404 },
      );
    const path = pathFromUrl(image.image_url, provider.id);
    if (path) {
      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) throw new Error(error.message);
    }
    const { error: deleteError } = await supabase
      .from("provider_images")
      .delete()
      .eq("id", image.id)
      .eq("provider_id", provider.id);
    if (deleteError) throw new Error(deleteError.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (new URL(request.url).searchParams.has("adminProviderId"))
      return adminFailure(error);
    const message =
      error instanceof Error ? error.message : "No se pudo eliminar la imagen.";
    return NextResponse.json(
      { error: message },
      { status: message === "No autorizado" ? 401 : 500 },
    );
  }
}
