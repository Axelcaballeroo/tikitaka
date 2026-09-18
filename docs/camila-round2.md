# Camila Round 2 — implementación local

Base: `main`, actualizado con `git pull --ff-only origin main`, commit `05d32b7f55d2d851ae97b4812a7780894fd892a0`. Trabajo realizado exclusivamente en `C:/Users/Axel/tikitaka-integration`. Sin commit, push, deployment, SQL ni escrituras a Supabase productivo.

## Paleta y pantallas

| Token | Valor / función |
| --- | --- |
| `--primary` | `#c44916`, naranja de acciones y links |
| `--primary-hover` | `#a63710` |
| `--primary-soft` | `#fff0e3`, peach suave |
| `--primary-muted` | `#ffd8b7`, acentos y controles |
| `--surface-warm` | `#fffaf3`, crema |
| `--text-primary` | `--ink`, petróleo `#193b3a` |
| `--accent-yellow` | `#ffd36e` |
| `--border-soft` | `#ead8c9` |
| `--focus-ring` | `#c4491666` |

Los aliases existentes `brand`, `brand-dark`, `mint`, `cream`, `sun` y las variables históricas apuntan a los tokens semánticos. Se revisaron bordes, scrollbar y focos CSS que aún tenían acentos verdes explícitos; no se reemplazaron indiscriminadamente colores de fotografías, logos o estados semánticos. Rosa, lila y amarillo permanecen como acentos.

Afecta Home, marketplace, perfiles, navbar/footer, login/registro, onboarding, planes, dashboard y acciones de Admin. Camila OS mantiene el sidebar petróleo y usa peach/naranja en selección, indicadores y acciones. Cards, botones y dropdowns tienen transiciones suaves; se respeta reduced motion.

## Hero

`public/gordo.jpeg` se copió exactamente del archivo entregado en el checkout original. SHA256: `375ac8d59636cbd0a2ce39b10c266e6d471f9bee0bcc9b2c88fd8983a9b8431c`.

No se editó la imagen ni sus colores. Usa Next Image con `object-fit: cover`, `object-position: 58% 72%`, tamaños responsivos, carga prioritaria, marco redondeado y acento ornamental independiente de la fotografía. Composición editorial con crema/peach, texto petróleo, foto grande y nota de familia. El logo multicolor y los dos archivos oficiales anteriores están intactos.

El buscador de Home conserva su envío explícito mediante Buscar/Enter; no tiene live search.

## Marketplace

- Titular exacto: **Encontrá lo que necesites en un solo click**.
- Subtítulo anterior eliminado sin reemplazo, con mayor separación al buscador.
- Live search exclusivo de `/servicios`, debounce de 300 ms, soporte de composición IME y cancelación de timers al navegar/desmontar.
- Los datos siguen viniendo de la consulta pública existente de Supabase. Filtrado sobre nombre, categoría, descripción, títulos y descripciones de servicios. Se preservan normalización y equivalencias.
- Resultados memorizados; la escritura no vuelve a consultar el catálogo. Next puede precargar los links de perfiles que se vuelven visibles, como ya hacía.
- Sugerencias de categorías, nombres y títulos presentes en los proveedores públicos recibidos. Deduplicación normalizada, máximo seis, sin etiquetas inventadas. Combobox/listbox, flechas, Enter, Escape, click y foco conservado.
- El botón Buscar permite confirmar; no es necesario para filtrar. Vaciar input o usar Limpiar búsqueda restaura resultados.
- `q`, `category`, `zona`, `localidad`, `sort` y flags existentes se combinan en la URL. Sigue aceptándose `location` para enlaces anteriores y el formulario de Home; las nuevas interacciones escriben `zona`.
- Native History API mantiene URLs compartibles y Back/Forward sin refetch del catálogo. Navegar atrás durante un debounce cancela la búsqueda pendiente.
- Zona Norte contiene Beccar; Zona Sur no. Cambiar zona limpia localidad.
- “salones de eventos” devuelve los cuatro registros reales ya verificados. No hay filtro/orden general de precio. `price_from` y precios de servicios siguen intactos y disponibles en los contextos individuales existentes.

## Planes

Cards públicas: **Tiki Taka Gratis**, **Tiki Taka PRO**, **Tiki Taka Negocios**. Gratis usa crema, PRO peach/naranja como protagonista y Negocios lila.

Se conservaron los beneficios existentes, ajustando referencias entre nombres. El anterior Básico se presenta como Gratis y el anterior Destacado como PRO. Negocios conserva la propuesta de acompañamiento en preparación del anterior tercer plan. La lógica de visibilidad y `featured` no cambia, y no se crean planes en DB, precios monetarios ni pagos. Dashboard y Home usan nombres consistentes; el ancla `#destacado` sigue funcionando.

## Auth y cuenta de proveedor

Ya existían registro Supabase Auth, perfil con rol provider, vínculo `providers.user_id`, onboarding persistente, dashboard, estadísticas, servicios/fotos, guardas server-side y políticas/plantillas de seguridad en el repositorio. No se duplicó esa infraestructura.

Se completaron:

- Navbar con sesión, primer nombre del perfil o “Mi cuenta”; nunca email como etiqueta.
- Endpoint `GET /api/auth/session` privado/no-store: valida `getUser()` y lee únicamente `full_name,role` del perfil del usuario verificado. No expone claves ni datos de otros usuarios.
- Menú admin: Camila OS, Configuración, marketplace, cerrar sesión. Menú provider: panel, perfil, vista de publicación, cerrar sesión. Sólo rutas existentes.
- Actualización al cambiar ruta, volver a la pestaña o recuperar foco. El control de navbar no agrega el SDK completo de Supabase al bundle público.
- Login admin sigue hacia `/admin`; provider hacia `/dashboard`, respetando el retorno interno de onboarding. Middleware y autorización server-side siguen presentes.
- `/publicar` muestra directamente registro/login, sin ocultarlos detrás de un segundo desplegable.
- Registro usa Zona → Localidad, valida la pareja en servidor antes del signup y guarda `city` real. El destino predeterminado de registro pasa a `/publicar`.
- El servidor sigue fijando `role=provider`, `user_id=signup.user.id`, `pending`, `published=false`; ignora ownership/privilegios enviados por el cliente.

No se crearon cuentas productivas, no se asignaron usuarios a providers legacy, no se implementaron cuentas de familias ni “reclamar perfil”. Favoritos conserva su sistema actual.

No se requiere una migración nueva para estos cambios: las columnas y el flujo ya existen. No se ejecutó SQL. Los tests aislados verifican las guardas de aplicación; no certifican el estado desplegado de RLS. El repositorio ya contiene `supabase/production/00_audit.sql` y `01_security_review.sql` como revisión/propuesta previa; esta fase no los modifica ni aplica. Las ediciones directas del dashboard continúan dependiendo de la RLS existente.

## Validación y QA

- `npm run lint`: correcto.
- `npm test`: **54/54**, conservando/adaptando los 45 existentes y agregando nueve de sugerencias, sesión, roles, registro y ownership.
- `npm run build`: correcto. First Load JS compartido aproximadamente 140 kB; Home 128 kB y marketplace 135 kB.
- **12 escenarios Playwright correctos**: nueve públicos y tres de cuenta con backend en memoria. Se ejecutaron por separado; las pruebas de cuentas requieren habilitar explícitamente el entorno aislado.
- QA público sobre build local y Supabase real en sólo lectura: búsqueda sin Enter, debounce, URL/Back/Forward, limpieza, sugerencias teclado/click, combinación categoría/zona/localidad/orden, texto exacto y fotografía real.
- QA privado exclusivamente sobre localhost: admin/provider, navbar/dropdown, cierre de sesión, redirecciones entre roles y registro hacia onboarding con una sola publicación ligada al usuario.
- Anchos **375, 430, 768, 1024 y 1440 px**: Home/Hero, marketplace/sugerencias/filtros, planes, registro, navbar autenticada, Admin y Dashboard sin overflow horizontal.
- Capturas inspeccionadas de Hero móvil/escritorio, planes y Admin. Evidencias locales en `.qa-private/round2-*.png`, excluidas de Git.
- Auditoría de diff: sin eliminaciones de archivos/módulos, sin cambios en SQL, middleware, consultas públicas o precios. Sin valores de secretos de `.env.local` en los archivos del release.

### Reproducir

Tests de lógica: `npm test`. Para browser público, iniciar la app local en puerto 3100 y ejecutar `npm run test:browser -- tests/browser/round2.spec.ts`. Se usa Chrome instalado; `QA_BROWSER_CHANNEL` permite elegir otro canal compatible.

Para pruebas privadas, detener primero la app anterior y ejecutar en terminales separadas:

```powershell
node tests/support/memory-supabase.cjs
```

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='http://localhost:54329'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='qa-anon'
$env:SUPABASE_SERVICE_ROLE_KEY='qa-service'
npm run dev -- --port 3101
```

```powershell
$env:QA_BASE_URL='http://localhost:3101'
$env:QA_MEMORY_AUTH='1'
npm run test:browser -- tests/browser/account.spec.ts
```

Estos valores sólo identifican el doble local en memoria, no credenciales reales. Las pruebas privadas rechazan URLs distintas al loopback configurado. Detener esos procesos y cerrar esas terminales antes de volver al entorno real.

## Archivos

Modificados:

- `package.json`, `package-lock.json`: Playwright como dependencia de desarrollo y comando de QA.
- `src/app/globals.css`: tokens, Hero, live search, planes y cuenta.
- `src/app/api/auth/register/route.ts`, `src/app/registro/page.tsx`.
- `src/components/auth/register-form.tsx`.
- `src/components/home/hero-search.tsx`, `src/components/home/plans-preview.tsx`.
- `src/components/layout/navbar.tsx`.
- `src/components/marketplace/services-catalog.tsx`.
- `src/components/onboarding/publish-intro.tsx`.
- `src/components/plans/plan-options.tsx`, `src/lib/plans.ts`.
- `src/components/admin/admin-shell.tsx`, `src/components/dashboard/plan-card.tsx`.
- `src/lib/provider-search.ts`, `tests/dashboard.test.mjs`.

Nuevos:

- `public/gordo.jpeg`.
- `src/app/api/auth/session/route.ts`.
- `src/components/layout/account-control.tsx`, `src/lib/account-menu.ts`.
- `src/components/marketplace/live-search.tsx`.
- `playwright.config.ts`, `tests/round2.test.mjs`.
- `tests/browser/round2.spec.ts`, `tests/browser/account.spec.ts`.
- `tests/support/memory-supabase.cjs`.
- Este reporte: `docs/camila-round2.md`.

Total: **28 archivos**, 17 modificados y 11 nuevos; ninguno eliminado.

## Antes de producción

1. Revisión visual de Camila y aprobación de estos cambios locales; esta fase no publica nada.
2. Confirmar las denominaciones comerciales Gratis/PRO/Negocios; aquí se aplicó el mapeo anterior preservando los beneficios y el control `featured`.
3. El contacto comercial local no está configurado, por lo que los CTA comerciales usan el estado seguro existente. Verificar esa configuración y la confirmación de email/redirects de Auth en el entorno de destino. No se modificaron variables secretas.
4. La verificación de ownership productivo con cuentas reales y políticas desplegadas queda fuera de estas pruebas en memoria; utilizar un entorno autorizado antes de probar escrituras reales. No hace falta SQL adicional por la navbar o los selectores.
5. La imagen externa de Unsplash de una colección de Home que ya devolvía 404 no fue alterada; el nuevo Hero local carga correctamente.
