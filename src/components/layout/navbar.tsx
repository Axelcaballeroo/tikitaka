"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { AccountControl } from "./account-control";
import { Logo } from "./logo";

const links = [["Explorar", "/servicios"], ["Categorías", "/#categorias"], ["Cómo funciona", "/como-funciona"]];
export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) { setMenuPath(pathname); setOpen(false); }
  return <header className="sticky top-0 z-50 border-b border-brand/10 bg-cream/95 backdrop-blur-xl">
    <div className="container-page flex h-20 items-center justify-between gap-3">
      <div className="shrink-0 whitespace-nowrap"><Logo priority /></div><nav aria-label="Navegación principal" className="hidden items-center gap-5 xl:flex">{links.map(([label, href]) => <Link key={href} href={href} className="py-3 text-sm font-bold text-muted transition hover:text-brand">{label}</Link>)}</nav>
      <div className="flex items-center gap-3"><Link href="/favoritos" className="hidden py-3 text-sm font-bold text-muted sm:block">♡ Favoritos</Link><AccountControl /><div className="hidden sm:block"><ButtonLink href="/publicar">Publicá tu servicio</ButtonLink></div><button type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full border border-brand/20 text-xl text-brand xl:hidden">{open ? "×" : "☰"}</button></div>
    </div>
    {open && <nav id="mobile-navigation" aria-label="Navegación móvil" className="container-page grid max-h-[calc(100dvh-5rem)] gap-1 overflow-y-auto border-t border-brand/10 py-4 xl:hidden">{[...links, ["Favoritos", "/favoritos"], ["Publicá tu servicio", "/publicar"]].map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold hover:bg-mint">{label}</Link>)}</nav>}
  </header>;
}
