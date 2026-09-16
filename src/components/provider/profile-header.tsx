import { ProviderBadge } from "@/components/marketplace/provider-badge";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { money } from "@/lib/utils";
import type { Provider } from "@/types";

// Reserved visual extension. Only actual featured/verified flags are displayed.
const presentation = {
  standard: "border-brand/10",
  featured: "border-brand/25 bg-mint/20",
  pro: "border-lilac",
};
export function ProfileHeader({
  provider,
  preview = false,
}: {
  provider: Provider;
  preview?: boolean;
}) {
  const location = [provider.zone, provider.city]
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(", ");
  const Heading = preview ? "h2" : "h1";
  return (
    <header
      className={`mb-6 rounded-3xl border p-5 md:p-7 ${presentation[provider.featured ? "featured" : "standard"]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="home-eyebrow">{provider.category}</p>
          <Heading className="display mt-3 break-words text-4xl font-medium leading-[1.1] md:text-5xl">
            {provider.name}
          </Heading>
        </div>
        {!preview && (
          <FavoriteButton
            providerId={provider.id}
            providerName={provider.name}
            className="!h-12 !w-12 !shadow-none"
          />
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
        {location && <p>⌖ {location}</p>}
        {provider.reviewsCount > 0 ? (
          <a href="#opiniones" className="py-1">
            <span className="font-bold text-ink">
              ★ {provider.rating.toFixed(1)}
            </span>{" "}
            · {provider.reviewsCount}{" "}
            {provider.reviewsCount === 1 ? "opinión" : "opiniones"}
          </a>
        ) : (
          <a href="#opiniones" className="py-1">
            Todavía sin opiniones
          </a>
        )}
        {provider.priceFrom > 0 && (
          <p>
            Desde{" "}
            <strong className="text-ink">{money(provider.priceFrom)}</strong>
          </p>
        )}
      </div>
      {(provider.featured || provider.verified) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {provider.featured && <ProviderBadge kind="featured" />}
          {provider.verified && <ProviderBadge kind="verified" />}
        </div>
      )}
    </header>
  );
}
