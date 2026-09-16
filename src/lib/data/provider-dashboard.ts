import "server-only";
import { cache } from "react";
import { requireAccount } from "@/lib/auth/account";
import {
  contactPeriods,
  type DashboardContact,
} from "@/lib/provider-dashboard";
export type DashboardReview = {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};
export const getDashboardData = cache(async () => {
  const { supabase, provider } = await requireAccount();
  if (!provider) return null;
  const now = new Date(),
    periods = contactPeriods(now),
    start = new Date(
      Math.min(periods.month30.getTime(), periods.month.getTime()),
    );
  async function contacts() {
    const rows: DashboardContact[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase
        .from("contact_events")
        .select("id,created_at,source")
        .eq("provider_id", provider!.id)
        .gte("created_at", start.toISOString())
        .lte("created_at", now.toISOString())
        .order("created_at")
        .order("id")
        .range(offset, offset + 499);
      if (error) throw error;
      rows.push(...(data ?? []));
      if (!data || data.length < 500) return rows;
    }
  }
  async function reviews() {
    const rows: DashboardReview[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,reviewer_name,rating,comment,created_at")
        .eq("provider_id", provider!.id)
        .eq("published", true)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .order("id")
        .range(offset, offset + 499);
      if (error) throw error;
      rows.push(...(data ?? []));
      if (!data || data.length < 500) return rows;
    }
  }
  async function count(
    table: "contact_events" | "provider_images" | "provider_services",
  ) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("provider_id", provider!.id);
    if (error) throw error;
    return count ?? 0;
  }
  const results = await Promise.allSettled([
    contacts(),
    reviews(),
    count("contact_events"),
    count("provider_images"),
    count("provider_services"),
  ] as const);
  results.forEach((r, i) => {
    if (r.status === "rejected")
      console.warn("[Tiki Taka] Métrica del proveedor no disponible", i);
  });
  const [contactResult, reviewResult, totalResult, imageResult, serviceResult] =
    results;
  return {
    provider,
    now: now.toISOString(),
    contacts: contactResult.status === "fulfilled" ? contactResult.value : null,
    reviews: reviewResult.status === "fulfilled" ? reviewResult.value : null,
    totalContacts:
      totalResult.status === "fulfilled" ? totalResult.value : null,
    imageCount: imageResult.status === "fulfilled" ? imageResult.value : null,
    serviceCount:
      serviceResult.status === "fulfilled" ? serviceResult.value : null,
  };
});
export type DashboardData = NonNullable<
  Awaited<ReturnType<typeof getDashboardData>>
>;
