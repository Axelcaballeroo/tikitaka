import type { Provider } from "@/types";
import { ProviderCard } from "./provider-card";
export function CatalogRecommendations({
  providers,
}: {
  providers: Provider[];
}) {
  if (!providers.length) return null;
  return (
    <section
      aria-label="Recomendados por Tiki Taka"
      className="my-8 min-w-0 rounded-3xl bg-lilac/25 p-4 md:p-6"
    >
      <p className="home-eyebrow">Propuestas destacadas</p>
      <h2 className="display mt-2 text-2xl font-medium">
        Recomendados por Tiki Taka
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Servicios con mayor presencia en Tiki Taka que coinciden con tu
        búsqueda.
      </p>
      <div className="catalog-promoted mt-5">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </section>
  );
}
