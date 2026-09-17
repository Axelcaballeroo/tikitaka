/** UX geography, stored in the existing providers.zone / providers.city fields.
 * Extend this catalog here; no database migration or backfill is performed. */
export const geography = {
  "Zona Norte": ["San Isidro", "Beccar", "Martínez", "Acassuso", "Boulogne", "Villa Adelina", "Vicente López", "Olivos", "La Lucila", "Florida", "Munro", "Villa Martelli", "Tigre", "General Pacheco", "Don Torcuato", "Benavídez", "San Fernando", "Victoria", "Virreyes", "Pilar", "Del Viso", "Ingeniero Maschwitz", "Escobar"],
  "Zona Oeste": ["Morón", "Castelar", "Haedo", "El Palomar", "Ituzaingó", "Hurlingham", "Villa Tesei", "Ramos Mejía", "San Justo", "Lomas del Mirador", "Ciudad Madero", "La Tablada", "Isidro Casanova", "Gregorio de Laferrere", "González Catán", "Merlo", "San Antonio de Padua", "Moreno", "Paso del Rey", "Ciudadela", "Caseros", "Santos Lugares", "Villa Bosch"],
  "Zona Sur": ["Avellaneda", "Wilde", "Sarandí", "Dock Sud", "Lanús", "Gerli", "Remedios de Escalada", "Valentín Alsina", "Lomas de Zamora", "Banfield", "Temperley", "Llavallol", "Adrogué", "Burzaco", "Longchamps", "Quilmes", "Bernal", "Don Bosco", "Berazategui", "Ranelagh", "Florencio Varela", "Bosques", "Ezeiza", "Canning", "Monte Grande", "Luis Guillón"],
  "Capital Federal": ["Agronomía", "Almagro", "Balvanera", "Barracas", "Belgrano", "Boedo", "Caballito", "Chacarita", "Coghlan", "Colegiales", "Constitución", "Flores", "Floresta", "La Boca", "La Paternal", "Liniers", "Mataderos", "Monte Castro", "Monserrat", "Nueva Pompeya", "Núñez", "Palermo", "Parque Avellaneda", "Parque Chacabuco", "Parque Chas", "Parque Patricios", "Puerto Madero", "Recoleta", "Retiro", "Saavedra", "San Cristóbal", "San Nicolás", "San Telmo", "Vélez Sarsfield", "Versalles", "Villa Crespo", "Villa del Parque", "Villa Devoto", "Villa General Mitre", "Villa Lugano", "Villa Luro", "Villa Ortúzar", "Villa Pueyrredón", "Villa Real", "Villa Riachuelo", "Villa Santa Rita", "Villa Soldati", "Villa Urquiza"],
} as const;
export type Zone = keyof typeof geography;
export const zones = Object.keys(geography) as Zone[];
export const normalizeText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").replace(/\s+/g, " ").trim();
export function canonicalZone(value: string): Zone | undefined {
  const normalized = normalizeText(value);
  if (["caba", "ciudad autonoma de buenos aires"].includes(normalized)) return "Capital Federal";
  return zones.find(zone => normalizeText(zone) === normalized);
}
export function localitiesFor(zone: string): readonly string[] {
  const key = canonicalZone(zone);
  return key ? geography[key] : [];
}
export function validGeography(zone: unknown, city: unknown) {
  return typeof zone === "string" && typeof city === "string" && zones.includes(zone as Zone) && localitiesFor(zone).includes(city);
}
/** Read-only adapter. Unknown/conflicting values are preserved, never guessed. */
export function resolveGeography(value: { zone?: string | null; city?: string | null }) {
  const rawZone = value.zone?.trim() ?? "", rawCity = value.city?.trim() ?? "";
  const zone = canonicalZone(rawZone);
  if (zone) {
    const city = localitiesFor(zone).find(city => normalizeText(city) === normalizeText(rawCity));
    return { zone, city: city ?? rawCity, resolved: !!city };
  }
  // Only the legacy generic city or an empty field can be safely replaced.
  const generic = (text: string) => !text || normalizeText(text) === "buenos aires";
  const inCatalog = (text: string) => zones.some(zone => localitiesFor(zone).some(city => normalizeText(city) === normalizeText(text)));
  if ((!generic(rawZone) && !inCatalog(rawZone)) || (!generic(rawCity) && !generic(rawZone) && normalizeText(rawCity) !== normalizeText(rawZone))) {
    return { zone: rawZone, city: rawCity, resolved: false };
  }
  for (const candidate of [rawZone, rawCity]) {
    for (const zone of zones) {
      const city = localitiesFor(zone).find(city => normalizeText(city) === normalizeText(candidate));
      if (city) return { zone, city, resolved: true };
    }
  }
  return { zone: rawZone, city: rawCity, resolved: false };
}
export function geographicDraft<T extends { zone: string; city: string }>(draft: T): T {
  const location = resolveGeography(draft);
  return location.resolved ? { ...draft, zone: location.zone, city: location.city } : draft;
}
