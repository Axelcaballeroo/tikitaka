"use client";

import { GeographyFields } from "@/components/geography-fields";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category } from "@/types";
import { createBrowserClient } from "@/lib/supabase/client";

const initial = {
  fullName: "",
  email: "",
  password: "",
  businessName: "",
  categorySlug: "",
  zone: "",
  city: "",
  whatsapp: "",
};
export function RegisterForm({
  categories,
  nextPath = "/publicar",
}: {
  categories: Category[];
  nextPath?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof initial, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const supabase = createBrowserClient();
      const login = supabase
        ? await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          })
        : null;
      if (login && !login.error) {
        router.push(nextPath);
        router.refresh();
        return;
      }
      setSuccess(
        "Cuenta creada. Revisá tu email para confirmar la cuenta y después iniciá sesión.",
      );
      setForm(initial);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear la cuenta.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      onSubmit={submit}
      className="rounded-[2rem] bg-white p-7 soft-shadow md:p-9"
    >
      <h1 className="display text-4xl font-semibold">
        Creá tu cuenta de proveedor
      </h1>
      <p className="mt-3 text-sm text-muted">
        Empezá tu perfil y dejalo listo para revisión.
      </p>
      {error && (
        <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
          {success}
        </p>
      )}
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Nombre completo">
          <input
            required
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Nombre del negocio">
          <input
            required
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Contraseña">
          <input
            required
            minLength={6}
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Categoría">
          <select
            required
            value={form.categorySlug}
            onChange={(e) => set("categorySlug", e.target.value)}
            className="input bg-white"
          >
            <option value="">Elegí una categoría</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <GeographyFields value={form} onChange={value => setForm(current => ({ ...current, ...value }))} required />
        <Field label="WhatsApp" className="sm:col-span-2">
          <input
            required
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            className="input"
          />
        </Field>
      </div>
      <button
        disabled={busy}
        className="mt-7 w-full rounded-full bg-brand py-3.5 font-extrabold text-white disabled:opacity-60"
      >
        {busy ? "Creando cuenta…" : "Crear cuenta →"}
      </button>
      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="font-extrabold text-brand"
        >
          Ingresá
        </Link>
      </p>
      <style jsx>{`
        .input {
          margin-top: 0.5rem;
          width: 100%;
          border: 1px solid var(--border-soft);
          border-radius: 0.75rem;
          padding: 0.75rem;
          outline: none;
        }
        .input:focus {
          border-color: var(--primary);
        }
      `}</style>
    </form>
  );
}
function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`text-sm font-extrabold ${className}`}>
      {label}
      {children}
    </label>
  );
}
