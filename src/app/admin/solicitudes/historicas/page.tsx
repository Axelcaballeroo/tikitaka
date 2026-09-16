import Link from "next/link";
import { adminDatabase } from "@/lib/data/admin-providers";
export const dynamic = "force-dynamic";
export default async function HistoricalRequests() {
  const db = await adminDatabase();
  const { data, error } = await db
    .from("provider_requests")
    .select(
      "id,business_name,category,zone,whatsapp,email,message,status,created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (
    <>
      <Link href="/admin/solicitudes" className="text-sm font-bold text-brand">
        ← Solicitudes actuales
      </Link>
      <h1 className="display mt-5 text-3xl">Solicitudes históricas</h1>
      <p className="my-5 text-sm text-muted">
        Formularios anteriores al onboarding con cuenta. Se conservan para
        consulta; no se convierten automáticamente en otro proveedor. Antes de
        un alta manual, comprobá si ya existe por nombre, email o WhatsApp.
      </p>
      <div className="space-y-4">
        {(data ?? []).map((r) => (
          <article key={r.id} className="rounded-2xl bg-white p-5">
            <h2 className="display text-xl">{r.business_name}</h2>
            <p className="mt-2 text-sm">
              {r.category} · {r.zone} · {r.status}
            </p>
            <p className="mt-3 break-words text-sm text-muted">{r.message}</p>
            <p className="mt-2 break-words text-sm">{r.email}</p>
            {r.whatsapp && (
              <a
                href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="onb-secondary mt-4"
              >
                Contactar por WhatsApp
              </a>
            )}
          </article>
        ))}
        {!data?.length && <p>No hay solicitudes históricas.</p>}
      </div>
    </>
  );
}
