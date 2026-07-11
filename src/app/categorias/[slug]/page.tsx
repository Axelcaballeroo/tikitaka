import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryHero } from "@/components/marketplace/category-hero";
import { CategoryCard } from "@/components/marketplace/category-card";
import { ProviderCard } from "@/components/marketplace/provider-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { getCategories, getCategoryBySlug } from "@/lib/data/categories";
import { getProviders } from "@/lib/data/providers";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const category = await getCategoryBySlug(slug); if (!category) return { title: "Categoría" };
  const title = `${category.name} en Buenos Aires | Tiki Taka`; const description = `${category.description} Compará proveedores, opiniones y precios en Tiki Taka.`; const url = `/categorias/${slug}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "website" }, twitter: { card: "summary_large_image", title, description } };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const [category, categories, list] = await Promise.all([getCategoryBySlug(slug), getCategories(), getProviders({ categorySlug: slug })]); if (!category) notFound();
  const currentIndex = categories.findIndex((item) => item.slug === slug); const related = [categories[(currentIndex + 1) % categories.length], categories[(currentIndex + 2) % categories.length], categories[(currentIndex + 3) % categories.length]].filter(Boolean);
  const faqs = [[`¿Cómo elegir ${category.name.toLowerCase()} de confianza?`, "Revisá la descripción, cobertura, verificaciones y opiniones. Antes de contratar, conversá sobre disponibilidad, experiencia y condiciones."], ["¿Los precios publicados son finales?", "Son valores orientativos. Cada proveedor confirma el presupuesto según modalidad, fecha, duración y zona."], ["¿Cómo contacto a un proveedor?", "Podés abrir su perfil y escribirle directamente por WhatsApp, sin intermediarios."]];
  return <><Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Servicios", href: "/servicios" }, { label: category.name }]} /><CategoryHero category={category} count={list.length} /><section className="container-page py-14"><div className="flex items-end justify-between gap-5"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-brand">Opciones disponibles</p><h2 className="display mt-2 text-3xl font-semibold md:text-4xl">Proveedores de {category.name.toLowerCase()}</h2></div><Link href="/servicios" className="hidden text-sm font-extrabold text-brand sm:block">Ver todo el catálogo →</Link></div><div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{list.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div>{!list.length && <p className="rounded-3xl bg-mint p-8 text-muted">Estamos sumando nuevos perfiles en esta categoría.</p>}
    <section className="mt-18 grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-brand">Antes de elegir</p><h2 className="display mt-3 text-4xl font-semibold">Preguntas frecuentes</h2><p className="mt-4 leading-7 text-muted">Información útil para comparar opciones con más tranquilidad.</p></div><div className="space-y-3">{faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-teal-900/8 bg-white p-5"><summary className="cursor-pointer list-none font-extrabold">{question}<span className="float-right text-brand group-open:rotate-45">＋</span></summary><p className="mt-4 pr-8 text-sm leading-6 text-muted">{answer}</p></details>)}</div></section>
    <section className="mt-18"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-brand">También puede interesarte</p><h2 className="display mt-2 text-3xl font-semibold">Categorías relacionadas</h2><div className="mt-7 grid gap-4 md:grid-cols-3">{related.map((item) => <CategoryCard key={item.slug} category={item} />)}</div></section>
    <div className="mt-16 rounded-[2rem] bg-lilac p-9 text-center"><h2 className="display text-3xl font-semibold">¿Ofrecés este servicio? Publicá tu perfil en Tiki Taka.</h2><p className="mt-3 text-muted">Conectá con familias que ya están buscando en tu categoría.</p><ButtonLink href="/publicar" className="mt-6">Publicar mi servicio</ButtonLink></div>
  </section></>;
}
