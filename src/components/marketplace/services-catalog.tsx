"use client";

import { useMemo, useState } from "react";
import { ProviderCard } from "./provider-card";
import type { Category, Provider } from "@/types";

type ProfileType = "all" | "verified" | "featured";
type Sort = "rating" | "recent" | "price-asc" | "price-desc";

const quick = [
  ["Niñeras", "nineras"], ["Cumpleaños", "salones-de-fiestas"], ["Clases", "clases-particulares"],
  ["Jardines", "jardines-maternales"], ["Psicopedagogía", "psicopedagogia"], ["Inflables", "inflables"],
];

export function ServicesCatalog({ providers, categories, zones, initialQuery = "" }: { providers: Provider[]; categories: Category[]; zones: string[]; initialQuery?: string }) {
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState("");
  const [zone, setZone] = useState("");
  const [rating, setRating] = useState("0");
  const [profile, setProfile] = useState<ProfileType>("all");
  const [sort, setSort] = useState<Sort>("rating");

  const results = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    return providers.filter((provider) => {
      const haystack = [provider.name, provider.category, provider.description, provider.zone].join(" ").toLocaleLowerCase("es");
      return (!term || haystack.includes(term)) && (!category || provider.categorySlug === category) && (!zone || provider.zone === zone) && provider.rating >= Number(rating) && (profile === "all" || (profile === "verified" && provider.verified) || (profile === "featured" && provider.featured));
    }).sort((a, b) => sort === "rating" ? b.rating - a.rating || b.reviewsCount - a.reviewsCount : sort === "recent" ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : sort === "price-asc" ? a.priceFrom - b.priceFrom : b.priceFrom - a.priceFrom);
  }, [providers, search, category, zone, rating, profile, sort]);

  const clear = () => { setSearch(""); setCategory(""); setZone(""); setRating("0"); setProfile("all"); setSort("rating"); };
  const filters = <div className="space-y-5">
    <label className="block text-sm font-extrabold">¿Qué buscás?<span className="relative mt-2 flex items-center"><span className="absolute left-3 text-muted">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, servicio o zona" className="w-full rounded-xl border border-teal-900/10 py-3 pl-9 pr-3 font-normal outline-brand" /></span></label>
    <label className="block text-sm font-extrabold">Categoría<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-teal-900/10 bg-white p-3 font-normal outline-brand"><option value="">Todas las categorías</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
    <label className="block text-sm font-extrabold">Zona<select value={zone} onChange={(event) => setZone(event.target.value)} className="mt-2 w-full rounded-xl border border-teal-900/10 bg-white p-3 font-normal outline-brand"><option value="">Todas las zonas</option>{zones.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="block text-sm font-extrabold">Rating mínimo<select value={rating} onChange={(event) => setRating(event.target.value)} className="mt-2 w-full rounded-xl border border-teal-900/10 bg-white p-3 font-normal outline-brand"><option value="0">Cualquier valoración</option><option value="4.5">★ 4.5 o más</option><option value="4.8">★ 4.8 o más</option><option value="4.9">★ 4.9 o más</option></select></label>
    <fieldset><legend className="text-sm font-extrabold">Tipo de perfil</legend><div className="mt-3 space-y-3">{[["all","Todos"],["verified","Verificados"],["featured","Destacados"]].map(([value,label]) => <label key={value} className="flex cursor-pointer items-center gap-3 text-sm text-muted"><input type="radio" name="profile" value={value} checked={profile === value} onChange={() => setProfile(value as ProfileType)} className="accent-[var(--teal)]" />{label}</label>)}</div></fieldset>
    <button type="button" onClick={clear} className="w-full rounded-full border-2 border-brand py-2.5 text-sm font-extrabold text-brand transition hover:bg-mint">Limpiar filtros</button>
  </div>;

  return <section className="container-page py-10 md:py-14">
    <div className="flex gap-2 overflow-x-auto pb-3">{quick.map(([label, slug]) => <button type="button" key={slug} onClick={() => setCategory(category === slug ? "" : slug)} className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-extrabold transition ${category === slug ? "border-brand bg-brand text-white" : "border-teal-900/10 bg-white hover:border-brand hover:text-brand"}`}>{label}</button>)}</div>
    <details className="mt-5 rounded-2xl border border-teal-900/8 bg-white p-5 lg:hidden"><summary className="cursor-pointer font-extrabold">Filtros de búsqueda</summary><div className="mt-6 border-t border-teal-900/8 pt-6">{filters}</div></details>
    <div className="mt-7 grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)]"><aside className="sticky top-24 hidden rounded-3xl border border-teal-900/8 bg-white p-6 shadow-[0_12px_35px_rgba(20,78,72,.06)] lg:block"><div className="mb-6 flex items-center justify-between"><h2 className="font-extrabold">Filtrar servicios</h2><span className="rounded-full bg-mint px-2 py-1 text-xs font-extrabold text-brand">{results.length}</span></div>{filters}</aside>
      <div><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="font-extrabold"><span className="text-brand">{results.length}</span> servicios encontrados</p><label className="flex items-center gap-2 text-sm text-muted">Ordenar por<select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="rounded-full border border-teal-900/10 bg-white px-4 py-2 font-bold text-ink outline-brand"><option value="rating">Mejor valorados</option><option value="recent">Más recientes</option><option value="price-asc">Precio menor</option><option value="price-desc">Precio mayor</option></select></label></div>
        {results.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{results.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div> : <div className="rounded-[2rem] border border-dashed border-brand/30 bg-mint px-6 py-16 text-center"><span className="text-5xl">⌕</span><h2 className="display mt-5 text-3xl font-semibold">No encontramos servicios con esos filtros</h2><p className="mt-3 text-muted">Probá ampliar la zona o elegir otra categoría.</p><button type="button" onClick={clear} className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-extrabold text-white">Limpiar filtros</button></div>}
      </div>
    </div>
  </section>;
}
