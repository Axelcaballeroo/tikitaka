"use client";

import { useSyncExternalStore } from "react";

const KEY = "tikitaka:favorites";
const EVENT = "tikitaka:favorites-changed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function getSnapshot() { return window.localStorage.getItem(KEY) ?? "[]"; }
function getServerSnapshot() { return "[]"; }

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  let ids: string[] = [];
  try { ids = JSON.parse(raw) as string[]; } catch { ids = []; }

  const toggleFavorite = (providerId: string) => {
    const next = ids.includes(providerId) ? ids.filter((id) => id !== providerId) : [...ids, providerId];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  };

  return { favoriteIds: ids, isFavorite: (providerId: string) => ids.includes(providerId), toggleFavorite };
}
