"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

export function RegisterForm({ initialType = null, customerEnabled = false }: {
  initialType?: "provider" | "customer" | null; customerEnabled?: boolean;
}) {
  const [type, setType] = useState(initialType);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setSuccess("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")), password = String(form.get("password"));
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountType: type, fullName: form.get("fullName"), email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (!result.requiresEmailConfirmation) {
        const db = createBrowserClient();
        const login = db ? await db.auth.signInWithPassword({ email, password }) : null;
        if (login && !login.error) { window.location.assign(`/auth/continuar${type === "provider" ? "?next=%2Fpublicar" : ""}`); return; }
      }
      setSuccess("Cuenta creada. Revisá tu email para confirmar la cuenta y después iniciá sesión.");
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos crear la cuenta."); }
    finally { setBusy(false); }
  }
  return <div className="rounded-[2rem] bg-white p-6 soft-shadow sm:p-9">
    <p className="home-eyebrow">Tu lugar en Tiki Taka</p>
    <h1 className="display mt-3 text-3xl font-semibold sm:text-4xl">¿Cómo querés usar Tiki Taka?</h1>
    <div className="mt-7 grid gap-4 sm:grid-cols-2" role="group" aria-label="Tipo de cuenta">
      {([['customer', 'Soy familia', 'Quiero encontrar servicios para mis hijos.', '♡'], ['provider', 'Soy proveedor', 'Quiero publicar y hacer crecer mi servicio.', '↗']] as const).map(([value, title, copy, icon]) =>
        <button key={value} type="button" aria-pressed={type === value} disabled={busy} onClick={() => { setType(value); setError(""); setSuccess(""); }}
          className={`rounded-3xl border-2 p-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${type === value ? 'border-brand bg-mint' : 'border-brand/10 bg-cream hover:border-brand/50'}`}>
          <span aria-hidden className="mb-3 block text-3xl text-brand">{icon}</span><span className="block text-lg font-extrabold">{title}</span><span className="mt-2 block text-sm leading-6 text-muted">{copy}</span>
        </button>)}
    </div>
    {type && <form key={type} onSubmit={submit} className="mt-7">
      <h2 className="text-xl font-extrabold">{type === "customer" ? "Creá tu cuenta de familia" : "Creá tu cuenta de proveedor"}</h2>
      <p className="mt-2 text-sm text-muted">{type === "customer" ? "Un espacio simple para encontrar lo que tu familia necesita." : "Primero tu cuenta. Después completás los datos de tu servicio."}</p>
      {type === "customer" && !customerEnabled && <p role="status" className="mt-4 rounded-2xl bg-mint p-4 text-sm">Las cuentas de familia estarán disponibles pronto. Ya podés <Link className="font-bold underline" href="/servicios">explorar servicios</Link> y guardar favoritos.</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {success && <p role="status" className="mt-4 rounded-xl bg-mint p-4 text-sm">{success} <Link className="font-bold underline" href={`/login${type === "provider" ? '?next=%2Fpublicar' : ''}`}>Iniciar sesión</Link></p>}
      <div className="mt-5 grid gap-5">
        {([['fullName', 'Nombre completo', 'text', 'name'], ['email', 'Email', 'email', 'email'], ['password', 'Contraseña', 'password', 'new-password']] as const).map(([name, label, inputType, autoComplete]) =>
          <label key={name} className="text-sm font-extrabold">{label}<input name={name} type={inputType} autoComplete={autoComplete} required minLength={name === 'password' ? 6 : undefined} maxLength={name === 'fullName' ? 120 : name === 'password' ? 128 : 254} className="mt-2 w-full rounded-xl border border-brand/15 p-3 outline-brand" /></label>)}
      </div>
      <button disabled={busy || !!success || (type === 'customer' && !customerEnabled)} className="mt-6 w-full rounded-full bg-brand px-5 py-3.5 font-extrabold text-white disabled:opacity-50">{busy ? 'Creando cuenta…' : 'Crear cuenta →'}</button>
    </form>}
    <p className="mt-6 text-center text-sm text-muted">¿Ya tenés cuenta? <Link href={`/login${type === 'provider' ? '?next=%2Fpublicar' : ''}`} className="font-extrabold text-brand">Ingresá</Link></p>
  </div>;
}
