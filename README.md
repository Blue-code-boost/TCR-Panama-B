# TCR Panamá Admin Panel Documentation

Este documento describe la configuración, uso y despliegue del panel de administración del proyecto **TCR Panamá**.

---

## 1. Requisitos previos

* Node.js (v14 o superior)
* MongoDB (URI en variable de entorno)
* npm / yarn

---

## 2. Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/Blue-code-boost/TCR-Panama-B.git
   cd TCR-Panama-B/server
   ```

2. Instala dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz de `server/` con:

   ```ini
   MONGO_URI=<tu-mongodb-uri>
   SESSION_SECRET=<clave-segura-generada>
   ```

4. Inicia el servidor:

   ```bash
   npm start
   ```

El servidor correrá en `http://localhost:3000`.

---

## 3. Estructura del código

* **server.js**: punto de entrada, configuración de Express, sesiones, CORS, rutas protegidas.
* **models/**: esquemas de Mongoose para cada entidad (Team, Event, News, Gallery, Info, Blog, Position, Result, Countdown, Hero).
* **public/**: frontend estático (login.html, admin.html, assets, templates).
* **uploads/**: carpeta donde se guardan los archivos subidos.

---

## 4. Endpoints principales

> Todos los endpoints (salvo `/login` y `/logout`) requieren autenticación. Se protege con `express-session`.

### Autenticación

* `POST /login`
  Body: `{ "username": "admin1", "password": "password1" }`
  Devuelve `200` o `401`.

* `POST /logout`
  Cierra la sesión.

### Hero

* `GET /hero`
* `POST /hero` (multipart/form-data)
* `PUT /hero/:id` (multipart/form-data)

### Countdown

* `GET /countdown`
* `PUT /countdown`
  Body: `{ "target": "2025-12-31T23:59:59Z" }`

### Equipos (Teams)

* `GET /teams`
* `GET /teams/:id`
* `POST /teams` (multipart/form-data)
* `PUT /teams/:id` (multipart/form-data)
* `DELETE /teams/:id`
* `POST /teams/bulk` — carga masiva desde Excel (JSON array)

### Eventos (Events)

* `GET /events`
* `GET /events/:id`
* `POST /events`
* `PUT /events/:id`
* `DELETE /events/:id`
* `POST /events/bulk`

### Noticias (News)

* `GET /news`
* `GET /news/:id`
* `POST /news`
* `PUT /news/:id`
* `DELETE /news/:id`
* `POST /news/bulk`

### Galería (Gallery)

* `GET /gallery`
* `POST /gallery` (multipart/form-data)
* `DELETE /gallery/:id`

### Info

* `GET /info`
* `POST /info`
* `DELETE /info/:id`

### Posiciones (Positions)

* `GET /positions`
* `POST /positions`
* `PUT /positions/:id`
* `DELETE /positions/:id`
* `POST /positions/bulk`

### Resultados (Results)

* `GET /results`
* `POST /results`
* `PUT /results/:id`
* `DELETE /results/:id`

### Blog

* `GET /blog`
* `GET /blog/:id`
* `POST /blog` (multipart/form-data)
* `PUT /blog/:id` (multipart/form-data)
* `DELETE /blog/:id`

---

## 5. Panel de administración

* **login.html**: formulario de inicio de sesión.
* **admin.html**: panel principal.
* **admin.js**: lógica de CRUD y cargas masivas.

> Asegúrate de incluir en el `<head>` de `admin.html`:
>
> ```html
> <script>
>   const API = 'http://localhost:3000';
>   // fetch con credentials: 'include'
> </script>
> <script src="admin.js"></script>
> ```

### Cargas masivas

* Eventos: input `#events-excel`, botón `#bulk-events-btn`.
* Posiciones: input `#positions-excel`, botón `#bulk-positions-btn`.
* Noticias: input `#news-excel`, botón `#bulk-news-btn`.

---
