import { NextResponse } from "next/server";
import { requireProviderApiAccount } from "@/lib/auth/account";
import { providerServiceInput } from "@/lib/provider-service-input";
export async function POST(request: Request) {
  try {
    const { supabase, provider } = await requireProviderApiAccount();
    if (!provider) return NextResponse.json({ error: "Completá primero tu perfil." }, { status: 404 });
    const input = providerServiceInput(await request.json());
    if (!input) return NextResponse.json({ error: "Revisá los datos del servicio." }, { status: 400 });
    const { data, error } = await supabase.from("provider_services").insert({ provider_id: provider.id, ...input }).select("id,title,description,price_from").single();
    if (error) throw error;
    return NextResponse.json({ service: { id: data.id, title: data.title, description: data.description ?? "", priceFrom: Number(data.price_from ?? 0) } });
  } catch (error) {
    console.error("[Tiki Taka] Servicio proveedor:", error instanceof Error ? error.message : "error");
    const unauthorized = error instanceof Error && error.message === "No autorizado";
    return NextResponse.json({ error: unauthorized ? "No autorizado." : "No pudimos guardar el servicio." }, { status: unauthorized ? 401 : 500 });
  }
}
