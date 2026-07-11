import type { Metadata } from "next";
import { FavoritesList } from "@/components/marketplace/favorites-list";
import { PageHero } from "@/components/marketplace/page-hero";
import { getProviders } from "@/lib/data/providers";

export const metadata: Metadata = { title: "Mis favoritos", description: "Tus proveedores infantiles favoritos, siempre a mano." };
export const dynamic = "force-dynamic";

export default async function FavoritesPage() { const providers = await getProviders(); return <><PageHero eyebrow="Tu selección" title="Tus servicios favoritos" text="Guardá perfiles interesantes y volvé a encontrarlos cuando los necesites." /><section className="container-page py-14 md:py-20"><FavoritesList providers={providers} /></section></>; }
