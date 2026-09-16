"use client";
import { useState } from "react";
import {
  contactSeries,
  type ContactPeriod,
  type DashboardContact,
} from "@/lib/provider-dashboard";
export function ContactChart({
  events,
  now,
  visible,
  totalContacts,
}: {
  events: DashboardContact[] | null;
  now: string;
  visible: boolean;
  totalContacts: number | null;
}) {
  const [period, setPeriod] = useState<ContactPeriod>("month");
  const days = contactSeries(events ?? [], now, period),
    total = days.reduce((s, d) => s + d.count, 0),
    max = Math.max(1, ...days.map((d) => d.count));
  return (
    <section className="min-w-0 rounded-3xl border border-brand/10 bg-white p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="display text-2xl font-semibold">
            Contactos por WhatsApp
          </h2>
          <p className="mt-2 text-sm text-muted">
            Clics en los botones de contacto de tu perfil.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["week", "Últimos 7 días"],
              ["month30", "Últimos 30 días"],
              ["month", "Este mes"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={period === value}
              onClick={() => setPeriod(value)}
              className={`min-h-11 rounded-full px-3 py-2 text-xs font-bold ${period === value ? "bg-brand text-white" : "bg-mint text-brand"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {events === null ? (
        <p role="status" className="mt-6 rounded-2xl bg-mint p-5 text-sm">
          No pudimos cargar los contactos. Intentá nuevamente en unos momentos.
        </p>
      ) : !total ? (
        <div className="mt-6 rounded-2xl bg-mint/50 p-6">
          <p className="font-bold">
            {visible
              ? totalContacts === 0
                ? "Aún no recibiste consultas desde Tiki Taka."
                : "No hay consultas en este período."
              : "Tu perfil no está visible actualmente."}
          </p>
          <p className="mt-2 text-sm text-muted">
            {visible
              ? "No hay contactos registrados en el período seleccionado. Completá tu perfil para que las familias conozcan tu propuesta."
              : "No hay contactos en este período. Cuando el equipo publique tu perfil, las familias podrán encontrarlo."}
          </p>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            <strong className="display mr-2 text-3xl text-brand">
              {total}
            </strong>
            {total === 1 ? "contacto registrado" : "contactos registrados"}
            {!visible ? " · Histórico de tu perfil" : ""}
          </p>
          <div
            role="img"
            aria-label={`Contactos diarios: ${days.map((d) => `${d.date}: ${d.count}`).join("; ")}`}
            className="mt-6 flex h-36 items-end gap-1 border-b border-brand/15"
          >
            {days.map((d) => (
              <div
                key={d.date}
                className="flex h-full min-w-0 flex-1 items-end"
              >
                <div
                  title={`${d.date}: ${d.count} contactos`}
                  className="w-full rounded-t-sm bg-brand/80"
                  style={{
                    height: d.count
                      ? `${Math.max(3, (d.count / max) * 100)}%`
                      : "2px",
                    opacity: d.count ? 1 : 0.12,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>{days[0]?.date}</span>
            <span>{days.at(-1)?.date}</span>
          </div>
          <details className="mt-4 text-xs text-muted">
            <summary className="cursor-pointer py-2 font-bold text-brand">
              Ver datos por día
            </summary>
            <div className="mt-2 grid max-h-52 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              {days.map((d) => (
                <p key={d.date}>
                  {d.date}: <strong>{d.count}</strong>
                </p>
              ))}
            </div>
          </details>
        </>
      )}
      <p className="mt-4 text-[11px] leading-5 text-muted">
        Días calendario en UTC, incluido hoy. Los clics no equivalen a
        conversaciones ni a clientes únicos.
      </p>
    </section>
  );
}
