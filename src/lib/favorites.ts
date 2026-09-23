"use client";

import { useSyncExternalStore } from "react";

const GUEST_KEY = "tikitaka:guest-favorites";
const LEGACY_KEY = "tikitaka:favorites";
type State = { ids: string[]; authenticated: boolean; ready: boolean };
type Store = { state: State; loading: Promise<void> | null; listeners: Set<() => void> };
declare global { interface Window { __tikiTakaFavorites?: Store } }
const initialState: State = { ids: [], authenticated: false, ready: false };
const store = () => window.__tikiTakaFavorites ??= { state: initialState, loading: null, listeners: new Set() };
const unique = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string"))] : [];
function readGuest() { try { return unique(JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]")); } catch { return []; } }
function writeGuest(ids: string[]) { localStorage.setItem(GUEST_KEY, JSON.stringify(unique(ids))); }
function update(next: State) { const current = store(); current.state = next; current.listeners.forEach(listener => listener()); }
async function load() {
  // The legacy key has no owner information and could belong to another account.
  localStorage.removeItem(LEGACY_KEY);
  try {
    const response = await fetch("/api/favorites", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error();
    if (!data.authenticated) return update({ ids: readGuest(), authenticated: false, ready: true });
    const guest = readGuest();
    if (guest.length) {
      const migration = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ providerIds: guest }) });
      if (migration.ok) {
        const migrated = await migration.json();
        localStorage.removeItem(GUEST_KEY);
        return update({ ids: unique(migrated.ids), authenticated: true, ready: true });
      }
    }
    update({ ids: unique(data.ids), authenticated: true, ready: true });
  } catch { update({ ids: readGuest(), authenticated: false, ready: true }); }
}
function ensureLoaded() { const current = store(); if (!current.loading) current.loading = load(); }
function subscribe(listener: () => void) { const current = store(); current.listeners.add(listener); ensureLoaded(); return () => current.listeners.delete(listener); }
const getSnapshot = () => store().state;
const serverState: State = initialState;
const getServerSnapshot = () => serverState;

export function useFavorites() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggleFavorite = async (providerId: string) => {
    const removing = current.ids.includes(providerId);
    const next = removing ? current.ids.filter(id => id !== providerId) : [...current.ids, providerId];
    update({ ...current, ids: next });
    if (!current.authenticated) { writeGuest(next); return; }
    try {
      const response = await fetch("/api/favorites", { method: removing ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ providerId }) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      update({ ids: unique(data.ids), authenticated: true, ready: true });
    } catch { update(current); }
  };
  return { favoriteIds: current.ids, favoritesReady: current.ready, isFavorite: (providerId: string) => current.ids.includes(providerId), toggleFavorite };
}
