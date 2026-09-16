# Fase 4 — Publicar mi servicio

## Entrega

`/publicar` explica los beneficios antes de pedir autenticación. Con sesión de proveedor ofrece seis pasos: negocio, servicios, fotos, contacto/zona, vista previa y envío. El envío termina con confirmación y enlaces al panel e inicio. Los planes son opcionales; no se agregaron cobros, tablas, columnas, estados, migraciones ni cambios de RLS.

## Archivos creados

- `src/app/api/onboarding/route.ts`
- `src/lib/onboarding.ts`
- `src/components/onboarding/publish-intro.tsx`
- `src/components/onboarding/onboarding-wizard.tsx`
- `src/components/onboarding/onboarding-fields.tsx`
- `src/components/onboarding/onboarding-photos.tsx`
- `src/components/onboarding/onboarding-preview.tsx`
- `tests/onboarding.test.mjs`
- `docs/onboarding-fase-4.md`

## Archivos modificados en esta fase

- `src/app/publicar/page.tsx`: entrada según sesión y rol.
- `src/app/registro/page.tsx`, `src/components/auth/register-form.tsx`, `src/components/auth/login-form.tsx`: retorno interno seguro mediante `next`, conservando el destino predeterminado al panel y el destino admin.
- `src/app/api/dashboard/images/route.ts`: permite eliminar portada usando la propiedad del proveedor y el Storage existentes.
- `src/components/provider/profile-details.tsx`: modo de vista previa que omite el mensaje de perfil publicado.
- `src/app/globals.css`: campos, botones y errores del wizard.
- `next.config.ts`: permite el protocolo y puerto del Storage configurado, incluido Supabase local HTTP; conserva el ámbito de imágenes públicas del Storage.

Los archivos de fases anteriores siguen en el mismo árbol de trabajo; su inventario está en los documentos de Home, marketplace y perfil.

## Auth, persistencia y estado

- Se mantiene Supabase Auth y `/api/auth/register`. El registro actual ya crea un proveedor vinculado a `user_id`; el onboarding lo recupera, sin crear otra `provider_request`.
- Login/registro desde la intro vuelven a `/publicar`. Si Auth requiere confirmar email, se conserva el mensaje existente y el enlace de login con retorno. No se cambió la configuración de Auth.
- La nueva API verifica `auth.getUser()`, consulta el proveedor por `user_id` y opera con el cliente autenticado sujeto a RLS. No usa service role.
- Una cuenta autenticada sin proveedor crea uno al primer guardado válido. La unicidad existente de `user_id` y la recuperación tras conflicto evitan duplicados. Los servicios conservan UUID estables al reintentar.
- Texto y paso se conservan en localStorage por cuenta durante siete días. Las fotos se recuperan del servidor. Si no se puede usar almacenamiento local, la interfaz informa que se debe guardar antes de salir.
- “Guardar progreso” escribe los campos válidos en el proveedor existente. También se guarda al salir de servicios y contacto. Texto incompleto se conserva localmente; no hace falta completar todo el contacto para guardar el borrador.
- Envío final: validación completa y confirmación obligatoria; `status='pending'`, `published=false`. Los flags de publicación/verificación/destacado enviados por cliente se descartan.
- Proveedor pendiente: informa revisión y permite continuar. Rechazado: permite corregir y reenviar. Aprobado/publicado: deriva al panel y bloquea el envío del wizard para no devolverlo a pendiente.
- Visibilidad pública existente: `published=true AND status='approved'`. Los campos reales son `published`, `status`, `verified`, `featured`; no hay columna `approved`.

## Servicios, Storage y validaciones

- Se usan `provider_services.title`, `description` y `price_from`; máximo cinco servicios en onboarding. “Consultar precio” corresponde a NULL; un precio cero se conserva como cero.
- Nombre 2–100 caracteres, descripción 20–2000, categoría activa real. En envío: WhatsApp de 8–15 dígitos, email opcional válido y al menos zona o ciudad. Se normaliza WhatsApp a dígitos sin agregar un sistema telefónico nuevo.
- Límites de longitud, UUID únicos y precios decimales no negativos se validan en cliente y servidor. La API permite únicamente campos expresamente seleccionados y comprueba pertenencia de servicios; conserva RLS.
- Fotos: API existente `/api/dashboard/images`, bucket `provider-images`; rutas por usuario/proveedor/tipo. JPEG, PNG y WEBP, hasta 5 MB por archivo y ocho imágenes de galería, más portada. Se muestran previews y se permite eliminar. No se obliga a cargar fotos porque no existía un mínimo.
- Horarios opcionales usan `schedule` textual existente. No se solicitan dirección exacta ni tipo de negocio sin representación real.

## Preview y accesibilidad

La vista previa reutiliza ProviderGallery y ProfileDetails del perfil público. Muestra nombre, categoría, zona, descripción, servicios, precios, fotos y contacto real del borrador, marcada “Vista previa”. No publica, no inventa reseñas ni activa acciones de contacto. Permite editar y continuar. Stepper numérico, labels asociados, errores inline, foco en el título al cambiar de paso y botones con estado de guardado.

## QA

- Invitado con configuración real: intro, enlaces con retorno y rechazo 401 de escritura sin sesión.
- Las operaciones de registro, login, guardado, Storage y envío se ejecutaron contra un servidor HTTP de fixtures en memoria, exclusivamente local. No se escribieron cuentas ni datos productivos. Esto comprueba integración de UI y rutas; no equivale a una prueba de escritura contra el Storage/RLS desplegado.
- Registro → wizard → seis pasos → éxito: aprobado. Recarga conserva descripción. Dos servicios, uno sin precio; portada y galería válidas; PDF rechazado; nueve fotos rechazadas; preview sin mensaje de publicación; checkbox obligatorio.
- Login con proveedor pending, published y rejected: estados correctos. Cuenta sin proveedor: creación al guardar, dos envíos mantienen un único proveedor. Envío de flags privilegiados no publica ni verifica. Draft incompleto devuelve 400; proveedor aprobado devuelve 409. API de imágenes rechaza MIME inválido y archivo mayor a 5 MB.
- Anchos 375, 390, 430, 768 y 1440: wizard sin overflow horizontal. Capturas móviles y desktop, y vista previa inspeccionadas. Sin errores JavaScript durante el recorrido completo.
- `npm run lint`: aprobado.
- `node --test tests/marketplace.test.mjs tests/provider-profile.test.mjs tests/onboarding.test.mjs`: 19 pruebas aprobadas.
- `npm run build`: aprobado, incluyendo TypeScript y generación de rutas.

## Límites e inconsistencias detectadas

- El esquema no distingue borrador pendiente de solicitud enviada. Guardar progreso ya deja un registro pendiente visible para el administrador; el envío no crea una segunda entidad ni un nuevo estado. Se mantiene el comportamiento de registro existente.
- El flujo histórico de `provider_requests` produce proveedores sin vincular a Auth al aprobarse. Se preserva para solicitudes anteriores; el nuevo onboarding reutiliza el proveedor de la cuenta para evitar duplicados.
- No hay transacción entre proveedor y servicios en la API existente: un fallo intermedio puede dejar parte del borrador guardado. Se informa error y el reintento usa los mismos IDs; solo se confirma el envío tras completar esas operaciones.
- No se agrega reordenado de imágenes: existe `sort_order`, pero no una operación actual de reordenado; se conserva el orden de carga.
- No se ejecutaron migraciones, despliegues, cambios de `.env.local` ni escrituras productivas.
