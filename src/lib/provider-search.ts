import type { Provider } from "@/types";
import { normalizeText } from "@/lib/geography";

// Match only real provider content; no external engine or synthetic results.
const synonyms: Record<string, string> = {
  salones: "salon", fiestas: "evento", fiesta: "evento", eventos: "evento",
  animadores: "animacion", animador: "animacion", animadora: "animacion", animadoras: "animacion",
  nineras: "ninera", nineros: "ninera", ninero: "ninera",
};
const stopWords = new Set(["de", "del", "la", "las", "el", "los", "en", "para", "y", "un", "una"]);
function tokens(text: string) {
  return normalizeText(text).split(/[^a-z0-9]+/).filter(token => token && !stopWords.has(token)).map(token => synonyms[token] ?? token);
}
export function matchesProviderSearch(provider: Provider, query: string) {
  const content = new Set(tokens([provider.name, provider.category, provider.description,
    ...(provider.services ?? []),
    ...(provider.serviceDetails ?? []).flatMap(service => [service.title, service.description]),
  ].filter(Boolean).join(" ")));
  return tokens(query).every(token => content.has(token) || [...content].some(word => word.startsWith(token)));
}
