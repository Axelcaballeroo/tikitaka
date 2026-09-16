# Fase 5 — Camila OS / Admin 2.0

## Fuente de verdad y auditoría

Las solicitudes nuevas son los propios registros de `providers` con `status='pending' AND published=false`. `/admin`, `/admin/solicitudes` y el filtro Pendientes de `/admin/proveedores` consultan esos mismos registros. No se copia el onboarding a `provider_requests`, ni a localStorage.

Se inspeccionaron las rutas, helpers, APIs, Auth, Storage, `supabase/schema.sql`, migraciones y la definición OpenAPI del Supabase configurado, exclusivamente mediante lecturas. La lectura real encontró:

| Tabla | Registros | Observación |
| --- | ---: | --- |
| providers | 22 | Ninguno pendiente; los 22 tienen `user_id=NULL` |
| provider_requests | 4 | Solicitudes históricas conservadas |
| profiles | 2 | Campos `full_name` y `role` existentes |
| categories | 13 | Categorías reales |
| provider_images | 22 | Relaciones y `sort_order` existentes |
| provider_services | 22 | Precio nullable |
| reviews | 60 | `status` y `published` existentes |
| contact_events | 4 | Contactos reales; no hay métrica de visitas |

`providers.user_id` es nullable en el contrato real y tiene registros NULL. El schema versionado declara FK a Auth con `ON DELETE SET NULL` y unicidad parcial para valores no nulos. No hace falta migración para el alta manual. Estados soportados en el schema: `pending`, `approved`, `rejected`. Campos reales de moderación: `status`, `published`, `verified`, `featured`. No se agregaron estados, notas de rechazo, plan PRO ni columnas.

### Alcance de la verificación del esquema

La API REST permitió verificar tablas, columnas, campos obligatorios y datos reales. Las FK, triggers y políticas se auditaron en el SQL del repositorio; no se dispuso de acceso SQL directo al catálogo PostgreSQL para certificar que las políticas desplegadas coincidan exactamente con ese archivo. No se probaron escrituras ni cambios de privilegios en producción.

## Circuito operativo

1. Onboarding guarda/envía el proveedor pendiente y no publicado.
2. Admin lo encuentra automáticamente en la cola, sin crear otro registro.
3. El detalle permite revisar datos, servicios, fotos, cobertura, horarios, contacto, estado y fecha; editar o contactar por WhatsApp.
4. **Aprobar y publicar** realiza una sola actualización con `{status:'approved', published:true}`. Valida los datos mínimos y usa `updated_at` para detectar cambios concurrentes durante la moderación.
5. La regla pública se conserva: `published=true AND status='approved'`.
6. **Ocultar** cambia solo `published=false`. **Volver a publicar** requiere que el estado siga aprobado.
7. **Rechazar** exige confirmación y cambia juntos `status='rejected'`, `published=false`; conserva la información.
8. **Verificar** exige confirmación y cambia solo `verified`. **Destacar** cambia solo `featured`, sin cobros ni cambio de estado.

Los cambios invalidan las rutas de Home, marketplace, Admin y perfil público. El detalle y las listas se refrescan tras la operación. No se informa éxito ante un conflicto o fallo de Supabase.

## Editar y alta manual

- `/admin/proveedores/[id]/editar` reutiliza BusinessStep, ContactStep, ServicesStep, OnboardingPhotos y OnboardingPreview.
- Se editan nombre, categoría activa, descripción, zona, ciudad, provincia, dirección administrativa, WhatsApp, email, precio general, cobertura, horarios y servicios. El slug y la vinculación Auth no se cambian al editar.
- `/admin/proveedores/nuevo` crea un proveedor con `user_id=NULL`, pendiente, no publicado, no verificado y no destacado. El ID se conserva ante doble clic/reintento en la misma pantalla; no se generan cuentas Auth falsas.
- Primero se guarda el borrador para tener un ID real; después se carga portada/galería y se habilita **Publicar ahora**. El alta manual exige portada al publicar, también si se intenta aprobar desde el detalle. Los proveedores provenientes del onboarding conservan la regla anterior de fotos opcionales.
- Validación compartida en cliente y servidor: nombre, descripción, categoría real, WhatsApp normalizado a dígitos, ubicación, email opcional, precios no negativos, límites de texto y servicios con UUID únicos. El formulario conserva el máximo de cinco servicios del onboarding.
- Los servicios se guardan en `provider_services`, con precio NULL cuando corresponde. La API comprueba que los IDs no pertenezcan a otro proveedor antes de escribir; no acepta flags ni `user_id` en el formulario de edición.
- Portada/galería utilizan el bucket existente `provider-images`, JPEG/PNG/WEBP, 5 MB por archivo y ocho fotos de galería. La API compartida acepta un proveedor objetivo únicamente después de validar el rol admin en servidor.
- Las eliminaciones de objetos Storage comprueban el origen configurado y la carpeta del proveedor seleccionado. Una URL guardada no puede provocar el borrado de archivos de otro proveedor.
- Las fotos se guardan inmediatamente al subir/eliminar. El resto se guarda explícitamente. No hay almacenamiento local de solicitudes administrativas.

## Preview, métricas y navegación

- Preview privada dentro del detalle: reutiliza ProfileHeader, ProviderGallery y ProfileDetails; sin botón de favoritos. No abre un perfil pendiente desde la URL pública.
- Preview del editor muestra los cambios aún sin guardar, sin afirmar que un perfil ya publicado esté pendiente.
- Dashboard saluda usando el primer nombre real de `profiles.full_name`, con fallback Cami.
- KPIs: activos = publicados y aprobados; pendientes = pending/no publicado; destacados = featured y públicamente visibles; contactos del mes = `contact_events` desde el primer día del mes UTC; contador de reseñas pendientes.
- Una métrica fallida muestra “— / Métrica no disponible” y no derriba el dashboard. Fallos de listas/detalle presentan un estado controlado con reintento.
- Detalle: cantidad de contactos mediante count exacto y reseñas/rating calculados sobre reseñas públicas aprobadas. No se inventan visitas.
- Se mantienen `/admin/analytics`, `/admin/resenas`, categorías y configuración. La navegación incluye Overview, Proveedores, Solicitudes, Reseñas, Categorías, Analytics y Configuración.
- WhatsApp administrativo usa un enlace directo `wa.me`, sin pasar por el tracking público ni escribir `contact_events`.

## Legacy y eliminación

El admin anterior ya usaba Supabase para `provider_requests`, aunque su cola no correspondía al onboarding nuevo. El módulo local era código sin consumidores en las rutas activas. Se retiraron:

- `src/lib/local-marketplace.ts`: solicitudes/proveedores locales y aprobación demo.
- `src/components/marketplace/dynamic-services-catalog.tsx` y `local-provider-profile.tsx`: consumidores de ese módulo, sin uso en rutas.
- `src/components/admin/requests-manager.tsx`: conversión antigua como flujo principal.
- Helpers antiguos de conversión y borrado en `src/lib/data/requests.ts`; la conversión inventaba fotos, horarios y servicios de ejemplo.

No se borraron claves existentes del navegador ni se importaron datos demo. Los cuatro `provider_requests` reales siguen intactos y accesibles en `/admin/solicitudes/historicas`, solo para consulta/contacto. La API administrativa histórica responde 409 ante mutaciones para evitar otra conversión/borrado. El endpoint de recepción histórico se conserva por compatibilidad; el onboarding nuevo no lo utiliza.

**Borrado de proveedor deshabilitado:** el schema declara `ON DELETE CASCADE` desde provider_images, provider_services, reviews, favorites y contact_events. El endpoint DELETE ahora devuelve 409 y recomienda Ocultar; se elimina el helper destructivo. No se añade un archivado ficticio ni cascadas nuevas. El ocultado conserva la evidencia.

## Seguridad y recomendaciones no ejecutadas

- Se mantienen middleware, layout protegido y `profiles.role='admin'` como autorización. Cada operación sensible comprueba sesión/rol en servidor antes de crear el cliente service role, siguiendo la estrategia existente.
- Service role permanece en módulos `server-only`; no se envía al navegador.
- Solicitudes inválidas, acciones desconocidas, valores de flags no booleanos, ausencia de confirmación, IDs ajenos y cambios concurrentes se rechazan.
- No se cambiaron Auth ni políticas RLS ni se ejecutaron migraciones.
- **Recomendación de seguridad previa al despliegue:** las políticas del SQL versionado permiten al propietario actualizar ampliamente `profiles` y `providers`; por sí solas no impiden modificar `profiles.role` o los campos de moderación mediante REST directo. Revisar las políticas/grants/triggers desplegados y preparar una migración que impida a usuarios normales cambiar `role`, `status`, `published`, `verified` y `featured`, manteniendo la edición de sus datos legítimos y las operaciones admin. No se ejecutó ni se certifica ese endurecimiento en esta fase.
- No se necesita migración funcional para el circuito solicitado. Si se requiere distinguir borrador de envío, recomendar evaluar un timestamp de envío: hoy ambos comparten pending y el admin debe revisar completitud antes de aprobar.

## QA y límites

No hay Docker, Supabase CLI ni PostgreSQL local disponibles. Se creó un servidor HTTP de fixtures en memoria compatible con las operaciones Supabase utilizadas; Next se ejecutó con variables temporales apuntando solo a localhost. `.env.local` quedó intacto. Esta prueba verifica UI, APIs y reglas de la aplicación; no sustituye una prueba contra un Supabase aislado con PostgreSQL, Auth y RLS reales.

Comprobado en navegador con ese entorno:

- Login admin y dashboard con nombre real de la fixture.
- Envío mediante `/api/onboarding` como proveedor → mismo ID en cola admin.
- Filtro pendiente, detalle y edición persistida tras recarga.
- Aprobar → marketplace y perfil públicos; ocultar → desaparece y perfil devuelve 404; republicar.
- Verificar/quitar verificación, destacar/quitar destacado y rechazar con confirmación.
- Destacado aparece en Home y verificado muestra badge público.
- Alta manual, `user_id=NULL`, subida de portada y publicación.
- Clic administrativo WhatsApp interceptado localmente: cero eventos de contacto público.
- Rutas de analytics, reseñas e histórico disponibles.
- Usuario proveedor e invitado reciben 403 en API admin; proveedor que intenta `/admin` es redirigido a su panel.
- DELETE bloqueado con 409; verificación sin confirmación rechazada con 400.
- Dashboard, listado, detalle y editor en 375, 430, 768, 1024 y 1440 px: sin overflow horizontal; capturas inspeccionadas.
- Falla de `contact_events`: métrica no disponible; falla de providers: error controlado sin detalles técnicos visibles.

Los servicios y datos generales se escriben en varias operaciones, porque no se añadió una función transaccional a la base. Un fallo intermedio puede dejar parte del borrador guardado. La publicación ocurre al finalizar; los IDs de servicios permiten reintentar sin duplicarlos. Para concurrencia estricta de edición/servicios y límite de imágenes entre varias sesiones, se recomienda una transacción en una evolución futura. La aprobación/rechazo de estado y publicación sí se realiza en una sola actualización.

## Inventario de archivos de esta fase

### Creados

- `src/lib/admin-provider.ts`
- `src/lib/admin-provider-api.ts`
- `src/lib/provider-storage.ts`
- `src/lib/data/admin-providers.ts`
- `src/components/admin/provider-editor.tsx`
- `src/app/admin/error.tsx`
- `src/app/admin/proveedores/nuevo/page.tsx`
- `src/app/admin/proveedores/[id]/editar/page.tsx`
- `src/app/admin/solicitudes/historicas/page.tsx`
- `src/app/api/admin/providers/route.ts`
- `tests/admin.test.mjs`
- `docs/admin-fase-5.md`

### Modificados

- `src/app/admin/page.tsx`
- `src/app/admin/proveedores/page.tsx`
- `src/app/admin/proveedores/[id]/page.tsx`
- `src/app/admin/solicitudes/page.tsx`
- `src/components/admin/admin-shell.tsx`
- `src/components/admin/dashboard.tsx`
- `src/components/admin/providers-manager.tsx`
- `src/components/admin/provider-detail-actions.tsx`
- `src/app/api/admin/providers/[id]/route.ts`
- `src/app/api/admin/requests/[id]/route.ts`
- `src/app/api/dashboard/images/route.ts`
- `src/lib/data/admin.ts`
- `src/lib/data/requests.ts`
- `src/components/onboarding/onboarding-photos.tsx`
- `src/components/onboarding/onboarding-preview.tsx`
- `src/components/provider/profile-header.tsx`

Los cuatro archivos retirados figuran en la sección Legacy. Se preservan los cambios de fases anteriores del árbol de trabajo.

### Comprobaciones finales

- Siete pruebas nuevas de reglas, permisos de API, confirmación, concurrencia y aislamiento de Storage.
- `node --test tests/admin.test.mjs tests/marketplace.test.mjs tests/provider-profile.test.mjs tests/onboarding.test.mjs`: 26 pruebas aprobadas.
- `npm run lint`: aprobado.
- `npm run build`: aprobado, con TypeScript y generación de rutas.
- Sin despliegue, migraciones ni modificación de datos productivos.
