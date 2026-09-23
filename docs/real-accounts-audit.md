# Cuentas reales: auditoría e implementación

Estado local, sin SQL ejecutado ni cambios de datos productivos.

## Infraestructura encontrada

- Supabase Auth con email/contraseña, cliente SSR y cliente browser.
- `profiles` contiene `id`, `email`, `full_name` y `role`. El schema versionado acepta sólo `admin` y `provider`; el trigger de alta asigna `provider` por defecto.
- Un `/login` único. La resolución de rol se centralizó y los destinos son `/admin`, `/dashboard` y `/cuenta`.
- Middleware protege `/admin`, `/dashboard` y `/cuenta`; cada layout vuelve a comprobar el rol desde la base.
- Onboarding crea o edita exclusivamente el provider cuyo `user_id` coincide con el usuario autenticado.
- Dashboard obtiene el provider por `providers.user_id = auth.uid()`. Perfil, servicios, fotos y Storage ahora pasan por rutas server-side que vuelven a comprobar ownership.
- Los providers legacy con `user_id = NULL` no se modifican ni se reclaman.
- `favorites` existe en el schema con `user_id` y RLS de propietario, pero la UI pública actual usa `localStorage`.
- `reviews` no tiene `user_id`; no existe vínculo seguro para “Mis reseñas”.

## Requisito pendiente de base de datos

`supabase/production/04_customer_accounts.sql` agrega `customer` al constraint de roles y adapta el trigger de Auth para aceptar únicamente `provider` o `customer` desde metadata. También conserva la imposibilidad de autoasignarse `admin` y explicita la policy de favoritos por `auth.uid()`.

La propuesta debe auditarse y probarse primero en staging. Hasta entonces `CUSTOMER_ACCOUNTS_ENABLED` debe permanecer desactivada; la UI presenta Familia, pero no intenta crear una cuenta incompatible con producción.

## Favoritos y reseñas

La cuenta customer muestra los favoritos locales sin romper la experiencia anónima. La sincronización entre `localStorage` y `favorites` queda para una fase posterior a certificar RLS y definir una estrategia de merge sin duplicados. “Mis reseñas” queda fuera porque el schema actual no permite atribuirlas a un usuario autenticado.
