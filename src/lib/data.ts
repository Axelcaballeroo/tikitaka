import type { Category, Provider } from "@/types";

export const categories: Category[] = [
  { slug: "nineras", name: "Niñeras", icon: "☀", description: "Cuidado cercano y de confianza", color: "bg-blush" },
  { slug: "jardines-maternales", name: "Jardines maternales", icon: "⌂", description: "Primeros aprendizajes felices", color: "bg-mint" },
  { slug: "salones-de-fiestas", name: "Salones de fiestas", icon: "✦", description: "Cumples que quedan en la memoria", color: "bg-lilac" },
  { slug: "animadores", name: "Animadores", icon: "☺", description: "Diversión para cada celebración", color: "bg-amber-100" },
  { slug: "clases-particulares", name: "Clases particulares", icon: "✎", description: "Acompañamiento para aprender", color: "bg-sky-100" },
  { slug: "psicopedagogia", name: "Psicopedagogía", icon: "♡", description: "Apoyo profesional y humano", color: "bg-rose-100" },
  { slug: "inflables", name: "Inflables", icon: "☁", description: "Juegos gigantes, sonrisas también", color: "bg-violet-100" },
  { slug: "transporte-escolar", name: "Transporte escolar", icon: "→", description: "Traslados cuidados y puntuales", color: "bg-yellow-100" },
];

const seeds = [
  ["manos-que-cuidan","Manos que cuidan","Niñeras","nineras","Palermo","Acompañamiento amoroso y responsable para cada etapa de tu familia.",4.9,48,8500,"photo-1544717305-2782549b5136"],
  ["jardin-la-ronda","Jardín La Ronda","Jardines maternales","jardines-maternales","Belgrano","Un espacio cálido donde jugar, explorar y crecer con confianza.",4.8,36,180000,"photo-1503454537195-1dcabb73ffb9"],
  ["fiesta-nube","Fiesta Nube","Salones de fiestas","salones-de-fiestas","Villa Urquiza","Celebraciones luminosas, cuidadas y pensadas para disfrutar en familia.",4.9,71,240000,"photo-1530103862676-de8c9debad1d"],
  ["club-de-risas","Club de Risas","Animadores","animadores","Caballito","Juegos, música y propuestas creativas para cumpleaños inolvidables.",4.7,29,45000,"photo-1527529482837-4698179dc6ce"],
  ["profe-cata","Profe Cata","Clases particulares","clases-particulares","Recoleta","Apoyo escolar personalizado, con paciencia y objetivos claros.",5,22,9000,"photo-1509062522246-3755977927d7"],
  ["espacio-brote","Espacio Brote","Psicopedagogía","psicopedagogia","Almagro","Evaluación y acompañamiento integral para aprender con bienestar.",4.9,41,22000,"photo-1596464716127-f2a82984de30"],
  ["salta-salta","Salta Salta","Inflables","inflables","San Isidro","Inflables seguros, limpios y listos para transformar cualquier fiesta.",4.6,18,60000,"photo-1509924603848-aca5e0027ab6"],
  ["ruta-kids","Ruta Kids","Transporte escolar","transporte-escolar","Núñez","Traslados escolares con seguimiento, puntualidad y mucha atención.",4.8,55,95000,"photo-1501349800519-48093d60bde0"],
] as const;

export const providers: Provider[] = seeds.map((p, i) => ({
  id: String(i + 1), slug: p[0], name: p[1], category: p[2], categorySlug: p[3], zone: p[4], city: "Buenos Aires",
  description: p[5], rating: p[6], reviewsCount: p[7], priceFrom: p[8], verified: i !== 6, featured: i < 3,
  image: `https://images.unsplash.com/${p[9]}?auto=format&fit=crop&w=1000&q=85`,
  services: ["Atención personalizada", "Consulta inicial", "Propuesta a medida"], coverage: [p[4], "CABA"], schedule: "Lunes a sábados, 9 a 19 h",
}));

export const stats = [
  ["+80", "proveedores infantiles"], ["+300", "familias conectadas"], ["10", "categorías disponibles"], ["1", "ciudad para empezar"],
];
