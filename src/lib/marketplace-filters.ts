import type { Provider } from "@/types";
import { canonicalZone, normalizeText, resolveGeography } from "@/lib/geography";
import { matchesProviderSearch } from "@/lib/provider-search";

export const normalizeSearch = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
export const sortOptions = [
  ["recommended", "Recomendados"],
  ["rating", "Mejor puntuados"],
  ["recent", "Más recientes"],
] as const;
export type CatalogFilters = {
  q: string;
  location: string;
  category: string;
  localidad: string;
  rating: string;
  verified: boolean;
  featured: boolean;
  sort: string;
};
const amount = (value: string | null) =>
  value !== null &&
  value.trim() !== "" &&
  Number.isFinite(Number(value)) &&
  Number(value) >= 0
    ? String(Number(value))
    : "";
export function readCatalogFilters(params: URLSearchParams): CatalogFilters {
  // Preserve main's location/category/sort URLs; also accept zona links.
  const rawZone = params.get("location") ?? params.get("zona") ?? "";
  const place = resolveGeography({ zone: rawZone, city: params.get("localidad") ?? "" });
  return {
    q: params.get("q") ?? "",
    location: canonicalZone(rawZone) ?? (place.resolved ? place.zone : rawZone),
    localidad: place.city,
    category: params.get("category") ?? "",
    rating: amount(params.get("rating")),
    verified: params.get("verified") === "true",
    featured: params.get("featured") === "true",
    sort: sortOptions.some(([value]) => value === params.get("sort"))
      ? params.get("sort")!
      : "recommended",
  };
}
export function filterAndSortProviders(
  providers: Provider[],
  filters: CatalogFilters,
) {
  const location = normalizeText(filters.location);
  const rated = (p: Provider) => (p.reviewsCount > 0 ? p.rating : 0);
  return providers
    .filter(
      (p) =>
        matchesProviderSearch(p, filters.q) &&
        (!location ||
          normalizeText(resolveGeography(p).zone) === location ||
          (!canonicalZone(filters.location) && [p.zone, p.city].some(value => normalizeText(value) === location))) &&
        (!filters.localidad || normalizeText(resolveGeography(p).city) === normalizeText(filters.localidad)) &&
        (!filters.category ||
          filters.category.split(",").includes(p.categorySlug)) &&
        (!filters.verified || p.verified) &&
        (!filters.featured || p.featured) &&
        rated(p) >= Number(filters.rating || 0),
    )
    .sort(
      (a, b) =>
        (filters.sort === "recommended"
          ? Number(b.featured) - Number(a.featured) ||
            Number(b.verified) - Number(a.verified) ||
            rated(b) - rated(a) ||
            b.reviewsCount - a.reviewsCount
          : filters.sort === "rating"
            ? rated(b) - rated(a) || b.reviewsCount - a.reviewsCount
            : filters.sort === "recent"
              ? (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)
              : 0) ||
        a.name.localeCompare(b.name, "es"),
    );
}
