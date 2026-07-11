import { createAdminClient } from "@/lib/supabase/admin";
import type { ProviderRequest } from "@/types";
import { slugify } from "@/lib/utils";

export type NewProviderRequest = Pick<ProviderRequest, "businessName" | "category" | "zone" | "whatsapp" | "email" | "message">;
type RequestRow = { id: string; business_name: string; category: string | null; zone: string | null; whatsapp: string | null; email: string | null; message: string | null; status: string; verified: boolean; featured: boolean; created_at: string };
const mapRequest = (row: RequestRow): ProviderRequest => ({ id: row.id, businessName: row.business_name, category: row.category ?? "Servicios infantiles", zone: row.zone ?? "Buenos Aires", whatsapp: row.whatsapp ?? "", email: row.email ?? "", message: row.message ?? "", status: row.status === "approved" ? "Aprobado" : row.status === "rejected" ? "Rechazado" : "Pendiente", verified: row.verified, featured: row.featured, createdAt: row.created_at });
const requireAdmin = () => { const client = createAdminClient(); if (!client) throw new Error("Supabase admin no está configurado. Agregá SUPABASE_SERVICE_ROLE_KEY."); return client; };

export async function createProviderRequest(input: NewProviderRequest) {
  const supabase = requireAdmin(); const { data, error } = await supabase.from("provider_requests").insert({ business_name: input.businessName, category: input.category, zone: input.zone, whatsapp: input.whatsapp, email: input.email, message: input.message, status: "pending", verified: false, featured: false }).select().single();
  if (error) throw new Error(error.message); return mapRequest(data as RequestRow);
}
export async function getProviderRequests(): Promise<ProviderRequest[]> { const supabase = createAdminClient(); if (!supabase) return []; const { data, error } = await supabase.from("provider_requests").select("*").order("created_at", { ascending: false }); if (error) { console.error("[Tiki Taka] Error al leer solicitudes:", error.message); return []; } return (data as RequestRow[]).map(mapRequest); }

export async function approveProviderRequest(id: string) {
  const supabase = requireAdmin(); const { data: request, error: requestError } = await supabase.from("provider_requests").select("*").eq("id", id).single(); if (requestError) throw new Error(requestError.message); const row = request as RequestRow;
  if (row.status === "approved") throw new Error("Esta solicitud ya fue aprobada.");
  const [emailMatch, whatsappMatch] = await Promise.all([row.email ? supabase.from("providers").select("id").eq("email", row.email).limit(1).maybeSingle() : Promise.resolve({ data: null }), row.whatsapp ? supabase.from("providers").select("id").eq("whatsapp", row.whatsapp).limit(1).maybeSingle() : Promise.resolve({ data: null })]);
  if (emailMatch.data || whatsappMatch.data) throw new Error("Ya existe un proveedor con ese email o WhatsApp.");
  const { data: category } = await supabase.from("categories").select("id,slug").eq("name", row.category).maybeSingle(); let slug = slugify(row.business_name); let suffix = 2; while ((await supabase.from("providers").select("id").eq("slug", slug).maybeSingle()).data) slug = `${slugify(row.business_name)}-${suffix++}`;
  const image = "https://images.unsplash.com/photo-1602030028438-4cf153cbae9e?auto=format&fit=crop&w=1200&q=85";
  const { data: provider, error } = await supabase.from("providers").insert({ category_id: category?.id ?? null, business_name: row.business_name, slug, description: row.message, zone: row.zone, whatsapp: row.whatsapp, email: row.email, verified: row.verified, featured: row.featured, published: true, status: "approved", cover_image: image, schedule: "Horarios a coordinar", coverage: row.zone }).select().single(); if (error) throw new Error(error.message);
  await supabase.from("provider_images").insert({ provider_id: provider.id, image_url: image, sort_order: 0 }); await supabase.from("provider_services").insert({ provider_id: provider.id, title: "Atención personalizada" });
  const { error: updateError } = await supabase.from("provider_requests").update({ status: "approved" }).eq("id", id); if (updateError) throw new Error(updateError.message); return provider;
}
export async function rejectProviderRequest(id: string) { const supabase = requireAdmin(); const { error } = await supabase.from("provider_requests").update({ status: "rejected" }).eq("id", id); if (error) throw new Error(error.message); }
export async function updateProviderFlags(id: string, flags: { verified?: boolean; featured?: boolean; published?: boolean; status?: "pending" | "approved" | "rejected" }) { const supabase = requireAdmin(); const { error } = await supabase.from("providers").update({ ...flags, updated_at: new Date().toISOString() }).eq("id", id); if (error) throw new Error(error.message); }
export async function deleteProvider(id: string) { const supabase = requireAdmin(); const { error } = await supabase.from("providers").delete().eq("id", id); if (error) throw new Error(error.message); }
export async function updateProviderRequestFlags(id: string, flags: { verified?: boolean; featured?: boolean }) { const supabase = requireAdmin(); const { error } = await supabase.from("provider_requests").update(flags).eq("id", id); if (error) throw new Error(error.message); }
export async function deleteProviderRequest(id: string) { const supabase = requireAdmin(); const { error } = await supabase.from("provider_requests").delete().eq("id", id); if (error) throw new Error(error.message); }
