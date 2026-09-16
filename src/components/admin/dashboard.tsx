import Link from "next/link";
import { ProvidersManager } from "./providers-manager";
import type { Provider } from "@/types";
export function AdminDashboard({
  stats,
  name,
  pending,
  error,
}: {
  stats: (number | null)[];
  name: string;
  pending: Provider[];
  error?: boolean;
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="home-eyebrow">Camila OS · Overview</p>
          <h1 className="display mt-3 text-4xl font-semibold">
            Hola, {name || "Cami"} 👋
          </h1>
          <p className="mt-3 text-muted">Esto está pasando en Tiki Taka.</p>
        </div>
        <Link href="/admin/proveedores/nuevo" className="onb-primary">
          + Nuevo proveedor
        </Link>
      </div>
      <div className="my-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          "Proveedores activos",
          "Solicitudes pendientes",
          "Proveedores destacados",
          "Contactos este mes",
        ].map((label, i) => (
          <article
            key={label}
            className="rounded-3xl border border-brand/10 bg-white p-5"
          >
            <p className="text-xs font-bold text-muted">{label}</p>
            <p className="display mt-4 text-4xl text-brand">
              {stats[i] ?? "—"}
            </p>
            {stats[i] === null && (
              <p className="mt-2 text-xs">Métrica no disponible</p>
            )}
          </article>
        ))}
      </div>
      <div className="mb-8 flex flex-wrap gap-3">
        <Link className="onb-secondary" href="/admin/resenas">
          Reseñas pendientes: {stats[4] ?? "—"}
        </Link>
        <Link className="onb-secondary" href="/admin/analytics">
          Analytics de WhatsApp ↗
        </Link>
      </div>
      <h2 className="display mb-5 text-2xl font-semibold">
        Solicitudes que necesitan atención
      </h2>
      {error ? (
        <p role="alert" className="rounded-2xl bg-white p-5">
          No pudimos cargar las solicitudes. Volvé a intentar.
        </p>
      ) : (
        <ProvidersManager
          initialProviders={pending}
          initialFilter="pendientes"
          compact
        />
      )}
    </>
  );
}
