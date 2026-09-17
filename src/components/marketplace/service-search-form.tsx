"use client";
import { useState, type FormEventHandler } from "react";
import { GeographyFields } from "@/components/geography-fields";
import { resolveGeography } from "@/lib/geography";

export function ServiceSearchForm({
  query = "",
  location = "",
  onSubmit,
  showGeography = true,
}: {
  zones?: string[];
  showGeography?: boolean;
  query?: string;
  location?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  id?: string;
}) {
  const [place, setPlace] = useState(() => resolveGeography({ zone: location }));
  return (
    <form
      action="/servicios"
      method="get"
      role="search"
      onSubmit={onSubmit}
      className="home-search-form"
    >
      <label className="block min-w-0 flex-[1.4] px-3">
        <span className="text-xs font-extrabold">¿Qué estás buscando?</span>
        <input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Niñera, salón de fiestas, psicopedagoga..."
          className="mt-2 block w-full min-w-0 bg-transparent py-1 text-base outline-brand"
        />
      </label>
      {showGeography && <div className="grid min-w-0 flex-[2] gap-3 px-3 sm:grid-cols-2"><GeographyFields value={place} onChange={value => setPlace({ ...value, resolved: true })} zoneName="location" cityName="localidad" /></div>}
      <button className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-brand px-8 font-extrabold text-white transition hover:bg-brand-dark">
        <span aria-hidden className="text-2xl">
          ⌕
        </span>{" "}
        Buscar
      </button>
    </form>
  );
}
