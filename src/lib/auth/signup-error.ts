export type SignupFailure = { status: number; code: "email_exists" | "rate_limited" | "invalid_email" | "signup_disabled" | "unavailable"; message: string };
export function signupFailure(error: { code?: string; status?: number; message?: string } | null): SignupFailure {
  const code = error?.code ?? "";
  const message = (error?.message ?? "").toLowerCase();
  if (["user_already_exists", "identity_already_exists"].includes(code) || message.includes("already registered"))
    return { status: 409, code: "email_exists", message: "Ese email ya tiene una cuenta. Iniciá sesión para continuar." };
  if (error?.status === 429 || code.includes("rate_limit") || message.includes("rate limit"))
    return { status: 429, code: "rate_limited", message: "Se alcanzó el límite temporal de emails. Esperá unos minutos y volvé a intentar." };
  if (code === "email_address_invalid" || message.includes("invalid email"))
    return { status: 400, code: "invalid_email", message: "Revisá el email ingresado." };
  if (code === "signup_disabled" || message.includes("signups not allowed"))
    return { status: 503, code: "signup_disabled", message: "El registro está temporalmente deshabilitado." };
  return { status: error?.status && error.status >= 500 ? 503 : 400, code: "unavailable", message: "No pudimos crear la cuenta. Revisá tus datos o intentá iniciar sesión." };
}
