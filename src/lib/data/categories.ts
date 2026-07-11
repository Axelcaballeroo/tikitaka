import { categories as mockCategories } from "@/lib/mock-data";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Category } from "@/types";

type CategoryRow = { id?: string; name: string; slug: string; description: string | null; image_url: string | null };
let warnedAboutFallback = false;
const visual = (slug: string) => mockCategories.find((item) => item.slug === slug) ?? { icon: "✦", color: "bg-mint" };
const mapCategory = (row: CategoryRow): Category => ({ id: row.id, name: row.name, slug: row.slug, description: row.description ?? `Servicios de ${row.name.toLowerCase()} para familias.`, icon: visual(row.slug).icon, color: visual(row.slug).color });

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) { if (!warnedAboutFallback) { console.warn("[Tiki Taka] Supabase no configurado: usando datos mock para lectura pública."); warnedAboutFallback = true; } return mockCategories; }
  const supabase = createServerClient(); if (!supabase) return mockCategories;
  const { data, error } = await supabase.from("categories").select("id,name,slug,description,image_url").eq("active", true).order("name");
  if (error) { console.error("[Tiki Taka] Error al leer categorías:", error.message); return mockCategories; }
  return (data as CategoryRow[]).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) return mockCategories.find((item) => item.slug === slug) ?? null;
  const supabase = createServerClient(); if (!supabase) return null;
  const { data, error } = await supabase.from("categories").select("id,name,slug,description,image_url").eq("slug", slug).eq("active", true).maybeSingle();
  if (error) { console.error("[Tiki Taka] Error al leer categoría:", error.message); return null; }
  return data ? mapCategory(data as CategoryRow) : null;
}
