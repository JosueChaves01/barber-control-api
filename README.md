# Backend Completo - Plataforma de Peluquerías

Backend completo desarrollado con Node.js, TypeScript, Express, Prisma y PostgreSQL para la gestión de una plataforma de peluquerías.

## Características

- ✅ Autenticación JWT con refresh tokens
- ✅ Sistema de roles (SuperAdmin, Admin, Barber, Client)
- ✅ Gestión de organizaciones
- ✅ CRUD completo de barberos, clientes y citas
- ✅ Sistema de notificaciones
- ✅ Integración con Google Calendar
- ✅ Validación con Zod
- ✅ Documentación Swagger/OpenAPI
- ✅ Logging estructurado con Winston
- ✅ Seguridad con Helmet y rate limiting

## Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (jsonwebtoken) + bcrypt
- **Validación**: Zod
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Google Calendar**: googleapis

## Requisitos Previos

- Node.js 18 o superior
- PostgreSQL 15 o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd Peluqueria_Backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://user:password@localhost:3002/peluqueria_db?schema=public"

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback

CORS_ORIGIN=http://localhost:3001

LOG_LEVEL=info
```

4. Iniciar PostgreSQL con Docker (opcional):
```bash
docker-compose up -d
```

5. Ejecutar migraciones de Prisma:
```bash
npm run prisma:generate
npm run prisma:migrate
```

## Uso

### Desarrollo
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

### Producción
```bash
npm run build
npm start
```

### Documentación API
Una vez iniciado el servidor, la documentación Swagger estará disponible en:
```
http://localhost:3001/api-docs
```

## Estructura del Proyecto

```
src/
├── config/          # Configuraciones (DB, JWT, Google OAuth, Swagger)
├── controllers/      # Controladores por dominio
├── services/         # Lógica de negocio
├── repositories/     # Acceso a datos (Prisma)
├── middleware/       # Middlewares (auth, error, validation)
├── routes/           # Definición de rutas
├── types/            # Tipos TypeScript
├── utils/            # Utilidades (password, jwt, errors, logger)
├── validators/       # Schemas Zod
├── app.ts            # Configuración Express
└── server.ts         # Inicio del servidor
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar nuevo cliente
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### SuperAdmin
- `POST /api/superadmin/organizations` - Crear organización + admin
- `GET /api/superadmin/organizations` - Listar todas las organizaciones
- `POST /api/superadmin/admins` - Crear admin para organización
- `GET /api/superadmin/users` - Listar usuarios

### Organizaciones
- `GET /api/organizations/:id` - Obtener organización
- `PATCH /api/organizations/:id` - Actualizar organización

### Barberos
- `POST /api/organizations/:id/barbers` - Crear barbero
- `GET /api/organizations/:id/barbers` - Listar barberos
- `GET /api/barbers/:id` - Obtener barbero
- `PATCH /api/barbers/:id` - Actualizar barbero

### Clientes
- `GET /api/clients/:id` - Obtener cliente
- `PATCH /api/clients/:id` - Actualizar cliente

### Citas
- `POST /api/appointments` - Crear cita
- `GET /api/appointments` - Listar citas
- `GET /api/appointments/:id` - Obtener cita
- `PATCH /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Eliminar cita

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `PATCH /api/notifications/:id/read` - Marcar como leída

### Google Calendar
- `GET /api/google/auth` - Obtener URL de autorización
- `GET /api/google/callback` - Callback OAuth
- `POST /api/google/sync/:appointment_id` - Sincronizar cita
- `DELETE /api/google/event/:appointment_id` - Eliminar evento

## Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Cobertura
npm run test:coverage
```

## Scripts Disponibles

- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar producción
- `npm run prisma:generate` - Generar cliente Prisma
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:studio` - Abrir Prisma Studio
- `npm test` - Ejecutar tests
- `npm run lint` - Linting
- `npm run format` - Formatear código

## Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `NODE_ENV` | Ambiente (development/production) | Sí |
| `PORT` | Puerto del servidor | No (default: 3000) |
| `DATABASE_URL` | URL de conexión PostgreSQL | Sí |
| `JWT_SECRET` | Secret para JWT | Sí |
| `JWT_EXPIRES_IN` | Expiración del access token | No (default: 15m) |
| `JWT_REFRESH_SECRET` | Secret para refresh token | Sí |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del refresh token | No (default: 7d) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Para Google Calendar |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Para Google Calendar |
| `GOOGLE_REDIRECT_URI` | Google OAuth Redirect URI | Para Google Calendar |
| `CORS_ORIGIN` | Origen permitido para CORS | No (default: http://localhost:3001) |
| `LOG_LEVEL` | Nivel de logging | No (default: info) |

## Seguridad

- ✅ Helmet.js para headers de seguridad
- ✅ Rate limiting en endpoints de autenticación
- ✅ Validación de entrada con Zod
- ✅ Hash de contraseñas con bcrypt
- ✅ JWT con expiración
- ✅ Refresh tokens rotativos
- ✅ CORS configurado

## Licencia

ISC

