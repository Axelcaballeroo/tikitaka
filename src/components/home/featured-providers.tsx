import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { ProviderBadge } from "@/components/marketplace/provider-badge";
import { money } from "@/lib/utils";
import type { Provider } from "@/types";

export function FeaturedProviders({ providers }: { providers: Provider[] }) {
  return <section className="home-section bg-mint/40"><div className="container-page">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="home-eyebrow">Para descubrir</p><h2 className="home-title">Recomendados por Tiki Taka</h2><p className="home-subtitle">Servicios y profesionales que vale la pena conocer.</p></div><Link href="/servicios" className="py-3 text-sm font-extrabold text-brand">Explorar servicios ↗</Link></div>
    {providers.length ? <div className="home-provider-list mt-8">{providers.map((provider) => <article key={provider.id} className="group flex min-w-0 snap-start flex-col overflow-hidden rounded-3xl border border-brand/10 bg-white">
      <div className="relative aspect-[4/3] overflow-hidden bg-mint"><Link href={`/proveedores/${provider.slug}`} tabIndex={-1} aria-hidden="true"><Image src={provider.image} alt="" fill sizes="(max-width: 767px) 80vw, (max-width: 1023px) 45vw, 25vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /></Link><div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3"><div>{provider.featured && <ProviderBadge kind="featured" />}</div><FavoriteButton providerId={provider.id} providerName={provider.name} className="!h-11 !w-11" /></div></div>
      <div className="flex flex-1 flex-col p-5"><p className="text-xs font-bold text-brand">{provider.category}</p><h3 className="mt-2 text-lg font-extrabold leading-snug"><Link href={`/proveedores/${provider.slug}`}>{provider.name}</Link></h3><p className="mt-2 text-sm text-muted">⌖ {[provider.zone, provider.city].filter((value, index, all) => value && all.indexOf(value) === index).join(", ")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">{provider.reviewsCount > 0 && provider.rating > 0 ? <p className="text-xs font-bold"><span className="text-amber-600">★</span> {provider.rating.toFixed(1)} <span className="font-normal text-muted">({provider.reviewsCount} opiniones)</span></p> : <p className="text-xs text-muted">Todavía sin opiniones</p>}{provider.verified && <ProviderBadge kind="verified" />}</div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5"><p className="text-xs text-muted">{provider.priceFrom > 0 ? <>Desde <strong className="block text-base text-ink">{money(provider.priceFrom)}</strong></> : "Consultar precio"}</p><Link href={`/proveedores/${provider.slug}`} className="rounded-full bg-mint px-4 py-3 text-xs font-extrabold text-brand transition hover:bg-brand hover:text-white">Ver perfil ↗</Link></div>
      </div>
    </article>)}</div> : <div className="mt-8 rounded-3xl border border-dashed border-brand/25 bg-white p-8 md:p-12"><h3 className="text-xl font-bold">Hay mucho por descubrir</h3><p className="mt-3 max-w-lg text-sm leading-6 text-muted">En este momento no tenemos recomendaciones para mostrar. Podés explorar las categorías y consultar los servicios disponibles.</p><Link href="/servicios" className="mt-5 inline-flex py-3 font-bold text-brand">Ir al marketplace →</Link></div>}
  </div></section>;
}
