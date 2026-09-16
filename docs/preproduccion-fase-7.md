# Fase 7 — validación de preproducción

Fecha: 15 de septiembre de 2026. Entorno local conectado al proyecto Supabase de `.env.local`.

**Estado: preparación técnica realizada; habilitación de producción pendiente de las pruebas autenticadas y de configuración.** No se ejecutó SQL, no se desplegó y no se borraron datos. Se conservaron tres eventos de contacto creados durante la prueba real solicitada.

## 1. Supabase real

Conexión y consultas reales correctas. El script de solo lectura `scripts/preproduction-audit.mjs` guarda evidencia local en `.reports/preproduction-audit.json`, ignorada por Git. No imprime claves ni correos de usuarios.

## 2. Schema

Las columnas consultadas existen en `profiles`, `categories`, `providers`, `provider_images`, `provider_services`, `reviews`, `contact_events`, `provider_requests` y `favorites`. Esta comprobación por API no certifica tipos, constraints, triggers ni todas las políticas desplegadas.

Visibilidad pública compartida por Home, marketplace y perfil: **`published = true AND status = 'approved'`**. Campos reales: `published`, `status`, `verified`, `featured`; no se agregó `approved`, plan ni otro campo de publicación. `verified` y `featured` no autorizan visibilidad.

La búsqueda consume `q` y `location` (no `zona`). Otros filtros: `category`, `minPrice`, `maxPrice`, `rating`, `verified`, `featured`, `sort`.

## 3. SQL propuesto, sin ejecutar

Revisar en orden los archivos de `supabase/production/`:

- `00_audit.sql`: inventario de políticas, permisos, claves y triggers desplegados.
- `01_security_review.sql`: protección de rol, ownership y moderación; permisos de eventos/reseñas; acceso de Storage basado en el propietario actual.
- `02_link_owner_template.sql`: vinculación manual con UUID explícitos, cuenta confirmada y validaciones; los valores vacíos impiden ejecutar la plantilla accidentalmente.
- `03_reconcile_ratings.sql`: reconciliación opcional de agregados contra reseñas aprobadas y publicadas.

Son propuestas para revisar y probar primero en staging, con autorización explícita. No se validaron ejecutándolas en PostgreSQL. Las políticas adicionales desplegadas deben contrastarse antes: varias políticas permisivas se combinan y pueden ampliar acceso.

## 4. RLS y permisos

Prueba anónima real: 22 proveedores visibles; cero filas de perfiles, solicitudes históricas y eventos de contacto. Ningún proveedor privado expuesto, pero la base actual no contiene proveedores privados para una prueba negativa concluyente. Las rutas privadas redirigen al login sin sesión.

La revisión del SQL versionado detectó que RLS por fila necesita además proteger campos privilegiados (rol, publicación y moderación). La propuesta incluye esos controles y corrige el acceso a imágenes tras una transferencia de propietario. **No se certifica que estas correcciones estén instaladas en Supabase.**

Pendiente con sesiones reales: admin CRUD/moderación, provider contra otro provider, escalación directa por API Supabase, lectura cruzada de analytics y escrituras públicas rechazadas. La revisión de código y los tests no sustituyen estas pruebas.

## 5. Ownership

| Clasificación | Cantidad |
| --- | ---: |
| A: propietario válido | 0 |
| B: sin `user_id` | 22 |
| C: propietario inválido | 0 |

Hay dos cuentas Auth y dos perfiles, ambos admin. No existe actualmente una cuenta provider. No se asignó propietario automáticamente. Los 22 negocios siguen accesibles para administración y marketplace; pueden permanecer administrados por Camila. Para habilitar dashboard, validar identidad y consentimiento y utilizar la plantilla de vinculación con una cuenta real confirmada.

## 6. Onboarding real

**Pendiente.** No se dispone de una sesión provider, negocio real autorizado ni imágenes reales aportadas para recorrer registro → onboarding → envío pending/no publicado → aprobación → publicación. No se inventaron negocios ni se reutilizó la identidad de un administrador.

El registro ahora valida la categoría antes de crear la cuenta, configura el retorno de confirmación a login y conserva la cuenta si falla el alta del negocio, permitiendo continuar en `/publicar`.

## 7. Admin real

**Pendiente autenticado.** Se verificó el bloqueo anónimo y el código de autorización. No se aprobaron, ocultaron, verificaron ni destacaron negocios reales sin la sesión y el caso de prueba necesarios. No se generaron sesiones de admin mediante service role.

## 8. Contact events reales

**Persistencia verificada:** tres clics sobre Jardín La Ronda guardaron exactamente un evento por origen: `marketplace_card`, `provider_profile`, `sticky_contact`. Evidencia local: `.reports/real-contact-events.json`. Los tres eventos permanecen en la base y cuentan en analytics; no se enviaron mensajes de WhatsApp.

También se comprobó que WhatsApp abre cuando el tracking responde 503. El endpoint devuelve 204 solo si la escritura termina correctamente; en error devuelve 503. La barra inferior móvil informa `sticky_contact`.

El contacto comercial usa enlaces independientes, sin tracking de leads. La lectura de estos eventos en las pantallas de admin y provider queda pendiente de sesiones reales; el aislamiento por provider está cubierto por tests y revisión de código.

## 9. Storage

Bucket real `provider-images` existente y público, límite 5 MiB, MIME permitidos JPEG/PNG/WebP. La configuración de `next/image` permite el origen real de Storage y Unsplash.

**Pendiente:** subir y eliminar imágenes con admin y provider, verificar límites con archivos reales y denegar modificaciones cruzadas. No se alteraron archivos del bucket. El carácter público del bucket permite leer una URL conocida: no debe almacenar documentación privada.

## 10. Reviews

Lectura de reseñas reales comprobada. **20 proveedores tienen `rating`/`reviews_count` guardados que no coinciden con sus reseñas aprobadas y publicadas.** La presentación pública ahora calcula ambos valores con las reseñas visibles, coherentemente entre Home, catálogo y perfil. La recalculación tras operaciones existentes filtra también `status='approved'` y pagina los resultados.

Los agregados históricos de la base no se modificaron; su reconciliación opcional está preparada en SQL. Creación y moderación reales pendientes: no se inventaron reseñas.

## 11–13. Contacto, Auth y variables

Ver [instrucciones de deploy](deploy-vercel.md). Faltan localmente `NEXT_PUBLIC_SITE_URL` y ambos contactos comerciales. Los CTA comerciales quedan deshabilitados de forma controlada. La service role se usa en servidor; `.env.local` está ignorado y `.env.example` documenta las seis variables. La auditoría busca además la clave exacta en los bundles cliente.

## 14. QA

Se ejecutaron pruebas reales en navegador para Home, marketplace, categoría, perfil, favoritos, registro, login, publicar y planes, además de redirecciones anónimas de dashboard/admin. Sin errores JS críticos ni desbordamiento horizontal en móvil de 375 px.

Resultados finales con Node 24.15.0:

- `npm run lint`: correcto.
- `node --test tests/*.test.mjs`: 38/38 correctos.
- `npm run build`: correcto, Next.js 15.5.25, incluyendo validación TypeScript.
- `npm audit`: cero vulnerabilidades después de actualizar dependencias.
- Auditoría del bundle final: service role no encontrada en `.next/static`.
- Smoke repetido con `npm start` sobre el build final y Supabase real: nueve rutas públicas correctas, búsqueda real, `next/image` respondiendo imagen HTTP 200, JSON-LD válido, redirecciones de rutas privadas, fallback comercial deshabilitado y cero errores JS. Esta repetición no insertó eventos adicionales.

Se actualizó Next.js 15.5.20 → 15.5.25 y su configuración ESLint. El lockfile utiliza Sharp 0.35.4, PostCSS 8.5.28 y Nanoid 3.3.19; se fijó un override de PostCSS para Next porque su dependencia exacta anterior seguía vulnerable. También se actualizaron dependencias de desarrollo vulnerables mediante `npm audit fix`, sin `--force`. El aviso crítico de imágenes está documentado por [Next.js](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4).

Login/logout y acciones autenticadas requieren las sesiones pendientes.

## 15. Bloqueadores de producción

1. Seleccionar staging y aportar acceso seguro a sesiones reales admin/provider y un negocio autorizado para la prueba integral, sin pegar contraseñas en el chat.
2. Inspeccionar reglas desplegadas y aprobar/probar las correcciones SQL necesarias antes de instalarlas.
3. Configurar dominio final, Auth URLs y al menos un contacto comercial real.
4. Completar onboarding, moderación, ownership, analytics aisladas y Storage con esas sesiones.
5. Resolver conscientemente los agregados históricos y repetir el smoke sobre el dominio de destino.

## 16. Deploy

Ver [pasos exactos de Vercel](deploy-vercel.md). No se realizó despliegue ni commit automático.

## Archivos de esta fase

- Configuración: `.env.example`, `.gitignore`, `package.json`, `package-lock.json`.
- Contacto: `src/lib/commercial-contact.ts`, `src/components/ui/commercial-contact.tsx`, `src/lib/plans.ts`, componentes de planes/dashboard/footer y `admin/configuracion/page.tsx`.
- Correcciones: `src/app/api/contact-events/route.ts`, `src/components/provider/profile-whatsapp.tsx`, `src/app/proveedores/[slug]/page.tsx`, `src/lib/data/providers.ts`, `src/lib/data/reviews.ts`, `src/app/api/auth/register/route.ts`.
- URL/indexación: `src/lib/site-url.ts`, layouts raíz/admin/dashboard y páginas login/registro.
- Validación: `scripts/preproduction-audit.mjs`, `tests/preproduction.test.mjs`, `tests/dashboard.test.mjs`, `supabase/production/*.sql`, este informe y `docs/deploy-vercel.md`.

El árbol de trabajo ya contiene cambios de las fases anteriores; el estado completo de Git no representa únicamente esta fase.
