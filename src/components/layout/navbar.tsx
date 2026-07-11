import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "./logo";

const links = [["Servicios","/servicios"],["Categorías","/#categorias"],["Cómo funciona","/como-funciona"],["Favoritos","/favoritos"],["Ingresar","/login"]];
export function Navbar() { return <header className="sticky top-0 z-50 border-b border-teal-900/5 bg-cream/90 backdrop-blur-xl">
  <div className="container-page flex h-18 items-center justify-between gap-6">
    <Logo /><nav className="hidden items-center gap-7 lg:flex">{links.map(([label,href]) => <Link key={href} href={href} className="text-sm font-bold text-muted transition hover:text-brand">{label}</Link>)}</nav>
    <div className="flex items-center gap-2"><ButtonLink href="/publicar" variant="ghost" className="hidden sm:inline-flex">Publicá tu servicio</ButtonLink><ButtonLink href="/servicios">Buscar servicios <span className="ml-2">→</span></ButtonLink></div>
  </div>
</header>; }
