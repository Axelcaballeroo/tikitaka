import { ButtonLink } from "@/components/ui/button";
export function PlansPreview() {
  return (
    <section className="container-page home-section text-center">
      <p className="home-eyebrow">Un lugar para cada etapa de tu negocio</p>
      <h2 className="home-title">Crece con Tiki Taka</h2>
      <p className="home-subtitle">
        Empezá gratis. Sumá visibilidad y conocé las propuestas para
        acompañarte.
      </p>
      <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
        {[
          [
            "TIKI TAKA GRATIS",
            "Gratis",
            "Publicá y empezá a recibir consultas.",
            "plan-free",
          ],
          [
            "TIKI TAKA PRO",
            "Más visibilidad",
            "Mayor presencia en recomendados y en Home.",
            "plan-pro",
          ],
          [
            "TIKI TAKA NEGOCIOS",
            "Marketing + crecimiento",
            "Una propuesta de acompañamiento personalizado.",
            "plan-business",
          ],
        ].map(([name, title, text, color], index) => (
          <article key={name} className={`rounded-3xl p-7 ${color}`}>
            <p className="text-xs font-extrabold tracking-widest">{name}</p>
            <h3 className="display mt-5 text-2xl font-medium">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
            {index === 2 && (
              <p className="mt-5 text-xs font-bold text-brand">
                En preparación
              </p>
            )}
          </article>
        ))}
      </div>
      <ButtonLink href="/planes" variant="secondary" className="mt-8">
        Conocer los planes
      </ButtonLink>
    </section>
  );
}
