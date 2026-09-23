import "server-only";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

import { parseRole, roleHome, type UserRole } from "./roles";
export type { UserRole } from "./roles";
export type CurrentUserProfile = { id: string; email: string; fullName: string; role: UserRole };

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const supabase = await createAuthServerClient(); if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser(); if (!user) return null;
  const { data } = await supabase.from("profiles").select("id,email,full_name,role").eq("id", user.id).maybeSingle();
  const role = parseRole(data?.role);
  if (!data || !role) return null;
  return { id: user.id, email: user.email ?? "", fullName: data.full_name ?? "", role };
}

export async function requireRole(role: UserRole) { const profile = await getCurrentUserProfile(); if (!profile) redirect("/login"); if (profile.role !== role) redirect(roleHome(profile.role)); return profile; }
export async function requireAdminApi() { const profile = await getCurrentUserProfile(); if (!profile || profile.role !== "admin") throw new Error("No autorizado"); return profile; }
