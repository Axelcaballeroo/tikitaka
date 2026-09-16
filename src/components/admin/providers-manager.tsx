"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Provider } from "@/types";
import {
  adminFilters,
  matchesAdminFilter,
  providerState,
} from "@/lib/admin-provider";
import { ProfileImage } from "@/components/provider/profile-image";
import { ProviderDetailActions } from "./provider-detail-actions";
export function ProvidersManager({
  initialProviders,
  initialFilter = "todos",
  compact = false,
}: {
  initialProviders: Provider[];
  initialFilter?: string;
  compact?: boolean;
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const visible = initialProviders.filter(
    (p) =>
      matchesAdminFilter(p, initialFilter) &&
      normalize(
        [p.name, p.category, p.zone, p.city, p.email].join(" "),
      ).includes(normalize(search)),
  );
  return (
    <>
      {!compact && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="home-eyebrow">Camila OS</p>
              <h1 className="display mt-3 text-4xl font-semibold">
                {initialFilter === "pendientes" ? "Solicitudes" : "Proveedores"}
              </h1>
              <p className="mt-3 text-sm text-muted">
                Perfiles reales de Tiki Taka. Revisá, editá y gestioná su
                publicación.
              </p>
            </div>
            <Link href="/admin/proveedores/nuevo" className="onb-primary">
              + Nuevo proveedor
            </Link>
          </div>
          <label className="mt-7 block text-sm font-bold">
            Buscar proveedor...
            <input
              className="onb-input mt-2"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, categoría o zona"
            />
          </label>
          <div className="my-5 flex flex-wrap gap-2">
            {adminFilters.map((f) => (
              <button
                key={f}
                aria-pressed={initialFilter === f}
                onClick={() => router.push(`/admin/proveedores?filtro=${f}`)}
                className={`rounded-full px-4 py-3 text-xs font-bold capitalize ${initialFilter === f ? "bg-brand text-white" : "bg-white text-brand"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="space-y-4">
        {visible.map((p) => (
          <article
            key={p.id}
            className="min-w-0 rounded-3xl border border-brand/10 bg-white p-4 md:p-5"
          >
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-mint">
                <ProfileImage src={p.image} alt={p.name} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="display break-words text-xl font-semibold">
                    {p.name}
                  </h2>
                  <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-brand">
                    {providerState(p)}
                  </span>
                  {p.featured && (
                    <span className="text-xs font-bold text-amber-700">
                      ★ Destacado
                    </span>
                  )}
                  {p.verified && (
                    <span className="text-xs font-bold text-brand">
                      ✓ Verificado
                    </span>
                  )}
                </div>
                <p className="mt-2 break-words text-sm text-muted">
                  {p.category} ·{" "}
                  {[p.zone, p.city].filter(Boolean).join(", ") ||
                    "Sin ubicación"}
                </p>
                <p className="mt-2 text-xs text-muted">
                  Alta:{" "}
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString("es-AR")
                    : "—"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href={`/admin/proveedores/${p.id}`} className="onb-primary">
                Ver
              </Link>
              <Link
                href={`/admin/proveedores/${p.id}/editar`}
                className="onb-secondary"
              >
                Editar
              </Link>
              {p.whatsapp && (
                <a
                  href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="onb-secondary"
                >
                  WhatsApp ↗
                </a>
              )}
            </div>
            <div className="mt-3">
              <ProviderDetailActions provider={p} compact={!compact} />
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="rounded-3xl bg-white p-8 text-center">
          <h2 className="display text-2xl">
            {initialFilter === "pendientes"
              ? "Todo al día 🎉"
              : "Sin proveedores"}
          </h2>
          <p className="mt-3 text-sm text-muted">
            {initialFilter === "pendientes"
              ? "No hay solicitudes pendientes."
              : "No hay resultados para esta búsqueda."}
          </p>
          {!initialProviders.length && initialFilter !== "pendientes" && (
            <Link href="/admin/proveedores/nuevo" className="onb-primary mt-5">
              Agregar primer proveedor
            </Link>
          )}
        </div>
      )}
      {compact && (
        <Link
          href="/admin/solicitudes"
          className="mt-5 inline-block text-sm font-bold text-brand"
        >
          Ver todas las solicitudes →
        </Link>
      )}
    </>
  );
}
