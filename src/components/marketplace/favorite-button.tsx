"use client";

import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({ providerId, providerName, variant = "icon", className }: { providerId: string; providerName: string; variant?: "icon" | "full"; className?: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(providerId);
  return <button type="button" aria-label={`${active ? "Quitar de favoritos" : "Guardar en favoritos"}: ${providerName}`} aria-pressed={active} onClick={() => toggleFavorite(providerId)} className={cn("transition", variant === "icon" ? `grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl shadow-md hover:scale-105 ${active ? "bg-brand text-white" : "bg-white text-brand"}` : `inline-flex w-full items-center justify-center rounded-full border-2 border-brand px-5 py-3 text-sm font-extrabold ${active ? "bg-brand text-white" : "bg-white text-brand hover:bg-mint"}`, className)}>{active ? "♥" : "♡"}{variant === "full" && <span className="ml-2">{active ? "Guardado" : "Guardar"}</span>}</button>;
}
