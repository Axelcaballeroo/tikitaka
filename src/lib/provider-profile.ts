import type { Provider } from "@/types";
import { money } from "@/lib/utils";
import { normalizeSearch } from "@/lib/marketplace-filters";

export function similarProviders(provider: Provider, providers: Provider[]) {
  return providers
    .filter(
      (item) =>
        item.id !== provider.id &&
        item.slug !== provider.slug &&
        item.published === true &&
        item.status === "approved",
    )
    .sort(
      (a, b) =>
        Number(b.categorySlug === provider.categorySlug) -
          Number(a.categorySlug === provider.categorySlug) ||
        Number(
          Boolean(provider.zone) &&
            normalizeSearch(b.zone) === normalizeSearch(provider.zone),
        ) -
          Number(
            Boolean(provider.zone) &&
              normalizeSearch(a.zone) === normalizeSearch(provider.zone),
          ) ||
        Number(b.featured) - Number(a.featured) ||
        Number(b.verified) - Number(a.verified) ||
        b.rating - a.rating ||
        a.name.localeCompare(b.name, "es"),
    )
    .slice(0, 4);
}
export function profileJsonLd(provider: Provider, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: provider.name,
    url: `${siteUrl}/proveedores/${provider.slug}`,
    ...(provider.description ? { description: provider.description } : {}),
    ...(provider.gallery.length ? { image: provider.gallery } : {}),
    ...(provider.whatsapp.trim()
      ? { telephone: `+${provider.whatsapp.replace(/^\+/, "")}` }
      : {}),
    ...(provider.priceFrom > 0
      ? { priceRange: `Desde ${money(provider.priceFrom)}` }
      : {}),
    ...(provider.zone || provider.city
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: [provider.zone, provider.city]
              .filter((v, i, a) => v && a.indexOf(v) === i)
              .join(", "),
          },
        }
      : {}),
    ...(provider.reviewsCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: provider.rating,
            reviewCount: provider.reviewsCount,
          },
        }
      : {}),
  };
}
