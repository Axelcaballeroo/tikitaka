import { cn } from "@/lib/utils";
import type { Provider } from "@/types";

export type BadgeKind = "verified" | "featured" | "popular" | "fast" | "loved";
const badges: Record<BadgeKind, { label: string; icon: string; style: string }> = {
  verified: { label: "Verificado", icon: "✓", style: "bg-mint text-brand" },
  featured: { label: "Destacado", icon: "★", style: "bg-sun text-amber-950" },
  popular: { label: "Más contratado", icon: "🔥", style: "bg-orange-100 text-orange-800" },
  fast: { label: "Responde rápido", icon: "⚡", style: "bg-sky-100 text-sky-800" },
  loved: { label: "Favorito de familias", icon: "♥", style: "bg-blush text-rose-800" },
};
export function ProviderBadge({ kind, className }: { kind: BadgeKind; className?: string }) { const badge = badges[kind]; return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold shadow-sm", badge.style, className)}><span>{badge.icon}</span>{badge.label}</span>; }

export function getProviderBadges(provider: Provider): BadgeKind[] { const result: BadgeKind[] = []; if (provider.verified) result.push("verified"); if (provider.featured) result.push("featured"); if (provider.reviewsCount >= 50) result.push("popular"); if (provider.rating >= 4.8) result.push("fast"); if (provider.rating >= 4.9 && provider.reviewsCount >= 35) result.push("loved"); return result; }
