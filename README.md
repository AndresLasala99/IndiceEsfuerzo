# Índice Subjetivo del Esfuerzo

App para que cada jugador registre una vez por día su índice de esfuerzo (1 a 5) y el cuerpo técnico lo consulte por día o por jugador.

Misma arquitectura que el organizador de microciclos: backend Express + MongoDB en capas (config / controllers / middlewares / model / routes / services / validators) y frontend React con Vite. Deploy en Render + Vercel + MongoDB Atlas.

## Cómo funciona

**Jugador**
- Se registra en `/registro` e inicia sesión.
- Puede subir o cambiar su foto (se recorta cuadrada y se comprime antes de subir).
- Ve los 5 botones. Toca uno y queda guardado para hoy.
- Puede cambiar el valor las veces que quiera hasta las 00:00 de Uruguay. Después ese día queda cerrado y se habilita el siguiente.

**Administrador (cuerpo técnico)**
- Se registra en `/registro-admin` con el código de administrador (variable `ADMIN_CODE`). Sin ese código nadie puede crearse una cuenta de admin.
- Ve la lista de jugadores con foto, nombre y el valor del día elegido en el calendario, más cuántos registraron y el promedio.
- Al tocar un jugador, el calendario se pinta con los colores de cada día de ese mes para ese jugador.

El "día" siempre lo decide el servidor con la hora de Montevideo, así no importa la hora del celular del jugador ni dónde esté el servidor.

## Estructura

```
backend/
  src/
    config/        variables de entorno y conexión a Mongo
    model/         User (jugador/admin) y Effort (un registro por jugador por día)
    validators/    reglas de datos de entrada
    middlewares/   sesión, permisos por rol, validación y errores
    services/      lógica (registro, login, guardar el día, consultas)
    controllers/   reciben el pedido y devuelven la respuesta
    routes/        endpoints
    utils/         fecha de Uruguay y utilidades
frontend/
  src/
    pages/         Login, Register, PlayerHome, AdminHome
    components/    Avatar, PhotoPicker, Calendar, Scale, Topbar
```

## Endpoints

| Método | Ruta | Quién | Qué hace |
|---|---|---|---|
| POST | /api/auth/register | público | Crea cuenta de jugador |
| POST | /api/auth/register-admin | público + código | Crea cuenta de administrador |
| POST | /api/auth/login | público | Inicia sesión |
| GET | /api/auth/me | logueado | Datos del usuario |
| PUT | /api/users/me/photo | logueado | Guarda la foto |
| GET | /api/users/players | admin | Lista de jugadores |
| GET | /api/efforts/today | jugador | Valor de hoy |
| PUT | /api/efforts/today | jugador | Guarda o cambia el valor de hoy |
| GET | /api/efforts/day?date=AAAA-MM-DD | admin | Todos los jugadores en ese día |
| GET | /api/efforts/player/:id?month=AAAA-MM | admin | Mes de un jugador |

## Correrlo en tu computadora

Backend:
```
cd backend
cp .env.example .env      # completar los valores
npm install
npm run dev
```

Frontend (en otra terminal):
```
cd frontend
cp .env.example .env
npm install
npm run dev
```
Abrir http://localhost:5173

## Deploy

**1. MongoDB Atlas.** Crear un cluster (o usar el mismo del organizador con otra base, por ejemplo `/ise` al final de la cadena de conexión). En Network Access permitir `0.0.0.0/0` para que Render pueda conectarse.

**2. Render (backend).** New → Web Service → elegir el repositorio.
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Variables de entorno: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_CODE`, `CLIENT_URL` (la URL de Vercel, se completa después del paso 3).

**3. Vercel (frontend).** New Project → mismo repositorio.
- Root Directory: `frontend`
- Framework: Vite
- Variable de entorno: `VITE_API_URL` = URL de Render (sin barra al final).

**4.** Volver a Render, poner en `CLIENT_URL` la URL de Vercel y redeployar.

## Sobre las fotos

Render borra su disco en cada reinicio, así que las fotos no se guardan como archivos. El navegador las recorta a 400 × 400 y las comprime (quedan en unos 30–50 KB) y se guardan dentro de MongoDB. Para un plantel entero es liviano y no hace falta otro servicio.
