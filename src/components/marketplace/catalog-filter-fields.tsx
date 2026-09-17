"use client";

import { GeographyFields } from "@/components/geography-fields";
import type { Category } from "@/types";
import type { CatalogFilters } from "@/lib/marketplace-filters";
export type UpdateFilters = (patch: Partial<CatalogFilters>) => void;
const field =
  "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-brand/15 bg-white px-3 py-2 text-sm font-normal outline-brand";
export function CatalogFilterFields({
  filters,
  categories,
  update,
  clear,
}: {
  filters: CatalogFilters;
  categories: Category[];
  update: UpdateFilters;
  clear: () => void;
}) {
  return (
    <div className="space-y-6">
      <label className="block text-sm font-extrabold">
        Categoría
        <select
          aria-label="Categoría"
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
          className={field}
        >
          <option value="">Todas las categorías</option>
          {filters.category &&
            !categories.some((c) => c.slug === filters.category) && (
              <option value={filters.category}>Colección seleccionada</option>
            )}
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <GeographyFields value={{ zone: filters.location, city: filters.localidad }} zoneName="location" cityName="localidad" onChange={value => update({ location: value.zone, localidad: value.city })} />
      <label className="block text-sm font-extrabold">
        Puntuación mínima
        <select
          aria-label="Puntuación mínima"
          value={filters.rating || "0"}
          onChange={(e) => update({ rating: e.target.value })}
          className={field}
        >
          <option value="0">Todas las puntuaciones</option>
          {filters.rating &&
            !["0", "4", "4.5", "4.8", "4.9"].includes(filters.rating) && (
              <option value={filters.rating}>{filters.rating} o más</option>
            )}
          <option value="4">★ 4 o más</option>
          <option value="4.5">★ 4.5 o más</option>
          <option value="4.8">★ 4.8 o más</option>
          <option value="4.9">★ 4.9 o más</option>
        </select>
      </label>
      <fieldset className="space-y-3">
        <legend className="mb-3 text-sm font-extrabold">Preferencias</legend>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => update({ verified: e.target.checked })}
            className="h-4 w-4 accent-[var(--teal)]"
          />
          Solo verificados
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={filters.featured}
            onChange={(e) => update({ featured: e.target.checked })}
            className="h-4 w-4 accent-[var(--teal)]"
          />
          Solo destacados
        </label>
      </fieldset>
      <button
        type="button"
        onClick={clear}
        className="min-h-11 w-full rounded-full border border-brand px-4 py-3 text-sm font-bold text-brand hover:bg-mint"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
