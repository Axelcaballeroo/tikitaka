import { CommercialContact } from "@/components/ui/commercial-contact";
import Link from "next/link";
import type { DashboardData } from "@/lib/data/provider-dashboard";
import {
  contactSeries,
  dashboardState,
  profileCompleteness,
} from "@/lib/provider-dashboard";
import { planContact } from "@/lib/plans";
import { ContactChart } from "./contact-chart";
import { PlanCard } from "./plan-card";
import { RefreshStatus } from "./refresh-status";
export function MissingProvider() {
  return (
    <section className="rounded-3xl bg-white p-7">
      <h1 className="display text-3xl">Empezá tu perfil en Tiki Taka</h1>
      <p className="mt-4 text-sm text-muted">
        Completá tu propuesta para que el equipo pueda revisarla.
      </p>
      <Link href="/publicar" className="onb-primary mt-6">
        Publicar mi servicio
      </Link>
    </section>
  );
}
export function ProfileStatus({
  provider,
}: {
  provider: DashboardData["provider"];
}) {
  const state = dashboardState(provider);
  return (
    <section
      className={`rounded-3xl border p-5 ${state.visible ? "border-brand/15 bg-mint/50" : "border-amber-200 bg-amber-50/60"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">{state.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{state.text}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-brand">
          {state.label}
        </span>
      </div>
      {!state.visible && (
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard/perfil" className="onb-secondary">
            Editar información
          </Link>
          {provider.status === "rejected" ? (
            <Link href="/publicar" className="onb-secondary">
              Revisar solicitud
            </Link>
          ) : (
            <CommercialContact
              href={planContact("mi perfil", provider.businessName)}
              className="onb-secondary"
            >
              Contactar Tiki Taka
            </CommercialContact>
          )}
        </div>
      )}
    </section>
  );
}
export function DashboardMetrics({ data }: { data: DashboardData }) {
  const reviews = data.reviews;
  const count = reviews?.length;
  const rating = count
    ? reviews!.reduce((sum, r) => sum + r.rating, 0) / count
    : null;
  const monthly = data.contacts
    ? contactSeries(data.contacts, data.now, "month").reduce(
        (sum, d) => sum + d.count,
        0,
      )
    : null;
  const state = dashboardState(data.provider);
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        [
          monthly === null ? "—" : String(monthly),
          "Contactos WhatsApp este mes",
        ],
        [
          reviews === null
            ? "—"
            : rating === null
              ? "Sin reseñas"
              : rating.toFixed(1),
          "Rating público",
        ],
        [count === undefined ? "—" : String(count), "Reseñas publicadas"],
        [state.label, "Estado del perfil"],
      ].map(([value, label]) => (
        <article
          key={label}
          className="min-w-0 rounded-3xl border border-brand/10 bg-white p-5"
        >
          <p className="text-xs font-bold text-muted">{label}</p>
          <p className="display mt-3 break-words text-3xl font-semibold text-brand">
            {value}
          </p>
          {value === "—" && (
            <p className="mt-2 text-xs text-muted">No disponible</p>
          )}
        </article>
      ))}
    </div>
  );
}
export function BusinessOverview({ data }: { data: DashboardData }) {
  const { provider } = data,
    state = dashboardState(provider),
    complete = profileCompleteness(
      provider,
      data.imageCount,
      data.serviceCount,
    );
  return (
    <div className="space-y-6">
      <RefreshStatus />
      <header>
        <p className="home-eyebrow">Tu negocio en Tiki Taka</p>
        <h1 className="display mt-3 break-words text-3xl font-semibold md:text-4xl">
          Hola, {provider.businessName} 👋
        </h1>
        <p className="mt-3 text-sm text-muted">
          Tu perfil, tus consultas y tus próximos pasos, en un lugar.
        </p>
      </header>
      <ProfileStatus provider={provider} />
      <DashboardMetrics data={data} />
      <ContactChart
        totalContacts={data.totalContacts}
        events={data.contacts}
        now={data.now}
        visible={state.visible}
      />
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-brand/10 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="display text-2xl font-semibold">
              Completitud de tu perfil
            </h2>
            <strong className="display text-3xl text-brand">
              {complete.percent === null ? "—" : `${complete.percent}%`}
            </strong>
          </div>
          {complete.percent !== null && (
            <div
              role="progressbar"
              aria-label="Completitud de tu perfil"
              aria-valuenow={complete.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-5 h-2 overflow-hidden rounded-full bg-mint"
            >
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${complete.percent}%` }}
              />
            </div>
          )}
          <ul className="mt-5 space-y-2">
            {complete.checks.map((c) => (
              <li key={c.label}>
                <Link
                  href={c.href}
                  className="flex min-h-10 items-center gap-3 rounded-xl px-2 text-sm hover:bg-mint"
                >
                  <span className="text-brand">
                    {c.done === null ? "?" : c.done ? "✓" : "○"}
                  </span>
                  {c.label}
                  {c.done === null ? " · No disponible" : ""}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-6 text-muted">
            Diez aspectos con el mismo peso. Completar el perfil no lo publica
            automáticamente.
          </p>
          <Link href="/dashboard/perfil" className="onb-primary mt-5">
            Completar perfil
          </Link>
        </section>
        <div className="space-y-6">
          <PlanCard provider={provider} />
          <section className="rounded-3xl border border-brand/10 bg-white p-6">
            <h2 className="display text-2xl font-semibold">Últimas reseñas</h2>
            <div className="mt-5 space-y-4">
              {data.reviews === null ? (
                <p className="text-sm text-muted">
                  No pudimos cargar tus reseñas.
                </p>
              ) : !data.reviews.length ? (
                <p className="text-sm text-muted">
                  Todavía no recibiste reseñas publicadas.
                </p>
              ) : (
                data.reviews.slice(0, 3).map((r) => (
                  <article key={r.id} className="rounded-2xl bg-mint/40 p-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <strong className="break-words text-sm">
                        {r.reviewer_name}
                      </strong>
                      <span
                        aria-label={`${r.rating} de 5 estrellas`}
                        className="text-sm text-brand"
                      >
                        ★ {r.rating}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="mt-2 break-words text-sm leading-6 text-muted">
                        {r.comment}
                      </p>
                    )}
                    <time className="mt-3 block text-xs text-muted">
                      {new Date(r.created_at).toLocaleDateString("es-AR", {
                        timeZone: "UTC",
                      })}
                    </time>
                  </article>
                ))
              )}
            </div>
            <Link
              href="/dashboard/estadisticas"
              className="mt-5 inline-block text-sm font-bold text-brand"
            >
              Ver estadísticas →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
