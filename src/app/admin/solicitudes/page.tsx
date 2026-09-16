import Link from "next/link";
import { ProvidersManager } from "@/components/admin/providers-manager";
import { getAdminProviders } from "@/lib/data/admin-providers";
export const dynamic = "force-dynamic";
export default async function RequestsPage() {
  const records = await getAdminProviders();
  return (
    <>
      <ProvidersManager
        initialProviders={records.map((r) => r.provider)}
        initialFilter="pendientes"
      />
      <p className="mt-6 text-sm text-muted">
        Los borradores del onboarding también figuran como pendientes.{" "}
        <Link
          href="/admin/solicitudes/historicas"
          className="font-bold text-brand underline"
        >
          Consultar solicitudes históricas
        </Link>
      </p>
    </>
  );
}
