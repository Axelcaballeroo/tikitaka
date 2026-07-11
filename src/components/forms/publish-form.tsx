"use client";

import { FormEvent, useState } from "react";
import type { Category } from "@/types";

type FormState = { businessName: string; category: string; zone: string; whatsapp: string; email: string; message: string };
const emptyForm: FormState = { businessName: "", category: "", zone: "", whatsapp: "", email: "", message: "" };

export function PublishForm({ categories }: { categories: Category[] }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof FormState, value: string) => { setForm((current) => ({ ...current, [field]: value })); setError(""); setSuccess(false); };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (Object.values(form).some((value) => !value.trim())) { setError("Completá todos los campos para enviar tu solicitud."); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { setError("Ingresá un email válido."); return; }
    if (form.whatsapp.replace(/\D/g, "").length < 8) { setError("Ingresá un número de WhatsApp válido."); return; }

    setSubmitting(true);
    try {
      const response = await fetch("/api/provider-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No pudimos enviar la solicitud.");
      setForm(emptyForm); setError(""); setSuccess(true);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "No pudimos enviar tu solicitud. Intentá nuevamente."); }
    finally { setSubmitting(false); }
  };

  return <form onSubmit={handleSubmit} noValidate className="rounded-[2rem] bg-white p-7 shadow-[0_18px_55px_rgba(20,78,72,.11)] md:p-10">
    <p className="text-xs font-extrabold uppercase tracking-[.16em] text-brand">Empezá hoy</p><h2 className="display mt-3 text-3xl font-semibold">Contanos sobre tu servicio</h2><p className="mt-2 text-sm leading-6 text-muted">Completá estos datos y te ayudaremos a preparar un perfil que se destaque.</p>
    {success && <div role="status" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900"><strong className="block">¡Solicitud recibida!</strong>Recibimos tu solicitud. El equipo de Tiki Taka se va a contactar para ayudarte a crear tu perfil.</div>}
    {error && <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">{error}</div>}
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      <Field label="Nombre del negocio" required><input value={form.businessName} onChange={(event) => update("businessName", event.target.value)} autoComplete="organization" placeholder="Ej: Club de Risas" className="field" /></Field>
      <Field label="Categoría" required><select value={form.category} onChange={(event) => update("category", event.target.value)} className="field bg-white"><option value="">Elegí una categoría</option>{categories.map((category) => <option key={category.slug} value={category.name}>{category.name}</option>)}</select></Field>
      <Field label="Zona" required><input value={form.zone} onChange={(event) => update("zone", event.target.value)} placeholder="Ej: Palermo" className="field" /></Field>
      <Field label="WhatsApp" required><input value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} inputMode="tel" autoComplete="tel" placeholder="11 2345 6789" className="field" /></Field>
      <Field label="Email" required className="sm:col-span-2"><input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" autoComplete="email" placeholder="hola@tuservicio.com" className="field" /></Field>
      <Field label="Mensaje" required className="sm:col-span-2"><textarea value={form.message} onChange={(event) => update("message", event.target.value)} rows={5} placeholder="Contanos qué ofrecés, qué hace especial tu propuesta y a qué familias te gustaría llegar." className="field resize-none" /></Field>
    </div>
    <button type="submit" disabled={submitting} className="mt-6 w-full rounded-full bg-brand px-7 py-3.5 font-extrabold text-white shadow-lg shadow-teal-900/10 transition hover:-translate-y-0.5 hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto">{submitting ? "Enviando…" : "Enviar solicitud →"}</button><p className="mt-4 text-xs leading-5 text-muted">Al enviar aceptás que Tiki Taka te contacte para conversar sobre tu publicación.</p>
    <style jsx>{`.field { margin-top: .5rem; width: 100%; border-radius: .85rem; border: 1px solid rgba(14,95,88,.14); padding: .85rem; font-weight: 400; outline: none; } .field:focus { border-color: #167f75; box-shadow: 0 0 0 3px rgba(22,127,117,.1); }`}</style>
  </form>;
}

function Field({ label, required, className = "", children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) { return <label className={`text-sm font-extrabold ${className}`}>{label}{required && <span className="ml-1 text-rose-500">*</span>}{children}</label>; }
