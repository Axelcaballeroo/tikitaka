import { ServiceSearchForm } from "@/components/marketplace/service-search-form";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";
import { collectionHref, collections, homePhoto } from "./home-content";

export function HeroSearch({
  categories,
  zones,
}: {
  categories: Category[];
  zones: string[];
}) {
  const quick = [
    ["Cumpleaños", collections[0].slugs],
    ["Niñeras", ["nineras"]],
    ["Apoyo escolar", ["clases-particulares"]],
    ["Psicopedagogía", ["psicopedagogia"]],
    ["Actividades", collections[4].slugs],
  ] as const;
  return (
    <section className="home-hero container-page">
      <div className="home-hero-copy">
        <p className="home-eyebrow">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand" />
          Para sus pequeños grandes momentos
        </p>
        <h1 className="display mt-5 text-[2.65rem] font-medium leading-[1.08] sm:text-6xl lg:text-[4.25rem]">
          Todo lo que tus hijos necesitan,
          <br />
          <span className="text-brand">en un solo lugar.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-muted md:text-lg">
          Encontrá servicios, profesionales y lugares de confianza cerca tuyo.
        </p>
      </div>
      <div className="home-hero-photo relative overflow-hidden rounded-[2rem] bg-mint lg:rounded-[3rem_3rem_7rem_3rem]">
        <Image
          src={homePhoto}
          alt="Un momento compartido en familia"
          fill
          priority
          sizes="(max-width: 767px) 100vw, 48vw"
          className="object-cover"
        />
        <div className="absolute bottom-5 left-5 rounded-2xl md:bottom-auto md:top-5 bg-white/95 px-5 py-3 text-sm font-bold">
          Más tiempo para <span className="text-brand">estar juntos.</span>{" "}
          <span aria-hidden>♡</span>
        </div>
      </div>
      <div className="home-hero-search">
        <ServiceSearchForm zones={zones} id="home-search" />
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-muted">Ideas para empezar</span>
          {quick.map(([label, slugs]) => (
            <Link
              key={label}
              href={collectionHref([...slugs], categories)}
              className="rounded-full border border-brand/15 bg-white/80 px-3 py-2.5 text-xs font-bold transition hover:border-brand hover:bg-mint"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
