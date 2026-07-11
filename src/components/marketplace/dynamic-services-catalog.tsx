"use client";

import { useMarketplaceProviders } from "@/lib/local-marketplace";
import { categories } from "@/lib/mock-data";
import { ServicesCatalog } from "./services-catalog";

export function DynamicServicesCatalog({ initialQuery = "" }: { initialQuery?: string }) {
  const providers = useMarketplaceProviders();
  const zones = [...new Set(providers.map((provider) => provider.zone))].sort();
  return <ServicesCatalog providers={providers} categories={categories} zones={zones} initialQuery={initialQuery} />;
}
