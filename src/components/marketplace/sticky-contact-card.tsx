import { FavoriteButton } from "./favorite-button";
import { money } from "@/lib/utils";
import type { Provider } from "@/types";
import { ShareProfile } from "@/components/provider/share-profile";
import { ProfileWhatsapp } from "@/components/provider/profile-whatsapp";

export function StickyContactCard({ provider }: { provider: Provider }) {
  const location = [provider.zone, provider.city]
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(", ");
  return (
    <aside
      aria-label="Contacto del proveedor"
      className="rounded-[2rem] border border-brand/15 bg-white p-6 shadow-[0_8px_30px_#193b3a08] md:p-7"
    >
      <p className="home-eyebrow">Hablemos de lo que necesitás</p>
      <h2 className="display mt-3 break-words text-2xl font-medium">
        Contactá a {provider.name}
      </h2>
      <div className="my-5 space-y-3 border-y border-brand/10 py-5">
        {provider.priceFrom > 0 && (
          <p className="text-xs text-muted">
            Precio desde
            <strong className="mt-1 block text-2xl text-ink">
              {money(provider.priceFrom)}
            </strong>
          </p>
        )}
        {location && (
          <p className="text-sm leading-6 text-muted">⌖ {location}</p>
        )}
      </div>
      {provider.whatsapp.trim() ? (
        <ProfileWhatsapp
          provider={provider}
          className="flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-4 py-3 text-center text-sm font-extrabold text-white transition hover:bg-brand-dark"
        />
      ) : (
        <p className="rounded-2xl bg-mint p-4 text-sm leading-6 text-muted">
          Este proveedor todavía no publicó un número de WhatsApp.
        </p>
      )}
      <p className="mt-3 text-center text-xs leading-5 text-muted">
        Contactás directamente con el proveedor.
      </p>
      <FavoriteButton
        providerId={provider.id}
        providerName={provider.name}
        variant="full"
        className="my-4"
      />
      <ShareProfile name={provider.name} />
    </aside>
  );
}
