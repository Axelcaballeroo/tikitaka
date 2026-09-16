import { ProvidersManager } from "@/components/admin/providers-manager";
import { getAdminProviders } from "@/lib/data/admin-providers";
import { adminFilters } from "@/lib/admin-provider";
export const dynamic = "force-dynamic";
export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro } = await searchParams;
  const records = await getAdminProviders();
  return (
    <ProvidersManager
      initialProviders={records.map((r) => r.provider)}
      initialFilter={
        adminFilters.includes(filtro as (typeof adminFilters)[number])
          ? filtro
          : "todos"
      }
    />
  );
}
