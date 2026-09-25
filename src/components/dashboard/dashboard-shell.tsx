"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [
  ["Inicio", "/dashboard"],
  ["Mi perfil", "/dashboard/perfil"],
  ["Servicios", "/dashboard/servicios"],
  ["Fotos", "/dashboard/fotos"],
  ["Estadísticas", "/dashboard/estadisticas"],
  ["Mi plan", "/dashboard/plan"],
  ["Vista pública", "/dashboard/vista-publica"],
];
export function DashboardShell({
  children,
  businessName,
}: {
  children: React.ReactNode;
  businessName: string;
}) {
  const path = usePathname();
  return (
    <div className="container-page py-6">
      <div className="grid min-h-[700px] rounded-[2rem] border border-brand/10 bg-[#f5f8f7] lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-t-[2rem] bg-[#173f3d] p-5 text-white lg:rounded-l-[2rem] lg:rounded-tr-none">
          <Link href="/dashboard" className="display text-2xl font-semibold">
            Mi Tiki Taka<span className="text-yellow-300">·</span>
          </Link>
          <p className="mt-3 break-words text-xs leading-5 text-white/70">
            {businessName || "Panel de proveedor"}
          </p>
          <nav
            aria-label="Panel del proveedor"
            className="mt-6 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1"
          >
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
                className={`rounded-xl px-3 py-3 text-xs font-bold hover:bg-white/10 ${path === href ? "bg-white/15 text-white" : "text-white/70"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            href="/logout"
            className="mt-6 block px-3 py-3 text-xs font-bold text-white/70"
          >
            Cerrar sesión →
          </Link>
        </aside>
        <main className="page-enter min-w-0 p-4 md:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
