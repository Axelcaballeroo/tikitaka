import { CommercialContact } from "@/components/ui/commercial-contact";
import Link from "next/link";
import { requireAccount } from "@/lib/auth/account";
import { PlanCard } from "@/components/dashboard/plan-card";
import {
  MissingProvider,
  ProfileStatus,
} from "@/components/dashboard/business-overview";
import { RefreshStatus } from "@/components/dashboard/refresh-status";
import { planContact } from "@/lib/plans";
export default async function MyPlanPage() {
  const { provider } = await requireAccount();
  if (!provider) return <MissingProvider />;
  return (
    <div className="space-y-6">
      <RefreshStatus />
      <header>
        <p className="home-eyebrow">Acompañamos tu negocio</p>
        <h1 className="display mt-3 text-3xl font-semibold">Mi plan</h1>
      </header>
      <ProfileStatus provider={provider} />
      <PlanCard provider={provider} full />
      <section className="rounded-3xl border border-brand/10 bg-lilac/30 p-6">
        <p className="home-eyebrow">PRO · En preparación</p>
        <h2 className="display mt-3 text-2xl font-semibold">
          Marketing + crecimiento
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Estamos preparando una propuesta de acompañamiento personalizado. PRO
          todavía no es un plan activable en tu cuenta.
        </p>
        <CommercialContact
          href={planContact("PRO", provider.businessName)}
          className="onb-secondary mt-5"
        >
          Hablar con Tiki Taka
        </CommercialContact>
      </section>
      <Link
        href="/planes"
        className="inline-block text-sm font-bold text-brand"
      >
        Comparar todos los planes →
      </Link>
    </div>
  );
}
