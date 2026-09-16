import Link from "next/link";
import type { Category } from "@/types";
import { collectionHref, collections } from "./home-content";

export function CategoryExplorer({ categories }: { categories: Category[] }) {
  return <section id="categorias" className="container-page home-section scroll-mt-24">
    <p className="home-eyebrow">Un mundo de posibilidades</p><h2 className="home-title">¿Qué necesitás hoy?</h2><p className="home-subtitle">Encontrá la propuesta indicada para tu familia.</p>
    <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">{collections.map((item) => <Link key={item.name} href={collectionHref(item.slugs, categories)} className="group rounded-3xl border border-brand/10 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-brand/30">
      <span aria-hidden className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl text-3xl ${item.color}`}>{item.icon}</span><h3 className="text-base font-extrabold">{item.name}</h3><p className="mt-2 text-xs font-bold leading-5">{item.tagline}</p><p className="mt-2 text-xs leading-5 text-muted">{item.description}</p><span aria-hidden className="mt-4 block text-brand transition group-hover:translate-x-1">↗</span>
    </Link>)}</div>
    <details className="mt-7"><summary className="w-fit cursor-pointer py-3 text-sm font-extrabold text-brand">Ver todas las categorías →</summary><div className="mt-3 flex flex-wrap gap-2">{categories.map((category) => <Link key={category.slug} href={`/categorias/${category.slug}`} className="rounded-full bg-mint px-4 py-3 text-sm font-bold text-brand">{category.name}</Link>)}{!categories.length && <Link href="/servicios" className="py-3 text-sm text-brand">Explorar servicios →</Link>}</div></details>
  </section>;
}
