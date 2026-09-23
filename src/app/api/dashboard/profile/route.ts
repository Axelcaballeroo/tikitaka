import { NextResponse } from "next/server";
import { requireProviderApiAccount } from "@/lib/auth/account";
import { validGeography } from "@/lib/geography";

export async function PATCH(request: Request) {
  try {
    const { supabase, provider } = await requireProviderApiAccount();
    if (!provider) return NextResponse.json({ error: "Completá primero tu perfil de proveedor." }, { status: 404 });
    const body = await request.json();
    const fields = ["businessName", "description", "categoryId", "zone", "city", "province", "address", "whatsapp", "email", "schedule", "coverage"] as const;
    if (!body || fields.some(key => typeof body[key] !== "string") || !validGeography(body.zone, body.city))
      return NextResponse.json({ error: "Revisá los datos y la ubicación." }, { status: 400 });
    const price = Number(body.priceFrom);
    if (!Number.isFinite(price) || price < 0 || price > 1_000_000_000)
      return NextResponse.json({ error: "Ingresá un precio válido." }, { status: 400 });
    const { data, error } = await supabase.from("providers").update({
      business_name: body.businessName.trim(), description: body.description.trim(), category_id: body.categoryId || null,
      zone: body.zone, city: body.city, province: body.province.trim(), address: body.address.trim(),
      whatsapp: body.whatsapp.trim(), email: body.email.trim(), price_from: price,
      schedule: body.schedule.trim(), coverage: body.coverage.trim(),
    }).eq("id", provider.id).eq("user_id", provider.userId).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Tiki Taka] Perfil proveedor:", error instanceof Error ? error.message : "error");
    const unauthorized = error instanceof Error && error.message === "No autorizado";
    return NextResponse.json({ error: unauthorized ? "No autorizado." : "No pudimos guardar los cambios." }, { status: unauthorized ? 401 : 500 });
  }
}
