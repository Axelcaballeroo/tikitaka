"use client";

import { useState } from "react";
export function ShareProfile({ name }: { name: string }) {
  const [message, setMessage] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Enlace copiado");
    } catch {
      setManualUrl(url);
      setMessage("Copiá el enlace para compartirlo");
    }
  };
  return (
    <div>
      <button
        type="button"
        onClick={share}
        className="min-h-11 w-full rounded-full border border-brand/20 px-5 py-3 text-sm font-bold text-brand transition hover:bg-mint"
      >
        Compartir ↗
      </button>
      <p role="status" className="mt-2 text-center text-xs text-muted">
        {message}
      </p>
      {manualUrl && (
        <input
          aria-label="Enlace del perfil"
          readOnly
          value={manualUrl}
          onFocus={(e) => e.target.select()}
          className="mt-2 w-full rounded-xl border border-brand/20 p-3 text-xs"
        />
      )}
    </div>
  );
}
