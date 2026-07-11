import "server-only";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export type UserRole = "admin" | "provider";
export type CurrentUserProfile = { id: string; email: string; fullName: string; role: UserRole };

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const supabase = await createAuthServerClient(); if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return null;
  const { data } = await supabase.from("profiles").select("id,email,full_name,role").eq("id", user.id).maybeSingle();
  if (!data) return null;
  return { id: data.id, email: data.email ?? user.email ?? "", fullName: data.full_name ?? "", role: data.role === "admin" ? "admin" : "provider" };
}

export async function requireRole(role: UserRole) { const profile = await getCurrentUserProfile(); if (!profile) redirect("/login"); if (profile.role !== role) redirect(profile.role === "admin" ? "/admin" : "/dashboard"); return profile; }
export async function requireAdminApi() { const profile = await getCurrentUserProfile(); if (!profile || profile.role !== "admin") throw new Error("No autorizado"); return profile; }
