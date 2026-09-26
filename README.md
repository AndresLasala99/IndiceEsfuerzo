# Índice Subjetivo del Esfuerzo

Página única, sin usuarios ni inicio de sesión. Muestra la lista del plantel y cada jugador carga su índice de esfuerzo del día (1 a 5).

Arquitectura: backend Express + MongoDB en capas (config / controllers / middlewares / model / routes / services / validators) y frontend React con Vite. Deploy en Render + Vercel + MongoDB Atlas.

## Cómo funciona

- Al entrar se ve la lista de hoy: foto, nombre y el valor de cada jugador.
- **Agregar jugador** (al final de la lista): foto, nombre y el valor de hoy. El valor se puede dejar para después.
- Tocando un jugador se elige o cambia el valor de hoy. También se puede borrar el valor, editar el nombre o la foto, o eliminar al jugador.
- El valor se puede cambiar hasta las 00:00 de Uruguay. Después ese día queda cerrado y al día siguiente el campo aparece vacío.
- En el calendario se elige un día anterior para ver cómo quedó cada jugador (solo lectura), con cuántos cargaron y el promedio.

El "día" siempre lo decide el servidor con la hora de Montevideo, no la hora del celular.

No hay nombres repetidos: si ya existe "Juan Pérez", no se puede agregar otro igual.

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| GET | /api/players | Lista con los valores de hoy |
| GET | /api/players?date=AAAA-MM-DD | Lista con los valores de ese día |
| POST | /api/players | Agrega jugador (nombre, foto opcional, valor opcional) |
| PATCH | /api/players/:id | Cambia nombre o foto |
| DELETE | /api/players/:id | Elimina al jugador y su historial |
| PUT | /api/players/:id/today | Guarda o cambia el valor de hoy |
| DELETE | /api/players/:id/today | Borra el valor de hoy |

## Variables de entorno

**Render (backend)**
- `MONGODB_URI`: cadena de conexión de Atlas
- `CLIENT_URL`: dirección de Vercel, sin barra al final

**Vercel (frontend)**
- `VITE_API_URL`: dirección de Render, sin barra al final

## Correrlo en tu computadora

```
cd backend
cp .env.example .env      # completar los valores
npm install
npm run dev
```

En otra terminal:
```
cd frontend
cp .env.example .env
npm install
npm run dev
```
Abrir http://localhost:5173

## Sobre las fotos

Render borra su disco en cada reinicio, así que las fotos no se guardan como archivos. El navegador las recorta a 400 × 400 y las comprime (unos 30–50 KB) y se guardan dentro de MongoDB.
