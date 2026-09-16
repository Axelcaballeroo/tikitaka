import type { Category } from "@/types";

// Reuse photography and category slugs already present in the project.
export const homePhoto = "https://images.unsplash.com/photo-1602030028438-4cf153cbae9e?auto=format&fit=crop&w=1200&q=85";
export const collections = [
  { name: "Cumpleaños", tagline: "Celebremos a lo grande", description: "Salones, animadores y todo para su fiesta.", slugs: ["salones-de-fiestas", "animadores", "inflables", "fotografos"], icon: "✦", color: "bg-lilac", moment: "Se viene su cumple 🎈", detail: "Salones, animadores, catering, fotógrafos e inflables.", photo: "1530103862676-de8c9debad1d" },
  { name: "Cuidado infantil", tagline: "Siempre bien cuidados", description: "Niñeras, jardines y espacios infantiles.", slugs: ["nineras", "jardines-maternales"], icon: "♡", color: "bg-blush", moment: "Necesitás alguien que lo cuide 🧸", detail: "Niñeras y jardines maternales.", photo: "1544717305-2782549b5136" },
  { name: "Educación", tagline: "Aprender también puede ser divertido", description: "Apoyo escolar, idiomas y aprendizaje.", slugs: ["clases-particulares", "psicopedagogia", "idiomas"], icon: "✎", color: "bg-mint", moment: "Necesita apoyo con el cole 📚", detail: "Profesores, psicopedagogos e idiomas.", photo: "1509062522246-3755977927d7" },
  { name: "Salud & Desarrollo", tagline: "Acompañarlos en cada etapa", description: "Profesionales de salud y desarrollo infantil.", slugs: ["psicopedagogia", "fonoaudiologia", "estimulacion-temprana"], icon: "✿", color: "bg-blush" },
  { name: "Actividades", tagline: "Descubrir lo que les apasiona", description: "Deportes, arte, música y robótica.", slugs: ["colonias", "robotica", "deportes", "danza", "musica", "arte"], icon: "☼", color: "bg-sun/40", moment: "¿Una actividad nueva? ⚽", detail: "Deportes, danza, música, arte y robótica.", photo: "1472162072942-cd5147eb3902" },
  { name: "Transporte", tagline: "Llegar seguros también importa", description: "Opciones de transporte para chicos.", slugs: ["transporte-escolar"], icon: "→", color: "bg-lilac/60" },
];

export function collectionHref(slugs: string[], categories: Category[]) {
  const available = slugs.filter((slug) => categories.some((category) => category.slug === slug));
  return available.length ? `/servicios?${new URLSearchParams({ category: available.join(",") })}` : "/servicios";
}
