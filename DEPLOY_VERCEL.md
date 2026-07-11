# Deploy de Tiki Taka en Vercel

1. Subir el proyecto a GitHub sin incluir `.env.local`.
2. Importar el repositorio desde **Add New > Project** en Vercel.
3. Configurar las variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_SITE_URL=https://TU-DOMINIO.vercel.app
   ```

4. Ejecutar completo `supabase/production-update.sql` en Supabase SQL Editor.
5. En **Authentication > URL Configuration**, establecer **Site URL** en `https://TU-DOMINIO.vercel.app`.
6. Agregar las Redirect URLs `http://localhost:3000/**` y `https://TU-DOMINIO.vercel.app/**`.
7. Hacer el deploy desde Vercel.
8. Probar `/login` con una cuenta provider y una admin, sus accesos a `/dashboard` y `/admin`, y un clic de WhatsApp.

`SUPABASE_SERVICE_ROLE_KEY` es sólo para servidor y nunca debe llevar el prefijo `NEXT_PUBLIC_`. No se necesita `vercel.json`: Vercel detecta Next.js, Route Handlers y middleware durante el build.
