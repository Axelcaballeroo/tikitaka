export function commercialConfig() {
  const rawWhatsapp = process.env.NEXT_PUBLIC_TIKITAKA_WHATSAPP?.trim() ?? "";
  const whatsapp = /^[+\d\s().-]+$/.test(rawWhatsapp)
    ? rawWhatsapp.replace(/\D/g, "")
    : "";
  const rawEmail = process.env.NEXT_PUBLIC_TIKITAKA_EMAIL?.trim() ?? "";
  return {
    whatsapp: /^\d{8,15}$/.test(whatsapp) ? whatsapp : null,
    email: /^[^\s@?&\r\n]+@[^\s@?&\r\n]+\.[^\s@?&\r\n]+$/.test(rawEmail)
      ? rawEmail
      : null,
  };
}
export function commercialContact(
  subject = "Consulta Tiki Taka",
  message = "Hola, equipo de Tiki Taka.",
) {
  const config = commercialConfig();
  if (config.whatsapp)
    return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
  if (config.email)
    return `mailto:${config.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  return null;
}
