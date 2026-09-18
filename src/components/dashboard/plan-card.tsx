import { CommercialContact } from "@/components/ui/commercial-contact";
import Link from "next/link";
import {
  currentPlan,
  basicBenefits,
  featuredBenefits,
  planContact,
} from "@/lib/plans";
import { dashboardState } from "@/lib/provider-dashboard";
export function PlanCard({
  provider,
  full = false,
}: {
  provider: {
    featured: boolean;
    businessName: string;
    status: string;
    published: boolean;
  };
  full?: boolean;
}) {
  const state = dashboardState(provider);
  return (
    <section
      className={`rounded-3xl border p-6 ${provider.featured ? "border-brand/20 bg-mint" : "border-brand/10 bg-white"}`}
    >
      <p className="home-eyebrow">Tu plan</p>
      <h2 className="display mt-3 text-3xl font-semibold">
        {currentPlan(provider.featured)}
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        {state.visible
          ? provider.featured
            ? "Tu perfil tiene mayor visibilidad dentro de Tiki Taka."
            : "Tu perfil está activo y visible en Tiki Taka."
          : `Estado: ${state.label}. Los beneficios de aparición pública se aplican cuando el perfil está publicado.`}
      </p>
      {full && (
        <ul className="mt-5 space-y-3 text-sm">
          {(provider.featured ? featuredBenefits : basicBenefits).map((b) => (
            <li key={b}>✓ {b}</li>
          ))}
        </ul>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        {provider.featured ? (
          <CommercialContact
            className="onb-primary"
            href={planContact("PRO", provider.businessName)}
          >
            Consultar con Tiki Taka
          </CommercialContact>
        ) : (
          <Link className="onb-primary" href="/planes#destacado">
            Conocer Tiki Taka PRO
          </Link>
        )}
        {!full && (
          <Link className="onb-secondary" href="/dashboard/plan">
            Ver mi plan
          </Link>
        )}
      </div>
      {full && (
        <p className="mt-5 text-xs leading-6 text-muted">
          La condición Destacado la administra el equipo de Tiki Taka. No hay
          cobros automáticos ni una suscripción activa gestionada desde este
          panel.
        </p>
      )}
    </section>
  );
}
