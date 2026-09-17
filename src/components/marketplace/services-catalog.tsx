"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProviderCard } from "./provider-card";
import { ServiceSearchForm } from "./service-search-form";
import { CatalogFilterFields } from "./catalog-filter-fields";
import { CatalogDrawer } from "./catalog-drawer";
import { CatalogRecommendations } from "./catalog-recommendations";
import { collections } from "@/components/home/home-content";
import {
  filterAndSortProviders,
  readCatalogFilters,
  sortOptions,
  type CatalogFilters,
} from "@/lib/marketplace-filters";
import type { Category, Provider } from "@/types";

export function ServicesCatalog({
  providers,
  categories,
  initialQuery = "",
  initialLocation = "",
  initialCategory = "",
  unavailable = false,
}: {
  providers: Provider[];
  categories: Category[];
  zones: string[];
  initialQuery?: string;
  initialLocation?: string;
  initialCategory?: string;
  unavailable?: boolean;
}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    // Legacy embedded callers also initialize the same URL state.
    const initial = {
      q: initialQuery,
      location: initialLocation,
      category: initialCategory,
    };
    if (!Object.values(initial).some(Boolean)) return;
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(initial))
      if (value && !params.has(key)) params.set(key, value);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params}`,
    );
  }, [initialQuery, initialLocation, initialCategory]);
  const filters = readCatalogFilters(
    new URLSearchParams(searchParams.toString()),
  );
  const [drawer, setDrawer] = useState<"filters" | "sort" | null>(null);
  const update = (patch: Partial<CatalogFilters>) => {
    const next = { ...filters, ...(patch.location !== undefined && patch.location !== filters.location ? { localidad: "" } : {}), ...patch };
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(next))
      if (
        value !== "" &&
        value !== false &&
        !(key === "sort" && value === "recommended") &&
        !(key === "rating" && value === "0")
      )
        query.set(key, String(value));
    // Native history integrates with App Router search params without refetching providers.
    window.history.pushState(
      null,
      "",
      `/servicios${query.size ? `?${query}` : ""}`,
    );
  };
  const clear = () =>
    update({
      q: "",
      location: "",
      category: "",
      localidad: "",
      rating: "",
      verified: false,
      featured: false,
      sort: "recommended",
    });
  const results = filterAndSortProviders(providers, filters);
  const groups = useMemo(
    () =>
      collections.map((c) => ({
        ...c,
        value: c.slugs
          .filter((slug) =>
            categories.some((category) => category.slug === slug),
          )
          .join(","),
      })),
    [categories],
  );
  const promoted =
    filters.sort === "recommended" && results.length >= 12
      ? results
          .slice(6)
          .filter((p) => p.featured)
          .slice(0, 3)
      : [];
  const promotedIds = new Set(promoted.map((p) => p.id));
  const rest = results.slice(6).filter((p) => !promotedIds.has(p.id));
  const fields = (
    <CatalogFilterFields
      filters={filters}
      categories={categories}
      update={update}
      clear={clear}
    />
  );
  const sorting = (
    <label className="flex min-w-0 items-center gap-2 text-xs font-bold text-muted">
      Ordenar por
      <select
        aria-label="Ordenar por"
        value={filters.sort}
        onChange={(e) => update({ sort: e.target.value })}
        className="min-h-11 min-w-0 rounded-full border border-brand/15 bg-white px-3 text-sm text-ink"
      >
        {sortOptions.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
  const active = [
    filters.q && `Búsqueda: ${filters.q}`,
    filters.location && `Zona: ${filters.location}`,
    filters.category &&
      (groups.find((g) => g.value === filters.category)?.name ??
        categories.find((c) => c.slug === filters.category)?.name ??
        "Categorías seleccionadas"),
    filters.localidad && `Localidad: ${filters.localidad}`,
    Number(filters.rating) > 0 && `★ ${filters.rating}+`,
    filters.verified && "Verificados",
    filters.featured && "Destacados",
  ].filter(Boolean);
  const grid = (items: Provider[]) => (
    <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
  return (
    <div className="catalog-page pb-16">
      <section className="border-b border-brand/10 bg-mint/25 py-6 md:py-10">
        <div className="container-page">
          <nav
            aria-label="Breadcrumb"
            className="flex gap-2 text-xs text-muted"
          >
            <Link href="/" className="py-2 hover:text-brand">
              Inicio
            </Link>
            <span className="py-2" aria-hidden>
              /
            </span>
            <span className="py-2" aria-current="page">
              Servicios
            </span>
          </nav>
          <h1 className="home-title !mt-4">Encontrá lo que necesitás</h1>
          <p className="mt-3 text-sm text-muted">
            Personas, lugares y propuestas para cada momento de tu familia.
          </p>
          <div className="mt-6">
            <ServiceSearchForm
              key={`${filters.q}-${filters.location}`}
              query={filters.q}
              location={filters.location}
              showGeography={false}
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                update({
                  q: String(data.get("q") ?? "").trim(),
                });
              }}
            />
          </div>
        </div>
      </section>
      <div className="container-page">
        <div className="grid items-start gap-7 pt-7 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside
            aria-label="Filtros"
            className="hidden rounded-3xl border border-brand/10 bg-white p-5 lg:block"
          >
            <h2 className="mb-6 text-lg font-extrabold">Afiná tu búsqueda</h2>
            {fields}
          </aside>
          <section className="min-w-0" aria-label="Resultados">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p aria-live="polite" className="font-extrabold">
                <span className="text-brand">{results.length}</span> servicios
                encontrados
              </p>
              <div className="hidden lg:block">{sorting}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setDrawer("filters")}
                className="catalog-chip justify-center"
              >
                ☷ Filtros {active.length > 0 && `(${active.length})`}
              </button>
              <button
                type="button"
                onClick={() => setDrawer("sort")}
                className="catalog-chip justify-center"
              >
                ↕ Ordenar
              </button>
            </div>
            {active.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {active.map((label, i) => (
                  <span
                    key={i}
                    className="max-w-full break-words rounded-full bg-mint px-3 py-2 text-xs text-brand"
                  >
                    {label}
                  </span>
                ))}
                <button
                  onClick={clear}
                  className="min-h-11 px-2 text-xs font-bold text-brand underline underline-offset-4"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
            <div className="mt-6">
              {unavailable ? (
                <div
                  role="status"
                  className="rounded-3xl border border-brand/15 bg-mint p-8"
                >
                  <h2 className="display text-2xl">
                    No pudimos cargar los servicios.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Intentá nuevamente en unos minutos. Tu búsqueda sigue
                    guardada.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-5 min-h-11 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white"
                  >
                    Volver a intentar
                  </button>
                </div>
              ) : results.length ? (
                <>
                  {grid(results.slice(0, 6))}
                  <CatalogRecommendations providers={promoted} />
                  {rest.length > 0 && (
                    <div className={promoted.length ? "" : "mt-5"}>
                      {grid(rest)}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-brand/25 bg-mint/50 px-6 py-12 text-center">
                  <span aria-hidden className="text-4xl text-brand">
                    ⌕
                  </span>
                  <h2 className="display mt-4 text-3xl">
                    {filters.q ? `No encontramos resultados para '${filters.q}'.` : "No encontramos servicios con esos filtros."}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Probá ampliar tu búsqueda para encontrar otras propuestas.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={clear}
                      className="min-h-11 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white"
                    >
                      Limpiar filtros
                    </button>
                    {filters.location && (
                      <button
                        onClick={() => update({ location: "" })}
                        className="catalog-chip"
                      >
                        Ampliar zona
                      </button>
                    )}
                    <Link href="/servicios" className="catalog-chip">Ver todos los servicios</Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      {drawer && (
        <CatalogDrawer
          title={
            drawer === "filters" ? "Filtros de búsqueda" : "Ordenar servicios"
          }
          onClose={() => setDrawer(null)}
        >
          {drawer === "filters" ? fields : sorting}
        </CatalogDrawer>
      )}
    </div>
  );
}
