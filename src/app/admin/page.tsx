import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/dashboard";
import { getAdminStats } from "@/lib/data/admin";
export const metadata: Metadata = { title: "Dashboard admin" };
export const dynamic = "force-dynamic";
export default async function AdminPage() { const stats = await getAdminStats(); return <AdminDashboard stats={stats} />; }
