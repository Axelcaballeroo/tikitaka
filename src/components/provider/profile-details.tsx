import type { Provider } from "@/types";
import { money } from "@/lib/utils";

export function ProfileDetails({
  provider,
  preview = false,
}: {
  provider: Provider;
  preview?: boolean;
}) {
  return (
    <div className="space-y-10 md:space-y-12">
      {provider.description && (
        <section aria-labelledby="profile-about">
          <p className="home-eyebrow">Conocé su propuesta</p>
          <h2 id="profile-about" className="profile-section-title">
            Sobre este servicio
          </h2>
          <p className="mt-5 max-w-prose whitespace-pre-line break-words text-base leading-8 text-muted">
            {provider.description}
          </p>
        </section>
      )}
      {Boolean(provider.serviceDetails?.length) && (
        <section aria-labelledby="profile-services">
          <h2 id="profile-services" className="profile-section-title">
            Servicios
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {provider.serviceDetails!.map((service, index) => (
              <article
                key={`${service.title}-${index}`}
                className="rounded-3xl border border-brand/10 bg-white p-5"
              >
                <span
                  aria-hidden
                  className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-mint text-brand"
                >
                  ✦
                </span>
                <h3 className="break-words text-base font-extrabold">
                  {service.title}
                </h3>
                {service.description.trim() && (
                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-muted">
                    {service.description}
                  </p>
                )}
                {service.priceFrom !== null && (
                  <p className="mt-4 text-xs text-muted">
                    Desde{" "}
                    <strong className="text-base text-ink">
                      {money(service.priceFrom)}
                    </strong>
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
      {(provider.coverage.length > 0 || provider.schedule) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {provider.coverage.length > 0 && (
            <section className="rounded-3xl bg-lilac/30 p-6">
              <h2 className="profile-section-title !text-2xl">
                Zona de cobertura
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {[...new Set(provider.coverage)].map((zone) => (
                  <span
                    key={zone}
                    className="max-w-full break-words rounded-xl bg-white px-3 py-2 text-sm text-muted"
                  >
                    {zone}
                  </span>
                ))}
              </div>
            </section>
          )}
          {provider.schedule && (
            <section className="rounded-3xl bg-blush/40 p-6">
              <h2 className="profile-section-title !text-2xl">Horarios</h2>
              <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-muted">
                {provider.schedule}
              </p>
            </section>
          )}
        </div>
      )}
      {!preview && (
        <section className="rounded-3xl border border-brand/10 bg-white p-6">
          <h2 className="profile-section-title !text-2xl">
            Información del perfil
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            {provider.verified
              ? "Perfil verificado por Tiki Taka"
              : "Perfil publicado en Tiki Taka."}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Consultá disponibilidad, precios y condiciones directamente con el
            proveedor antes de coordinar.
          </p>
        </section>
      )}
    </div>
  );
}
