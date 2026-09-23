"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { safeReturnPath } from "@/lib/onboarding";
import { createBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    params.get("error") === "config"
      ? "Supabase Auth todavía no está configurado."
      : params.get("error") === "profile"
        ? "No pudimos verificar el tipo de cuenta. Contactá a Tiki Taka."
        : "",
  );
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createBrowserClient();
    if (!supabase) {
      setError("Supabase Auth no está configurado.");
      setBusy(false);
      return;
    }
    const { error: authError } =
      await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("Email o contraseña incorrectos.");
      setBusy(false);
      return;
    }
    window.location.assign(`/auth/continuar?next=${encodeURIComponent(safeReturnPath(params.get("next"), "/"))}`);
  };
  return (
    <form
      onSubmit={submit}
      className="rounded-[2rem] bg-white p-7 soft-shadow md:p-9"
    >
      <h1 className="display text-4xl font-semibold">Ingresá a tu cuenta</h1>
      <p className="mt-3 text-sm text-muted">
        Volvé a tu espacio en Tiki Taka.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800"
        >
          {error}
        </p>
      )}
      <label className="mt-7 block text-sm font-extrabold">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-teal-900/10 p-3 outline-brand"
        />
      </label>
      <label className="mt-5 block text-sm font-extrabold">
        Contraseña
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-teal-900/10 p-3 outline-brand"
        />
      </label>
      <button
        disabled={busy}
        className="mt-7 w-full rounded-full bg-brand py-3.5 font-extrabold text-white disabled:opacity-60"
      >
        {busy ? "Ingresando…" : "Ingresar →"}
      </button>
      <p className="mt-6 text-center text-sm text-muted">
        ¿Todavía no tenés cuenta?{" "}
        <Link
          href={`/registro?next=${encodeURIComponent(safeReturnPath(params.get("next"), "/"))}`}
          className="font-extrabold text-brand"
        >
          Registrate
        </Link>
      </p>
    </form>
  );
}
