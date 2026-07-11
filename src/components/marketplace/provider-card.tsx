"use client";

import Image from "next/image";
import Link from "next/link";
import { money } from "@/lib/utils";
import type { Provider } from "@/types";
import { FavoriteButton } from "./favorite-button";
import { getProviderBadges, ProviderBadge } from "./provider-badge";
import { TrackedWhatsappLink } from "./tracked-whatsapp-link";

export function ProviderCard({ provider }: { provider: Provider }) {
  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(`Hola ${provider.name}, encontré tu perfil en Tiki Taka y quisiera consultar.`)}`;

  return <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-teal-900/8 bg-white shadow-[0_14px_45px_rgba(20,78,72,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(20,78,72,.14)]">
    <div className="relative h-56 overflow-hidden">
      <Image src={provider.image} alt={provider.name} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <div className="flex max-w-[82%] flex-wrap gap-1.5">{getProviderBadges(provider).slice(0, 3).map((kind) => <ProviderBadge key={kind} kind={kind} className="backdrop-blur" />)}</div>
        <FavoriteButton providerId={provider.id} providerName={provider.name} />
      </div>
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-extrabold uppercase tracking-[.13em] text-brand">{provider.category}</p><p className="whitespace-nowrap text-sm font-extrabold text-ink"><span className="text-amber-500">★</span> {provider.rating} <span className="font-medium text-muted">({provider.reviewsCount})</span></p></div>
      <h3 className="display mt-2 text-[1.65rem] font-semibold leading-tight">{provider.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{provider.description}</p>
      <p className="mt-4 text-sm font-bold text-ink">⌖ {provider.zone}, {provider.city}</p>
      <p className="mt-2 line-clamp-1 text-xs text-muted"><span className="font-bold text-ink">Cobertura:</span> {provider.coverage.join(" · ")}</p>
      <div className="mt-auto pt-5"><div className="flex items-end justify-between border-t border-teal-900/8 pt-4"><div><span className="text-[11px] text-muted">Precio desde</span><p className="text-lg font-extrabold">{money(provider.priceFrom)}</p></div><Link href={`/proveedores/${provider.slug}`} className="rounded-full border-2 border-brand px-4 py-2 text-sm font-extrabold text-brand transition hover:bg-mint">Ver perfil</Link></div>
        <TrackedWhatsappLink providerId={provider.id} source="marketplace_card" page="/servicios" href={whatsappUrl} className="mt-3 flex w-full items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-sm font-extrabold text-[#103d24] transition hover:bg-[#1fc35b]">WhatsApp <span className="ml-2">↗</span></TrackedWhatsappLink><p className="mt-2 text-center text-[11px] text-muted">Responde por WhatsApp</p>
      </div>
    </div>
  </article>;
}
