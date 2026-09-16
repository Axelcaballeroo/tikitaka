import { providers as mockProviders } from "@/lib/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { Provider, ProviderReview } from "@/types";

export type ProviderFilters = {
  search?: string;
  categorySlug?: string;
  zone?: string;
  minRating?: number;
  verified?: boolean;
  featured?: boolean;
  includeUnpublished?: boolean;
  admin?: boolean;
  allowMockFallback?: boolean;
  throwOnError?: boolean;
};
export type ProviderRow = Record<string, unknown> & {
  id: string;
  business_name: string;
  slug: string;
  description: string | null;
  zone: string | null;
  city: string | null;
  whatsapp: string | null;
  price_from: number | null;
  rating: number | null;
  reviews_count: number | null;
  verified: boolean;
  featured: boolean;
  published: boolean;
  cover_image: string | null;
  schedule: string | null;
  coverage: string | null;
  documents: string[] | null;
  created_at: string;
  categories: { name: string; slug: string } | null;
  provider_images: { image_url: string; sort_order: number }[] | null;
  provider_services:
    | { title: string; description: string | null; price_from: number | null }[]
    | null;
  reviews:
    | {
        published?: boolean;
        status?: string;
        id: string;
        reviewer_name: string;
        reviewer_avatar: string | null;
        rating: number;
        comment: string | null;
        created_at: string;
      }[]
    | null;
};
const fallbackImage =
  "https://images.unsplash.com/photo-1602030028438-4cf153cbae9e?auto=format&fit=crop&w=1200&q=85";

function mapProvider(row: ProviderRow): Provider {
  let gallery = [...(row.provider_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => item.image_url);
  const image = row.cover_image ?? gallery[0] ?? fallbackImage;
  gallery = [image, ...gallery.filter((item) => item !== image)];
  const reviews: ProviderReview[] = (row.reviews ?? []).map((review) => ({
    id: review.id,
    author: review.reviewer_name,
    avatar:
      review.reviewer_avatar ??
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    rating: review.rating,
    comment: review.comment ?? "Excelente experiencia.",
    date: review.created_at,
  }));
  return {
    id: row.id,
    name: row.business_name,
    slug: row.slug,
    description: row.description ?? "Servicio infantil en Buenos Aires.",
    category: row.categories?.name ?? "Servicios infantiles",
    categorySlug: row.categories?.slug ?? "servicios-infantiles",
    zone: row.zone ?? "Buenos Aires",
    city: row.city ?? "Buenos Aires",
    rating: Number(row.rating ?? 0),
    reviewsCount: row.reviews_count ?? reviews.length,
    priceFrom: Number(row.price_from ?? 0),
    whatsapp: row.whatsapp ?? "",
    verified: row.verified,
    featured: row.featured,
    published: row.published,
    status: row.status as Provider["status"],
    image,
    gallery: gallery.length ? gallery : [image, image, image],
    services: (row.provider_services ?? []).map((service) => service.title),
    schedule: row.schedule ?? "Horarios a coordinar",
    coverage: (row.coverage ?? row.zone ?? "Buenos Aires")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    documents: row.documents ?? [],
    reviews,
    faqs: [
      {
        question: "¿Cómo consulto disponibilidad?",
        answer: "Contactá al proveedor por WhatsApp para coordinar.",
      },
      {
        question: "¿El precio es final?",
        answer:
          "El valor es orientativo y puede variar según fecha, zona y modalidad.",
      },
    ],
    createdAt: row.created_at,
  };
}

const select =
  "*,categories(name,slug),provider_images(image_url,sort_order),provider_services(title,description,price_from),reviews(id,reviewer_name,reviewer_avatar,rating,comment,created_at,published,status)";
export async function getProviders(
  filters: ProviderFilters = {},
): Promise<Provider[]> {
  const fallback = () =>
    filters.admin || filters.allowMockFallback === false
      ? []
      : filterMocks(filters);
  if (!isSupabaseConfigured()) {
    if (filters.throwOnError) throw new Error("Supabase no configurado");
    return fallback();
  }
  const supabase = filters.admin ? createAdminClient() : createServerClient();
  if (!supabase) {
    if (filters.throwOnError) throw new Error("Supabase no disponible");
    return fallback();
  }
  let query = supabase.from("providers").select(select);
  if (!filters.includeUnpublished)
    query = query.eq("published", true).eq("status", "approved");
  if (filters.search)
    query = query.or(
      `business_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,zone.ilike.%${filters.search}%`,
    );
  if (filters.zone) query = query.eq("zone", filters.zone);
  if (filters.verified) query = query.eq("verified", true);
  if (filters.featured) query = query.eq("featured", true);
  const { data, error } = await query
    .order("featured", { ascending: false })
    .order("rating", { ascending: false });
  if (error) {
    console.error("[Tiki Taka] Error al leer proveedores:", error.message);
    if (filters.throwOnError)
      throw new Error("No se pudieron cargar los proveedores");
    return fallback();
  }
  const rows = data as unknown as ProviderRow[];
  let result = rows.map((row) => ({
    ...mapPublicProvider(row),
    ...(filters.allowMockFallback === false
      ? { zone: row.zone ?? "", city: row.city ?? "" }
      : {}),
    email: String(row.email ?? ""),
  }));
  if (filters.categorySlug)
    result = result.filter(
      (item) => item.categorySlug === filters.categorySlug,
    );
  if (filters.minRating)
    result = result.filter((item) => item.rating >= filters.minRating!);
  result.sort(
    (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
  );
  return result;
}

export async function getProviderById(id: string): Promise<Provider | null> {
  const supabase = createAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("providers")
    .select(select)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as ProviderRow;
  return { ...mapProvider(row), email: String(row.email ?? "") };
}

export async function getProviderBySlug(
  slug: string,
): Promise<Provider | null> {
  const supabase = createServerClient();
  if (!supabase) throw new Error("No se pudo cargar el perfil");
  const profileSelect = select.replace(
    "comment,created_at)",
    "comment,created_at,published,status)",
  );
  const { data, error } = await supabase
    .from("providers")
    .select(profileSelect)
    .eq("slug", slug)
    .eq("published", true)
    .eq("status", "approved")
    .eq("reviews.published", true)
    .eq("reviews.status", "approved")
    .maybeSingle();
  if (error) {
    console.error("[Tiki Taka] Error al leer perfil:", error.message);
    throw new Error("No se pudo cargar el perfil");
  }
  return data ? mapPublicProvider(data as unknown as ProviderRow) : null;
}

// The public profile never fills missing business information with sample content.
export function mapPublicProvider(row: ProviderRow): Provider {
  const base = mapProvider(row);
  const gallery = [
    ...new Set(
      [
        row.cover_image,
        ...(row.provider_images ?? [])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((image) => image.image_url),
      ].filter((image): image is string => Boolean(image?.trim())),
    ),
  ];
  const reviews: ProviderReview[] = (row.reviews ?? [])
    .filter(
      (review) => review.published === true && review.status === "approved",
    )
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .map((review) => ({
      id: review.id,
      author: review.reviewer_name,
      avatar: review.reviewer_avatar ?? "",
      rating: Number(review.rating),
      comment: review.comment ?? "",
      date: review.created_at,
    }));
  return {
    ...base,
    description: row.description?.trim() ?? "",
    zone: row.zone?.trim() ?? "",
    city: row.city?.trim() ?? "",
    image: gallery[0] ?? "",
    gallery,
    schedule: row.schedule?.trim() ?? "",
    coverage: (row.coverage ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    faqs: [],
    serviceDetails: (row.provider_services ?? []).map((service) => ({
      title: service.title,
      description: service.description ?? "",
      priceFrom:
        service.price_from === null ? null : Number(service.price_from),
    })),
    reviews,
    reviewsCount: reviews.length,
    rating: reviews.length
      ? Number(
          (
            reviews.reduce((total, review) => total + review.rating, 0) /
            reviews.length
          ).toFixed(2),
        )
      : 0,
  };
}
function filterMocks(filters: ProviderFilters) {
  return mockProviders.filter(
    (provider) =>
      (!filters.search ||
        `${provider.name} ${provider.description} ${provider.category} ${provider.zone}`
          .toLowerCase()
          .includes(filters.search.toLowerCase())) &&
      (!filters.categorySlug ||
        provider.categorySlug === filters.categorySlug) &&
      (!filters.zone || provider.zone === filters.zone) &&
      (!filters.minRating || provider.rating >= filters.minRating) &&
      (!filters.verified || provider.verified) &&
      (!filters.featured || provider.featured),
  );
}
