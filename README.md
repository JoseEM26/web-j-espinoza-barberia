# JEspinoza Barbershop — Tarjeta de fidelidad

Aplicación web para la barbería **JEspinoza**: los clientes se registran y ven el
estado de su tarjeta de fidelidad (cuántos cortes llevan, cuántos les faltan
para el corte gratis, su historial); el administrador gestiona clientes,
registra cada corte (incluyendo cortes **fiado**/a crédito con seguimiento de
pago) y configura las reglas del negocio sin tocar código.

Construida con **Next.js (App Router) + TypeScript + PostgreSQL (Prisma)**,
autenticación propia con **JWT** (sin proveedores externos) y contraseñas
hasheadas con **bcrypt**.

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack técnico](#stack-técnico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha local](#puesta-en-marcha-local)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos y migraciones](#base-de-datos-y-migraciones)
- [Scripts disponibles](#scripts-disponibles)
- [Seguridad](#seguridad)
- [Despliegue en Vercel + Supabase](#despliegue-en-vercel--supabase)
- [Solución de problemas](#solución-de-problemas)

## Funcionalidades

**Clientes**

- Registro solo con usuario, contraseña (con confirmación), nombre completo y
  fecha de nacimiento — sin correo electrónico.
- Login con usuario/contraseña. Si un cliente fue bloqueado, ve el motivo
  exacto al intentar ingresar.
- Tarjeta de fidelidad visual: progreso hacia el próximo corte gratis.
- Aviso especial de descuento el día de su cumpleaños.
- Historial completo de sus cortes, incluyendo el estado de pago de los
  cortes fiado.
- Perfil propio editable: nombre, foto de perfil (opcional) y contraseña
  (usuario y fecha de nacimiento solo los edita el admin).

**Administrador**

- Buscar, filtrar y administrar clientes (activar/bloquear con motivo,
  editar datos, restablecer contraseña).
- Registrar un corte ("firma") por cliente. El tipo se sugiere solo
  (normal / gratis por cumpleaños / gratis por lealtad) pero se puede
  forzar, incluyendo **Fiado** (a crédito).
- En un corte fiado: registrar cuánto pagó el cliente (nada, la mitad, todo,
  o un monto exacto) sin superar el precio configurado del corte, y marcarlo
  como pagado más adelante.
- Vista global de todos los cortes de la barbería, con filtro de "fiados por
  pagar".
- Configuración del negocio, todo editable desde `/admin/settings`: nombre
  del negocio, cuántos cortes se necesitan para el premio, precio del corte,
  textos de los mensajes de descuento, e Instagram/WhatsApp del negocio.

**Seguridad**

- JWT propio en cookie `httpOnly` (no hay tokens accesibles desde JS).
- Verificación de sesión y rol tanto en el edge (`src/proxy.ts`, protege las
  páginas) como en cada endpoint de la API (autoridad final: siempre
  consulta si el usuario sigue activo).
- Contraseñas con bcrypt (12 rounds). Todo formulario de contraseña pide
  confirmarla dos veces.
- Username único garantizado por constraint de base de datos.

## Stack técnico

| Capa            | Elección                                                            |
| --------------- | -------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)                                    |
| Lenguaje        | TypeScript                                                             |
| Base de datos   | PostgreSQL                                                             |
| ORM             | Prisma 7 (cliente TS nativo + `@prisma/adapter-pg`)                   |
| Autenticación   | JWT propio (`jsonwebtoken` en el servidor, `jose` en el edge/proxy)   |
| Contraseñas     | `bcryptjs`                                                             |
| Validación      | `zod` (cliente y servidor)                                             |
| UI              | Tailwind CSS v4, componentes propios sobre Radix UI, `framer-motion`  |
| Formularios     | `react-hook-form` + `@hookform/resolvers`                              |
| Notificaciones  | `sonner`                                                               |

## Estructura del proyecto

```
prisma/
  schema.prisma          Modelo de datos (User, Cut, Settings)
  migrations/             Historial de migraciones SQL
  seed.ts                 Crea el admin inicial y la configuración por defecto
src/
  app/
    api/                  Endpoints (route handlers) del backend
    login/, register/     Páginas públicas
    dashboard/, profile/  Páginas del cliente
    admin/                Páginas del administrador
  components/
    ui/                   Primitivos de interfaz (botón, input, dialog, etc.)
    admin/                Diálogos/formularios propios del panel admin
    cuts/                 Historial de cortes (con estado de pago)
    brand/                Logo, splash de carga, íconos de redes sociales
    layout/                Header, footer con redes sociales
  contexts/auth-context.tsx  Sesión del usuario en el cliente (React)
  lib/
    auth/                 JWT, hash de contraseñas, cookies, guards de sesión
    validators/            Esquemas zod (auth, user, cut, settings, image)
    prisma.ts              Cliente Prisma (singleton + adapter pg)
    loyalty.ts              Lógica de la tarjeta (progreso, cumpleaños)
    settings.ts             Lectura/escritura de la configuración del negocio
  middleware / proxy.ts    Protección de rutas a nivel de servidor (edge)
```

## Requisitos previos

- Node.js 20+
- PostgreSQL (local para desarrollo, o un proveedor como Supabase/Neon/RDS
  para producción)

## Puesta en marcha local

```bash
npm install
cp .env.example .env      # y completa los valores (ver siguiente sección)
npm run db:migrate         # crea las tablas en tu Postgres local
npm run db:seed            # crea el usuario admin inicial
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Ver `.env.example` para la lista completa. Las más importantes:

| Variable                     | Descripción                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`                | Conexión a Postgres que usa la app en cada request.                          |
| `DIRECT_URL`                  | (Opcional) Conexión directa sin *connection pooler*, para migraciones. Solo hace falta con proveedores tipo Supabase/pgbouncer. |
| `JWT_SECRET`                  | Secreto para firmar los tokens de sesión. Genera uno distinto por ambiente (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`). |
| `JWT_EXPIRES_IN`              | Duración del token (ej. `7d`).                                                |
| `JWT_COOKIE_MAX_AGE_SECONDS`  | Duración de la cookie de sesión, en segundos.                                 |
| `BUSINESS_TIMEZONE`           | Zona horaria del negocio (ej. `America/Lima`), usada para detectar cumpleaños "hoy" sin depender de la zona del servidor. |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` | Credenciales que crea `npm run db:seed` si no existe ya un admin con ese username. |

**Nunca reutilices `JWT_SECRET` ni la contraseña del admin entre desarrollo y
producción.**

## Base de datos y migraciones

El modelo vive en `prisma/schema.prisma`. Para cambios de schema:

```bash
npm run db:migrate -- --name nombre_del_cambio   # crea y aplica la migración (dev)
npm run db:deploy                                 # aplica migraciones pendientes (prod/CI)
npm run db:studio                                 # explorador visual de la base de datos
```

## Scripts disponibles

| Script              | Qué hace                                                          |
| -------------------- | -------------------------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo (Turbopack).                                   |
| `npm run build`       | Aplica migraciones pendientes y compila para producción.             |
| `npm run start`       | Sirve el build de producción.                                        |
| `npm run typecheck`   | Chequeo de tipos de TypeScript sin emitir archivos.                   |
| `npm run lint`        | ESLint.                                                               |
| `npm run db:migrate`  | Crea/aplica una migración en desarrollo.                              |
| `npm run db:deploy`   | Aplica migraciones pendientes (no interactivo, para CI/producción).   |
| `npm run db:seed`     | Crea el admin inicial y la configuración por defecto.                 |
| `npm run db:studio`   | Abre Prisma Studio.                                                   |

## Seguridad

- Las contraseñas nunca se guardan en texto plano (bcrypt, 12 rounds).
- La sesión vive en una cookie `httpOnly` + `sameSite=lax`; el JWT nunca es
  accesible desde JavaScript del navegador.
- `src/proxy.ts` verifica la sesión en el edge para redirigir antes de
  renderizar páginas protegidas, pero la autoridad real está en cada endpoint
  (`requireUser`/`requireAdmin` en `src/lib/auth/session.ts`), que sí
  consulta la base de datos en cada request — así, si el admin bloquea a un
  usuario a media sesión, el siguiente request de ese usuario ya lo rechaza.
- Todos los formularios validan en el cliente (UX) **y** en el servidor
  (autoridad) con los mismos criterios via `zod`.

## Despliegue en Vercel + Supabase

1. **Base de datos**: crea un proyecto en [Supabase](https://supabase.com) (u
   otro proveedor Postgres). Copia la connection string *pooled* (puerto
   `6543`, con `?pgbouncer=true`) como `DATABASE_URL`, y la conexión directa
   (puerto `5432`) como `DIRECT_URL`.
2. **Variables de entorno en Vercel**: en el proyecto de Vercel, ve a
   *Settings → Environment Variables* y agrega todas las variables de
   `.env.example` con sus valores reales de producción (usa un `JWT_SECRET`
   y una contraseña de admin **distintos** a los de desarrollo).
3. **Deploy**: conecta el repositorio de GitHub a Vercel (o usa
   `vercel --prod` desde la CLI). El script `build` corre
   `prisma migrate deploy` automáticamente antes de compilar, así que las
   migraciones pendientes se aplican en cada deploy.
4. **Primer admin**: después del primer deploy exitoso, corre el seed una
   vez apuntando a la base de datos de producción:
   ```bash
   DATABASE_URL="<tu DIRECT_URL de producción>" npm run db:seed
   ```
   Cambia la contraseña del admin apenas inicies sesión.

> Este repositorio no incluye archivos `.env*` (están en `.gitignore` salvo
> `.env.example`). Los valores reales de producción se configuran solo en el
> dashboard de Vercel, nunca se suben a git.

## Solución de problemas

- **"Prisma Migrate has detected that the environment is non-interactive"**:
  pasa al correr `prisma migrate dev` con cambios que borran datos (columnas
  con valores). Usa `npm run db:deploy` en entornos no interactivos (CI,
  scripts), o borra los datos afectados antes de migrar en desarrollo.
- **Login funciona pero `/admin` o `/dashboard` redirigen al login**:
  revisa que `JWT_SECRET` sea el mismo en todos los procesos (el server de
  Next.js y el proxy/middleware deben compartirlo).
