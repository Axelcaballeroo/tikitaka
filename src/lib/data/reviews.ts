import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminReview = {
  id: string;
  providerId: string;
  providerName: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "hidden";
  published: boolean;
  createdAt: string;
};
const admin = () => {
  const client = createAdminClient();
  if (!client) throw new Error("Supabase admin no está configurado.");
  return client;
};

export async function recalculateProviderRating(providerId: string) {
  const supabase = admin();
  let sum = 0,
    count = 0;
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase
      .from("reviews")
      .select("id,rating")
      .eq("provider_id", providerId)
      .eq("published", true)
      .eq("status", "approved")
      .order("id")
      .range(offset, offset + 499);
    if (error) throw new Error(error.message);
    for (const row of data ?? []) {
      sum += Number(row.rating);
      count++;
    }
    if (!data || data.length < 500) break;
  }
  const { error } = await supabase
    .from("providers")
    .update({
      rating: count ? Number((sum / count).toFixed(2)) : 0,
      reviews_count: count,
    })
    .eq("id", providerId);
  if (error) throw new Error(error.message);
}
export async function createReview(input: {
  providerId: string;
  author: string;
  rating: number;
  comment: string;
}) {
  const supabase = admin();
  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("id", input.providerId)
    .eq("published", true)
    .eq("status", "approved")
    .maybeSingle();
  if (!provider)
    throw new Error("El proveedor no está disponible para recibir reseñas.");
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      provider_id: input.providerId,
      reviewer_name: input.author,
      rating: input.rating,
      comment: input.comment,
      status: "approved",
      published: true,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await recalculateProviderRating(input.providerId);
  return data;
}
export async function getAdminReviews(): Promise<AdminReview[]> {
  const supabase = createAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id,provider_id,reviewer_name,reviewer_avatar,rating,comment,status,published,created_at,providers(business_name)",
    )
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[Tiki Taka] Error leyendo reseñas:", error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    providerId: row.provider_id,
    providerName:
      (row.providers as unknown as { business_name: string } | null)
        ?.business_name ?? "Proveedor",
    author: row.reviewer_name,
    avatar: row.reviewer_avatar ?? "",
    rating: row.rating,
    comment: row.comment ?? "",
    status: row.status as AdminReview["status"],
    published: row.published,
    createdAt: row.created_at,
  }));
}
export async function moderateReview(id: string, action: "approve" | "hide") {
  const supabase = admin();
  const { data: review, error: readError } = await supabase
    .from("reviews")
    .select("provider_id")
    .eq("id", id)
    .single();
  if (readError) throw new Error(readError.message);
  const patch =
    action === "approve"
      ? { status: "approved", published: true }
      : { status: "hidden", published: false };
  const { error } = await supabase.from("reviews").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  await recalculateProviderRating(review.provider_id);
}
export async function deleteReview(id: string) {
  const supabase = admin();
  const { data: review, error: readError } = await supabase
    .from("reviews")
    .select("provider_id")
    .eq("id", id)
    .single();
  if (readError) throw new Error(readError.message);
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await recalculateProviderRating(review.provider_id);
}
