const principles = [
  ["✓", "Perfiles verificados", "Buscá la insignia Verificado para identificar los perfiles con esa distinción."],
  ["☆", "Opiniones de otras familias", "Leé las experiencias disponibles en cada perfil."],
  ["≡", "Información clara", "Consultá servicios, zona de cobertura y precios cuando estén publicados."],
  ["↗", "Contacto directo", "Hablá con el proveedor y resolvé tus dudas antes de coordinar."],
  ["♡", "Proveedores revisados por Tiki Taka", "Los perfiles pasan por una aprobación antes de publicarse. La verificación es una distinción adicional."],
];

export function TrustSection() {
  return <section id="nosotros" className="container-page home-section scroll-mt-24"><div className="grid gap-10 rounded-[2rem] bg-[#f1eef9] p-6 md:p-12 lg:grid-cols-[.9fr_1.1fr]"><div><p className="home-eyebrow">Elegí con más información</p><h2 className="home-title">Elegir para tus hijos no es cualquier elección.</h2><p className="home-subtitle">Por eso queremos que tengas más información antes de contactar.</p><span aria-hidden className="mt-8 hidden text-7xl text-brand/60 lg:block">♡</span></div><div className="space-y-6">{principles.map(([icon, title, text]) => <div key={title} className="flex gap-4"><span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white font-bold text-brand">{icon}</span><div><h3 className="text-sm font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted">{text}</p></div></div>)}</div></div></section>;
}
