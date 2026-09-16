# Fase 6 — Planes y panel de proveedor

## Auditoría y representación de planes

Se revisaron `providers`, `featured`, `verified`, `contact_events`, `reviews`, `provider_services`, `provider_images`, los editores existentes, el admin de fase 5 y `/planes`. La lectura del contrato OpenAPI del Supabase configurado confirmó que no expone tablas de planes/suscripciones ni campos `plan`, `tier` o `subscription` en providers. El único campo relacionado es `featured`. Se conservan 22 proveedores reales; todos tienen `user_id=NULL`, por lo que no hay un proveedor vinculado disponible para probar el panel con una cuenta productiva sin modificar datos.

| Dato real | Plan mostrado |
| --- | --- |
| featured=false | Tiki Taka Básico |
| featured=true | Tiki Taka Destacado |
| verified | No determina el plan |
| PRO | Propuesta visual en preparación; nunca se asigna a una cuenta |

No se agregaron columnas, tablas, pagos ni cobros. Las acciones actuales de Admin siguen siendo la única forma prevista en la interfaz de activar/quitar Destacado.

## Panel final

`/dashboard` incluye saludo con business_name, estado real, KPIs, gráfico, completitud, plan actual y las tres reseñas públicas más recientes. Los editores existentes de perfil, servicios y fotos se reutilizan sin crear otro editor.

Estados:

- Publicado: `status='approved' AND published=true`.
- Pendiente: `status='pending'`; informa revisión, permite editar y no afirma que esté visible.
- Oculto: aprobado/no publicado; permite editar o contactar al equipo.
- Rechazado: informa el rechazo y ofrece volver al onboarding para corregir/reintentar.

`/dashboard/vista-publica` también exige ambos campos para ofrecer el enlace público. No se añade autopublicación.

Navegación: Inicio, Mi perfil, Servicios, Fotos, Estadísticas, Mi plan y Vista pública. Sidebar desktop y navegación compacta en cuadrícula móvil. Inicio, Estadísticas y Mi plan refrescan sus datos al recuperar el foco y cada 60 segundos cuando la pestaña está visible; los editores no reciben ese refresco periódico para evitar interferir con cambios sin guardar.

## Métricas reales y fechas

- Contactos: registros de `contact_events` del proveedor autenticado. Se cuentan clics, no conversaciones, visitas, impresiones ni clientes únicos.
- Períodos del gráfico: siete días calendario, treinta días calendario y mes actual, en UTC, incluyendo hoy. Se excluyen fechas futuras del gráfico.
- La consulta paginada cubre desde el inicio más antiguo entre los últimos treinta días y el mes actual. Así se cubren también meses de 31 días. Los totales históricos usan count exacto.
- `/dashboard/estadisticas` muestra los tres períodos, total histórico, rating, reseñas y distribución por source dentro de esa ventana reciente.
- Reseñas: consultas con `provider_id` propio, `published=true` y `status='approved'`, paginadas para evitar truncar el promedio. Cantidad y rating se calculan sobre esas mismas reseñas. No se usan los contadores desactualizados de providers detectados en fase 3.
- Sin reseñas: “Sin reseñas”, no un rating cero inventado. Error de consulta: “No disponible”/“—”, no cero. Un fallo de contactos no oculta las reseñas ni derriba el resto del panel.
- Sin contactos históricos: mensaje de primeras consultas. Si hubo contactos pero no en el período elegido, se informa únicamente que ese período está vacío. Para perfiles no públicos se explica su estado; los datos anteriores se presentan como históricos.
- El gráfico utiliza CSS, sin librerías nuevas; ofrece descripción accesible y datos por día desplegables.

## Completitud

Diez aspectos con igual peso (10% cada uno): nombre, descripción, WhatsApp, categoría, zona o ciudad, portada, al menos una foto de galería, al menos un servicio, horarios y cobertura. Los textos deben contener contenido no vacío. Cada elemento enlaza al editor adecuado.

No se incluyen email obligatorio, dirección, plan ni campos inexistentes. Si falla la lectura de fotos o servicios, el porcentaje se muestra no disponible en vez de tratar ese error como contenido faltante. El porcentaje es orientativo y no publica el perfil automáticamente.

## Plan actual y página comercial

- `/dashboard/plan`: plan actual derivado de featured, estado del perfil, beneficios y consulta comercial. Si el perfil no está publicado, el texto no promete visibilidad actual.
- `/planes`: Básico “Gratis”, Destacado “Más visibilidad”, PRO “Marketing + crecimiento / En preparación”. Beneficios concretos y ausencia de precios inventados.
- Destacado incluye badge y participación prioritaria en recomendados/Home según la lógica existente, sin prometer primer puesto fijo ni consultas garantizadas.
- Las estadísticas también están disponibles en Básico; no se presentan como una restricción paga inexistente.
- PRO muestra beneficios propuestos, claramente sujetos a definición futura. No se puede activar, seleccionar como plan actual ni comprar.
- CTA Destacado y PRO: `mailto:hola@tikitaka.com.ar`, reutilizando el contacto ya existente en el footer, con asunto y texto de consulta codificados. No se inventó un número de WhatsApp ni se envió ningún mensaje durante las pruebas.
- El resumen de planes de Home se ajustó para no seguir indicando que Destacado es exclusivamente un placeholder futuro.

## Seguridad

Las nuevas métricas se leen con el cliente autenticado, sujeto a RLS, y derivan el ID del proveedor de la sesión en servidor. El helper no acepta un proveedor objetivo del navegador. Todas las consultas filtran explícitamente `provider_id`; pasar un ID ajeno en query params no cambia la cuenta consultada. No se utiliza service role para estadísticas del proveedor.

Se retiró el helper anterior `getProviderInsights(providerId)` para tener una única lectura de estadísticas. Los helpers existentes de servicios y fotos ahora verifican que el ID solicitado coincida con el proveedor autenticado. La lectura de cuenta distingue un error de Supabase de una cuenta que todavía no tiene proveedor.

No se incorporan acciones de moderación/borrado de reseñas ni de edición de featured en el panel. No se modificaron RLS ni Auth. La revisión de permisos de actualización de `profiles.role` y flags de providers documentada en fase 5 sigue recomendada antes del despliegue; esta fase no certifica ni endurece políticas productivas.

## QA

Lecturas reales del contrato Supabase y auditoría de schema/código. Todas las escrituras de prueba y escenarios autenticados se ejecutaron en un servidor HTTP local de fixtures en memoria, con Next apuntando temporalmente a localhost. No equivale a una prueba con PostgreSQL/Auth/RLS reales de una instancia Supabase aislada. `.env.local` y los datos productivos permanecieron intactos.

Casos aprobados en navegador:

- Básico y Destacado; publicado, pendiente, oculto y rechazado.
- Sin contactos/reseñas y con contactos/reseñas. Dos contactos y rating 4.0 comprobados exactamente.
- Reseña pendiente y datos de otro proveedor excluidos.
- Cambios de período del gráfico y estado de error de contactos.
- Cambio de featured reflejado al volver al foco de Mi plan.
- Dashboard, estadísticas, plan, editor de perfil y planes en 375, 430, 768, 1024 y 1440 px; sin overflow horizontal. Gráfico con datos también probado en los cinco anchos. Capturas desktop/móvil inspeccionadas.
- Cuenta sin sesión redirigida a login. Parámetro `providerId` ajeno no expone analytics ajenos.
- CTA comercial apunta al email existente; sin envíos reales.
- Sin errores JavaScript en el recorrido.

Pruebas automatizadas nuevas: planes, estados, límites temporales y año bisiesto, completitud, ownership de todas las queries, paginación de 501 reseñas, fallo parcial y ausencia de sesión.

## Migración futura recomendada, no ejecutada

No hace falta migración para Básico/Destacado en esta fase. Para PRO persistente, definir primero si se trata de una condición editorial o de una suscripción comercial:

- Si solo se necesita un nivel de servicio, evaluar un campo de plan con valores basic/featured/pro y una estrategia explícita para derivar o reemplazar featured; evitar dos fuentes contradictorias.
- Si habrá pagos y renovaciones, preferir un modelo de suscripción separado con proveedor, estado, período, historial y referencias del procesador. El nivel efectivo debe derivarse de ese modelo de forma consistente.
- Diseñar autorización de cambios de plan y transición de los featured existentes antes de ejecutar cualquier migración. No crear suscripciones pagas a partir de un flag editorial sin revisar su origen.

## Archivos creados

- `src/lib/provider-dashboard.ts`
- `src/lib/plans.ts`
- `src/lib/data/provider-dashboard.ts`
- `src/components/dashboard/business-overview.tsx`
- `src/components/dashboard/contact-chart.tsx`
- `src/components/dashboard/plan-card.tsx`
- `src/components/dashboard/refresh-status.tsx`
- `src/components/plans/plan-options.tsx`
- `src/app/dashboard/estadisticas/page.tsx`
- `src/app/dashboard/plan/page.tsx`
- `src/app/dashboard/error.tsx`
- `tests/dashboard.test.mjs`
- `docs/dashboard-planes-fase-6.md`

## Archivos modificados

- `src/app/dashboard/page.tsx`
- `src/app/dashboard/vista-publica/page.tsx`
- `src/components/dashboard/dashboard-shell.tsx`
- `src/lib/auth/account.ts`
- `src/app/planes/page.tsx`
- `src/components/home/plans-preview.tsx`

## Validación final

- `npm run lint`: aprobado.
- Suite completa: 33 pruebas aprobadas (siete nuevas de esta fase).
- `npm run build`: aprobado, con TypeScript y generación de rutas.
- Sin despliegue, migraciones, integración de pagos ni cambios productivos.
