import { canonicalZone, validGeography } from "@/lib/geography";
export type OnboardingService = {
  id: string;
  title: string;
  description: string;
  priceFrom: string;
};
export type OnboardingDraft = {
  businessName: string;
  categorySlug: string;
  description: string;
  whatsapp: string;
  email: string;
  city: string;
  province: string;
  zone: string;
  coverage: string;
  schedule: string;
  services: OnboardingService[];
};
export type OnboardingImage = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};
export type OnboardingProvider = {
  id: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  published: boolean;
  coverImage: string;
};
export type OnboardingData = {
  provider: OnboardingProvider | null;
  draft: OnboardingDraft;
  images: OnboardingImage[];
};
export const emptyDraft: OnboardingDraft = {
  businessName: "",
  categorySlug: "",
  description: "",
  whatsapp: "",
  email: "",
  city: "",
  province: "",
  zone: "",
  coverage: "",
  schedule: "",
  services: [],
};
export const onboardingSteps = [
  "Sobre tu negocio",
  "Tu servicio",
  "Fotos",
  "Contacto y zona",
  "Vista previa",
  "Enviar",
];
export const normalizeWhatsapp = (value: string) => value.replace(/\D/g, "");
export const scheduleDays = [
  ["L", "Lunes"], ["M", "Martes"], ["X", "Miércoles"], ["J", "Jueves"], ["V", "Viernes"], ["S", "Sábado"], ["D", "Domingo"],
] as const;
export function parseCoverage(value: string) {
  return [...new Set(value.split(/[,;\n]+/).map(item => item.trim()).filter(Boolean))].slice(0, 12);
}
export const serializeCoverage = (items: string[]) => [...new Set(items.map(item => item.trim()).filter(Boolean))].slice(0, 12).join(", ");
export function parseSchedule(value: string) {
  if (!value.trim() || /^a coordinar$/i.test(value.trim())) return { mode: "flexible" as const, days: [] as string[], from: "09:00", to: "18:00" };
  const times = value.match(/(\d{2}:\d{2})\s*(?:a|–|-)\s*(\d{2}:\d{2})/i);
  const days = scheduleDays.filter(([, label]) => value.toLocaleLowerCase("es").includes(label.toLocaleLowerCase("es"))).map(([code]) => code);
  return { mode: "defined" as const, days: days.length ? days : ["L", "M", "X", "J", "V"], from: times?.[1] ?? "09:00", to: times?.[2] ?? "18:00" };
}
export function serializeSchedule(mode: "flexible" | "defined", days: string[], from: string, to: string) {
  if (mode === "flexible") return "A coordinar";
  const labels = scheduleDays.filter(([code]) => days.includes(code)).map(([, label]) => label);
  return labels.length ? `${labels.join(", ")} · ${from} a ${to}` : "";
}
export function validateDraft(input: unknown, complete = false, strictGeography = true) {
  const errors: Record<string, string> = {};
  const raw =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const draft = { ...emptyDraft, services: [] } as OnboardingDraft;
  const limits: Record<Exclude<keyof OnboardingDraft, "services">, number> = {
    businessName: 100,
    categorySlug: 100,
    description: 2000,
    whatsapp: 30,
    email: 254,
    city: 100,
    province: 100,
    zone: 100,
    coverage: 1000,
    schedule: 500,
  };
  for (const key of Object.keys(limits) as (keyof typeof limits)[]) {
    draft[key] =
      typeof raw[key] === "string" ? (raw[key] as string).trim() : "";
    if (draft[key].length > limits[key])
      errors[key] = `Usá hasta ${limits[key]} caracteres.`;
  }
  if (draft.businessName.length < 2)
    errors.businessName = "Ingresá al menos 2 caracteres para el nombre.";
  if (!draft.categorySlug) errors.categorySlug = "Elegí una categoría.";
  if (draft.description.length < 20)
    errors.description = "Contanos qué ofrecés en al menos 20 caracteres.";
  if (
    complete &&
    (!/^[+\d\s().-]+$/.test(draft.whatsapp) ||
      normalizeWhatsapp(draft.whatsapp).length < 8 ||
      normalizeWhatsapp(draft.whatsapp).length > 15)
  )
    errors.whatsapp =
      "Ingresá un WhatsApp válido, con código de país (8 a 15 dígitos).";
  if (
    complete &&
    draft.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)
  )
    errors.email = "Ingresá un email válido.";
  // Moderation of an existing record keeps its original geography requirement.
  if (!strictGeography && complete && !draft.zone && !draft.city) errors.zone = "Seleccioná una ubicación.";
  if (strictGeography && (complete || draft.zone || draft.city)) {
    if (canonicalZone(draft.zone) !== draft.zone || !draft.zone) errors.zone = "Seleccioná una zona válida.";
    if ((complete || draft.city) && !validGeography(draft.zone, draft.city)) errors.city = "Seleccioná una localidad de esa zona.";
  }
  if (!Array.isArray(raw.services) || raw.services.length > 5)
    errors.services = "Podés agregar hasta 5 servicios.";
  const ids = new Set<string>();
  for (const [index, item] of (Array.isArray(raw.services)
    ? raw.services
    : []
  ).entries()) {
    if (!item || typeof item !== "object") {
      errors.services = "Revisá los servicios cargados.";
      continue;
    }
    const service = {
      id: typeof item.id === "string" ? item.id : "",
      title: typeof item.title === "string" ? item.title.trim() : "",
      description:
        typeof item.description === "string" ? item.description.trim() : "",
      priceFrom:
        typeof item.priceFrom === "string" ? item.priceFrom.trim() : "",
    };
    if (
      !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(
        service.id,
      ) ||
      ids.has(service.id)
    )
      errors.services = "Revisá los servicios cargados.";
    ids.add(service.id);
    if (service.title.length < 2 || service.title.length > 100)
      errors[`service-${index}-title`] =
        "Usá entre 2 y 100 caracteres para el título.";
    if (service.description.length > 1000)
      errors[`service-${index}-description`] = "Usá hasta 1000 caracteres.";
    if (
      service.priceFrom !== "" &&
      (!/^\d+(\.\d{1,2})?$/.test(service.priceFrom) ||
        !Number.isFinite(Number(service.priceFrom)) ||
        Number(service.priceFrom) > 1000000000)
    )
      errors[`service-${index}-priceFrom`] =
        "Ingresá un precio válido o elegí Consultar precio.";
    draft.services.push(service);
  }
  return { draft, errors, valid: Object.keys(errors).length === 0 };
}
export const imageLimits = {
  types: ["image/jpeg", "image/png", "image/webp"],
  size: 5 * 1024 * 1024,
  gallery: 8,
};
export function validateImage(file: { type: string; size: number }) {
  return !imageLimits.types.includes(file.type)
    ? "Elegí una imagen JPG, PNG o WEBP."
    : file.size > imageLimits.size
      ? "La imagen supera el máximo de 5 MB."
      : null;
}
export function safeReturnPath(
  path: string | null | undefined,
  fallback = "/dashboard",
) {
  return path &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !/[\\\u0000-\u001f]/.test(path)
    ? path
    : fallback;
}
