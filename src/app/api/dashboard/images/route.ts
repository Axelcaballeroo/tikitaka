import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

const BUCKET = "provider-images";
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSize = 5 * 1024 * 1024;

async function getContext() {
  const supabase = await createAuthServerClient(); if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("No autorizado");
  const { data: provider } = await supabase.from("providers").select("id,cover_image,logo").eq("user_id", user.id).maybeSingle(); if (!provider) throw new Error("No encontramos tu perfil de proveedor.");
  return { supabase, user, provider };
}

const pathFromUrl = (url: string | null) => { if (!url) return null; const marker = `/storage/v1/object/public/${BUCKET}/`; const index = url.indexOf(marker); return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null; };

export async function POST(request: Request) {
  try {
    const { supabase, user, provider } = await getContext(); const form = await request.formData(); const file = form.get("file"); const kind = form.get("kind");
    if (!(file instanceof File) || !["cover", "logo", "gallery"].includes(String(kind))) return NextResponse.json({ error: "Archivo o tipo inválido." }, { status: 400 });
    if (!allowed.has(file.type)) return NextResponse.json({ error: "Solo se permiten imágenes JPG, PNG o WEBP." }, { status: 400 });
    if (file.size > maxSize) return NextResponse.json({ error: "La imagen supera el máximo de 5 MB." }, { status: 400 });
    if (kind === "gallery") { const { count } = await supabase.from("provider_images").select("*", { count: "exact", head: true }).eq("provider_id", provider.id); if ((count ?? 0) >= 8) return NextResponse.json({ error: "La galería admite un máximo de 8 imágenes." }, { status: 400 }); }
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"; const path = `${user.id}/${provider.id}/${kind}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false }); if (uploadError) throw new Error(uploadError.message);
    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path); const url = publicData.publicUrl;
    if (kind === "gallery") { const { count } = await supabase.from("provider_images").select("*", { count: "exact", head: true }).eq("provider_id", provider.id); const { data, error } = await supabase.from("provider_images").insert({ provider_id: provider.id, image_url: url, sort_order: count ?? 0 }).select("id,image_url,sort_order").single(); if (error) { await supabase.storage.from(BUCKET).remove([path]); throw new Error(error.message); } return NextResponse.json({ image: { id: data.id, imageUrl: data.image_url, sortOrder: data.sort_order } }); }
    const field = kind === "cover" ? "cover_image" : "logo"; const previous = kind === "cover" ? provider.cover_image : provider.logo; const { error: updateError } = await supabase.from("providers").update({ [field]: url }).eq("id", provider.id); if (updateError) { await supabase.storage.from(BUCKET).remove([path]); throw new Error(updateError.message); } const oldPath = pathFromUrl(previous); if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]); return NextResponse.json({ url });
  } catch (error) { const message = error instanceof Error ? error.message : "No se pudo subir la imagen."; return NextResponse.json({ error: message }, { status: message === "No autorizado" ? 401 : 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const { supabase, provider } = await getContext(); const { imageId } = await request.json(); const { data: image } = await supabase.from("provider_images").select("id,image_url").eq("id", imageId).eq("provider_id", provider.id).maybeSingle(); if (!image) return NextResponse.json({ error: "Imagen no encontrada." }, { status: 404 });
    const path = pathFromUrl(image.image_url); if (path) { const { error } = await supabase.storage.from(BUCKET).remove([path]); if (error) throw new Error(error.message); }
    const { error: deleteError } = await supabase.from("provider_images").delete().eq("id", image.id).eq("provider_id", provider.id); if (deleteError) throw new Error(deleteError.message); return NextResponse.json({ ok: true });
  } catch (error) { const message = error instanceof Error ? error.message : "No se pudo eliminar la imagen."; return NextResponse.json({ error: message }, { status: message === "No autorizado" ? 401 : 500 }); }
}
