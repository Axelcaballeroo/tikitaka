import Link from "next/link";
import { notFound } from "next/navigation";
import { ProviderDetailActions } from "@/components/admin/provider-detail-actions";
import { ProviderGallery } from "@/components/marketplace/provider-gallery";
import { ProfileDetails } from "@/components/provider/profile-details";
import { ProfileHeader } from "@/components/provider/profile-header";
import { getAdminProvider, adminDatabase } from "@/lib/data/admin-providers";
import { providerState } from "@/lib/admin-provider";
export const dynamic = "force-dynamic";
export default async function AdminProviderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getAdminProvider(id);
  if (!record) notFound();
  const p = record.provider;
  const db = await adminDatabase();
  const contacts = await db
    .from("contact_events")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", id);
  return (
    <>
      <Link href="/admin/proveedores" className="text-sm font-bold text-brand">
        ← Proveedores
      </Link>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="home-eyebrow">{providerState(p)}</p>
          <h1 className="display mt-3 break-words text-3xl font-semibold">
            {p.name}
          </h1>
          <p className="mt-3 text-xs text-muted">
            Solicitud: {new Date(p.createdAt).toLocaleDateString("es-AR")} ·{" "}
            {record.userId
              ? "Cuenta de proveedor vinculada"
              : "Alta sin cuenta vinculada"}
          </p>
        </div>
        <Link href={`/admin/proveedores/${id}/editar`} className="onb-primary">
          Editar proveedor
        </Link>
      </div>
      <section className="my-6 rounded-3xl bg-white p-5">
        <ProviderDetailActions provider={p} />
        <div className="mt-5 flex flex-wrap gap-3">
          {p.whatsapp && (
            <a
              href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="onb-secondary"
            >
              Contactar por WhatsApp
            </a>
          )}
          {p.published && p.status === "approved" && (
            <Link href={`/proveedores/${p.slug}`} className="onb-secondary">
              Ver perfil público ↗
            </Link>
          )}
          <a href="#preview" className="onb-secondary">
            Vista previa pública
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">
          Ocultar conserva servicios, fotos, reseñas y contactos. El borrado
          definitivo está deshabilitado.
        </p>
      </section>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          [
            "Clics WhatsApp",
            contacts.error ? "No disponible" : String(contacts.count ?? 0),
          ],
          ["Reseñas públicas", String(p.reviewsCount)],
          ["Rating público", p.reviewsCount ? String(p.rating) : "Sin reseñas"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <dl className="mb-6 grid gap-4 rounded-3xl bg-white p-5 text-sm sm:grid-cols-2">
        {[
          ["Email", record.draft.email],
          ["WhatsApp", record.draft.whatsapp],
          ["Provincia", record.draft.province],
          ["Dirección administrativa", record.address],
          [
            "Precio general desde",
            record.priceFrom ? `ARS ${record.priceFrom}` : "Consultar",
          ],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 break-words font-bold">
              {value || "Sin informar"}
            </dd>
          </div>
        ))}
      </dl>
      <section
        id="preview"
        className="scroll-mt-28 space-y-6 rounded-3xl bg-white p-5 md:p-7"
      >
        <div className="rounded-xl bg-lilac/40 p-4">
          <h2 className="font-bold">Vista previa pública</h2>
          <p className="mt-2 text-sm">
            Vista privada para administración. Los perfiles pendientes u ocultos
            no son accesibles desde su URL pública.
          </p>
        </div>
        <ProfileHeader provider={p} preview />
        <ProviderGallery images={p.gallery} name={p.name} />
        <ProfileDetails provider={p} preview />
      </section>
    </>
  );
}
