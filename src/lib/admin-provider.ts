import {
  validateDraft,
  type OnboardingDraft,
  type OnboardingImage,
} from "./onboarding";
import type { Provider } from "@/types";

export type AdminProvider = {
  provider: Provider;
  draft: OnboardingDraft;
  images: OnboardingImage[];
  address: string;
  priceFrom: string;
  userId: string | null;
  updatedAt: string;
  coverImage: string;
};
export const adminFilters = [
  "todos",
  "pendientes",
  "publicados",
  "destacados",
  "verificados",
  "rechazados",
  "ocultos",
] as const;
export type AdminFilter = (typeof adminFilters)[number];
export function matchesAdminFilter(p: Provider, filter: string) {
  switch (filter) {
    case "pendientes":
      return p.status === "pending" && !p.published;
    case "publicados":
      return p.status === "approved" && p.published === true;
    case "destacados":
      return p.featured;
    case "verificados":
      return p.verified;
    case "rechazados":
      return p.status === "rejected";
    case "ocultos":
      return !p.published;
    default:
      return true;
  }
}
export function providerState(p: Pick<Provider, "status" | "published">) {
  return p.status === "rejected"
    ? "Rechazado"
    : p.status === "pending"
      ? "Pendiente"
      : p.published
        ? "Publicado"
        : "Aprobado · oculto";
}
export function moderationPatch(action: string, value?: unknown) {
  switch (action) {
    case "approve":
      return { status: "approved", published: true };
    case "reject":
      return { status: "rejected", published: false };
    case "hide":
      return { published: false };
    case "publish":
      return { published: true };
    case "verify":
    case "feature":
      if (typeof value !== "boolean") throw new Error("Valor inválido.");
      return { [action === "verify" ? "verified" : "featured"]: value };
    default:
      throw new Error("Acción inválida.");
  }
}
export function validateAdminDraft(input: unknown, complete: boolean) {
  const raw =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const result = validateDraft(raw.draft, complete);
  const address = typeof raw.address === "string" ? raw.address.trim() : "";
  const priceFrom =
    typeof raw.priceFrom === "string" ? raw.priceFrom.trim() : "";
  if (address.length > 300) result.errors.address = "Usá hasta 300 caracteres.";
  if (
    priceFrom &&
    (!/^\d+(\.\d{1,2})?$/.test(priceFrom) || Number(priceFrom) > 1000000000)
  )
    result.errors.priceFrom = "Ingresá un precio válido o dejalo vacío.";
  return {
    ...result,
    address,
    priceFrom,
    valid: Object.keys(result.errors).length === 0,
  };
}
