import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { ProviderBadge, getProviderBadges } from "@/components/marketplace/provider-badge";
import { ProviderGallery } from "@/components/marketplace/provider-gallery";
import { ReviewCard } from "@/components/marketplace/review-card";
import { StickyContactCard } from "@/components/marketplace/sticky-contact-card";
import { WhatsappPageTracker } from "@/components/marketplace/whatsapp-page-tracker";
import { ReviewForm } from "@/components/reviews/review-form";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { getProviderBySlug } from "@/lib/data/providers";
import { getSiteUrl } from "@/lib/site-url";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const provider = await getProviderBySlug(slug); if (!provider) return { title: "Proveedor en Tiki Taka" };
  const title = `${provider.name} | ${provider.category} en ${provider.zone}`; const url = `/proveedores/${provider.slug}`;
  return { title, description: provider.description, alternates: { canonical: url }, openGraph: { title, description: provider.description, url, type: "website", images: [{ url: provider.image, alt: provider.name }] }, twitter: { card: "summary_large_image", title, description: provider.description, images: [provider.image] } };
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const provider = await getProviderBySlug(slug); if (!provider) notFound();
  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(`Hola ${provider.name}, encontré tu perfil en Tiki Taka y quisiera consultar disponibilidad.`)}`;
  const jsonLd = { "@context": "https://schema.org", "@type": "LocalBusiness", name: provider.name, description: provider.description, image: provider.gallery, telephone: `+${provider.whatsapp}`, priceRange: `Desde ${money(provider.priceFrom)}`, address: { "@type": "PostalAddress", addressLocality: provider.zone, addressRegion: "Buenos Aires", addressCountry: "AR" }, aggregateRating: { "@type": "AggregateRating", ratingValue: provider.rating, reviewCount: provider.reviewsCount }, url: `${getSiteUrl()}/proveedores/${provider.slug}` };

  return <>
    <WhatsappPageTracker providerId={provider.id} page={`/proveedores/${provider.slug}`} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Servicios", href: "/servicios" }, { label: provider.category, href: `/categorias/${provider.categorySlug}` }, { label: provider.name }]} />
    <section className="container-page"><ProviderGallery images={provider.gallery} name={provider.name} /></section>
    <section className="container-page mt-9 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div><div className="flex flex-wrap gap-2">{getProviderBadges(provider).map((kind) => <ProviderBadge key={kind} kind={kind} />)}</div><p className="mt-6 text-xs font-extrabold uppercase tracking-[.16em] text-brand">{provider.category}</p><h1 className="display mt-2 text-5xl font-semibold leading-tight md:text-6xl">{provider.name}</h1><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted"><p><span className="font-extrabold text-amber-500">★ {provider.rating}</span> ({provider.reviewsCount} opiniones)</p><p>⌖ {provider.zone}, {provider.city}</p><p className="font-bold text-brand">⚡ Responde en menos de 2 horas</p></div><div className="mt-7 flex flex-col gap-3 sm:flex-row lg:hidden"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center rounded-full bg-[#25D366] px-5 py-3 font-extrabold text-[#103d24]">Contactar por WhatsApp ↗</a><FavoriteButton providerId={provider.id} providerName={provider.name} variant="full" className="flex-1" /></div>
        <div className="mt-12 space-y-14">
          <section><h2 className="display text-3xl font-semibold">Sobre este servicio</h2><p className="mt-4 max-w-3xl text-base leading-8 text-muted">{provider.description} Cada propuesta se adapta a las necesidades de la familia, con información clara y acompañamiento desde el primer contacto.</p></section>
          <section><h2 className="display text-3xl font-semibold">Servicios disponibles</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{provider.services.map((service) => <div key={service} className="rounded-2xl bg-mint p-4 text-sm font-bold"><span className="mr-2 text-brand">✓</span>{service}</div>)}</div></section>
          <section><h2 className="display text-3xl font-semibold">Precios orientativos</h2><div className="mt-5 overflow-hidden rounded-2xl border border-teal-900/8 bg-white">{[["Servicio inicial", provider.priceFrom], ["Propuesta extendida", Math.round(provider.priceFrom * 1.5)], ["Plan personalizado", null]].map(([label, price]) => <div key={String(label)} className="flex items-center justify-between border-b border-teal-900/8 px-5 py-4 last:border-0"><span className="text-sm font-bold">{label}</span><span className="text-sm font-extrabold text-brand">{typeof price === "number" ? `Desde ${money(price)}` : "A consultar"}</span></div>)}</div><p className="mt-3 text-xs text-muted">Confirmá el precio final según fecha, modalidad, duración y zona.</p></section>
          <section className="grid gap-5 sm:grid-cols-2"><div className="rounded-[1.75rem] bg-lilac p-6"><h2 className="display text-2xl font-semibold">Cobertura</h2><p className="mt-3 leading-7 text-muted">{provider.coverage.join(" · ")}</p></div><div className="rounded-[1.75rem] bg-blush p-6"><h2 className="display text-2xl font-semibold">Horarios</h2><p className="mt-3 leading-7 text-muted">{provider.schedule}</p></div></section>
          <section><h2 className="display text-3xl font-semibold">Dónde trabaja</h2><p className="mt-3 text-muted">Zona de referencia: {provider.zone}, Buenos Aires.</p><div className="relative mt-5 h-72 overflow-hidden rounded-[1.75rem] bg-[#e4eee9] dot-pattern"><div className="absolute inset-0 opacity-30" /><div className="absolute left-[42%] top-[42%] grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-brand text-2xl text-white shadow-xl">⌖</div><span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-xs font-extrabold shadow">Mapa orientativo · {provider.zone}</span></div></section>
          <section><h2 className="display text-3xl font-semibold">Proveedor verificado</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{provider.documents.map((document) => <div key={document} className="flex items-center gap-3 rounded-2xl border border-teal-900/8 bg-white p-4 text-sm font-bold"><span className="grid h-8 w-8 place-items-center rounded-full bg-mint text-brand">✓</span>{document}</div>)}</div></section>
          <section><div className="flex items-end justify-between"><div><h2 className="display text-3xl font-semibold">Opiniones de familias</h2><p className="mt-2 text-sm text-muted">Experiencias verificadas de la comunidad.</p></div><div className="text-right"><p className="display text-3xl font-semibold text-brand">{provider.rating}</p><p className="text-xs text-amber-500">★★★★★</p></div></div><div className="mt-6 grid gap-4 xl:grid-cols-2">{provider.reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div></section>
          <section><h2 className="display text-3xl font-semibold">Preguntas frecuentes</h2><div className="mt-5 space-y-3">{provider.faqs.map((faq) => <details key={faq.question} className="group rounded-2xl border border-teal-900/8 bg-white p-5"><summary className="cursor-pointer list-none font-extrabold">{faq.question}<span className="float-right text-brand group-open:rotate-45">＋</span></summary><p className="mt-4 pr-8 text-sm leading-6 text-muted">{faq.answer}</p></details>)}</div></section>
        </div>
      </div>
      <div className="hidden lg:block"><StickyContactCard provider={provider} /></div>
    </section>
    {!provider.reviews.length && <section className="container-page mt-12"><div className="rounded-2xl border border-dashed border-brand/30 bg-mint p-10 text-center"><p className="display text-3xl font-semibold">Todavía no hay reseñas</p><p className="mt-2 text-muted">Sé la primera familia en compartir su experiencia.</p></div></section>}
    <section className="container-page mt-12"><ReviewForm providerId={provider.id} providerName={provider.name} /></section>
    <section className="container-page mt-14"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Antes de contratar:</strong> Tiki Taka facilita el contacto entre familias y proveedores. Recomendamos validar disponibilidad, precios, documentación y condiciones directamente con el proveedor.</div></section>
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-teal-900/10 bg-white/95 p-3 backdrop-blur lg:hidden"><div className="container-page flex items-center gap-3"><div className="hidden min-w-0 flex-1 sm:block"><p className="truncate text-sm font-extrabold">{provider.name}</p><p className="text-xs text-muted">Desde {money(provider.priceFrom)}</p></div><a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex flex-1 justify-center rounded-full bg-[#25D366] px-5 py-3 text-sm font-extrabold text-[#103d24]">WhatsApp ↗</a></div></div>
  </>;
}
