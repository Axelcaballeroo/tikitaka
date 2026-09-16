import { createAdminClient } from "@/lib/supabase/admin";
import type { ProviderRequest } from "@/types";


export type NewProviderRequest = Pick<ProviderRequest, "businessName" | "category" | "zone" | "whatsapp" | "email" | "message">;
type RequestRow = { id: string; business_name: string; category: string | null; zone: string | null; whatsapp: string | null; email: string | null; message: string | null; status: string; verified: boolean; featured: boolean; created_at: string };
const mapRequest = (row: RequestRow): ProviderRequest => ({ id: row.id, businessName: row.business_name, category: row.category ?? "Servicios infantiles", zone: row.zone ?? "Buenos Aires", whatsapp: row.whatsapp ?? "", email: row.email ?? "", message: row.message ?? "", status: row.status === "approved" ? "Aprobado" : row.status === "rejected" ? "Rechazado" : "Pendiente", verified: row.verified, featured: row.featured, createdAt: row.created_at });
const requireAdmin = () => { const client = createAdminClient(); if (!client) throw new Error("Supabase admin no está configurado. Agregá SUPABASE_SERVICE_ROLE_KEY."); return client; };

export async function createProviderRequest(input: NewProviderRequest) {
  const supabase = requireAdmin(); const { data, error } = await supabase.from("provider_requests").insert({ business_name: input.businessName, category: input.category, zone: input.zone, whatsapp: input.whatsapp, email: input.email, message: input.message, status: "pending", verified: false, featured: false }).select().single();
  if (error) throw new Error(error.message); return mapRequest(data as RequestRow);
}
export async function getProviderRequests(): Promise<ProviderRequest[]> { const supabase = createAdminClient(); if (!supabase) return []; const { data, error } = await supabase.from("provider_requests").select("*").order("created_at", { ascending: false }); if (error) { console.error("[Tiki Taka] Error al leer solicitudes:", error.message); return []; } return (data as RequestRow[]).map(mapRequest); }
