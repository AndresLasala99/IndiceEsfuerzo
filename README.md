# Índice Subjetivo del Esfuerzo

Página única, sin usuarios ni inicio de sesión. Muestra la lista del plantel y cada jugador carga tres valores por día, del 1 al 5:

| Medición | Cuándo | 1 | 5 |
|---|---|---|---|
| Fatiga | Antes de entrenar | Nada fatigado | Muy fatigado |
| Calidad del sueño | Antes de entrenar | Durmió muy mal | Durmió muy bien |
| Índice de esfuerzo | Después de entrenar | Muy suave | Máximo |

Colores: turquesa = tranquilo, rojo = alerta. Por eso en sueño la escala va al revés (5 = verde/turquesa, 1 = rojo).

Arquitectura: backend Express + MongoDB en capas (config / controllers / middlewares / model / routes / services / validators) y frontend React con Vite. Deploy en Render + Vercel + MongoDB Atlas.

## Cómo funciona

- Al entrar se ve la lista de hoy: foto, nombre y las tres columnas (Fatiga, Sueño, Esfuerzo). Arriba, el promedio de cada una y cuántos cargaron.
- **Agregar jugador** (al final de la lista): foto, nombre y los valores de hoy, todos opcionales.
- Tocando un jugador se cargan o cambian sus valores de hoy, cada uno por separado (fatiga y sueño antes de entrenar, esfuerzo después). También se puede borrar un valor, editar el nombre o la foto, o eliminar al jugador (en "Editar nombre o foto").
- Los valores se pueden cambiar hasta las 00:00 de Uruguay. Después ese día queda cerrado y al día siguiente los campos aparecen vacíos.
- En el calendario se elige un día anterior para ver cómo quedó cada jugador (solo lectura).
- Pestaña **Mes**: promedio general del plantel y promedio de cada jugador en fatiga, sueño y esfuerzo, para el mes que muestra el calendario. En el mes en curso se promedia lo cargado hasta el momento. Los días sin datos no cuentan (no se toman como cero).
- **Promedios del mes** (sigue al mes que muestra el calendario): promedio general del plantel en fatiga, sueño y esfuerzo, y una tabla con el promedio de cada jugador en cada dato y cuántos días cargó. En el mes en curso se promedia lo cargado hasta el último dato ingresado.

El "día" siempre lo decide el servidor con la hora de Montevideo, no la hora del celular.

No hay nombres repetidos: si ya existe "Juan Pérez", no se puede agregar otro igual.

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| GET | /api/players | Lista con los valores de hoy |
| GET | /api/players?date=AAAA-MM-DD | Lista con los valores de ese día |
| GET | /api/players/summary?month=AAAA-MM | Promedios del mes: plantel y cada jugador |
| GET | /api/players/month?month=AAAA-MM | Promedios del mes: plantel y cada jugador |
| POST | /api/players | Agrega jugador (nombre, foto y valores opcionales: fatigue, sleep, effort) |
| PATCH | /api/players/:id | Cambia nombre o foto |
| DELETE | /api/players/:id | Elimina al jugador y su historial |
| PUT | /api/players/:id/today | Guarda o cambia un valor de hoy. Cuerpo: `{ "metric": "fatigue" \| "sleep" \| "effort", "value": 1-5 }` |
| DELETE | /api/players/:id/today/:metric | Borra un valor de hoy |

Los registros de la versión anterior (solo esfuerzo) se convierten solos al nuevo formato la primera vez que arranca el servidor.

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
