import type { Provider } from "@/types";
import { TrackedWhatsappLink } from "@/components/marketplace/tracked-whatsapp-link";
export function ProfileWhatsapp({
  provider,
  className,
  source = "provider_profile",
}: {
  provider: Provider;
  className: string;
  source?: "provider_profile" | "sticky_contact";
}) {
  if (!provider.whatsapp.trim()) return null;
  const url = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(`Hola ${provider.name}, encontré tu perfil en Tiki Taka y quisiera consultar disponibilidad.`)}`;
  return (
    <TrackedWhatsappLink
      providerId={provider.id}
      source={source}
      page={`/proveedores/${provider.slug}`}
      href={url}
      className={className}
    >
      Consultar por WhatsApp ↗
    </TrackedWhatsappLink>
  );
}
