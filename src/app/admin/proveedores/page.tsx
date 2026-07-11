import type { Metadata } from "next";
import { ProvidersManager } from "@/components/admin/providers-manager";
import { getProviders } from "@/lib/data/providers";
export const metadata: Metadata = { title: "Proveedores admin" };
export const dynamic = "force-dynamic";
export default async function ProvidersPage({searchParams}:{searchParams:Promise<{filtro?:string}>}) { const [providers,{filtro}] = await Promise.all([getProviders({ admin: true, includeUnpublished: true }),searchParams]); const valid=["todos","pendientes","aprobados","rechazados","publicados","ocultos","verificados","destacados"] as const; const initialFilter=valid.includes(filtro as typeof valid[number])?filtro as typeof valid[number]:"todos"; return <ProvidersManager initialProviders={providers} initialFilter={initialFilter} />; }
