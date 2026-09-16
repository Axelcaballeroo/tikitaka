import "server-only";
import { adminDatabase } from "@/lib/data/admin-providers";
export async function getAdminStats() {
  const db = await adminDatabase();
  const month = new Date();
  month.setUTCDate(1);
  month.setUTCHours(0, 0, 0, 0);
  const queries = [
    db
      .from("providers")
      .select("*", { count: "exact", head: true })
      .eq("published", true)
      .eq("status", "approved"),
    db
      .from("providers")
      .select("*", { count: "exact", head: true })
      .eq("published", false)
      .eq("status", "pending"),
    db
      .from("providers")
      .select("*", { count: "exact", head: true })
      .eq("featured", true)
      .eq("published", true)
      .eq("status", "approved"),
    db
      .from("contact_events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", month.toISOString()),
    db
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ];
  const settled = await Promise.allSettled(queries);
  return settled.map((r, i) => {
    if (r.status === "rejected" || r.value.error) {
      console.warn("[Tiki Taka] Métrica admin no disponible", i);
      return null;
    }
    return r.value.count ?? 0;
  });
}
