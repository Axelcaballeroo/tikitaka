export type UserRole = "admin" | "provider" | "customer";
export function parseRole(value: unknown): UserRole | null {
  return value === "admin" || value === "provider" || value === "customer" ? value : null;
}
export function roleHome(role: UserRole) {
  return { admin: "/admin", provider: "/dashboard", customer: "/cuenta" }[role];
}
export function canAccessRolePath(role: UserRole, path: string) {
  for (const [prefix, allowed] of [["/admin", "admin"], ["/dashboard", "provider"], ["/cuenta", "customer"]]) {
    if (path === prefix || path.startsWith(prefix + "/")) return role === allowed;
  }
  return true;
}
