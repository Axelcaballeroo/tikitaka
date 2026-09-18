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
  return matchesSearchText([provider.name, provider.category, provider.description,
    ...(provider.services ?? []),
    ...(provider.serviceDetails ?? []).flatMap(service => [service.title, service.description]),
  ].filter(Boolean).join(" "), query);
}
export function matchesSearchText(text: string, query: string) {
  const content = new Set(tokens(text));
  return tokens(query).every(token => content.has(token) || [...content].some(word => word.startsWith(token)));
}
export function searchSuggestions(providers: Provider[], query: string) {
  if (!tokens(query).length) return [];
  const unique = new Map<string, string>();
  for (const provider of providers) {
    for (const label of [provider.category, provider.name, ...(provider.services ?? []), ...(provider.serviceDetails ?? []).map(service => service.title)]) {
      const text = label?.trim();
      if (text && matchesSearchText(text, query)) unique.set(normalizeText(text), text);
    }
  }
  return [...unique.values()].slice(0, 6);
}
