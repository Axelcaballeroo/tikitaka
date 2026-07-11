import { providers as mockProviders } from "@/lib/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Provider, ProviderReview } from "@/types";

export type ProviderFilters = { search?: string; categorySlug?: string; zone?: string; minRating?: number; verified?: boolean; featured?: boolean; includeUnpublished?: boolean; admin?: boolean };
type ProviderRow = Record<string, unknown> & { id: string; business_name: string; slug: string; description: string | null; zone: string | null; city: string | null; whatsapp: string | null; price_from: number | null; rating: number | null; reviews_count: number | null; verified: boolean; featured: boolean; published: boolean; cover_image: string | null; schedule: string | null; coverage: string | null; documents: string[] | null; created_at: string; categories: { name: string; slug: string } | null; provider_images: { image_url: string; sort_order: number }[] | null; provider_services: { title: string; description: string | null; price_from: number | null }[] | null; reviews: { id: string; reviewer_name: string; reviewer_avatar: string | null; rating: number; comment: string | null; created_at: string }[] | null };
const fallbackImage = "https://images.unsplash.com/photo-1602030028438-4cf153cbae9e?auto=format&fit=crop&w=1200&q=85";

function mapProvider(row: ProviderRow): Provider {
  let gallery = [...(row.provider_images ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((item) => item.image_url);
  const image = row.cover_image ?? gallery[0] ?? fallbackImage;
  gallery = [image, ...gallery.filter((item) => item !== image)];
  const reviews: ProviderReview[] = (row.reviews ?? []).map((review) => ({ id: review.id, author: review.reviewer_name, avatar: review.reviewer_avatar ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80", rating: review.rating, comment: review.comment ?? "Excelente experiencia.", date: review.created_at }));
  return { id: row.id, name: row.business_name, slug: row.slug, description: row.description ?? "Servicio infantil en Buenos Aires.", category: row.categories?.name ?? "Servicios infantiles", categorySlug: row.categories?.slug ?? "servicios-infantiles", zone: row.zone ?? "Buenos Aires", city: row.city ?? "Buenos Aires", rating: Number(row.rating ?? 0), reviewsCount: row.reviews_count ?? reviews.length, priceFrom: Number(row.price_from ?? 0), whatsapp: row.whatsapp ?? "", verified: row.verified, featured: row.featured, published: row.published, status: row.status as Provider["status"], image, gallery: gallery.length ? gallery : [image, image, image], services: (row.provider_services ?? []).map((service) => service.title), schedule: row.schedule ?? "Horarios a coordinar", coverage: (row.coverage ?? row.zone ?? "Buenos Aires").split(",").map((item) => item.trim()).filter(Boolean), documents: row.documents ?? [], reviews, faqs: [{ question: "¿Cómo consulto disponibilidad?", answer: "Contactá al proveedor por WhatsApp para coordinar." }, { question: "¿El precio es final?", answer: "El valor es orientativo y puede variar según fecha, zona y modalidad." }], createdAt: row.created_at };
}

const select = "*,categories(name,slug),provider_images(image_url,sort_order),provider_services(title,description,price_from),reviews(id,reviewer_name,reviewer_avatar,rating,comment,created_at)";
export async function getProviders(filters: ProviderFilters = {}): Promise<Provider[]> {
  if (!isSupabaseConfigured()) return filterMocks(filters);
  const supabase = filters.admin ? createAdminClient() : createServerClient(); if (!supabase) return filters.admin ? [] : filterMocks(filters);
  let query = supabase.from("providers").select(select);
  if (!filters.includeUnpublished) query = query.eq("published", true).eq("status", "approved");
  if (filters.search) query = query.or(`business_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,zone.ilike.%${filters.search}%`);
  if (filters.zone) query = query.eq("zone", filters.zone); if (filters.minRating) query = query.gte("rating", filters.minRating); if (filters.verified) query = query.eq("verified", true); if (filters.featured) query = query.eq("featured", true);
  const { data, error } = await query.order("featured", { ascending: false }).order("rating", { ascending: false });
  if (error) { console.error("[Tiki Taka] Error al leer proveedores:", error.message); return filters.admin ? [] : filterMocks(filters); }
  const rows = data as unknown as ProviderRow[];
  let result = rows.map((row) => ({ ...mapProvider(row), email: String(row.email ?? "") }));
  if (filters.categorySlug) result = result.filter((item) => item.categorySlug === filters.categorySlug); return result;
}

export async function getProviderById(id: string): Promise<Provider | null> { const supabase = createAdminClient(); if (!supabase) return null; const { data, error } = await supabase.from("providers").select(select).eq("id", id).maybeSingle(); if (error || !data) return null; const row = data as unknown as ProviderRow; return { ...mapProvider(row), email: String(row.email ?? "") }; }

export async function getProviderBySlug(slug: string): Promise<Provider | null> {
  if (!isSupabaseConfigured()) return mockProviders.find((item) => item.slug === slug) ?? null;
  const supabase = createServerClient(); if (!supabase) return null;
  const { data, error } = await supabase.from("providers").select(select).eq("slug", slug).eq("published", true).eq("status", "approved").maybeSingle();
  if (error) { console.error("[Tiki Taka] Error al leer proveedor:", error.message); return null; } return data ? mapProvider(data as unknown as ProviderRow) : null;
}

function filterMocks(filters: ProviderFilters) { return mockProviders.filter((provider) => (!filters.search || `${provider.name} ${provider.description} ${provider.category} ${provider.zone}`.toLowerCase().includes(filters.search.toLowerCase())) && (!filters.categorySlug || provider.categorySlug === filters.categorySlug) && (!filters.zone || provider.zone === filters.zone) && (!filters.minRating || provider.rating >= filters.minRating) && (!filters.verified || provider.verified) && (!filters.featured || provider.featured)); }
