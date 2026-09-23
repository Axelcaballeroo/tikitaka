"use client";
import { FormEvent, useState } from "react";
import type { AccountService } from "@/lib/auth/account";
const empty = { title: "", description: "", priceFrom: 0 };

export function ServicesEditor({ initialServices }: { providerId: string; initialServices: AccountService[] }) {
  const [services, setServices] = useState(initialServices);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const response = await fetch(editing ? `/api/dashboard/services/${editing}` : "/api/dashboard/services", {
      method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const result = await response.json();
    if (!response.ok) setError(result.error || "No pudimos guardar el servicio.");
    else { setServices(current => editing ? current.map(item => item.id === editing ? result.service : item) : [...current, result.service]); setForm(empty); setEditing(null); }
    setBusy(false);
  }
  async function remove(id: string) {
    if (!confirm("¿Eliminar este servicio?")) return;
    const response = await fetch(`/api/dashboard/services/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (response.ok) setServices(current => current.filter(item => item.id !== id)); else setError(result.error || "No pudimos eliminar el servicio.");
  }
  return <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1fr_340px]">
    <div className="space-y-4">{services.length ? services.map(item => <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex justify-between gap-4"><div><h2 className="font-extrabold">{item.title}</h2><p className="mt-2 text-sm text-muted">{item.description}</p><p className="mt-3 text-sm font-extrabold text-brand">Desde ARS {item.priceFrom.toLocaleString("es-AR")}</p></div><div className="flex gap-3 text-xs"><button onClick={() => { setEditing(item.id); setForm({ title: item.title, description: item.description, priceFrom: item.priceFrom }); }} className="font-bold text-brand">Editar</button><button onClick={() => remove(item.id)} className="font-bold text-rose-700">Eliminar</button></div></div></article>) : <p className="rounded-2xl bg-mint p-8 text-center text-muted">Todavía no agregaste servicios.</p>}</div>
    <form onSubmit={save} className="rounded-2xl bg-white p-5 shadow-sm xl:sticky xl:top-24"><h2 className="display text-2xl font-semibold">{editing ? "Editar servicio" : "Nuevo servicio"}</h2>{error && <p className="mt-3 text-xs text-rose-700">{error}</p>}<label className="mt-5 block text-sm font-extrabold">Título<input required minLength={2} maxLength={100} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label><label className="mt-4 block text-sm font-extrabold">Descripción<textarea maxLength={1000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label><label className="mt-4 block text-sm font-extrabold">Precio desde<input type="number" min="0" max="1000000000" value={form.priceFrom} onChange={e => setForm({ ...form, priceFrom: Number(e.target.value) })} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label><button disabled={busy} className="mt-5 w-full rounded-full bg-brand py-3 font-extrabold text-white disabled:opacity-60">{busy ? "Guardando…" : "Guardar"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="mt-2 w-full text-xs font-bold text-muted">Cancelar</button>}</form>
  </div>;
}
