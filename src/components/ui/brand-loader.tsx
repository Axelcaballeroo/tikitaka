export function BrandLoader({ label = "Cargando" }: { label?: string }) {
  return <div className="brand-loader" role="status" aria-live="polite"><span className="brand-loader-mark" aria-hidden>TK</span><span>{label}…</span></div>;
}
