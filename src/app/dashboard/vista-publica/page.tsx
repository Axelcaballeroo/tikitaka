import Link from "next/link";
import { requireAccount } from "@/lib/auth/account";
import {
  MissingProvider,
  ProfileStatus,
} from "@/components/dashboard/business-overview";
import { dashboardState } from "@/lib/provider-dashboard";
export default async function PublicViewPage() {
  const { provider } = await requireAccount();
  if (!provider) return <MissingProvider />;
  return (
    <div className="space-y-6">
      <h1 className="display text-3xl font-semibold">Vista pública</h1>
      <ProfileStatus provider={provider} />
      {dashboardState(provider).visible && (
        <Link href={`/proveedores/${provider.slug}`} className="onb-primary">
          Ver mi perfil público ↗
        </Link>
      )}
    </div>
  );
}
