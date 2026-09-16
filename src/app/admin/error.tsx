"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="rounded-3xl bg-white p-8">
      <h1 className="display text-3xl">No pudimos cargar esta pantalla</h1>
      <p className="mt-4 text-sm text-muted">
        Los datos siguen guardados. Intentá nuevamente en unos momentos.
      </p>
      <button className="onb-primary mt-6" onClick={reset}>
        Volver a intentar
      </button>
    </section>
  );
}
