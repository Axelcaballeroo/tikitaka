import type { FormEventHandler } from "react";

export function ServiceSearchForm({
  zones,
  query = "",
  location = "",
  onSubmit,
  id = "service-search",
}: {
  zones: string[];
  query?: string;
  location?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  id?: string;
}) {
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
      <label className="block min-w-0 flex-1 px-3">
        <span className="text-xs font-extrabold">¿Dónde?</span>
        <input
          name="location"
          defaultValue={location}
          list={`${id}-zones`}
          placeholder="Palermo, Córdoba, Pilar..."
          className="mt-2 block w-full min-w-0 bg-transparent py-1 text-base outline-brand"
        />
        <datalist id={`${id}-zones`}>
          {zones.map((zone) => (
            <option key={zone} value={zone} />
          ))}
        </datalist>
      </label>
      <button className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-brand px-8 font-extrabold text-white transition hover:bg-brand-dark">
        <span aria-hidden className="text-2xl">
          ⌕
        </span>{" "}
        Buscar
      </button>
    </form>
  );
}
