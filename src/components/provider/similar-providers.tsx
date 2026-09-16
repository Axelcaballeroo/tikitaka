import type { Provider } from "@/types";
import { ProviderCard } from "@/components/marketplace/provider-card";
export function SimilarProviders({ providers }: { providers: Provider[] }) {
  if (!providers.length) return null;
  return (
    <section className="container-page mt-14 md:mt-20">
      <p className="home-eyebrow">Seguí descubriendo</p>
      <h2 className="profile-section-title">También te puede interesar</h2>
      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </section>
  );
}
