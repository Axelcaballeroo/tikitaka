export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured && process.env.VERCEL_ENV)
    throw new Error(
      "Configurá NEXT_PUBLIC_SITE_URL para este entorno de Vercel.",
    );
  const url = new URL(configured || "http://localhost:3000");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error(
      "NEXT_PUBLIC_SITE_URL debe ser un origen HTTP(S) sin ruta ni credenciales.",
    );
  if (
    process.env.VERCEL_ENV === "production" &&
    (url.protocol !== "https:" ||
      ["localhost", "127.0.0.1"].includes(url.hostname))
  )
    throw new Error("El sitio productivo requiere su dominio HTTPS real.");
  return url.origin;
}
