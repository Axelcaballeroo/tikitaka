import Link from "next/link";
import { Logo } from "./logo";
export function Footer() { return <footer className="mt-24 bg-[#173f3d] py-14 text-white">
  <div className="container-page grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
    <div><div className="[&_a]:text-white"><Logo /></div><p className="mt-5 max-w-sm text-sm leading-6 text-white/70">Un lugar simple y confiable para encontrar todo lo que tus hijos necesitan.</p></div>
    <div><p className="font-extrabold">Explorá</p><div className="mt-4 grid gap-3 text-sm text-white/70"><Link href="/servicios">Servicios</Link><Link href="/como-funciona">Cómo funciona</Link><Link href="/publicar">Publicá tu servicio</Link></div></div>
    <div><p className="font-extrabold">Tiki Taka</p><div className="mt-4 grid gap-3 text-sm text-white/70"><Link href="/favoritos">Favoritos</Link><span>Buenos Aires, Argentina</span><span>hola@tikitaka.com.ar</span></div></div>
  </div><div className="container-page mt-12 border-t border-white/10 pt-6 text-xs text-white/50">© 2026 Tiki Taka. Hecho con cuidado para las familias.</div>
</footer>; }
