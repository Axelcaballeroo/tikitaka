import { zones } from "@/lib/geography";
import type { Metadata } from "next";
import { getCategories } from "@/lib/data/categories";
import { getProviders } from "@/lib/data/providers";
import { HeroSearch } from "@/components/home/hero-search";
import { CategoryExplorer } from "@/components/home/category-explorer";
import { FeaturedProviders } from "@/components/home/featured-providers";
import { MomentCollections } from "@/components/home/moment-collections";
import { TrustSection } from "@/components/home/trust-section";
import { NearbySection } from "@/components/home/nearby-section";
import { ProviderCTA } from "@/components/home/provider-cta";
import { PlansPreview } from "@/components/home/plans-preview";
import { homePhoto } from "@/components/home/home-content";

const title = "Tiki Taka | Servicios para chicos y familias";
const description = "Encontrá niñeras, salones, actividades, profesionales y servicios para tus hijos cerca tuyo.";
export const metadata: Metadata = {
  title: { absolute: title }, description, alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", images: [{ url: homePhoto, alt: "Un momento compartido en familia" }] },
  twitter: { card: "summary_large_image", title, description, images: [homePhoto] },
};
export const dynamic = "force-dynamic";

export default async function Home() {
  const [categoryResult, providerResult] = await Promise.allSettled([
    getCategories(), getProviders({ allowMockFallback: false }),
  ]);
  const categories = categoryResult.status === "fulfilled" ? categoryResult.value : [];
  const providers = (providerResult.status === "fulfilled" ? providerResult.value : [])
    .filter((provider) => provider.published === true && provider.status === "approved")
    .sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.verified) - Number(a.verified) || b.rating - a.rating);

  return <div className="home-page"><HeroSearch categories={categories} zones={zones} /><CategoryExplorer categories={categories} /><FeaturedProviders providers={providers.slice(0, 4)} /><MomentCollections categories={categories} /><TrustSection /><NearbySection zones={zones} /><ProviderCTA /><PlansPreview /></div>;
}
