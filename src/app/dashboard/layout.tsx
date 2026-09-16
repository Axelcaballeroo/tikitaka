import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireAccount } from "@/lib/auth/account";
import { requireRole } from "@/lib/auth/profile";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("provider");
  const { provider } = await requireAccount();
  return (
    <DashboardShell businessName={provider?.businessName ?? "Perfil pendiente"}>
      {children}
    </DashboardShell>
  );
}
