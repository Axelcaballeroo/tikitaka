# Tiki Taka

Marketplace infantil construido con Next.js 15, TypeScript, Tailwind CSS y Supabase.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` se obtienen en Settings → API del proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` se usa únicamente en el servidor para solicitudes y administración. Nunca debe llevar prefijo `NEXT_PUBLIC_`, subirse al repositorio ni enviarse al navegador.
- Sin variables configuradas, las páginas públicas usan los mocks de forma controlada. Las escrituras y el admin muestran datos vacíos o un error amable: no se simulan escrituras locales.

## Crear la base de datos

1. Crear un proyecto en Supabase.
2. Abrir SQL Editor.
3. Ejecutar completo [`supabase/schema.sql`](supabase/schema.sql).
4. Ejecutar completo [`supabase/seed.sql`](supabase/seed.sql).
5. Copiar las variables del proyecto a `.env.local` y reiniciar Next.js.

El seed es idempotente y carga 13 categorías, 20 proveedores publicados, servicios, imágenes remotas y 60 reseñas.

## Actualizar Supabase antes del deploy

Para actualizar una base existente sin borrar datos:

1. Abrir el proyecto en Supabase.
2. Ir a **SQL Editor**.
3. Abrir [`supabase/production-update.sql`](supabase/production-update.sql) en este repositorio.
4. Copiar todo el contenido en SQL Editor.
5. Ejecutar el script completo.
6. Confirmar en **Table Editor** que existe `contact_events` y que `reviews` contiene las columnas `status` y `published`.
7. Reiniciar el servidor local.

En **Table Editor**, abrir `contact_events` para comprobar sus columnas y luego `reviews` para verificar la moderación. En una instalación nueva se debe ejecutar `supabase/schema.sql`; `production-update.sql` es sólo la actualización incremental.

## Tablas

- `profiles`: perfil y rol asociado a `auth.users`.
- `categories`: categorías activas del marketplace.
- `providers`: datos principales, moderación y publicación.
- `provider_images`: galería ordenada de cada proveedor.
- `provider_services`: servicios y precios orientativos.
- `reviews`: opiniones públicas.
- `favorites`: preparada para usuarios autenticados; la UI todavía usa `localStorage`.
- `provider_requests`: solicitudes enviadas desde `/publicar`.

Todas las tablas tienen RLS. El público sólo puede leer categorías activas y datos de proveedores publicados/aprobados. Los proveedores autenticados pueden leer y editar sus propios datos. El acceso administrativo se resuelve con service role en rutas server-side.

## Probar el flujo completo

1. Abrir `/publicar` y enviar una solicitud.
2. Abrir `/admin/solicitudes`.
3. Marcar verificado/destacado si corresponde y aprobar.
4. La aprobación crea un proveedor `published = true`, genera un slug único y agrega imagen/servicio inicial.
5. Abrir `/servicios` y entrar al nuevo perfil `/proveedores/[slug]`.
6. Gestionar visibilidad y badges desde `/admin/proveedores`.

## Registro y panel de proveedor

1. Abrir `/registro` y completar los datos personales y del negocio.
2. Supabase Auth crea el usuario; Tiki Taka crea automáticamente un `profile` con rol `provider` y un proveedor `pending`, no publicado.
3. Si Confirm email está activo en Supabase Auth, confirmar el correo antes de usar `/login`. Para desarrollo también puede desactivarse temporalmente en Authentication → Providers → Email.
4. Iniciar sesión en `/login`. Las rutas `/dashboard/*` están protegidas por middleware y redirigen a login cuando no existe una sesión válida.
5. Editar datos en `/dashboard/perfil`, gestionar servicios en `/dashboard/servicios` y URLs de imágenes en `/dashboard/fotos`.
6. Abrir `/admin/proveedores` y elegir **Aprobar**. Esto establece `status = approved` y `published = true`.
7. El proveedor puede abrir `/dashboard/vista-publica` y acceder a `/proveedores/[slug]`.
8. Para cerrar la sesión, usar el enlace del sidebar o abrir `/logout`.

Después de actualizar desde una fase anterior, volvé a ejecutar `supabase/schema.sql`: utiliza `if not exists` y reemplaza las políticas RLS necesarias para el panel de proveedor.

## Crear y probar un administrador

No existe registro público de administradores. Primero registrá o creá el usuario desde Supabase Auth y luego ejecutá en SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'EMAIL_ADMIN';
```

Después:

1. Iniciá sesión normalmente desde `/login`; el rol `admin` redirige a `/admin`.
2. Revisá cuentas registradas en `/admin/proveedores` y filtrá por Pendientes.
3. **Aprobar** establece `status = approved` y `published = true`.
4. **Ocultar/Publicar** controla la aparición en `/servicios` y `/proveedores/[slug]`.
5. El detalle completo y sus acciones están en `/admin/proveedores/[id]`.
6. Las solicitudes externas se revisan en `/admin/solicitudes`; se bloquea la conversión cuando ya existe el mismo email o WhatsApp.

## Rutas protegidas

- `/dashboard` y todas sus subrutas: requieren sesión con rol `provider`.
- `/admin` y todas sus subrutas: requieren sesión con rol `admin`.
- Sin sesión, ambas áreas redirigen a `/login`.
- Un proveedor que intenta abrir admin vuelve a `/dashboard`.
- Un admin que intenta abrir dashboard vuelve a `/admin`.
- Las APIs `/api/admin/*` vuelven a validar el rol en el servidor antes de usar service role.

> El admin está abierto sólo para desarrollo. No desplegarlo así en producción.

## Imágenes y Storage

El bucket esperado es `provider-images`. La forma recomendada de crearlo es volver a ejecutar `supabase/schema.sql`: el script crea/actualiza el bucket con acceso público de lectura, límite de 5 MB y MIME permitidos (`image/jpeg`, `image/png`, `image/webp`), además de instalar las políticas RLS.

También puede crearse manualmente en Storage → New bucket:

- Nombre: `provider-images`
- Public bucket: activado
- File size limit: 5 MB
- Allowed MIME types: JPG, PNG y WEBP

Las rutas siguen el formato `{user_id}/{provider_id}/{cover|logo|gallery}/{uuid}.ext`. Las APIs validan sesión y pertenencia; Storage RLS impide escribir o borrar fuera de la carpeta propia. La galería admite hasta ocho imágenes. Portada y logo sustituyen y eliminan el archivo anterior cuando pertenecía al bucket.

## Reseñas y contactos por WhatsApp

Después de actualizar, ejecutá nuevamente `supabase/schema.sql` y `supabase/seed.sql`. El esquema agrega moderación a `reviews`, crea `contact_events`, sus índices y políticas RLS.

Para probar reseñas:

1. Abrí un perfil público `/proveedores/[slug]`.
2. Completá nombre, calificación y comentario al final del perfil.
3. La reseña aparece públicamente y actualiza `rating` y `reviews_count`.
4. Ingresá como admin a `/admin/resenas` para aprobar, ocultar o eliminar. Cada acción recalcula las métricas.

Para probar tracking y analytics:

1. Hacé clic en WhatsApp desde una card, el perfil o la caja sticky. WhatsApp abre aunque el registro falle.
2. Ingresá como admin a `/admin/analytics` para ver total, fuentes, últimos contactos y ranking de proveedores.
3. El dashboard `/admin` muestra contactos de hoy, del mes, ranking y reseñas pendientes.
4. El proveedor ve únicamente sus propios contactos, rating y últimas reseñas en `/dashboard`, protegido por RLS.

## Pendiente antes de producción

- Recuperación de contraseña, cambio de email y gestión avanzada de cuenta.
- Transformación, recorte y optimización automática de imágenes.
- Login de familias y migración de favoritos a la tabla `favorites`.
- Protección anti-spam/rate limit y CAPTCHA en solicitudes.
- Auditoría, logs y transacciones para el flujo de aprobación.
- Generar tipos TypeScript desde el esquema de Supabase.
- Pagos, reservas y chat interno (fuera del alcance actual).

## Calidad

```bash
npm run lint
npm run build
```
