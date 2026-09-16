import Link from "next/link";

export function NearbySection({ zones }: { zones: string[] }) {
  return <section className="container-page home-section !pt-0"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="home-eyebrow">Tu barrio, tus opciones</p><h2 className="home-title">Cerca tuyo</h2><p className="home-subtitle">Buenas propuestas, más cerca de la rutina de tu familia.</p></div><span aria-hidden className="text-4xl text-brand">⌖</span></div>{zones.length ? <div className="mt-7 flex flex-wrap gap-3">{zones.slice(0, 8).map((zone) => <Link key={zone} href={`/servicios?${new URLSearchParams({ location: zone })}`} className="rounded-2xl border border-brand/15 bg-white px-5 py-4 text-sm font-bold transition hover:bg-mint">{zone} <span aria-hidden className="ml-4 text-brand">↗</span></Link>)}</div> : <Link href="/servicios" className="mt-5 inline-flex py-3 text-sm font-bold text-brand">Buscá servicios por tu zona →</Link>}</section>;
}
