# Landing El Tanque Motors

Landing administrable para publicar vehículos seminuevos, recibir solicitudes de cita y mostrar páginas individuales por unidad.

## Stack

- Next/Vinext con React y TypeScript.
- Cloudflare Workers mediante Sites.
- D1 para configuración, vehículos y leads.
- R2 para fotos y videos.

## Configuración

Copia `.env.example` a `.env.local` en desarrollo y define:

- `ADMIN_USERNAME`: usuario del panel, por defecto `admin`.
- `ADMIN_PASSWORD`: contraseña del panel. Obligatoria para acceder a `/admin`.
- `ADMIN_SESSION_SECRET`: secreto para firmar la cookie HttpOnly del panel.
- `NEXT_PUBLIC_SITE_URL`: URL pública canónica del sitio.

No subas `.env.local` al repositorio.

## Comandos

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

## Flujo de negocio

- `/` muestra la portada y el inventario publicado desde D1.
- `/vehiculo/:id` muestra la página individual del vehículo con metadata dinámica.
- `/agendar` registra leads en D1 mediante `/api/leads`.
- `/admin` permite editar textos, vehículos, fotos, video y revisar leads.

## Notas de seguridad

El panel ya no guarda credenciales ni datos sensibles en `localStorage`. La sesión se firma en servidor y se envía como cookie HttpOnly. Antes de publicar, configura secretos fuertes en el entorno de hosting.
