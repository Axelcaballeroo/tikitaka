import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProviderGallery } from "@/components/marketplace/provider-gallery";
import { StickyContactCard } from "@/components/marketplace/sticky-contact-card";
import { ProfileHeader } from "@/components/provider/profile-header";
import { ProfileDetails } from "@/components/provider/profile-details";
import { ProfileReviews } from "@/components/provider/profile-reviews";
import { SimilarProviders } from "@/components/provider/similar-providers";
import { ProfileWhatsapp } from "@/components/provider/profile-whatsapp";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { getProviderBySlug, getProviders } from "@/lib/data/providers";
import { getSiteUrl } from "@/lib/site-url";
import { profileJsonLd, similarProviders } from "@/lib/provider-profile";

export const dynamic = "force-dynamic";
const loadProfile = cache(async (slug: string) => {
  try {
    return { provider: await getProviderBySlug(slug), unavailable: false };
  } catch {
    return { provider: null, unavailable: true };
  }
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { provider, unavailable } = await loadProfile(slug);
  if (!provider && !unavailable) notFound();
  if (!provider)
    return {
      title: "Proveedor en Tiki Taka",
      robots: { index: false, follow: true },
    };
  const location = [provider.zone, provider.city]
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(", ");
  const title = `${provider.name} | ${provider.category}${location ? ` en ${location}` : ""}`;
  const url = `${getSiteUrl()}/proveedores/${provider.slug}`;
  return {
    title,
    description: provider.description || undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: provider.description || undefined,
      url,
      type: "website",
      images: provider.image
        ? [{ url: provider.image, alt: provider.name }]
        : [],
    },
    twitter: {
      card: provider.image ? "summary_large_image" : "summary",
      title,
      description: provider.description || undefined,
      images: provider.image ? [provider.image] : [],
    },
  };
}
export default async function ProviderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { provider, unavailable } = await loadProfile(slug);
  if (unavailable)
    return (
      <section className="container-page py-20">
        <div
          role="status"
          className="mx-auto max-w-xl rounded-[2rem] bg-mint p-8 text-center"
        >
          <h1 className="display text-3xl">No pudimos cargar este perfil.</h1>
          <p className="mt-4 text-sm leading-7 text-muted">
            Intentá nuevamente en unos minutos.
          </p>
          <a
            href={`/proveedores/${encodeURIComponent(slug)}`}
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand px-6 py-3 text-sm font-bold text-white"
          >
            Volver a intentar
          </a>
        </div>
      </section>
    );
  if (!provider) notFound();
  const candidates = await getProviders({ allowMockFallback: false }).catch(
    () => [],
  );
  const related = similarProviders(provider, candidates);
  const jsonLd = profileJsonLd(provider, getSiteUrl());
  return (
    <div
      className={`provider-profile ${provider.whatsapp.trim() ? "provider-profile-with-contact" : ""}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Servicios", href: "/servicios" },
          {
            label: provider.category,
            href: `/servicios?${new URLSearchParams({ category: provider.categorySlug })}`,
          },
          { label: provider.name },
        ]}
      />
      <div className="container-page pt-3">
        <ProfileHeader provider={provider} />
        <ProviderGallery images={provider.gallery} name={provider.name} />
      </div>
      <div className="container-page mt-8 grid items-start gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24">
          <StickyContactCard provider={provider} />
        </div>
        <div className="min-w-0 space-y-12 lg:col-start-1 lg:row-start-1">
          <ProfileDetails provider={provider} />
          <ProfileReviews provider={provider} />
        </div>
      </div>
      <SimilarProviders providers={related} />
      {provider.whatsapp.trim() && (
        <div className="profile-mobile-contact fixed inset-x-0 bottom-0 z-40 border-t border-brand/15 bg-white/95 backdrop-blur lg:hidden">
          <div className="container-page">
            <ProfileWhatsapp
              source="sticky_contact"
              provider={provider}
              className="flex min-h-12 items-center justify-center rounded-full bg-brand px-4 py-3 text-center text-sm font-extrabold text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
