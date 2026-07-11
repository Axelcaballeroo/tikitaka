import type { Metadata } from "next";
import { PageHero } from "@/components/marketplace/page-hero";
import { ServicesCatalog } from "@/components/marketplace/services-catalog";
import { getCategories } from "@/lib/data/categories";
import { getProviders } from "@/lib/data/providers";

export const metadata: Metadata = { title: "Servicios infantiles en Buenos Aires", description: "Explorá proveedores infantiles, compará opciones y encontrá el servicio ideal para tu familia.", alternates: { canonical: "/servicios" }, openGraph: { title: "Servicios infantiles en Buenos Aires | Tiki Taka", description: "Compará proveedores verificados y contactá directamente.", url: "/servicios" }, twitter: { card: "summary_large_image", title: "Servicios infantiles | Tiki Taka", description: "Todo lo que tu familia necesita, en un solo lugar." } };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [providers, categories] = await Promise.all([getProviders(), getCategories()]);
  const zones = [...new Set(providers.map((provider) => provider.zone))].sort();
  return <><PageHero eyebrow="Marketplace infantil" title="Servicios para cada etapa de la infancia" text="Explorá perfiles, compará propuestas y contactá directamente a proveedores en Buenos Aires." /><ServicesCatalog providers={providers} categories={categories} zones={zones} initialQuery={q} /></>;
}
