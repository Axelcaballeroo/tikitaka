import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export type AccountProvider = {
  id: string;
  userId: string;
  categoryId: string | null;
  businessName: string;
  slug: string;
  description: string;
  zone: string;
  city: string;
  province: string;
  address: string;
  whatsapp: string;
  email: string;
  priceFrom: number;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  featured: boolean;
  published: boolean;
  status: "pending" | "approved" | "rejected";
  coverImage: string;
  logo: string;
  schedule: string;
  coverage: string;
  categoryName: string;
};
export type AccountService = {
  id: string;
  title: string;
  description: string;
  priceFrom: number;
};
export type AccountImage = { id: string; imageUrl: string; sortOrder: number };

export const requireAccount = cache(async function requireAccount() {
  const supabase = await createAuthServerClient();
  if (!supabase) redirect("/login?error=config");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase
    .from("providers")
    .select("*,categories(name)")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.error("[Tiki Taka] No se pudo leer la cuenta", error.message);
    throw new Error("No pudimos cargar tu perfil.");
  }
  const row = data as
    (Record<string, unknown> & { categories: { name: string } | null }) | null;
  const provider: AccountProvider | null = row
    ? {
        id: String(row.id),
        userId: user.id,
        categoryId: row.category_id ? String(row.category_id) : null,
        businessName: String(row.business_name ?? ""),
        slug: String(row.slug ?? ""),
        description: String(row.description ?? ""),
        zone: String(row.zone ?? ""),
        city: String(row.city ?? "Buenos Aires"),
        province: String(row.province ?? "Buenos Aires"),
        address: String(row.address ?? ""),
        whatsapp: String(row.whatsapp ?? ""),
        email: String(row.email ?? user.email ?? ""),
        priceFrom: Number(row.price_from ?? 0),
        rating: Number(row.rating ?? 0),
        reviewsCount: Number(row.reviews_count ?? 0),
        verified: Boolean(row.verified),
        featured: Boolean(row.featured),
        published: Boolean(row.published),
        status: (row.status as AccountProvider["status"]) ?? "pending",
        coverImage: String(row.cover_image ?? ""),
        logo: String(row.logo ?? ""),
        schedule: String(row.schedule ?? ""),
        coverage: String(row.coverage ?? ""),
        categoryName: row.categories?.name ?? "Sin categoría",
      }
    : null;
  if (!provider) redirect("/publicar");
  return { supabase, user, provider };
});

export async function requireProviderApiAccount() {
  const supabase = await createAuthServerClient();
  if (!supabase) throw new Error("No autorizado");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError || profile?.role === "admin" || !["provider", "customer"].includes(String(profile?.role))) throw new Error("No autorizado");
  const { data, error } = await supabase.from("providers").select("*,categories(name)").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  const row = data as (Record<string, unknown> & { categories: { name: string } | null }) | null;
  const provider: AccountProvider | null = row ? {
    id: String(row.id), userId: user.id, categoryId: row.category_id ? String(row.category_id) : null,
    businessName: String(row.business_name ?? ""), slug: String(row.slug ?? ""), description: String(row.description ?? ""),
    zone: String(row.zone ?? ""), city: String(row.city ?? ""), province: String(row.province ?? ""), address: String(row.address ?? ""),
    whatsapp: String(row.whatsapp ?? ""), email: String(row.email ?? user.email ?? ""), priceFrom: Number(row.price_from ?? 0),
    rating: Number(row.rating ?? 0), reviewsCount: Number(row.reviews_count ?? 0), verified: Boolean(row.verified), featured: Boolean(row.featured),
    published: Boolean(row.published), status: (row.status as AccountProvider["status"]) ?? "pending", coverImage: String(row.cover_image ?? ""),
    logo: String(row.logo ?? ""), schedule: String(row.schedule ?? ""), coverage: String(row.coverage ?? ""), categoryName: row.categories?.name ?? "Sin categoría",
  } : null;
  return { supabase, user, provider };
}

export async function getAccountServices(providerId: string) {
  const { supabase, provider } = await requireAccount();
  if (!provider || provider.id !== providerId) throw new Error("No autorizado");
  const { data } = await supabase
    .from("provider_services")
    .select("id,title,description,price_from")
    .eq("provider_id", providerId)
    .order("created_at");
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    priceFrom: Number(row.price_from ?? 0),
  })) as AccountService[];
}
export async function getAccountImages(providerId: string) {
  const { supabase, provider } = await requireAccount();
  if (!provider || provider.id !== providerId) throw new Error("No autorizado");
  const { data } = await supabase
    .from("provider_images")
    .select("id,image_url,sort_order")
    .eq("provider_id", providerId)
    .order("sort_order");
  return (data ?? []).map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  })) as AccountImage[];
}
