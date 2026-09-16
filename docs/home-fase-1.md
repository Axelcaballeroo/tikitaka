# Tiki Taka 2.0 — Home pública, fase 1

## Entrega

Home rediseñada con identidad existente, fotografías reutilizadas, búsqueda funcional, seis familias de categorías, cuatro recomendaciones, colecciones editoriales, confianza, localidades, bloque para proveedores y preview de planes. No se desplegó ni se ejecutaron migraciones o escrituras en Supabase.

### Archivos creados y componentes nuevos

- `src/components/home/hero-search.tsx`: HeroSearch, fotografía y formulario GET.
- `src/components/home/category-explorer.tsx`: CategoryExplorer, seis grupos y listado desplegable de categorías.
- `src/components/home/featured-providers.tsx`: FeaturedProviders, cards compactas y estado vacío.
- `src/components/home/moment-collections.tsx`: MomentCollections, cuatro accesos editoriales.
- `src/components/home/trust-section.tsx`: TrustSection, información para decidir.
- `src/components/home/nearby-section.tsx`: NearbySection, localidades reales.
- `src/components/home/provider-cta.tsx`: ProviderCTA, publicación e ingreso.
- `src/components/home/plans-preview.tsx`: PlansPreview, reutilizado en Home y planes.
- `src/components/home/home-content.ts`: fotografías y agrupaciones de categorías compartidas.
- `src/app/planes/page.tsx`: placeholder comercial, sin cobros.
- `docs/home-fase-1.md`: esta entrega y resultados de QA.

### Archivos modificados

- `src/app/page.tsx`: composición de Home, datos y metadata.
- `src/app/globals.css`: estilos de Home, responsive y foco visible.
- `src/components/layout/navbar.tsx`: navegación y menú móvil.
- `src/components/layout/footer.tsx`: columnas y enlaces existentes.
- `src/app/servicios/page.tsx`: recepción de filtros desde Home.
- `src/components/marketplace/services-catalog.tsx`: inicialización de filtros, colecciones y normalización de búsquedas.
- `src/lib/data/providers.ts`: opción para desactivar fallback mock y preservar ubicaciones faltantes en ese modo.
- `next.config.ts`: permitir imágenes públicas del Storage del proyecto Supabase configurado.

### Reutilización

Logo, ButtonLink, FavoriteButton, ProviderBadge, getCategories, getProviders, tipos Category/Provider, helper money, tipografías, paleta y fotografías existentes. Se reutilizó ServicesCatalog para resultados. La card de Home compone los helpers y controles existentes; la ProviderCard del catálogo conserva su comportamiento y tracking.

## Búsqueda y datos

- El formulario GET navega a `/servicios?q=...&location=...`, también sin JavaScript.
- `q` conserva su función. `location` busca por zona o ciudad, sin distinguir mayúsculas o tildes.
- `category` admite un slug o varios separados por comas. Los grupos se cruzan con categorías devueltas por la capa existente; no requieren nuevas categorías en la base.
- Las colecciones combinan categorías con OR; texto, zona y categoría se combinan con AND. Limpiar filtros mantiene el comportamiento existente.
- La Home llama `getProviders({ allowMockFallback: false })` usando el cliente público. La consulta exige `published = true` y `status = approved`; la Home vuelve a comprobar ambos campos.
- Prioridad: destacado, luego verificado, luego rating como desempate. Se muestran hasta cuatro perfiles; se completa con otros publicados si hace falta.
- Ratings, cantidad de opiniones y precios provienen del mapeo existente. Sin opiniones se muestra “Todavía sin opiniones”; sin precio, “Consultar precio”. No se usan insignias inferidas de rapidez o popularidad.
- Localidades provenientes de esos perfiles, ordenadas por cantidad de ofertas; no se inventan cantidades ni zonas faltantes.
- Sin configuración, ante error de consulta o promesa rechazada, la Home presenta un estado vacío. Nunca sustituye recomendaciones por mocks. El fallback histórico de otras páginas no se cambió.

## Decisiones y alcance

- Server Components para las secciones; interacción cliente limitada al navbar y favoritos existentes. Sin dependencias de producción nuevas.
- `next/image` con tamaños responsive, prioridad en hero y carga diferida en colecciones.
- Grilla de categorías de 2/3/6 columnas. Recomendaciones con scroll y snap móvil, 2 columnas en tablet y 4 en desktop. Buscador vertical móvil y horizontal desde tablet.
- Navbar y footer son componentes compartidos del layout, por lo que su presentación se actualiza en las demás rutas. No cambia su lógica de negocio.
- Se mantiene `metadataBase` mediante el helper existente que lee `NEXT_PUBLIC_SITE_URL`; canonical de Home y OG actualizados. El título absoluto evita duplicar la marca. JSON-LD de perfiles intacto.
- No existen páginas de términos, privacidad ni centro de ayuda: se omitieron sus enlaces para evitar destinos rotos. Nosotros apunta a la sección de confianza; Contacto usa el correo ya existente.
- Autenticación, roles, RLS, migraciones, pagos y datos productivos intactos.

## QA — 15 de septiembre de 2026

- `npm run lint`: aprobado, sin errores ni advertencias de ESLint.
- `npm run build`: aprobado, compilación, tipos y generación de rutas completados.
- `git diff --check`: aprobado.
- Chromium: 375, 390, 430, 768 y 1440 px. El ancho del documento coincide con el viewport en todos los casos; no hay overflow horizontal de página.
- Inspección visual de hero, navbar, recomendaciones y colecciones; fotografía de hero y las cuatro imágenes editoriales cargadas.
- Menú móvil abre y cierra. Favoritos: `aria-pressed` pasa a true al guardar y a false al quitar.
- Búsqueda `q=niñera&location=palermo`: 1 resultado con los datos disponibles al probar.
- Colección `category=nineras,jardines-maternales`: 4 resultados.
- Home: 4 recomendaciones. Lectura pública directa: 22 perfiles publicados y aprobados disponibles durante QA.
- Rutas revisadas: `/`, `/servicios`, `/categorias/animadores`, `/proveedores/profe-cata`, `/publicar`, `/login`, `/planes`: HTTP 200, sin errores JavaScript.
- `/dashboard` y `/admin`: redirección correcta a `/login` sin sesión. No se probaron interiores autenticados.
- Pruebas aisladas de la capa de datos: sin configuración y con error de Supabase no devuelve mocks en modo estricto; consulta pública exige ambos filtros de publicación/aprobación.
- El endpoint de tracking se interceptó en el navegador de QA al abrir el perfil para evitar escribir eventos productivos. No se enviaron formularios.

## Problemas preexistentes / límites

- `/publicar` contiene una tabla comercial anterior (Profesional/Premium y precios) distinta al nuevo preview Básico/Destacado/Pro. Se conserva por el alcance solicitado; requiere alineación en una fase posterior.
- `NEXT_PUBLIC_SITE_URL` no está definido en el entorno local; canonical usa el fallback existente `http://localhost:3000`. En producción debe mantenerse configurada la URL pública.
- Supabase contiene registros con nombres similares a los seeds del proyecto. Se usaron registros realmente leídos de Supabase; no se puede confirmar desde el código si cada negocio corresponde a un proveedor comercial real.
- Las páginas ajenas a Home mantienen sus fallbacks y textos previos. Esta fase no audita sus afirmaciones comerciales ni modifica sus datos.

## Fase 2

El marketplace ahora comparte el formulario de búsqueda de Home y usa una card pública 2.0. Ver `marketplace-fase-2.md` para el alcance y la validación posteriores.
