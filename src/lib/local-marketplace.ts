"use client";

import { useSyncExternalStore } from "react";
import { categories, providers as mockProviders } from "./mock-data";
import type { LocalProvider, ProviderRequest, ProviderRequestStatus } from "@/types";
import { slugify } from "@/lib/utils";

export const REQUESTS_KEY = "tikitaka:provider-requests";
export const PROVIDERS_KEY = "tikitaka:local-providers";
const EVENT = "tikitaka:marketplace-changed";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback); window.addEventListener(EVENT, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(EVENT, callback); };
};
const serverSnapshot = () => "[]";
const parse = <T,>(raw: string): T[] => { try { const value: unknown = JSON.parse(raw); return Array.isArray(value) ? value as T[] : []; } catch { return []; } };
const notify = () => window.dispatchEvent(new Event(EVENT));
const write = (key: string, value: unknown[]) => { window.localStorage.setItem(key, JSON.stringify(value)); notify(); };

export function useProviderRequests() {
  const raw = useSyncExternalStore(subscribe, () => window.localStorage.getItem(REQUESTS_KEY) ?? "[]", serverSnapshot);
  const requests = parse<ProviderRequest>(raw);
  const updateRequest = (id: string, patch: Partial<ProviderRequest>) => write(REQUESTS_KEY, requests.map((request) => request.id === id ? { ...request, ...patch } : request));
  const removeRequest = (id: string) => write(REQUESTS_KEY, requests.filter((request) => request.id !== id));
  return { requests, updateRequest, removeRequest };
}

export function useLocalProviders() {
  const raw = useSyncExternalStore(subscribe, () => window.localStorage.getItem(PROVIDERS_KEY) ?? "[]", serverSnapshot);
  const localProviders = parse<LocalProvider>(raw);
  const updateProvider = (id: string, patch: Partial<LocalProvider>) => write(PROVIDERS_KEY, localProviders.map((provider) => provider.id === id ? { ...provider, ...patch } : provider));
  const removeProvider = (id: string) => write(PROVIDERS_KEY, localProviders.filter((provider) => provider.id !== id));
  return { localProviders, updateProvider, removeProvider };
}

export function useMarketplaceProviders() {
  const { localProviders } = useLocalProviders();
  return [...mockProviders, ...localProviders.filter((provider) => provider.published)];
}

export function useHydrated() { return useSyncExternalStore(() => () => undefined, () => true, () => false); }

const placeholderByCategory: Record<string, string> = {
  nineras: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85",
  "jardines-maternales": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=85",
  "salones-de-fiestas": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85",
  default: "https://images.unsplash.com/photo-1602030028438-4cf153cbae9e?auto=format&fit=crop&w=1200&q=85",
};

export function approveProviderRequest(request: ProviderRequest, existing: LocalProvider[]) {
  const category = categories.find((item) => item.name === request.category);
  const baseSlug = slugify(request.businessName) || `proveedor-${Date.now()}`;
  const occupied = new Set([...mockProviders.map((provider) => provider.slug), ...existing.map((provider) => provider.slug)]);
  let slug = baseSlug; let suffix = 2; while (occupied.has(slug)) slug = `${baseSlug}-${suffix++}`;
  const categorySlug = category?.slug ?? "servicios-infantiles";
  const image = placeholderByCategory[categorySlug] ?? placeholderByCategory.default;
  const provider: LocalProvider = {
    id: `local-${request.id}`, sourceRequestId: request.id, local: true, published: true, slug, name: request.businessName,
    category: request.category, categorySlug, description: request.message, zone: request.zone, city: "Buenos Aires", rating: 0, reviewsCount: 0,
    priceFrom: 0, whatsapp: request.whatsapp.replace(/\D/g, ""), verified: request.verified, featured: request.featured, image,
    gallery: [image, image, image], services: ["Atención personalizada", "Consulta por WhatsApp"], schedule: "Horarios a coordinar",
    coverage: [request.zone, "A coordinar"], documents: request.verified ? ["Datos verificados por Tiki Taka"] : ["Datos de contacto informados"],
    reviews: [], faqs: [{ question: "¿Cómo consulto disponibilidad?", answer: "Escribí directamente por WhatsApp para coordinar." }], createdAt: new Date().toISOString(),
  };
  const prior = existing.find((item) => item.sourceRequestId === request.id);
  write(PROVIDERS_KEY, prior ? existing.map((item) => item.sourceRequestId === request.id ? { ...item, published: true, verified: request.verified, featured: request.featured } : item) : [...existing, provider]);
  return provider;
}

export function setRequestStatus(requests: ProviderRequest[], id: string, status: ProviderRequestStatus) { write(REQUESTS_KEY, requests.map((request) => request.id === id ? { ...request, status } : request)); }
