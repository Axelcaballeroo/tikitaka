import { GeographyFields } from "@/components/geography-fields";
import type { Category } from "@/types";
import type { OnboardingDraft, OnboardingService } from "@/lib/onboarding";
import { parseCoverage, parseSchedule, scheduleDays, serializeCoverage, serializeSchedule } from "@/lib/onboarding";
import { useState } from "react";

type Props = {
  draft: OnboardingDraft;
  categories: Category[];
  errors: Record<string, string>;
  update: (
    key: keyof OnboardingDraft,
    value: string | OnboardingService[],
  ) => void;
};
export function OnboardingField({
  label,
  name,
  error,
  help,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={name} className="text-sm font-bold">
        {label}
      </label>
      {children}
      {help && <p className="mt-2 text-xs leading-5 text-muted">{help}</p>}
      {error && (
        <p
          id={`${name}-error`}
          role="alert"
          className="mt-2 text-xs font-bold text-rose-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
export function BusinessStep({ draft, categories, errors, update }: Props) {
  return (
    <div className="space-y-5">
      <OnboardingField
        label="Nombre del negocio / profesional"
        name="businessName"
        error={errors.businessName}
        help="Este será el nombre que verán las familias."
      >
        <input
          id="businessName"
          maxLength={100}
          value={draft.businessName}
          onChange={(e) => update("businessName", e.target.value)}
          aria-invalid={Boolean(errors.businessName)}
          aria-describedby={
            errors.businessName ? "businessName-error" : undefined
          }
          autoComplete="organization"
          className="onb-input"
        />
      </OnboardingField>
      <OnboardingField
        label="Categoría"
        name="categorySlug"
        error={errors.categorySlug}
      >
        <select
          id="categorySlug"
          value={draft.categorySlug}
          onChange={(e) => update("categorySlug", e.target.value)}
          aria-invalid={Boolean(errors.categorySlug)}
          aria-describedby={
            errors.categorySlug ? "categorySlug-error" : undefined
          }
          className="onb-input"
        >
          <option value="">Elegí una categoría</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </OnboardingField>
      <OnboardingField
        label="Descripción breve"
        name="description"
        error={errors.description}
        help={`${draft.description.length}/2000 caracteres. Contá qué ofrecés y a quién acompañás.`}
      >
        <textarea
          id="description"
          rows={5}
          maxLength={2000}
          value={draft.description}
          onChange={(e) => update("description", e.target.value)}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
          className="onb-input"
        />
      </OnboardingField>
    </div>
  );
}
export function ServicesStep({ draft, errors, update }: Props) {
  const set = (index: number, key: keyof OnboardingService, value: string) =>
    update(
      "services",
      draft.services.map((service, i) =>
        i === index ? { ...service, [key]: value } : service,
      ),
    );
  return (
    <div className="space-y-5">
      <p className="text-sm leading-7 text-muted">
        Mostrá tus propuestas. Si trabajás con presupuesto, elegí Consultar
        precio. También podés agregar servicios después desde tu panel.
      </p>
      {errors.services && (
        <p role="alert" className="onb-error">
          {errors.services}
        </p>
      )}
      {draft.services.map((service, index) => (
        <section
          key={service.id}
          className="space-y-4 rounded-3xl border border-brand/15 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">Servicio {index + 1}</h3>
            <button
              type="button"
              onClick={() =>
                update(
                  "services",
                  draft.services.filter((_, i) => i !== index),
                )
              }
              className="min-h-11 text-xs font-bold text-rose-700"
            >
              Eliminar servicio {index + 1}
            </button>
          </div>
          <OnboardingField
            label="Título del servicio"
            name={`service-${index}-title`}
            error={errors[`service-${index}-title`]}
          >
            <input
              id={`service-${index}-title`}
              value={service.title}
              maxLength={100}
              onChange={(e) => set(index, "title", e.target.value)}
              aria-invalid={Boolean(errors[`service-${index}-title`])}
              aria-describedby={
                errors[`service-${index}-title`]
                  ? `service-${index}-title-error`
                  : undefined
              }
              className="onb-input"
            />
          </OnboardingField>
          <OnboardingField
            label="Descripción del servicio (opcional)"
            name={`service-${index}-description`}
            error={errors[`service-${index}-description`]}
          >
            <textarea
              id={`service-${index}-description`}
              rows={3}
              maxLength={1000}
              value={service.description}
              onChange={(e) => set(index, "description", e.target.value)}
              className="onb-input"
            />
          </OnboardingField>
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={service.priceFrom === ""}
              onChange={(e) =>
                set(index, "priceFrom", e.target.checked ? "" : "0")
              }
              className="h-4 w-4 accent-[var(--teal)]"
            />
            Consultar precio
          </label>
          {service.priceFrom !== "" && (
            <OnboardingField
              label="Precio desde (ARS)"
              name={`service-${index}-priceFrom`}
              error={errors[`service-${index}-priceFrom`]}
            >
              <input
                id={`service-${index}-priceFrom`}
                type="number"
                min="0"
                max="1000000000"
                step="0.01"
                value={service.priceFrom}
                onChange={(e) => set(index, "priceFrom", e.target.value)}
                className="onb-input"
              />
            </OnboardingField>
          )}
        </section>
      ))}
      <button
        type="button"
        disabled={draft.services.length >= 5}
        onClick={() =>
          update("services", [
            ...draft.services,
            {
              id: crypto.randomUUID(),
              title: "",
              description: "",
              priceFrom: "",
            },
          ])
        }
        className="onb-secondary"
      >
        + Agregar otro servicio
      </button>
      <p className="text-xs text-muted">Hasta 5 servicios en este paso.</p>
    </div>
  );
}
function CoverageInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [input, setInput] = useState("");
  const tags = parseCoverage(value);
  const add = () => { const next = input.trim().replace(/[,;]+$/, ""); if (!next) return; onChange(serializeCoverage([...tags, next])); setInput(""); };
  return <div className="onb-chip-field"><div className="onb-chips" aria-label="Zonas adicionales">{tags.map(tag => <span key={tag}>{tag}<button type="button" aria-label={`Quitar ${tag}`} onClick={() => onChange(serializeCoverage(tags.filter(item => item !== tag)))}>×</button></span>)}</div><div className="onb-chip-entry"><input id="coverage" value={input} maxLength={100} placeholder="Agregar zona o localidad…" onChange={event => setInput(event.target.value)} onBlur={add} onKeyDown={event => { if (["Enter", ","].includes(event.key)) { event.preventDefault(); add(); } }} /><button type="button" onMouseDown={event => event.preventDefault()} onClick={add}>Agregar</button></div></div>;
}
function ScheduleInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const parsed = parseSchedule(value);
  const setDefined = (days = parsed.days.length ? parsed.days : ["L", "M", "X", "J", "V"], from = parsed.from, to = parsed.to) => onChange(serializeSchedule("defined", days, from, to));
  return <fieldset className="onb-schedule"><legend className="sr-only">¿Cuándo atendés?</legend><div className="onb-schedule-modes"><label><input type="radio" name="scheduleMode" checked={parsed.mode === "defined"} onChange={() => setDefined()} /> Con horario definido</label><label><input type="radio" name="scheduleMode" checked={parsed.mode === "flexible"} onChange={() => onChange("A coordinar")} /> A coordinar</label></div>{parsed.mode === "defined" && <div className="onb-schedule-detail"><div className="onb-days" aria-label="Días de atención">{scheduleDays.map(([code, label]) => <button type="button" key={code} title={label} aria-pressed={parsed.days.includes(code)} onClick={() => setDefined(parsed.days.includes(code) ? parsed.days.filter(day => day !== code) : [...parsed.days, code])}>{code}</button>)}</div><div className="onb-times"><label>Desde<input type="time" value={parsed.from} onChange={event => setDefined(parsed.days, event.target.value, parsed.to)} /></label><label>Hasta<input type="time" value={parsed.to} onChange={event => setDefined(parsed.days, parsed.from, event.target.value)} /></label></div></div>}</fieldset>;
}
export function ContactStep({ draft, errors, update }: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <GeographyFields value={draft} onChange={value => { update("zone", value.zone); update("city", value.city); }} required errors={errors} />
      {(
        [
          ["WhatsApp", "whatsapp", "tel"],
          ["Email de contacto", "email", "email"],
          ["Provincia", "province", "text"],
        ] as const
      ).map(([label, key, type]) => (
        <OnboardingField
          key={key}
          label={label}
          name={key}
          error={errors[key]}
          help={
            key === "whatsapp"
              ? "Incluí código de país. Ejemplo: 54 9 11 2345 6789."
              : undefined
          }
        >
          <input
            id={key}
            type={type}
            inputMode={key === "whatsapp" ? "tel" : undefined}
            maxLength={key === "email" ? 254 : key === "whatsapp" ? 30 : 100}
            value={draft[key]}
            onChange={(e) => update(key, e.target.value)}
            aria-invalid={Boolean(errors[key])}
            aria-describedby={errors[key] ? `${key}-error` : undefined}
            className="onb-input"
          />
        </OnboardingField>
      ))}
      <div className="sm:col-span-2">
        <OnboardingField
          label="¿También trabajás en otras zonas?"
          name="coverage"
          error={errors.coverage}
          help="Agregá sólo las localidades extra donde prestás servicio."
        >
          <CoverageInput value={draft.coverage} onChange={value => update("coverage", value)} />
        </OnboardingField>
      </div>
      <div className="sm:col-span-2">
        <OnboardingField
          label="¿Cuándo atendés?"
          name="schedule"
          error={errors.schedule}
        >
          <ScheduleInput value={draft.schedule} onChange={value => update("schedule", value)} />
        </OnboardingField>
      </div>
      <aside className="onb-privacy sm:col-span-2"><span aria-hidden>♡</span><div><strong>Tu privacidad primero</strong><p>Las familias podrán escribirte por WhatsApp sin que tengas que publicar tu dirección exacta.</p></div></aside>
    </div>
  );
}
