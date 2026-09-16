import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/profile";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");
  return <AdminShell>{children}</AdminShell>;
}
