"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Category } from "@/types";
import {
  emptyDraft,
  onboardingSteps,
  validateDraft,
  type OnboardingData,
  type OnboardingDraft,
  type OnboardingService,
} from "@/lib/onboarding";
import { BusinessStep, ServicesStep, ContactStep } from "./onboarding-fields";
import { OnboardingPhotos } from "./onboarding-photos";
import { OnboardingPreview } from "./onboarding-preview";

export function OnboardingWizard({
  userId,
  categories,
}: {
  userId: string;
  categories: Category[];
}) {
  const key = `tikitaka:onboarding:v1:${userId}`;
  const [data, setData] = useState<OnboardingData | null>(null),
    [draft, setDraft] = useState<OnboardingDraft>(emptyDraft),
    [step, setStep] = useState(0),
    [started, setStarted] = useState(false),
    [busy, setBusy] = useState(false),
    [photoBusy, setPhotoBusy] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [message, setMessage] = useState(""),
    [loadError, setLoadError] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [success, setSuccess] = useState(false),
    [localAvailable, setLocalAvailable] = useState(true);
  const heading = useRef<HTMLHeadingElement>(null),
    submitting = useRef(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/onboarding", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "No pudimos cargar tu perfil.");
        if (!active) return;
        setData(result);
        let restored = false;
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const saved = JSON.parse(raw);
            if (
              Date.now() - saved.savedAt < 7 * 24 * 60 * 60 * 1000 &&
              saved.draft &&
              (!result.provider || saved.providerId === result.provider.id)
            ) {
              setDraft(validateDraft(saved.draft).draft);
              setStep(Math.max(0, Math.min(5, Number(saved.step) || 0)));
              restored = true;
            } else localStorage.removeItem(key);
          }
        } catch {
          setLocalAvailable(false);
        }
        if (!restored) setDraft(result.draft);
        setStarted(restored || !result.provider || !result.draft.description);
      } catch (err) {
        if (active)
          setLoadError(
            err instanceof Error
              ? err.message
              : "No pudimos cargar tu progreso.",
          );
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [key]);
  useEffect(() => {
    if (
      !data ||
      !started ||
      success ||
      data.provider?.published ||
      data.provider?.status === "approved"
    )
      return;
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          draft,
          step,
          providerId: data.provider?.id ?? null,
          savedAt: Date.now(),
        }),
      );
    } catch {
      setLocalAvailable(false);
    }
  }, [data, draft, step, started, success, key]);
  const update = (
    field: keyof OnboardingDraft,
    value: string | OnboardingService[],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors({});
    setMessage("");
    setConfirmed(false);
  };
  const showErrors = (next: Record<string, string>) => {
    setErrors(next);
    setMessage("Revisá los campos indicados antes de continuar.");
    requestAnimationFrame(() => {
      const first = document.getElementById(Object.keys(next)[0]);
      first?.focus();
    });
  };
  const go = (next: number) => {
    setStep(next);
    setErrors({});
    setMessage("");
    requestAnimationFrame(() => {
      heading.current?.focus();
      heading.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };
  const save = async (final = false) => {
    if (submitting.current) return false;
    const checked = validateDraft(draft, final);
    if (!checked.valid) {
      showErrors(checked.errors);
      return false;
    }
    if (final && !confirmed) {
      showErrors({ confirmed: "Confirmá que la información es correcta." });
      return false;
    }
    submitting.current = true;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: final ? "submit" : "save",
          draft: checked.draft,
          confirmed,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.errors) setErrors(result.errors);
        throw new Error(result.error || "No pudimos guardar tu progreso.");
      }
      setData((current) =>
        current ? { ...current, provider: result.provider } : current,
      );
      setMessage(final ? "" : "Progreso guardado en tu cuenta.");
      if (final) {
        try {
          localStorage.removeItem(key);
        } catch {}
        setSuccess(true);
      }
      return true;
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "No pudimos guardar. Tu información sigue en este formulario.",
      );
      return false;
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  const next = async () => {
    const checked = validateDraft(draft, step >= 3);
    const relevant =
      step === 0
        ? Object.fromEntries(
            Object.entries(checked.errors).filter(([field]) =>
              ["businessName", "categorySlug", "description"].includes(field),
            ),
          )
        : checked.errors;
    if (Object.keys(relevant).length) {
      showErrors(relevant);
      return;
    }
    if ((step === 1 || step === 3) && !(await save())) return;
    go(step + 1);
  };
  if (loadError)
    return (
      <div role="alert" className="mx-auto max-w-xl rounded-3xl bg-mint p-8">
        <h2 className="display text-2xl">No pudimos abrir tu solicitud</h2>
        <p className="mt-4 text-sm leading-7 text-muted">{loadError}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="onb-primary"
            onClick={() => window.location.reload()}
          >
            Volver a intentar
          </button>
          <Link href="/login?next=%2Fpublicar" className="onb-secondary">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  if (!data)
    return (
      <p
        role="status"
        className="rounded-3xl bg-mint p-10 text-center text-sm text-muted"
      >
        Cargando tu progreso…
      </p>
    );
  if (success)
    return (
      <section className="mx-auto max-w-2xl rounded-[2rem] bg-white p-7 text-center md:p-12">
        <span
          aria-hidden
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint text-3xl text-brand"
        >
          ✓
        </span>
        <h1 className="display mt-6 text-4xl font-medium">
          ¡Recibimos tu solicitud!
        </h1>
        <p className="mt-5 leading-7 text-muted">
          El equipo de Tiki Taka va a revisar tu perfil antes de publicarlo.
        </p>
        <p className="mt-3 text-sm leading-7 text-muted">
          Podés seguir completando o actualizando tu información desde tu panel.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="onb-primary">
            Ir a mi panel
          </Link>
          <Link href="/" className="onb-secondary">
            Volver al inicio
          </Link>
        </div>
        <p className="mt-8 text-xs leading-6 text-muted">
          Más adelante podés destacar tu perfil con Tiki Taka Destacado.{" "}
          <Link href="/planes" className="font-bold text-brand underline">
            Conocer planes
          </Link>
        </p>
      </section>
    );
  if (
    data.provider &&
    (data.provider.published || data.provider.status === "approved" || !started)
  )
    return (
      <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8">
        <p className="home-eyebrow">Tu perfil en Tiki Taka</p>
        <h1 className="display mt-4 text-3xl">
          {data.provider.published && data.provider.status === "approved"
            ? "Tu perfil ya está publicado."
            : data.provider.status === "approved"
              ? "Tu perfil está aprobado y todavía no está publicado."
              : data.provider.status === "rejected"
                ? "Tu solicitud fue rechazada."
                : "Tu perfil está en revisión."}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          {data.provider.status === "rejected"
            ? "Podés revisar tu información y volver a enviarla al equipo."
            : "Podés completar o actualizar tu información sin crear otro perfil."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="onb-primary">
            Ir a mi panel
          </Link>
          {!data.provider.published && data.provider.status !== "approved" && (
            <button className="onb-secondary" onClick={() => setStarted(true)}>
              {data.provider.status === "rejected"
                ? "Revisar y reintentar"
                : "Continuar editando"}
            </button>
          )}
        </div>
      </section>
    );
  const props = { draft, categories, errors, update };
  const locked = busy || photoBusy;
  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="home-eyebrow">Tu perfil empieza acá · Gratis</p>
        <h1 className="display mt-3 text-3xl font-medium md:text-4xl">
          Publicá tu servicio en Tiki Taka
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Completá tu propuesta a tu ritmo. El equipo la revisará antes de
          publicarla.
        </p>
      </div>
      <div className="rounded-[2rem] border border-brand/10 bg-white p-5 md:p-9">
        <ol
          aria-label="Pasos del onboarding"
          className="mb-8 grid grid-cols-6 gap-2 border-b border-brand/10 pb-6"
        >
          {onboardingSteps.map((label, index) => (
            <li
              key={label}
              aria-current={step === index ? "step" : undefined}
              className="min-w-0 text-center"
            >
              <span
                className={`mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${index === step ? "bg-brand text-white" : index < step ? "bg-mint text-brand" : "bg-slate-100 text-muted"}`}
              >
                {index < step ? "✓" : index + 1}
              </span>
              <span className="mt-2 hidden text-[11px] font-bold leading-4 md:block">
                {label}
              </span>
            </li>
          ))}
        </ol>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-brand">Paso {step + 1} de 6</p>
            <h2
              ref={heading}
              tabIndex={-1}
              className="display mt-2 scroll-mt-28 text-3xl font-medium outline-none"
            >
              {onboardingSteps[step]}
            </h2>
          </div>
          <button
            disabled={locked}
            type="button"
            onClick={() => save()}
            className="min-h-11 text-xs font-bold text-brand underline underline-offset-4"
          >
            Guardar progreso
          </button>
        </div>
        {data.provider?.status === "rejected" && (
          <p className="mb-5 rounded-xl bg-blush/50 p-4 text-sm">
            Tu solicitud anterior fue rechazada. Podés corregirla y enviarla de
            nuevo.
          </p>
        )}
        {message && (
          <p
            role="status"
            className="mb-5 rounded-xl bg-mint p-4 text-sm leading-6 text-brand"
          >
            {message}
          </p>
        )}
        <fieldset disabled={locked} className="min-w-0 border-0 p-0">
          {step === 0 && <BusinessStep {...props} />}
          {step === 1 && <ServicesStep {...props} />}
          {step === 2 && (
            <OnboardingPhotos
              cover={data.provider?.coverImage ?? ""}
              images={data.images}
              onCover={(url) =>
                setData((current) =>
                  current && current.provider
                    ? {
                        ...current,
                        provider: { ...current.provider, coverImage: url },
                      }
                    : current,
                )
              }
              onImages={(images) =>
                setData((current) =>
                  current ? { ...current, images } : current,
                )
              }
              onBusy={setPhotoBusy}
            />
          )}
          {step === 3 && <ContactStep {...props} />}
          {step === 4 && (
            <>
              <OnboardingPreview
                draft={draft}
                categories={categories}
                cover={data.provider?.coverImage ?? ""}
                images={data.images}
              />
              <button className="onb-secondary mt-6" onClick={() => go(0)}>
                Editar información
              </button>
            </>
          )}
          {step === 5 && (
            <div className="space-y-5">
              <p className="text-sm leading-7 text-muted">
                Revisá tu solicitud antes de enviarla. Tu perfil quedará
                pendiente y todavía no será visible para las familias.
              </p>
              <dl className="grid gap-4 rounded-3xl bg-mint p-5 text-sm sm:grid-cols-2">
                {[
                  ["Nombre", draft.businessName],
                  [
                    "Categoría",
                    categories.find((c) => c.slug === draft.categorySlug)
                      ?.name ?? "",
                  ],
                  [
                    "Zona / ciudad",
                    [draft.zone, draft.city].filter(Boolean).join(", "),
                  ],
                  ["WhatsApp", draft.whatsapp],
                  ["Servicios", String(draft.services.length)],
                  [
                    "Fotos",
                    String(
                      data.images.length + (data.provider?.coverImage ? 1 : 0),
                    ),
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="mt-1 break-words font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
              <label className="flex min-h-12 items-start gap-3 text-sm leading-7">
                <input
                  id="confirmed"
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => {
                    setConfirmed(e.target.checked);
                    setErrors({});
                  }}
                  aria-invalid={Boolean(errors.confirmed)}
                  aria-describedby={
                    errors.confirmed ? "confirmed-error" : undefined
                  }
                  className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--teal)]"
                />
                Confirmo que la información cargada es correcta.
              </label>
              {errors.confirmed && (
                <p id="confirmed-error" role="alert" className="onb-error">
                  {errors.confirmed}
                </p>
              )}
            </div>
          )}
        </fieldset>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-brand/10 pt-6">
          <button
            disabled={locked || step === 0}
            type="button"
            onClick={() => go(step - 1)}
            className="onb-secondary disabled:opacity-40"
          >
            ← Atrás
          </button>
          {step < 5 ? (
            <button
              disabled={locked}
              type="button"
              onClick={next}
              className="onb-primary"
            >
              {busy ? "Guardando…" : step === 4 ? "Continuar" : "Siguiente →"}
            </button>
          ) : (
            <button
              disabled={locked}
              type="button"
              onClick={() => save(true)}
              className="onb-primary"
            >
              {busy ? "Enviando…" : "Enviar a revisión"}
            </button>
          )}
        </div>
        <p className="mt-4 text-xs leading-6 text-muted">
          {localAvailable
            ? "Tu progreso se conserva temporalmente en este dispositivo. Usá Guardar progreso para guardarlo en tu cuenta."
            : "Este navegador no permite guardar progreso local. Usá Guardar progreso antes de salir."}
        </p>
      </div>
    </section>
  );
}
