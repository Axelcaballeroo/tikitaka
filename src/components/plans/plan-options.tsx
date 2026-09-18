import { CommercialContact } from "@/components/ui/commercial-contact";
import Link from "next/link";
import {
  basicBenefits,
  featuredBenefits,
  proBenefits,
  planContact,
} from "@/lib/plans";
export function PlanOptions() {
  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-3">
      {[
        {
          id: "basico",
          name: "Para empezar",
          title: "Tiki Taka Gratis",
          description: "Tu primer paso para conectar con familias.",
          benefits: basicBenefits,
          href: "/publicar",
          cta: "Crear mi perfil gratis",
          style: "plan-free",
        },
        {
          id: "destacado",
          name: "Para dar el siguiente paso",
          title: "Tiki Taka PRO",
          description: "Dale más presencia a tu propuesta dentro de Tiki Taka.",
          benefits: featuredBenefits,
          href: planContact(),
          cta: "Quiero destacar mi perfil",
          style: "plan-pro",
        },
        {
          id: "negocios",
          name: "Para crecer en equipo",
          title: "Tiki Taka Negocios",
          description:
            "Una propuesta de acompañamiento que estamos preparando.",
          benefits: proBenefits,
          href: planContact("Negocios"),
          cta: "Hablar con Tiki Taka",
          style: "plan-business",
        },
      ].map((plan) => (
        <article
          key={plan.id}
          id={plan.id}
          className={`flex min-w-0 scroll-mt-28 flex-col rounded-[2rem] border p-6 md:p-8 ${plan.style}`}
        >
          {plan.id === "destacado" && <span id="pro" className="scroll-mt-28" />}
          <p className="home-eyebrow">
            {plan.name}
            {plan.id === "negocios" ? " · En preparación" : ""}
          </p>
          <h2 className="display mt-5 text-3xl font-semibold">{plan.title}</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            {plan.description}
          </p>
          <ul className="my-7 flex-1 space-y-4 text-sm">
            {plan.benefits.map((b) => (
              <li key={b} className="flex gap-3">
                <span aria-hidden className="text-brand">
                  ✓
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {plan.id === "basico" ? (
            <Link href="/publicar" className="onb-secondary text-center">
              {plan.cta}
            </Link>
          ) : (
            <CommercialContact
              href={plan.href}
              className="onb-primary text-center"
            >
              {plan.cta}
            </CommercialContact>
          )}
          <p className="mt-4 text-xs leading-6 text-muted">
            {plan.id === "negocios"
              ? "Beneficios propuestos, sujetos a la definición del servicio. Consultá al equipo."
              : plan.id === "destacado"
                ? "Activación coordinada con Tiki Taka. Consultá las condiciones con el equipo."
                : "Publicación sujeta a revisión del equipo."}
          </p>
        </article>
      ))}
    </div>
  );
}
