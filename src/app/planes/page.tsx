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
    </section>
  );
}
