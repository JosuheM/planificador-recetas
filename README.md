# Planificador de recetas y lista de compras

App web full-stack: guarda recetas, asígnalas a los días de la semana y genera la lista de compras con los ingredientes sumados.

- **Frontend:** React + Vite + React Router + axios (`/frontend`)
- **Backend:** Node + Express, API REST con JWT y validación con zod (`/backend`)
- **Base de datos:** MySQL (`/database/schema.sql`)

## Ejecutar en local

1. Crear las tablas: importar `database/schema.sql` en MySQL (phpMyAdmin o consola).
2. Backend:
   ```
   cd backend
   cp .env.example .env     # completar datos de MySQL y JWT_SECRET
   npm install
   npm run dev
   ```
3. Frontend:
   ```
   cd frontend
   cp .env.example .env     # VITE_API_URL=http://localhost:4000
   npm install
   npm run dev
   ```
4. Opcional, recetas de ejemplo para un usuario ya registrado: `node seed.js tu@email.com` (en `/backend`).

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/registro`, `/auth/login` | Cuenta y token JWT |
| GET/POST/PUT/DELETE | `/recetas` | CRUD de recetas con ingredientes |
| GET/PUT/DELETE | `/plan` | Plan semanal (día + comida → receta) |
| POST | `/lista-compras/generar` | Agrupa y suma ingredientes del plan |
| GET/PATCH/DELETE | `/lista-compras` | Ver, marcar comprado, vaciar |

## Variables de entorno

Backend: `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `CORS_ORIGIN` (dominio del frontend).
Frontend: `VITE_API_URL` (URL pública de la API).
