// Never let a stored URL authorize deleting an object belonging to another provider.
export function providerStoragePath(
  url: string | null,
  providerId: string,
  supabaseUrl: string | undefined,
) {
  if (!url || !supabaseUrl) return null;
  try {
    const parsed = new URL(url),
      base = new URL(supabaseUrl);
    const prefix = "/storage/v1/object/public/provider-images/";
    if (parsed.origin !== base.origin || !parsed.pathname.startsWith(prefix))
      return null;
    const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
    return path.split("/")[1] === providerId &&
      !path.split("/").some((p) => p === ".." || p === ".")
      ? path
      : null;
  } catch {
    return null;
  }
}
