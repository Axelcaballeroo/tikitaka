import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
export function PublishIntro() {
  return (
    <section className="container-page py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="home-eyebrow">Tu trabajo tiene un lugar acá</p>
          <h1 className="display mt-4 text-4xl font-medium leading-tight md:text-5xl">
            Publicá tu servicio en Tiki Taka
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
            Llegá a familias que están buscando exactamente lo que ofrecés.
          </p>
          <ul className="mt-7 space-y-4 text-sm">
            {[
              "Crear tu perfil es gratis",
              "Vos controlás tu información",
              "Empezá a recibir consultas por WhatsApp",
              "Podés mejorar tu visibilidad más adelante",
            ].map((text) => (
              <li key={text} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-brand"
                >
                  ✓
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[2rem] bg-lilac/40 p-7 md:p-9">
          <span aria-hidden className="text-5xl text-brand">
            ✦
          </span>
          <h2 className="display mt-4 text-3xl font-medium">
            Una propuesta, muchas familias por conocer.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Contanos sobre tu servicio, sumá tus fotos y revisá cómo se verá tu
            perfil antes de enviarlo.
          </p>
          <div className="mt-7">
            <div className="mt-5 space-y-3">
              <p className="text-sm leading-6 text-muted">
                Creá una cuenta para guardar tu progreso o ingresá si ya tenés
                una.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/registro?tipo=provider&next=%2Fpublicar">
                  Crear cuenta y publicar →
                </ButtonLink>
                <ButtonLink href="/login?next=%2Fpublicar" variant="secondary">
                  Iniciar sesión
                </ButtonLink>
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs leading-6 text-muted">
            Sin elegir un plan y sin pagos.{" "}
            <Link
              href="/planes"
              className="font-bold text-brand underline underline-offset-4"
            >
              Conocer planes
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
