"use client";

import { ButtonLink } from "@/components/ui/button";
import { useState } from "react";
import { useFavorites } from "@/lib/favorites";
import type { Provider } from "@/types";
import { ProviderCard } from "./provider-card";

export function FavoritesList({ providers }: { providers: Provider[] }) {
  const [shared, setShared] = useState(false);
  const { favoriteIds } = useFavorites();
  const favorites = providers.filter((provider) => favoriteIds.includes(provider.id));

  if (!favorites.length) return <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-10 text-center soft-shadow md:p-12"><span className="text-5xl text-brand">♡</span><h2 className="display mt-5 text-3xl font-semibold">Todavía no guardaste proveedores</h2><p className="mt-3 text-muted">Usá el corazón de las cards o perfiles para armar tu selección.</p><ButtonLink href="/servicios" className="mt-7">Explorar servicios</ButtonLink></div>;

  const share = async () => { const text = `Mis favoritos en Tiki Taka: ${favorites.map((provider) => provider.name).join(", ")}`; try { if (navigator.share) await navigator.share({ title: "Mis favoritos de Tiki Taka", text, url: window.location.href }); else await navigator.clipboard.writeText(`${text} — ${window.location.href}`); setShared(true); window.setTimeout(() => setShared(false), 2500); } catch { /* El usuario puede cancelar el diálogo nativo. */ } };
  return <><div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-extrabold uppercase tracking-wider text-brand">Tu selección</p><h2 className="display mt-2 text-3xl font-semibold">Guardaste {favorites.length} {favorites.length === 1 ? "proveedor" : "proveedores"}.</h2><p className="mt-2 text-sm text-muted">Comparalos y compartí tu lista con quien quieras.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={share} className="rounded-full border-2 border-brand px-5 py-3 text-sm font-extrabold text-brand transition hover:bg-mint">{shared ? "¡Enlace copiado!" : "Compartir favoritos ↗"}</button><ButtonLink href="/servicios">Seguir explorando</ButtonLink></div></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{favorites.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div></>;
}
