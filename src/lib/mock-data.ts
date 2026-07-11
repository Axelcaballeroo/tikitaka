import type { Category, Provider } from "@/types";

export const categories: Category[] = [
  { slug: "nineras", name: "Niñeras", icon: "☀", description: "Cuidado cercano y de confianza para cada familia.", color: "bg-blush" },
  { slug: "jardines-maternales", name: "Jardines maternales", icon: "⌂", description: "Espacios amorosos para sus primeros aprendizajes.", color: "bg-mint" },
  { slug: "salones-de-fiestas", name: "Salones de fiestas", icon: "✦", description: "Lugares preparados para celebrar a lo grande.", color: "bg-lilac" },
  { slug: "animadores", name: "Animadores", icon: "☺", description: "Juegos y aventuras para cumpleaños inolvidables.", color: "bg-amber-100" },
  { slug: "transporte-escolar", name: "Transporte escolar", icon: "→", description: "Traslados cuidados, seguros y puntuales.", color: "bg-yellow-100" },
  { slug: "colonias", name: "Colonias", icon: "☼", description: "Días de movimiento, amistad y aire libre.", color: "bg-emerald-100" },
  { slug: "clases-particulares", name: "Clases particulares", icon: "✎", description: "Acompañamiento personalizado para aprender mejor.", color: "bg-sky-100" },
  { slug: "robotica", name: "Robótica", icon: "⚙", description: "Tecnología, creatividad y desafíos para explorar.", color: "bg-cyan-100" },
  { slug: "fotografos", name: "Fotógrafos", icon: "◉", description: "Recuerdos naturales de sus momentos más lindos.", color: "bg-orange-100" },
  { slug: "inflables", name: "Inflables", icon: "☁", description: "Juegos gigantes para saltar sin parar.", color: "bg-violet-100" },
  { slug: "psicopedagogia", name: "Psicopedagogía", icon: "♡", description: "Apoyo profesional para aprender con bienestar.", color: "bg-rose-100" },
  { slug: "fonoaudiologia", name: "Fonoaudiología", icon: "♪", description: "Acompañamiento respetuoso en comunicación y lenguaje.", color: "bg-pink-100" },
  { slug: "estimulacion-temprana", name: "Estimulación temprana", icon: "✿", description: "Propuestas sensibles para acompañar su desarrollo.", color: "bg-teal-100" },
];

type Seed = [string, string, string, string, string, string, number, number, number, string, boolean, boolean, string];
const seeds: Seed[] = [
  ["manos-que-cuidan", "Manos que Cuidan", "Niñeras", "nineras", "Palermo", "Selección de niñeras con experiencia, referencias y acompañamiento personalizado para cada familia.", 4.9, 48, 8500, "1544717305-2782549b5136", true, true, "2026-06-18"],
  ["nani-en-casa", "Nani en Casa", "Niñeras", "nineras", "Belgrano", "Cuidado por horas, apoyo en rutinas y acompañamiento amoroso para bebés y niños.", 4.8, 32, 7800, "1596461404969-9ae70f2830c1", true, false, "2026-05-09"],
  ["jardin-la-ronda", "Jardín La Ronda", "Jardines maternales", "jardines-maternales", "Villa Urquiza", "Un jardín de puertas abiertas donde jugar, explorar y crecer en comunidad.", 4.9, 63, 180000, "1503454537195-1dcabb73ffb9", true, true, "2026-06-22"],
  ["casa-semilla", "Casa Semilla", "Jardines maternales", "jardines-maternales", "Caballito", "Grupos reducidos, crianza respetuosa y propuestas de aprendizaje a través del juego.", 4.7, 27, 165000, "1587654780291-39c9404d746b", true, false, "2026-04-15"],
  ["fiesta-nube", "Fiesta Nube", "Salones de fiestas", "salones-de-fiestas", "Villa Devoto", "Un salón luminoso con juegos, ambientación y un equipo que se ocupa de cada detalle.", 4.9, 71, 240000, "1530103862676-de8c9debad1d", true, true, "2026-06-26"],
  ["mini-mundo-eventos", "Mini Mundo Eventos", "Salones de fiestas", "salones-de-fiestas", "San Isidro", "Celebraciones a medida con parque, cocina equipada y propuestas para todas las edades.", 4.6, 39, 210000, "1513151233558-d860c5398176", false, false, "2026-03-12"],
  ["club-de-risas", "Club de Risas", "Animadores", "animadores", "Almagro", "Animación con juegos cooperativos, música y talleres creativos para festejar diferente.", 4.8, 44, 45000, "1527529482837-4698179dc6ce", true, true, "2026-06-11"],
  ["tripulacion-magia", "Tripulación Magia", "Animadores", "animadores", "Recoleta", "Shows de magia, burbujas y personajes con propuestas adaptadas a cada grupo.", 4.7, 35, 52000, "1516627145497-ae6968895b74", true, false, "2026-05-17"],
  ["ruta-kids", "Ruta Kids", "Transporte escolar", "transporte-escolar", "Núñez", "Traslados escolares con seguimiento, puntualidad y atención cercana a las familias.", 4.8, 55, 95000, "1501349800519-48093d60bde0", true, false, "2026-04-20"],
  ["camino-al-cole", "Camino al Cole", "Transporte escolar", "transporte-escolar", "Colegiales", "Recorridos coordinados, unidades habilitadas y comunicación diaria por WhatsApp.", 4.6, 24, 88000, "1494526585095-c41746248156", true, false, "2026-02-08"],
  ["club-verde", "Club Verde", "Colonias", "colonias", "Parque Chas", "Colonia urbana con deporte, arte, naturaleza y grupos organizados por edades.", 4.9, 46, 145000, "1472162072942-cd5147eb3902", true, true, "2026-06-05"],
  ["verano-en-ronda", "Verano en Ronda", "Colonias", "colonias", "Vicente López", "Una propuesta de verano con pileta, juegos de equipo y talleres todos los días.", 4.7, 31, 155000, "1500530855697-b586d89ba3ee", false, false, "2026-05-28"],
  ["profe-cata", "Profe Cata", "Clases particulares", "clases-particulares", "Recoleta", "Apoyo escolar personalizado con paciencia, recursos visuales y objetivos claros.", 5, 38, 9000, "1509062522246-3755977927d7", true, true, "2026-06-29"],
  ["aprender-juntos", "Aprender Juntos", "Clases particulares", "clases-particulares", "Boedo", "Equipo docente para nivel primario y secundario, presencial y online.", 4.7, 21, 7500, "1503676260728-1c00da094a0b", true, false, "2026-03-30"],
  ["robotica-play", "Robótica Play", "Robótica", "robotica", "Palermo", "Talleres de programación y robótica donde las ideas se convierten en proyectos.", 4.9, 42, 32000, "1535378917042-10a22c95931a", true, true, "2026-06-14"],
  ["codigo-curioso", "Código Curioso", "Robótica", "robotica", "Belgrano", "Cursos por edades de videojuegos, electrónica creativa y pensamiento computacional.", 4.8, 19, 28500, "1516321318423-f06f85e504b3", false, false, "2026-04-09"],
  ["luz-de-infancia", "Luz de Infancia", "Fotógrafos", "fotografos", "Chacarita", "Fotografía documental de cumpleaños y sesiones familiares relajadas, sin poses forzadas.", 4.9, 57, 70000, "1542038784456-1ea8e935640e", true, true, "2026-06-02"],
  ["salta-salta", "Salta Salta", "Inflables", "inflables", "San Isidro", "Inflables limpios, seguros y listos para transformar cualquier festejo.", 4.6, 28, 60000, "1509924603848-aca5e0027ab6", true, false, "2026-03-22"],
  ["espacio-brote", "Espacio Brote", "Psicopedagogía", "psicopedagogia", "Almagro", "Evaluación y acompañamiento integral para construir aprendizajes con confianza.", 4.9, 41, 22000, "1596464716127-f2a82984de30", true, true, "2026-06-24"],
  ["hablar-y-crecer", "Hablar y Crecer", "Fonoaudiología", "fonoaudiologia", "Caballito", "Atención fonoaudiológica infantil centrada en comunicación, lenguaje y vínculo.", 4.8, 34, 24000, "1576091160399-112ba8d25d1d", true, false, "2026-05-13"],
  ["primeros-pasos", "Primeros Pasos", "Estimulación temprana", "estimulacion-temprana", "Villa Crespo", "Acompañamiento temprano a través del juego, el movimiento y la participación familiar.", 4.9, 26, 25000, "1602030028438-4cf153cbae9e", true, true, "2026-06-27"],
];

const photo = (id: string, width = 1000) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=85`;

const reviewAuthors = ["Mariana G.", "Sofía R.", "Nicolás y Vale", "Carolina M.", "Lucía P.", "Martín A."];
const reviewPhotos = ["1494790108377-be9c29b29330", "1534528741775-53994a69daeb", "1500648767791-00dcc994a43e", "1544005313-94ddf0286df2", "1438761681033-6461ffad8d80", "1507003211169-0a1dd7228f2d"];
const reviewComments = [
  "Nos acompañaron con mucha calidez y profesionalismo. La comunicación fue clara desde el primer momento.",
  "Una experiencia excelente. Cumplieron todo lo acordado y nuestros chicos quedaron felices.",
  "Se nota el cuidado en cada detalle. Volveríamos a elegirlos y ya los recomendamos a otras familias.",
];

export const providers: Provider[] = seeds.map((p, index) => ({
  id: String(index + 1), slug: p[0], name: p[1], category: p[2], categorySlug: p[3], zone: p[4], city: "Buenos Aires",
  description: p[5], rating: p[6], reviewsCount: p[7], priceFrom: p[8], whatsapp: `54911${42000000 + index * 13791}`,
  verified: p[10], featured: p[11], image: photo(p[9]),
  gallery: [photo(p[9], 1400), photo(index % 2 ? "1516627145497-ae6968895b74" : "1602030028438-4cf153cbae9e", 900), photo("1503454537195-1dcabb73ffb9", 900)],
  services: ["Atención personalizada", "Consulta inicial", "Propuesta adaptada por edad"],
  schedule: index % 3 === 0 ? "Lunes a sábados, 9 a 19 h" : "Lunes a viernes, 9 a 18 h",
  coverage: [p[4], index % 2 ? "CABA" : "Zona Norte", "A coordinar"],
  documents: p[10] ? ["Identidad verificada", "Referencias comprobadas", "Datos de contacto revisados"] : ["Datos de contacto revisados"],
  reviews: Array.from({ length: 3 }, (_, reviewIndex) => ({
    id: `${index + 1}-${reviewIndex + 1}`,
    author: reviewAuthors[(index + reviewIndex) % reviewAuthors.length],
    avatar: photo(reviewPhotos[(index + reviewIndex) % reviewPhotos.length], 160),
    rating: reviewIndex === 1 && index % 4 === 0 ? 4 : 5,
    comment: reviewComments[(index + reviewIndex) % reviewComments.length],
    date: new Date(2026, 5 - reviewIndex, 4 + ((index * 3 + reviewIndex) % 24)).toISOString(),
  })),
  faqs: [{ question: "¿Cómo consulto disponibilidad?", answer: "Podés escribir directamente por WhatsApp indicando fecha, zona y edad." }, { question: "¿El precio es final?", answer: "Es orientativo y puede variar según la propuesta y la zona." }],
  createdAt: p[12],
}));

export const stats = [["+80", "proveedores infantiles"], ["+300", "familias buscando servicios"], ["10", "categorías disponibles"], ["Buenos Aires", "nuestra primera ciudad"]];

export const zones = [...new Set(providers.map((provider) => provider.zone))].sort();
