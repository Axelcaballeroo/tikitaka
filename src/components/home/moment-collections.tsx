import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";
import { collectionHref, collections } from "./home-content";

export function MomentCollections({ categories }: { categories: Category[] }) {
  return <section className="container-page home-section"><p className="home-eyebrow">La vida en familia</p><h2 className="home-title max-w-xl">Encontrá lo que necesitás para cada momento</h2><div className="mt-8 grid gap-4 sm:grid-cols-2">{[collections[0], collections[2], collections[1], collections[4]].map((item) => <Link key={item.name} href={collectionHref(item.slugs, categories)} className="group relative isolate flex min-h-72 items-end overflow-hidden rounded-[2rem] bg-ink p-6 md:min-h-80 md:p-8"><Image src={`https://images.unsplash.com/photo-${item.photo}?auto=format&fit=crop&w=800&q=85`} alt="" fill sizes="(max-width: 639px) 100vw, 50vw" className="-z-20 object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/25 to-transparent" /><div className="pr-8 text-white"><h3 className="display text-2xl font-medium md:text-3xl">{item.moment}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-white/90">{item.detail}</p></div><span aria-hidden className="absolute bottom-8 right-6 grid h-10 w-10 place-items-center rounded-full border border-white/50 text-white">↗</span></Link>)}</div></section>;
}
