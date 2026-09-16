import type { Metadata } from "next";
import { PlanOptions } from "@/components/plans/plan-options";
export const metadata: Metadata = {
  title: "Planes para proveedores",
  description:
    "Empezá gratis y conocé Tiki Taka Destacado. Más visibilidad para tu servicio y propuestas de acompañamiento.",
  alternates: { canonical: "/planes" },
};
export default function PlansPage() {
  return (
    <section className="container-page home-section">
      <header className="mx-auto max-w-3xl text-center">
        <p className="home-eyebrow">Un lugar para cada etapa de tu negocio</p>
        <h1 className="home-title">Crece con Tiki Taka</h1>
        <p className="home-subtitle">
          Empezá gratis. Sumá visibilidad y conocé cómo podemos acompañar el
          crecimiento de tu servicio.
        </p>
      </header>
      <PlanOptions />
      <div className="mx-auto mt-10 max-w-3xl space-y-5 rounded-3xl bg-white p-6 text-sm leading-7 text-muted">
        <h2 className="display text-2xl font-semibold text-ink">
          Elegí tu próximo paso
        </h2>
        <p>
          Podés crear tu perfil sin elegir un plan pago. Si te interesa
          Destacado, escribinos para conocer las condiciones y coordinar su
          activación.
        </p>
        <p>
          Las estadísticas de contactos están disponibles también en Básico.
          Destacado mejora la presencia del perfil en selecciones y en el orden
          Recomendados; no garantiza consultas ni un puesto fijo en todas las
          búsquedas.
        </p>
        <p>
          PRO está en preparación. Todavía no se activa como plan de una cuenta.
          Las consultas se coordinan directamente con el equipo de Tiki Taka.
        </p>
      </div>
    </section>
  );
}
