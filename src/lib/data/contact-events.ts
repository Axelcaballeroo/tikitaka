import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const CONTACT_EVENT_SOURCES = ["marketplace_card", "provider_profile", "sticky_contact"] as const;
export type ContactEventSource = (typeof CONTACT_EVENT_SOURCES)[number];
export type ContactEvent = { id: string; providerId: string; providerName: string; source: string; page: string; createdAt: string };

export async function createContactEvent(input: { providerId: string; source: ContactEventSource; page: string }) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: provider, error: providerError } = await supabase.from("providers").select("id").eq("id", input.providerId).eq("published", true).eq("status", "approved").maybeSingle();
  if (providerError || !provider) throw new Error("Proveedor no disponible.");
  const { error } = await supabase.from("contact_events").insert({ provider_id: input.providerId, source: input.source, page: input.page.slice(0, 200) });
  if (error) throw new Error(error.message);
}

export async function getContactEvents(): Promise<ContactEvent[]> {
  const supabase = createAdminClient();
  if (!supabase) {
    console.warn("[Tiki Taka] Contact analytics desactivado: Supabase admin no está configurado.");
    return [];
  }
  try {
    const { data, error } = await supabase.from("contact_events").select("id,provider_id,source,page,created_at,providers(business_name)").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, providerId: row.provider_id, providerName: (row.providers as unknown as { business_name: string } | null)?.business_name ?? "Proveedor", source: row.source, page: row.page ?? "", createdAt: row.created_at }));
  } catch (error) {
    console.warn(`[Tiki Taka] Contact analytics no disponible; se continúa sin métricas: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
