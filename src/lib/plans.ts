import { commercialContact } from "./commercial-contact";
export const currentPlan = (featured: boolean) =>
  featured ? "Tiki Taka PRO" : "Tiki Taka Gratis";
export const basicBenefits = [
  "Perfil público",
  "Contacto por WhatsApp",
  "Servicios y fotos",
  "Reseñas",
  "Aparición en marketplace",
];
export const featuredBenefits = [
  "Todo lo incluido en Gratis",
  "Badge destacado",
  "Prioridad en el orden Recomendados",
  "Participación en recomendados",
  "Mayor presencia en Home",
  "Estadísticas de contactos",
];
export const proBenefits = [
  "Todo lo incluido en PRO",
  "Optimización del perfil",
  "Acompañamiento personalizado",
  "Estrategia de contenido",
  "Promociones",
  "Reporte mensual",
  "Soporte directo",
];
export function planContact(plan = "PRO", businessName = "") {
  return commercialContact(
    `Consulta Tiki Taka ${plan}`,
    `Hola, equipo de Tiki Taka. Quiero conocer más sobre ${plan}.${businessName ? ` Mi negocio es ${businessName}.` : ""}`,
  );
}
