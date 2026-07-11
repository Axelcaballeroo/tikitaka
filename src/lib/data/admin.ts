import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getContactEvents } from "@/lib/data/contact-events";

const emptyStats = { totalProviders: 0, publishedProviders: 0, pendingProviders: 0, pendingRequests: 0, activeCategories: 0, totalReviews: 0, contactsToday: 0, contactsMonth: 0, pendingReviews: 0, topContacted: [] as { name: string; count: number }[] };

export async function getAdminStats() {
  const supabase = createAdminClient();
  if (!supabase) return { ...emptyStats };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const queries = [
    supabase.from("providers").select("*", { count: "exact", head: true }),
    supabase.from("providers").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("providers").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("provider_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("categories").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("contact_events").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("contact_events").select("*", { count: "exact", head: true }).gte("created_at", month.toISOString()),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ];
  const settled = await Promise.allSettled(queries);
  const counts = settled.map((result, index) => {
    if (result.status === "rejected") {
      console.warn(`[Tiki Taka] Métrica admin ${index} no disponible:`, result.reason);
      return 0;
    }
    if (result.value.error) {
      console.warn(`[Tiki Taka] Métrica admin ${index} no disponible: ${result.value.error.message}`);
      return 0;
    }
    return result.value.count ?? 0;
  });
  const events = await getContactEvents();
  const ranking = new Map<string, number>();
  events.forEach((event) => ranking.set(event.providerName, (ranking.get(event.providerName) ?? 0) + 1));
  const topContacted = [...ranking.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({ name, count }));
  return { totalProviders: counts[0], publishedProviders: counts[1], pendingProviders: counts[2], pendingRequests: counts[3], activeCategories: counts[4], totalReviews: counts[5], contactsToday: counts[6], contactsMonth: counts[7], pendingReviews: counts[8], topContacted };
}
