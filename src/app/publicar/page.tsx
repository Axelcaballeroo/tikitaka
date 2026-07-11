import type { Metadata } from "next";
import { PublishForm } from "@/components/forms/publish-form";
import { PageHero } from "@/components/marketplace/page-hero";
import { getCategories } from "@/lib/data/categories";

export const metadata: Metadata = { title: "Publicá tu servicio infantil", description: "Mostrá tu servicio en Tiki Taka y conectá con familias que ya están buscando." };
export const dynamic = "force-dynamic";

const benefits = [
  ["01", "Llegás a padres que ya están buscando", "Tu propuesta aparece frente a familias con una necesidad concreta."],
  ["02", "Ahorrás tiempo respondiendo consultas repetidas", "Centralizá la información importante en un perfil claro."],
  ["03", "Mostrás tu propuesta de forma profesional", "Fotos, servicios, cobertura y precios en un solo lugar."],
  ["04", "Generás confianza con reseñas y verificaciones", "Construí una reputación que acompañe el crecimiento de tu servicio."],
];
const plans = [
  { name: "Básico", price: "Gratis", text: "Para empezar a mostrar tu servicio.", features: ["Perfil público", "Contacto por WhatsApp", "Hasta 3 fotos"] },
  { name: "Profesional", price: "ARS 15.000/mes", text: "Más herramientas para crecer.", features: ["Todo lo del plan Básico", "Perfil verificado", "Hasta 10 fotos", "Estadísticas de visitas"], popular: true },
  { name: "Premium", price: "ARS 35.000/mes", text: "Máxima visibilidad en el marketplace.", features: ["Todo lo del plan Profesional", "Posición destacada", "Badge Premium", "Acompañamiento personalizado"] },
];

export default async function PublishPage() { const categories = await getCategories(); return <>
  <PageHero eyebrow="Para proveedores" title="Conseguí más familias interesadas en tu servicio infantil." text="Creá tu perfil, mostrá fotos, precios y zona de cobertura, y recibí consultas directas por WhatsApp." />
  <section className="container-page py-16"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-brand">Crecer en comunidad</p><h2 className="display mt-3 text-4xl font-semibold">¿Por qué publicar en Tiki Taka?</h2></div><div className="mt-10 grid gap-4 md:grid-cols-2">{benefits.map(([number, title, text]) => <article key={number} className="flex gap-5 rounded-[1.75rem] border border-teal-900/6 bg-white p-6 soft-shadow"><span className="display text-3xl font-semibold text-brand/25">{number}</span><div><h3 className="font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{text}</p></div></article>)}</div></section>
  <section className="bg-mint py-16"><div className="container-page"><div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-brand">Planes simples</p><h2 className="display mt-3 text-4xl font-semibold">Elegí cómo querés crecer</h2><p className="mt-3 text-muted">No se realizan pagos en esta etapa. Los planes son informativos.</p></div><div className="mt-10 grid items-stretch gap-6 lg:grid-cols-3">{plans.map((plan) => <article key={plan.name} className={`relative rounded-[2rem] p-7 ${plan.popular ? "bg-brand text-white shadow-xl shadow-teal-900/20" : "bg-white"}`}>{plan.popular && <span className="absolute -top-3 right-6 rounded-full bg-sun px-3 py-1 text-xs font-extrabold text-ink">Más elegido</span>}<h3 className="display text-2xl font-semibold">{plan.name}</h3><p className="mt-4 text-2xl font-extrabold">{plan.price}</p><p className={`mt-2 text-sm ${plan.popular ? "text-white/70" : "text-muted"}`}>{plan.text}</p><div className={`my-6 border-t ${plan.popular ? "border-white/15" : "border-teal-900/8"}`} /> <ul className="space-y-3 text-sm">{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul></article>)}</div></div></section>
  <section className="container-page py-16"><div className="grid items-start gap-10 lg:grid-cols-[.72fr_1.28fr]"><div className="lg:sticky lg:top-24"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-brand">Sumate a Tiki Taka</p><h2 className="display mt-3 text-4xl font-semibold">Tu próximo cliente puede estar buscándote hoy.</h2><p className="mt-5 leading-7 text-muted">Mandanos tus datos. Nuestro equipo revisará tu propuesta y se pondrá en contacto para ayudarte a preparar el perfil.</p><div className="mt-7 rounded-2xl bg-lilac p-5 text-sm leading-6"><strong className="block">Sin compromisos</strong><span className="text-muted">Enviar una solicitud es gratis y no activa ningún plan automáticamente.</span></div></div><PublishForm categories={categories} /></div></section>
  </>;
}
