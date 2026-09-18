"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { searchSuggestions } from "@/lib/provider-search";
import type { Provider } from "@/types";

export function LiveSearch({ query, providers, onSearch }: { query: string; providers: Provider[]; onSearch: (query: string) => void }) {
  const [value, setValue] = useState(query);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const emitted = useRef<string | null>(null);
  const callback = useRef(onSearch);
  const composing = useRef(false);
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { callback.current = onSearch; }, [onSearch]);
  useEffect(() => {
    if (emitted.current === query) { emitted.current = null; return; }
    clearTimeout(timer.current);
    setValue(query); setActive(-1); setOpen(false);
  }, [query]);
  useEffect(() => {
    const cancel = () => { clearTimeout(timer.current); emitted.current = null; setValue(new URLSearchParams(location.search).get("q") ?? ""); setOpen(false); };
    window.addEventListener("popstate", cancel);
    return () => { clearTimeout(timer.current); window.removeEventListener("popstate", cancel); };
  }, []);
  const suggestions = useMemo(() => searchSuggestions(providers, value), [providers, value]);
  const commit = (text: string) => {
    clearTimeout(timer.current); emitted.current = text.trim(); callback.current(text.trim());
  };
  const change = (text: string) => {
    setValue(text); setOpen(true); setActive(-1); clearTimeout(timer.current);
    if (!composing.current) timer.current = setTimeout(() => commit(text), 300);
  };
  const choose = (text: string) => { setValue(text); commit(text); setOpen(false); setActive(-1); input.current?.focus(); };
  const expanded = open && suggestions.length > 0;
  return <form className="live-search" role="search" onSubmit={e => { e.preventDefault(); choose(value); }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
    <div className="live-search-field">
      <label htmlFor={id}>¿Qué estás buscando?</label>
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-brand text-2xl">⌕</span>
        <input ref={input} id={id} role="combobox" aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-list`} aria-activedescendant={expanded && active >= 0 ? `${id}-${active}` : undefined} autoComplete="off" name="q" value={value} placeholder="Niñera, salón, actividades…" onFocus={() => setOpen(true)} onChange={e => change(e.target.value)} onCompositionStart={() => { composing.current = true; clearTimeout(timer.current); }} onCompositionEnd={e => { composing.current = false; change(e.currentTarget.value); }} onKeyDown={e => {
          if (composing.current || e.nativeEvent.isComposing) return;
          if (e.key === "Escape") { e.preventDefault(); setOpen(false); setActive(-1); }
          if ((e.key === "ArrowDown" || e.key === "ArrowUp") && suggestions.length) { e.preventDefault(); setOpen(true); setActive(i => e.key === "ArrowDown" ? (i + 1) % suggestions.length : (i <= 0 ? suggestions.length - 1 : i - 1)); }
          if (e.key === "Enter" && expanded && active >= 0) { e.preventDefault(); choose(suggestions[active]); }
        }} />
        {value && <button type="button" aria-label="Limpiar búsqueda" className="live-search-clear" onClick={() => choose("")}>×</button>}
      </div>
      {expanded && <ul id={`${id}-list`} role="listbox" aria-label="Sugerencias reales" className="search-suggestions">
        {suggestions.map((text, index) => <li id={`${id}-${index}`} key={text} role="option" aria-selected={active === index} onPointerDown={e => e.preventDefault()} onClick={() => choose(text)}><span aria-hidden>↗</span>{text}</li>)}
      </ul>}
    </div>
    <button className="onb-primary live-search-submit" type="submit">Buscar <span aria-hidden>→</span></button>
  </form>;
}
