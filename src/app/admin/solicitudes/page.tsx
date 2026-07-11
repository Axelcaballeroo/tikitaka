import type { Metadata } from "next";
import { RequestsManager } from "@/components/admin/requests-manager";
import { getProviderRequests } from "@/lib/data/requests";
import { getProviders } from "@/lib/data/providers";
export const metadata: Metadata = { title: "Solicitudes admin" };
export const dynamic = "force-dynamic";
export default async function RequestsPage() { const [requests,providers] = await Promise.all([getProviderRequests(),getProviders({admin:true,includeUnpublished:true})]); return <RequestsManager initialRequests={requests} providers={providers} />; }
