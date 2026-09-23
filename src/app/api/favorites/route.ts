import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "private, no-store" };

async function context() {
  const db = await createAuthServerClient();
  if (!db) return { db: null, user: null };
  const { data: { user } } = await db.auth.getUser();
  return { db, user };
}
async function currentIds(db: NonNullable<Awaited<ReturnType<typeof context>>["db"]>, userId: string) {
  const { data, error } = await db.from("favorites").select("provider_id").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map(row => String(row.provider_id));
}
export async function GET() {
  try {
    const { db, user } = await context();
    if (!db || !user) return NextResponse.json({ authenticated: false, ids: [] }, { headers });
    return NextResponse.json({ authenticated: true, ids: await currentIds(db, user.id) }, { headers });
  } catch { return NextResponse.json({ error: "No pudimos cargar tus favoritos." }, { status: 503, headers }); }
}
export async function POST(request: Request) {
  try {
    const { db, user } = await context();
    if (!db || !user) return NextResponse.json({ error: "Iniciá sesión para sincronizar favoritos." }, { status: 401, headers });
    const body = await request.json();
    const submitted: unknown[] = Array.isArray(body.providerIds) ? body.providerIds : [body.providerId];
    const requested = [...new Set(submitted.filter((id): id is string => typeof id === "string" && uuid.test(id)))].slice(0, 100);
    if (!requested.length) return NextResponse.json({ error: "Proveedor inválido." }, { status: 400, headers });
    const { data: visible, error: visibilityError } = await db.from("providers").select("id").in("id", requested).eq("published", true).eq("status", "approved");
    if (visibilityError) throw visibilityError;
    const allowed = (visible ?? []).map(row => String(row.id));
    if (!allowed.length) return NextResponse.json({ error: "El servicio ya no está disponible." }, { status: 404, headers });
    const { error } = await db.from("favorites").upsert(allowed.map(providerId => ({ user_id: user.id, provider_id: providerId })), { onConflict: "user_id,provider_id", ignoreDuplicates: true });
    if (error) throw error;
    return NextResponse.json({ authenticated: true, ids: await currentIds(db, user.id) }, { headers });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400, headers });
    return NextResponse.json({ error: "No pudimos guardar el favorito." }, { status: 503, headers });
  }
}
export async function DELETE(request: Request) {
  try {
    const { db, user } = await context();
    if (!db || !user) return NextResponse.json({ error: "Iniciá sesión para sincronizar favoritos." }, { status: 401, headers });
    const { providerId } = await request.json();
    if (typeof providerId !== "string" || !uuid.test(providerId)) return NextResponse.json({ error: "Proveedor inválido." }, { status: 400, headers });
    const { error } = await db.from("favorites").delete().eq("user_id", user.id).eq("provider_id", providerId);
    if (error) throw error;
    return NextResponse.json({ authenticated: true, ids: await currentIds(db, user.id) }, { headers });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400, headers });
    return NextResponse.json({ error: "No pudimos actualizar el favorito." }, { status: 503, headers });
  }
}
