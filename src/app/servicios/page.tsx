import type { Metadata } from "next";

import { ServicesCatalog } from "@/components/marketplace/services-catalog";
import { getCategories } from "@/lib/data/categories";
import { getProviders } from "@/lib/data/providers";

export const metadata: Metadata = {
  title: "Servicios infantiles en Buenos Aires",
  description:
    "Explorá proveedores infantiles, compará opciones y encontrá el servicio ideal para tu familia.",
  alternates: { canonical: "/servicios" },
  openGraph: {
    title: "Servicios infantiles en Buenos Aires | Tiki Taka",
    description: "Compará proveedores verificados y contactá directamente.",
    url: "/servicios",
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicios infantiles | Tiki Taka",
    description: "Todo lo que tu familia necesita, en un solo lugar.",
  },
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [providerResult, categoryResult] = await Promise.allSettled([
    getProviders({ allowMockFallback: false, throwOnError: true }),
    getCategories(),
  ]);
  const providers =
    providerResult.status === "fulfilled" ? providerResult.value : [];
  const categories =
    categoryResult.status === "fulfilled" ? categoryResult.value : [];
  const zones = [
    ...new Set(providers.map((provider) => provider.zone).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "es"));
  return (
    <ServicesCatalog
      providers={providers}
      categories={categories}
      zones={zones}
      unavailable={providerResult.status === "rejected"}
    />
  );
}
