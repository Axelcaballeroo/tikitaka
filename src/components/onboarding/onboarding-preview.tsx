import type { Category, Provider } from "@/types";
import type { OnboardingDraft, OnboardingImage } from "@/lib/onboarding";
import { ProviderGallery } from "@/components/marketplace/provider-gallery";
import { ProfileDetails } from "@/components/provider/profile-details";
export function OnboardingPreview({
  draft,
  categories,
  cover,
  images,
  administrative = false,
}: {
  draft: OnboardingDraft;
  categories: Category[];
  cover: string;
  images: OnboardingImage[];
  administrative?: boolean;
}) {
  const prices = draft.services
    .filter((service) => service.priceFrom !== "")
    .map((service) => Number(service.priceFrom));
  const provider: Provider = {
    id: "preview",
    slug: "",
    name: draft.businessName,
    category:
      categories.find((category) => category.slug === draft.categorySlug)
        ?.name ?? "",
    categorySlug: draft.categorySlug,
    description: draft.description,
    zone: draft.zone,
    city: draft.city,
    rating: 0,
    reviewsCount: 0,
    priceFrom: prices.length ? Math.min(...prices) : 0,
    whatsapp: draft.whatsapp,
    verified: false,
    featured: false,
    image: cover,
    gallery: [cover, ...images.map((image) => image.imageUrl)].filter(Boolean),
    services: draft.services.map((service) => service.title),
    serviceDetails: draft.services.map((service) => ({
      title: service.title,
      description: service.description,
      priceFrom: service.priceFrom === "" ? null : Number(service.priceFrom),
    })),
    schedule: draft.schedule,
    coverage: draft.coverage
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    documents: [],
    reviews: [],
    faqs: [],
    createdAt: "",
    published: false,
    status: "pending",
  };
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-lilac/40 p-4 text-sm leading-6">
        <strong>Vista previa</strong>
        <p>
          {administrative
            ? "Así se verá aproximadamente el perfil. Los cambios sin guardar no se publican."
            : "Así se verá aproximadamente tu perfil. Todavía no está publicado."}
        </p>
      </div>
      <header>
        <p className="home-eyebrow">{provider.category}</p>
        <h3 className="display mt-3 break-words text-3xl font-medium">
          {provider.name}
        </h3>
        <p className="mt-3 text-sm text-muted">
          {[draft.zone, draft.city].filter(Boolean).join(", ")}
        </p>
      </header>
      <ProviderGallery images={provider.gallery} name={provider.name} />
      <ProfileDetails provider={provider} preview />
      <div className="rounded-2xl bg-mint p-5">
        <p className="text-sm font-bold">WhatsApp de contacto</p>
        <p className="mt-2 break-words text-sm text-muted">{draft.whatsapp}</p>
        <p className="mt-3 text-xs text-muted">
          Las familias podrán contactarte directamente por WhatsApp.
        </p>
      </div>
    </div>
  );
}
