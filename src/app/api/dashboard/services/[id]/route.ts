import { NextResponse } from "next/server";
import { requireProviderApiAccount } from "@/lib/auth/account";
import { providerServiceInput } from "@/lib/provider-service-input";

function failure(error: unknown, message: string) {
  const unauthorized = error instanceof Error && error.message === "No autorizado";
  return NextResponse.json({ error: unauthorized ? "No autorizado." : message }, { status: unauthorized ? 401 : 500 });
}

async function context(id: string) {
  const account = await requireProviderApiAccount();
  if (!account.provider) return { ...account, owned: null };
  const { data } = await account.supabase.from("provider_services").select("id").eq("id", id).eq("provider_id", account.provider.id).maybeSingle();
  return { ...account, owned: data };
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const { supabase, provider, owned } = await context(id);
    if (!provider || !owned) return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    const input = providerServiceInput(await request.json());
    if (!input) return NextResponse.json({ error: "Revisá los datos del servicio." }, { status: 400 });
    const { data, error } = await supabase.from("provider_services").update(input).eq("id", id).eq("provider_id", provider.id).select("id,title,description,price_from").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    return NextResponse.json({ service: { id: data.id, title: data.title, description: data.description ?? "", priceFrom: Number(data.price_from ?? 0) } });
  } catch (error) { return failure(error, "No pudimos guardar el servicio."); }
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const { supabase, provider, owned } = await context(id);
    if (!provider || !owned) return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    const { error } = await supabase.from("provider_services").delete().eq("id", id).eq("provider_id", provider.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) { return failure(error, "No pudimos eliminar el servicio."); }
}
