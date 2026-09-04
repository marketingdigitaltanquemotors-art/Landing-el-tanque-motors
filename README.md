# Landing El Tanque Motors

Landing administrable para publicar vehículos seminuevos, recibir solicitudes de cita y mostrar páginas individuales por unidad.

## Stack

- Next/Vinext con React y TypeScript.
- Vercel para despliegue de producción.
- Supabase Postgres para configuración, vehículos y leads.
- Supabase Storage para fotos y videos.

## Configuración

Copia `.env.example` a `.env.local` en desarrollo y define:

- `ADMIN_USERNAME`: usuario del panel, por defecto `admin`.
- `ADMIN_PASSWORD`: contraseña del panel. Obligatoria para acceder a `/admin`.
- `ADMIN_SESSION_SECRET`: secreto para firmar la cookie HttpOnly del panel.
- `NEXT_PUBLIC_SITE_URL`: URL pública canónica del sitio.
- `SUPABASE_URL`: Project URL del proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: service role key de Supabase. Solo servidor.
- `SUPABASE_STORAGE_BUCKET`: bucket privado para media, por defecto `vehicle-media`.

No subas `.env.local` al repositorio.

Antes de publicar en Vercel, ejecuta `supabase/schema.sql` en el SQL Editor de
Supabase. Ese script crea las tablas, indices y el bucket privado.

## Comandos

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm run build:vercel
```

## Flujo de negocio

- `/` muestra la portada y el inventario publicado desde Supabase.
- `/vehiculo/:id` muestra la página individual del vehículo con metadata dinámica.
- `/agendar` registra leads en Supabase mediante `/api/leads`.
- `/admin` permite editar textos, vehículos, fotos, video y revisar leads.

## Notas de seguridad

El panel ya no guarda credenciales ni datos sensibles en `localStorage`. La sesión se firma en servidor y se envía como cookie HttpOnly. Antes de publicar, configura secretos fuertes en el entorno de hosting. La clave `SUPABASE_SERVICE_ROLE_KEY` no debe exponerse al cliente ni usarse con prefijo `NEXT_PUBLIC_`.
