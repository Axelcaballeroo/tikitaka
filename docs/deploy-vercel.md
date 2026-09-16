# Deploy de Tiki Taka en Vercel

## Requisitos previos

Cerrar los bloqueadores del [informe de fase 7](preproduccion-fase-7.md). No ejecutar SQL ni desplegar sin autorización explícita. Este documento no activa despliegues ni migraciones.

## 1. Variables por entorno

En Vercel → Project → Settings → Environment Variables, configurar:

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase de ese entorno |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon del mismo proyecto |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreto del mismo proyecto, exclusivamente servidor |
| `NEXT_PUBLIC_SITE_URL` | Origen HTTPS real, sin ruta, query ni credenciales |
| `NEXT_PUBLIC_TIKITAKA_WHATSAPP` | Número comercial real con código de país |
| `NEXT_PUBLIC_TIKITAKA_EMAIL` | Correo comercial real |

Configurar al menos uno de los dos contactos. WhatsApp tiene prioridad; sin ambos los CTA se deshabilitan. El WhatsApp de cada negocio sigue saliendo de su registro en Supabase.

Separar Production y Preview; usar staging para Preview. No entregar claves productivas a ramas no revisadas. Las variables públicas se incorporan al build; después de cambiarlas se necesita un nuevo deployment. [Documentación de variables de Vercel](https://vercel.com/docs/environment-variables).

En local copiar los nombres de `.env.example` a `.env.local`, sin versionar valores. Para Vercel, la aplicación falla deliberadamente si falta `NEXT_PUBLIC_SITE_URL`; no publica canonicals de localhost. Preview agrega `noindex,nofollow`, pero eso no sustituye controlar el acceso al staging.

## 2. Supabase Authentication

En Authentication → URL Configuration:

1. Site URL: el origen HTTPS productivo elegido.
2. Redirect URLs de producción: `https://DOMINIO-REAL/login?next=%2Fpublicar`.
3. Desarrollo: `http://localhost:3000/**`, solo donde se permita desarrollo.
4. Preview: preferir dominio estable de staging y su URL de login exacta. Si hace falta un wildcard de Vercel, restringirlo al proyecto/equipo y comprobar el patrón en Supabase; no permitir cualquier dominio.

Sustituir DOMINIO-REAL por el dominio configurado en `NEXT_PUBLIC_SITE_URL`. Si se utiliza también un dominio `vercel.app`, autorizar su retorno exacto únicamente si realmente se ofrece registro en él. No existe un callback OAuth nuevo: el flujo actual es confirmación de correo → `/login?next=%2Fpublicar` → contraseña → onboarding.

Comprobar SMTP, entrega de correo y confirmación con la cuenta real autorizada. Abrir el enlace desde el correo y verificar el dominio de llegada, login, sesión, logout y acceso denegado después de cerrar sesión. [Documentación de redirects de Supabase](https://supabase.com/docs/guides/auth/redirect-urls).

## 3. Base y permisos

Con aprobación, ejecutar primero la auditoría de `supabase/production/00_audit.sql`. Contrastar políticas desplegadas con el repositorio. Revisar y ensayar `01_security_review.sql` en staging antes de cualquier aplicación productiva. Las plantillas de ownership y agregados son decisiones separadas; nunca ejecutarlas automáticamente al hacer build.

Probar con admin, provider A, provider B y público: lectura/escritura cruzada, campos privilegiados, imágenes, reseñas y eventos. Vincular solo cuentas cuya identidad se haya comprobado; un negocio sin owner puede seguir administrado por Camila.

## 4. Validación local reproducible

Desde la raíz, con las variables del entorno seleccionado:

```powershell
npm ci
npm run lint
node --test tests/*.test.mjs
npm run build
npm audit --omit=dev
node scripts/preproduction-audit.mjs
npm start
```

El script de auditoría consulta datos reales de solo lectura y escribe evidencia local ignorada por Git. Nunca compartir `.env.local` ni publicar `.reports` como artefacto público.

## 5. Crear el deployment autorizado

1. Revisar el diff completo de las fases 1–7 y guardar una revisión identificable en el repositorio elegido.
2. En Vercel importar ese repositorio; raíz del proyecto: esta carpeta. Preset: **Next.js**.
3. Install Command: `npm ci`. Build Command: `npm run build`. Output Directory: valor predeterminado de Next.js. No configurar exportación estática: hay APIs, cookies y rutas dinámicas.
4. Elegir una versión de Node compatible con dependencias y repetir el build con la misma versión de Vercel antes del despliegue.
5. Configurar variables de Preview y Production antes de construir. Usar un origen estable de staging para el primer Preview.
6. Con autorización explícita, generar el Preview. Revisar build y runtime logs sin copiar secretos.
7. Completar smoke y pruebas autenticadas en ese Preview. Solo después, con autorización, promover/desplegar la revisión validada a Production.
8. Agregar el dominio final y comprobar HTTPS, Auth URLs y `NEXT_PUBLIC_SITE_URL`; si cambia alguna variable, reconstruir.

Vercel permite separar entornos y promover revisiones; los valores aplicados deben corresponder al deployment destino. [Entornos de Vercel](https://vercel.com/docs/deployments/environments).

## 6. Smoke en el dominio desplegado

- Público: Home con datos reales, búsqueda `q`/`location`, categorías, perfil, favoritos, WhatsApp e imágenes optimizadas; verificar canonical y JSON-LD del dominio correcto.
- Provider: registro real, confirmación/login/logout, onboarding con imágenes/servicios/contacto, envío pending/no publicado, dashboard propio y bloqueo de admin/datos ajenos.
- Admin: cola pending, editar, aprobar/publicar, verificar/destacar, ocultar y confirmar desaparición pública; analytics y moderación real de reseñas.
- Contactos: un evento por clic para cada origen, apertura de WhatsApp aun si tracking falla, y ausencia de leads por contacto comercial.
- Storage: subida y borrado permitidos al propietario/admin y rechazados para el otro provider.
- Navegador: sin errores JS críticos, sin desbordamiento móvil y sin secretos en respuestas/bundles.

## 7. Rollback

Conservar la revisión anterior y restaurar su deployment si aparece una regresión. No restaurar ni borrar datos automáticamente. Un rollback de Vercel no revierte SQL: cualquier modificación aprobada de base necesita su propio procedimiento revisado.
