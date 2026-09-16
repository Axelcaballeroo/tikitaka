"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Provider } from "@/types";
export function ProviderDetailActions({
  provider,
  compact = false,
}: {
  provider: Provider;
  compact?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [confirm, setConfirm] = useState<{
      action: string;
      value?: boolean;
      label: string;
    } | null>(null);
  const lock = useRef(false);
  const send = async (action: string, value?: boolean, confirmed = false) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch(`/api/admin/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, value, confirmed }),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setMessage("Cambios guardados.");
      setConfirm(null);
      router.refresh();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "No se pudo completar la acción.",
      );
    } finally {
      setBusy(false);
      lock.current = false;
    }
  };
  const actions = [
    ...(provider.status !== "approved"
      ? [{ action: "approve", label: "Aprobar y publicar" }]
      : []),
    ...(provider.status === "approved"
      ? [
          {
            action: provider.published ? "hide" : "publish",
            label: provider.published ? "Ocultar perfil" : "Volver a publicar",
          },
        ]
      : []),
    {
      action: "verify",
      value: !provider.verified,
      label: provider.verified
        ? "Quitar verificación"
        : "Marcar como verificado",
    },
    {
      action: "feature",
      value: !provider.featured,
      label: provider.featured ? "Quitar destacado" : "Destacar proveedor",
    },
    ...(provider.status !== "rejected"
      ? [{ action: "reject", label: "Rechazar solicitud" }]
      : []),
  ];
  const buttons = (
    <div className="flex flex-wrap gap-2">
      {actions.map((item) => (
        <button
          key={item.action}
          disabled={busy}
          className={
            item.action === "approve" ? "onb-primary" : "onb-secondary"
          }
          onClick={() =>
            ["reject", "verify"].includes(item.action)
              ? setConfirm(item)
              : send(item.action, item.value)
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  );
  return (
    <div>
      {compact ? (
        <details className="relative">
          <summary className="cursor-pointer py-3 text-sm font-bold text-brand">
            Más acciones
          </summary>
          <div className="mt-2 rounded-xl bg-mint/40 p-3">{buttons}</div>
        </details>
      ) : (
        buttons
      )}
      {confirm && (
        <div
          role="alertdialog"
          aria-label={confirm.label}
          aria-modal="false"
          className="mt-4 rounded-2xl border border-brand/20 bg-mint p-4"
        >
          <h3 className="font-bold">
            {confirm.label}: {provider.name}
          </h3>
          <p className="mt-2 text-sm">
            {confirm.action === "reject"
              ? "Se conservará su información y dejará de ser público."
              : "La verificación es una señal editorial de Tiki Taka. No modifica la publicación."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              autoFocus
              disabled={busy}
              className="onb-primary"
              onClick={() => send(confirm.action, confirm.value, true)}
            >
              Confirmar
            </button>
            <button
              disabled={busy}
              className="onb-secondary"
              onClick={() => setConfirm(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {message && (
        <p role="status" className="mt-3 rounded-xl bg-mint p-3 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
