"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/utils";
import type { Provider } from "@/types";
import { FavoriteButton } from "./favorite-button";
import { ProviderBadge } from "./provider-badge";
import { TrackedWhatsappLink } from "./tracked-whatsapp-link";

// PRO is a presentation extension only. No database field or automatic assignment.
export const providerCardPresentation = {
  standard: "border-brand/10",
  featured: "border-brand/30 shadow-[0_4px_20px_#167f7509]",
  pro: "border-lilac shadow-[0_4px_20px_#ded7ff30]",
};
export function ProviderCard({ provider }: { provider: Provider }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(`Hola ${provider.name}, encontré tu perfil en Tiki Taka y quisiera consultar.`)}`;
  return (
    <article
      data-provider-id={provider.id}
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border bg-white transition duration-300 hover:-translate-y-1 ${providerCardPresentation[provider.featured ? "featured" : "standard"]}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mint">
        {failedImage === provider.image ? (
          <div className="absolute inset-0 grid place-items-center px-4 text-sm text-muted">
            Imagen no disponible
          </div>
        ) : (
          <Link
            href={`/proveedores/${provider.slug}`}
            tabIndex={-1}
            aria-hidden="true"
          >
            <Image
              src={provider.image}
              alt=""
              fill
              onError={() => setFailedImage(provider.image)}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 639px) 100vw, (max-width: 1279px) 45vw, 25vw"
            />
          </Link>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div>{provider.featured && <ProviderBadge kind="featured" />}</div>
          <FavoriteButton
            providerId={provider.id}
            providerName={provider.name}
            className="!h-11 !w-11"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold text-brand">{provider.category}</p>
        <h3 className="mt-2 text-lg font-extrabold leading-snug">
          <Link href={`/proveedores/${provider.slug}`}>{provider.name}</Link>
        </h3>
        <p className="mt-2 text-sm text-muted">
          ⌖{" "}
          {[provider.zone, provider.city]
            .filter((v, i, a) => v && a.indexOf(v) === i)
            .join(", ") || "Consultar ubicación"}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
          {provider.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {provider.reviewsCount > 0 && provider.rating > 0 ? (
            <p className="text-xs">
              <span className="font-bold text-ink">
                ★ {provider.rating.toFixed(1)}
              </span>{" "}
              <span className="text-muted">
                ({provider.reviewsCount} opiniones)
              </span>
            </p>
          ) : (
            <p className="text-xs text-muted">Todavía sin opiniones</p>
          )}
          {provider.verified && <ProviderBadge kind="verified" />}
        </div>
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand/10 pt-4">
            <p className="text-xs text-muted">
              {provider.priceFrom > 0 ? (
                <>
                  Desde{" "}
                  <strong className="block text-base text-ink">
                    {money(provider.priceFrom)}
                  </strong>
                </>
              ) : (
                "Consultar precio"
              )}
            </p>
            <Link
              href={`/proveedores/${provider.slug}`}
              className="rounded-full bg-mint px-4 py-3 text-xs font-extrabold text-brand transition hover:bg-brand hover:text-white"
            >
              Ver perfil ↗
            </Link>
          </div>
          {provider.whatsapp && (
            <TrackedWhatsappLink
              providerId={provider.id}
              source="marketplace_card"
              page="/servicios"
              href={whatsappUrl}
              className="mt-4 flex min-h-11 items-center justify-center rounded-full border border-brand/20 px-4 py-2 text-xs font-extrabold text-brand transition hover:bg-mint"
            >
              Consultar por WhatsApp ↗
            </TrackedWhatsappLink>
          )}
        </div>
      </div>
    </article>
  );
}
