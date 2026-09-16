import { AdminDashboard } from "@/components/admin/dashboard";
import { getAdminStats } from "@/lib/data/admin";
import { getAdminProviders } from "@/lib/data/admin-providers";
import { requireRole } from "@/lib/auth/profile";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const profile = await requireRole("admin");
  const [stats, records] = await Promise.allSettled([
    getAdminStats(),
    getAdminProviders(),
  ]);
  return (
    <AdminDashboard
      name={profile.fullName.split(" ")[0]}
      stats={stats.status === "fulfilled" ? stats.value : Array(5).fill(null)}
      pending={
        records.status === "fulfilled"
          ? records.value
              .map((r) => r.provider)
              .filter((p) => p.status === "pending" && !p.published)
              .slice(0, 6)
          : []
      }
      error={records.status === "rejected"}
    />
  );
}
