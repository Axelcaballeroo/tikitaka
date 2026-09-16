# Tiki Taka 2.0 — Marketplace, fase 2

## Resultado

`/servicios` tiene un encabezado de búsqueda compartido con Home, categorías rápidas, filtros con estado en URL, cards públicas 2.0 y recomendaciones integradas sin duplicados. Sin despliegue, migraciones ni escrituras productivas.

## Archivos modificados en esta fase

- `src/app/servicios/page.tsx`: carga real, manejo de error y composición del catálogo; metadata existente conservada.
- `src/components/marketplace/services-catalog.tsx`: catálogo, filtros/orden en URL, resultados y estados vacíos.
- `src/components/marketplace/provider-card.tsx`: card pública 2.0, favoritos y WhatsApp existentes.
- `src/components/home/hero-search.tsx`: reutiliza el formulario extraído, con los mismos campos, parámetros y aspecto.
- `src/lib/data/providers.ts`: opción `throwOnError` para diferenciar una consulta fallida de cero resultados, manteniendo el comportamiento de los demás consumidores.
- `src/app/globals.css`: estilos específicos del marketplace, chips y modal móvil.
- `docs/home-fase-1.md`: enlace a esta fase.

## Archivos creados

- `src/components/marketplace/service-search-form.tsx`: formulario común Home/marketplace.
- `src/components/marketplace/catalog-filter-fields.tsx`: filtros compartidos entre sidebar y panel móvil.
- `src/components/marketplace/catalog-drawer.tsx`: diálogo nativo, foco modal, Escape, cierre y bloqueo del scroll de fondo.
- `src/components/marketplace/catalog-recommendations.tsx`: bloque editorial de destacados.
- `src/lib/marketplace-filters.ts`: lectura de URL, filtrado y ranking comprobables.
- `tests/marketplace.test.mjs`: pruebas automatizadas sin nuevas dependencias de producción.
- `docs/marketplace-fase-2.md`: entrega y QA.

## Parámetros y filtros

Se mantienen `q`, `location` y `category`. No se introduce `zona` ni un segundo sistema de búsqueda. `category` admite slugs separados por comas, reutilizando los grupos de Home y cruzándolos con las categorías existentes.

Nuevos parámetros para filtros adicionales:

| Parámetro | Comportamiento |
| --- | --- |
| `q` | Texto en nombre, categoría, descripción o zona |
| `location` | Ubicación por zona o ciudad |
| `category` | Una categoría o una colección de categorías |
| `minPrice`, `maxPrice` | Rango de precio inicial en ARS |
| `rating` | Puntuación mínima, respaldada por cantidad de opiniones |
| `verified=true` | Solo verificados |
| `featured=true` | Solo destacados |
| `sort` | `recommended`, `rating`, `recent`, `price-asc`, `price-desc` |

Texto y ubicación no distinguen mayúsculas ni tildes. Categorías dentro de una colección se combinan con OR; los diferentes filtros con AND. Precios desconocidos no pasan un filtro de precio y aparecen al final de ambos órdenes por precio. Un rango invertido da cero resultados, con las acciones para ampliar/limpiar.

Cambiar filtros usa el historial nativo integrado con App Router: URL compartible, recarga y atrás/adelante, sin nueva consulta de proveedores por cada ajuste. El formulario de Home sigue funcionando mediante GET sin JavaScript.

## Datos, visibilidad y ranking

Se reutiliza `getProviders({ allowMockFallback: false, throwOnError: true })` con el cliente público de Supabase. La consulta mantiene exactamente `published = true AND status = 'approved'`. `verified` y `featured` no otorgan visibilidad. No existe una columna `approved` ni un tier PRO en el schema auditado.

Orden recomendado: destacados primero, después verificados, rating cuando hay reseñas, cantidad de reseñas y nombre como desempate estable. Los proveedores normales permanecen en los resultados y tienen la misma información esencial.

La card usa nombre, foto, ubicación, categoría, descripción, rating, cantidad de reseñas, precio y flags del proveedor. Precio ausente: “Consultar precio”. Sin reseñas: “Todavía sin opiniones”. Solo se muestran badges respaldados por `verified` y `featured`; se retiraron de la card los claims derivados de rapidez/popularidad.

Destacado tiene badge y borde turquesa sutil. `providerCardPresentation` reserva el estilo `pro`, pero ninguna card lo selecciona ni muestra un badge PRO; no hay campos ni asignaciones inventadas.

## Bloque recomendado

Solo aparece en orden Recomendados cuando hay al menos 12 resultados y destacados disponibles después de las primeras 6 cards. Toma hasta 3 de esos destacados y los retira de la grilla restante. Cada proveedor aparece una sola vez. Los filtros aplican también al bloque. Sin candidatos se oculta.

Desktop: fila de cards. Móvil: scroll horizontal con snap. Al elegir otro orden se conserva el orden solicitado, sin intercalar promoción.

## Mobile y performance

375/390/430 px: buscador vertical, chips desplazables y botones Filtros/Ordenar. Los paneles usan `dialog` nativo, altura limitada, contenido desplazable, cierre, Escape y foco modal. No hay sidebar fija móvil.

Cards en 1/2/3 columnas según ancho. `next/image`, tamaños responsive y carga diferida. No hay nuevas librerías de UI. Como solo hay 22 registros públicos durante QA, se mantiene la carga única sin nueva infraestructura de paginación; filtrado y presentación quedaron separados para ampliarlos después.

## Favoritos y WhatsApp

Se conservan `FavoriteButton` y el almacenamiento actual. WhatsApp se ofrece cuando existe teléfono, reutilizando `TrackedWhatsappLink`, con `source=marketplace_card` y `page=/servicios`. No se espera analytics para abrir el enlace y no se agrega otro tracker.

## Validación

- `npm run lint`: aprobado.
- `npm run build`: aprobado.
- `node --test tests/marketplace.test.mjs`: 6 pruebas aprobadas (búsqueda combinada, ranking, precios faltantes, rating con reseñas, parámetros inválidos y fallo de datasource con visibilidad pública).
- Supabase configurado: 22 registros públicos; 9 destacados. Catálogo con 22 IDs únicos; bloque de 3 recomendaciones sin repetirlos.
- Texto + ubicación (`niñera`, `Palermo`): 1 resultado.
- Cuidado infantil: 4 resultados. Cuidado infantil + Palermo: 1.
- Precio entre 10000 y 30000: 3 resultados.
- Texto inexistente: estado vacío y acciones para limpiar, ampliar zona y explorar categorías.
- Navegación atrás/adelante: recupera filtros y campos del buscador.
- Favoritos: guardar y quitar comprobados.
- WhatsApp: abre con analytics respondiendo HTTP 500; se verificó un único evento con source correcto.
- Paneles de filtros y orden móvil: aplicación de verificados, cambio de orden y cierre con Escape comprobados.
- Perfil desde card: HTTP 200.
- 375, 390, 430, 768 y 1440 px: ancho de documento igual al viewport, sin overflow horizontal accidental. Inspección visual de desktop, móvil y drawer.
- Sin errores JavaScript en las pruebas completadas.

Durante QA el tracking se interceptó y WhatsApp abrió una respuesta simulada; no se escribieron eventos productivos ni se enviaron mensajes.

## Inconsistencias y límites

- La capa previa usaba mocks ante errores. Este catálogo opta por error controlado y reintento; no altera el fallback de otras páginas.
- El mapeo existente convierte precio nulo a cero: ambos se tratan como precio no informado, sin anunciar gratuidad.
- El rediseño de ProviderCard también se refleja en categorías y favoritos, que reutilizan ese componente. Home conserva su card compacta existente.
- Supabase contiene algunos registros con nombres/fotos coincidentes con los seeds. Se consumen registros de la base real; esta fase no valida comercialmente cada negocio.
- La metadata permanece estática y con canonical `/servicios`. Las URLs filtradas quedan disponibles para futuros ajustes SEO.
- Auth, roles, RLS, migraciones y pagos no se modificaron.

### Hallazgo adicional de imágenes

La foto existente de Salta Salta devuelve 404 desde Unsplash. La nueva card maneja el error con “Imagen no disponible”, conservando el espacio y el resto de la información; se comprobó en navegador con ese registro real. No se modificó la URL guardada en Supabase. También se volvió a comprobar el formulario compartido desde Home y la persistencia de los filtros al recargar.
