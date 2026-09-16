import { getDashboardData } from "@/lib/data/provider-dashboard";
import { contactSeries, dashboardState } from "@/lib/provider-dashboard";
import {
  DashboardMetrics,
  MissingProvider,
  ProfileStatus,
} from "@/components/dashboard/business-overview";
import { ContactChart } from "@/components/dashboard/contact-chart";
import { RefreshStatus } from "@/components/dashboard/refresh-status";
export default async function StatisticsPage() {
  const data = await getDashboardData();
  if (!data) return <MissingProvider />;
  const periods = (
    [
      ["week", "Últimos 7 días"],
      ["month30", "Últimos 30 días"],
      ["month", "Este mes"],
    ] as const
  ).map(([period, label]) => ({
    label,
    count: data.contacts
      ? contactSeries(data.contacts, data.now, period).reduce(
          (s, d) => s + d.count,
          0,
        )
      : null,
  }));
  const sources = new Map<string, number>();
  for (const event of data.contacts ?? [])
    sources.set(event.source, (sources.get(event.source) ?? 0) + 1);
  const labels: Record<string, string> = {
    marketplace_card: "Marketplace",
    provider_profile: "Perfil público",
    sticky_contact: "Contacto fijo",
  };
  return (
    <div className="space-y-6">
      <RefreshStatus />
      <header>
        <p className="home-eyebrow">Rendimiento real</p>
        <h1 className="display mt-3 text-3xl font-semibold">Estadísticas</h1>
        <p className="mt-3 text-sm text-muted">
          Contactos y reseñas de tu perfil en Tiki Taka.
        </p>
      </header>
      <ProfileStatus provider={data.provider} />
      <DashboardMetrics data={data} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ...periods,
          { label: "Contactos totales", count: data.totalContacts },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl bg-white p-5">
            <p className="text-xs text-muted">{item.label}</p>
            <p className="display mt-2 text-3xl font-semibold text-brand">
              {item.count ?? "—"}
            </p>
          </article>
        ))}
      </div>
      <ContactChart
        totalContacts={data.totalContacts}
        events={data.contacts}
        now={data.now}
        visible={dashboardState(data.provider).visible}
      />
      <section className="rounded-3xl bg-white p-6">
        <h2 className="display text-2xl font-semibold">
          Origen de los contactos
        </h2>
        <p className="mt-2 text-xs text-muted">
          Ventana consultada: últimos 30 días o inicio de mes, lo que sea
          anterior. No incluye contactos administrativos.
        </p>
        {data.contacts === null ? (
          <p className="mt-4 text-sm">No disponible.</p>
        ) : !sources.size ? (
          <p className="mt-4 text-sm text-muted">
            Todavía no hay contactos para comparar.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {[...sources.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => (
                <li
                  key={source}
                  className="flex flex-wrap justify-between gap-3 rounded-xl bg-mint p-4 text-sm"
                >
                  <span>{labels[source] ?? "Otro origen registrado"}</span>
                  <strong>{count}</strong>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
