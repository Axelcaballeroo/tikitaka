import "server-only";
import { requireAdminApi } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapPublicProvider, type ProviderRow } from "./providers";
import type { AdminProvider } from "@/lib/admin-provider";
import type { Category } from "@/types";

export async function adminDatabase() {
  await requireAdminApi();
  const db = createAdminClient();
  if (!db) throw new Error("Servicio no disponible.");
  return db;
}
export const adminProviderSelect =
  "*,categories(name,slug),provider_images(id,image_url,sort_order),provider_services(id,title,description,price_from),reviews(id,reviewer_name,reviewer_avatar,rating,comment,created_at,published,status)";
export function mapAdminProvider(raw: Record<string, unknown>): AdminProvider {
  const row = raw as ProviderRow;
  const services = (raw.provider_services ?? []) as {
    id: string;
    title: string;
    description: string | null;
    price_from: number | null;
  }[];
  const images = (raw.provider_images ?? []) as {
    id: string;
    image_url: string;
    sort_order: number;
  }[];
  const str = (key: string) =>
    typeof raw[key] === "string" ? (raw[key] as string) : "";
  return {
    provider: { ...mapPublicProvider(row), email: str("email") },
    draft: {
      businessName: row.business_name,
      categorySlug: row.categories?.slug ?? "",
      description: str("description"),
      whatsapp: str("whatsapp"),
      email: str("email"),
      city: str("city"),
      province: str("province"),
      zone: str("zone"),
      coverage: str("coverage"),
      schedule: str("schedule"),
      services: services.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description ?? "",
        priceFrom: s.price_from === null ? "" : String(s.price_from),
      })),
    },
    images: images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({
        id: i.id,
        imageUrl: i.image_url,
        sortOrder: i.sort_order,
      })),
    address: str("address"),
    priceFrom: raw.price_from == null ? "" : String(raw.price_from),
    userId: str("user_id") || null,
    updatedAt: str("updated_at"),
    coverImage: str("cover_image"),
  };
}
export async function getAdminProviders() {
  const db = await adminDatabase();
  const rows: AdminProvider[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db
      .from("providers")
      .select(adminProviderSelect)
      .order("created_at", { ascending: false })
      .order("id")
      .range(offset, offset + 499);
    if (error) throw error;
    rows.push(...(data ?? []).map(mapAdminProvider));
    if (!data || data.length < 500) return rows;
  }
}
export async function getAdminProvider(id: string) {
  const db = await adminDatabase();
  const { data, error } = await db
    .from("providers")
    .select(adminProviderSelect)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAdminProvider(data) : null;
}
export async function getAdminCategories(): Promise<Category[]> {
  const db = await adminDatabase();
  const { data, error } = await db
    .from("categories")
    .select("id,name,slug,description")
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((c) => ({
    ...c,
    description: c.description ?? "",
    icon: "✦",
    color: "bg-mint",
  }));
}
