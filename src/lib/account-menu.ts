export type NavbarAccount = {
  fullName: string;
  role: "admin" | "provider" | "customer";
  email?: string;
  avatarUrl?: string | null;
  hasProvider?: boolean;
  providerPublished?: boolean;
};
export function accountFirstName(account: NavbarAccount) {
  const name = account.fullName.trim();
  return /\p{L}/u.test(name) && !name.includes("@") ? name.split(/\s+/)[0] : "";
}
export function accountLabel(account: NavbarAccount) {
  const first = accountFirstName(account);
  return first ? `Hola, ${first}` : "Mi cuenta";
}
export const accountRoleLabel = (role: NavbarAccount["role"], hasProvider = false) => role === "admin" ? "Administradora" : hasProvider ? "Familia y proveedor" : "Mi cuenta";
export function accountLinks(role: NavbarAccount["role"], hasProvider = false, providerPublished = false) {
  return role === "admin"
    ? [["Camila OS", "/admin"], ["Configuración", "/admin/configuracion"], ["Volver al marketplace", "/servicios"]]
    : [["Mi cuenta", "/cuenta"], ["Mis favoritos", "/favoritos"], ...(hasProvider ? [["Mi negocio", "/dashboard"], ["Mi panel", "/dashboard/estadisticas"], ["Editar mi servicio", "/dashboard/perfil"], ...(providerPublished ? [["Ver mi publicación", "/dashboard/vista-publica"]] : [])] : [["Publicar mi servicio", "/publicar"]])];
}
// Existing image sources only. Never return arbitrary tracking or authenticated URLs.
export function safeAccountAvatar(value: unknown, storageUrl?: string) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.username || url.password) return null;
    if (url.protocol === "https:" && url.hostname === "images.unsplash.com") return url.href;
    if (!storageUrl) return null;
    const storage = new URL(storageUrl);
    const safeProtocol = url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
    return safeProtocol && url.origin === storage.origin && url.pathname.startsWith("/storage/v1/object/public/") ? url.href : null;
  } catch { return null; }
}
