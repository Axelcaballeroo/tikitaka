# Fase 3 — Perfil público del proveedor

## Entrega

Mini landing del proveedor con cabecera, galería real, contacto sticky, servicios, cobertura, horarios, reseñas públicas, compartir y similares. No se realizaron escrituras productivas, migraciones ni despliegue.

## Archivos

Modificados: `src/app/proveedores/[slug]/page.tsx`, `src/components/marketplace/provider-gallery.tsx`, `sticky-contact-card.tsx`, `review-card.tsx`, `src/lib/data/providers.ts`, `src/types/index.ts`, `src/app/globals.css`.

Creados: `src/components/provider/profile-header.tsx`, `profile-details.tsx`, `profile-image.tsx`, `profile-reviews.tsx`, `profile-whatsapp.tsx`, `share-profile.tsx`, `similar-providers.tsx`; `src/lib/provider-profile.ts`; `tests/provider-profile.test.mjs`; esta documentación.

Eliminado: `src/app/proveedores/[slug]/loading.tsx`. El loader provocaba una respuesta HTTP 200 ya iniciada antes del notFound. La lectura compartida con metadata ahora devuelve HTTP 404 real para slugs ausentes/no públicos, conservando la pantalla not-found existente.

## Datos y decisiones

- Se inspeccionó el schema expuesto por el Supabase configurado: providers, provider_images, provider_services, reviews, favorites y contact_events.
- `getProviderBySlug` usa el cliente público y exige `published=true AND status='approved'`, igual que el marketplace. Sin configuración o ante error no utiliza mocks; presenta estado controlado sin errores internos.
- Se reutiliza la consulta/mapeo existente, agregando un mapeo estricto del perfil: sin descripciones, horarios, fotografías, FAQs o precios de paquetes inventados.
- Galería: portada y provider_images ordenadas por sort_order, deduplicadas. Una foto ocupa el espacio completo; sin fotos aparece un estado vacío. Primeras tres en cabecera; restantes en Fotos. Visor con anterior/siguiente, teclado y cierre; next/image y carga diferida de fotos inferiores.
- `provider_services`: título, descripción y precio nullable reales. Se oculta la sección si no hay servicios. Horarios y cobertura solo cuando existen.
- `documents` contiene textos, no evidencia de documentos auditados. No se muestran esos textos como verificaciones. `verified=true` se expresa únicamente como “Perfil verificado por Tiki Taka”. No existe modelo FAQ ni plan PRO; no se inventan. Se reserva un estilo PRO sin seleccionarlo.
- Destacado: badge y acento turquesa, mismo contenido esencial para los demás perfiles.
- Reseñas: filtros explícitos `reviews.published=true AND reviews.status='approved'` y comprobación adicional en mapeo. Promedio y cantidad se calculan sobre esas reseñas y se comparten entre cabecera, opiniones y JSON-LD. Formulario existente preservado.
- Inconsistencia real: varios providers guardan reviews_count de 21–71, pero solo tienen tres reseñas públicas relacionadas. El perfil usa las tres existentes; no se corrige la base ni los contadores que otras páginas todavía consumen.
- WhatsApp: ambos CTA usan TrackedWhatsappLink con `source=provider_profile`, apertura inmediata incluso si analytics falla. No se monta el listener global adicional. Favoritos conservan localStorage y estado compartido. Compartir usa Web Share API, clipboard y campo seleccionable como último recurso.
- Similares: hasta cuatro publicados/aprobados, excluyendo ID y slug actuales; prioridad por categoría, zona, featured, verified y rating. Sin resultados se oculta el bloque.
- Metadata dinámica y canonical con getSiteUrl/NEXT_PUBLIC_SITE_URL. JSON-LD conserva LocalBusiness y omite campos ausentes; no inventa región, opiniones, teléfono ni precio. La consulta de metadata/perfil se comparte por request mediante React cache.
- Mobile: contacto en flujo y CTA inferior con safe areas; reserva de espacio en contenido/footer. Sidebar sticky real en desktop.

## QA

- Reales: Profe Cata (featured/verified), Mini Mundo Eventos (normal), Nani en Casa (verified), Remeo (sin reseñas). HTTP 200.
- 375, 390, 430, 768 y 1440 px: sin overflow horizontal. Revisión visual desktop/móvil.
- Favoritos sincronizados entre cabecera y tarjeta. Visor de foto abre/cierra con Escape.
- Compartir: clipboard comprobado y Web Share API comprobada con sustitución local de la API.
- Dos clics de WhatsApp, dos eventos exactos provider_profile, aun con endpoint simulado HTTP 500.
- Formulario de reseñas probado con POST interceptado; sin escritura productiva.
- Slug inexistente: HTTP 404 real y pantalla existente.
- La base real tiene solo una foto única por proveedor y no tenía proveedores no públicos en la lectura de auditoría. Se probaron varios/sin fotos, sin servicios, sin contacto, reseña pendiente, proveedor no publicado y falla Supabase con un servidor HTTP de fixtures exclusivamente local. El proveedor privado devuelve 404; el error no expone detalles.
- `node --test tests/marketplace.test.mjs tests/provider-profile.test.mjs`: 13 pruebas aprobadas.
- Lint y build aprobados al cierre combinado con fase 4; 19 pruebas automatizadas aprobadas entre marketplace, perfil y onboarding.

Los fixtures y scripts de navegador permanecieron fuera del repositorio y sus servidores se detuvieron tras las pruebas. No se alteró `.env.local`.
