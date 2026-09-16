"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [
  ["Overview", "/admin"],
  ["Proveedores", "/admin/proveedores"],
  ["Solicitudes", "/admin/solicitudes"],
  ["Reseñas", "/admin/resenas"],
  ["Categorías", "/admin/categorias"],
  ["Analytics", "/admin/analytics"],
  ["Configuración", "/admin/configuracion"],
];
export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="container-page py-6">
      <div className="grid min-h-[720px] rounded-[2rem] border border-brand/10 bg-[#f5f8f7] lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-t-[2rem] bg-[#173f3d] p-5 text-white lg:rounded-l-[2rem] lg:rounded-tr-none">
          <Link href="/admin" className="display text-2xl font-semibold">
            Camila OS<span className="text-yellow-300">·</span>
          </Link>
          <p className="mt-2 text-xs text-white/60">
            Tiki Taka · Administración
          </p>
          <nav
            aria-label="Administración"
            className="mt-6 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1"
          >
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
                className={`rounded-xl px-3 py-3 text-xs font-bold transition hover:bg-white/10 ${path === href ? "bg-white/15 text-white" : "text-white/70"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="mt-8 block text-xs text-white/70">
            Volver a Tiki Taka ↗
          </Link>
        </aside>
        <main className="min-w-0 p-4 md:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
