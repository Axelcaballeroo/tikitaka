import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/profile";
import { accountFirstName } from "@/lib/account-menu";
import { getProviders } from "@/lib/data/providers";
import { FavoritesList } from "@/components/marketplace/favorites-list";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const profile = await requireRole("customer");
  const providers = await getProviders();
  const first = accountFirstName({ fullName: profile.fullName, role: "customer" });
  return <section className="container-page py-10 md:py-16">
    <div className="mx-auto max-w-5xl">
      <div className="rounded-[2rem] border border-brand/10 bg-mint p-6 sm:p-10">
        <p className="home-eyebrow">Tu espacio en Tiki Taka</p>
        <h1 className="display mt-3 text-4xl font-semibold">{first ? `Hola, ${first}` : "Hola"} 👋</h1>
        <p className="mt-4 text-muted">Guardá tus favoritos y encontrá todo más rápido.</p>
      </div>
      <section className="mt-6 rounded-[2rem] bg-white p-6 soft-shadow sm:p-8" aria-labelledby="personal-profile">
        <h2 id="personal-profile" className="text-xl font-extrabold">Mi perfil</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <div><dt className="text-sm text-muted">Nombre</dt><dd className="mt-1 break-words font-bold">{profile.fullName || "Sin nombre"}</dd></div>
          <div><dt className="text-sm text-muted">Email</dt><dd className="mt-1 break-all font-bold">{profile.email}</dd></div>
        </dl>
      </section>
      <section className="mt-10" aria-labelledby="personal-favorites">
        <h2 id="personal-favorites" className="display text-3xl font-semibold">Mis favoritos</h2>
        <p className="mb-6 mt-2 text-sm text-muted">Guardados en este navegador. Por ahora no se sincronizan con tu cuenta ni entre dispositivos.</p>
        <FavoritesList providers={providers} emptyTitle="Aún no guardaste favoritos." />
      </section>
    </div>
  </section>;
}
