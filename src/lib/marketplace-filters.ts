import type { Provider } from "@/types";

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
  ["price-asc", "Precio: menor a mayor"],
  ["price-desc", "Precio: mayor a menor"],
] as const;
export type CatalogFilters = {
  q: string;
  location: string;
  category: string;
  minPrice: string;
  maxPrice: string;
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
  return {
    q: params.get("q") ?? "",
    location: params.get("location") ?? "",
    category: params.get("category") ?? "",
    minPrice: amount(params.get("minPrice")),
    maxPrice: amount(params.get("maxPrice")),
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
  const term = normalizeSearch(filters.q),
    location = normalizeSearch(filters.location);
  const hasPrice = filters.minPrice !== "" || filters.maxPrice !== "";
  const rated = (p: Provider) => (p.reviewsCount > 0 ? p.rating : 0);
  const priceOrder = (a: Provider, b: Provider, direction: number) =>
    a.priceFrom <= 0
      ? b.priceFrom <= 0
        ? 0
        : 1
      : b.priceFrom <= 0
        ? -1
        : direction * (a.priceFrom - b.priceFrom);
  return providers
    .filter(
      (p) =>
        (!term ||
          normalizeSearch(
            [p.name, p.category, p.description, p.zone].join(" "),
          ).includes(term)) &&
        (!location ||
          normalizeSearch([p.zone, p.city].join(" ")).includes(location)) &&
        (!filters.category ||
          filters.category.split(",").includes(p.categorySlug)) &&
        (!filters.verified || p.verified) &&
        (!filters.featured || p.featured) &&
        rated(p) >= Number(filters.rating || 0) &&
        (!hasPrice ||
          (p.priceFrom > 0 &&
            (filters.minPrice === "" ||
              p.priceFrom >= Number(filters.minPrice)) &&
            (filters.maxPrice === "" ||
              p.priceFrom <= Number(filters.maxPrice)))),
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
              : priceOrder(a, b, filters.sort === "price-desc" ? -1 : 1)) ||
        a.name.localeCompare(b.name, "es"),
    );
}
