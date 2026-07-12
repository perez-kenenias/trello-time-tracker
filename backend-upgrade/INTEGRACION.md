# Guía de integración: Tablero.dc.html ↔ Spring Boot Backend

## Cómo funciona la integración

El frontend (`Tablero.dc.html`) es un **Design Component** que corre directamente en el navegador.
Al cargar, intenta conectarse al backend en `http://localhost:8080/api`.

- Si el backend **está corriendo**: carga los tableros reales de MongoDB, sincroniza cada mutación vía API.
- Si el backend **no responde**: opera en **modo local** con datos de demo guardados en `localStorage`.

El indicador en la barra superior (`API conectada` / `Modo local`) muestra el estado.

---

## Configurar la URL del backend

En el panel de Tweaks del frontend (ícono ⚙ en el editor), ajusta el campo **api** si tu backend corre en otra URL o puerto:

```
http://localhost:8080/api        ← default
http://mi-servidor.com/api       ← producción
```

---

## Pasos para correr todo junto

### 1. Levantar el backend

```bash
cd trello-time-tracker/backend
mvn clean package -DskipTests
cd ..
docker compose up --build -d
```

### 2. Abrir el frontend

Abre `Tablero.dc.html` en el editor (o súbelo a cualquier servidor estático).
El indicador verde "API conectada" confirma que se sincroniza con MongoDB.

---

## Endpoints que usa el frontend

| Método | Ruta | Para qué |
|--------|------|----------|
| GET | `/api/boards` | Listar tableros al cargar |
| GET | `/api/boards/:id` | Cargar un tablero completo |
| POST | `/api/boards` | Crear nuevo tablero |
| POST | `/api/boards/:id/lists` | Añadir lista/columna |
| POST | `/api/boards/:id/lists/:lid/cards` | Crear tarjeta |
| PUT | `/api/boards/:id/lists/:lid/cards/:cid` | Editar título/desc/prioridad/fecha/estado |
| DELETE | `/api/boards/:id/lists/:lid/cards/:cid` | Eliminar tarjeta |
| POST | `/api/boards/:id/cards/:cid/move` | Mover tarjeta entre listas (drag & drop) |
| POST | `/api/boards/:id/lists/:lid/cards/:cid/time` | Guardar sesión de cronómetro |

### Endpoints nuevos (agregar al backend)

| Método | Ruta | Para qué |
|--------|------|----------|
| POST | `/api/boards/:id/lists/:lid/cards/:cid/vote` | Votar una tarjeta |
| POST | `/api/boards/:id/lists/:lid/cards/:cid/checklist` | Añadir item al checklist |
| PUT | `/api/boards/:id/lists/:lid/cards/:cid/checklist/:itemId` | Marcar item checklist |
| POST | `/api/boards/:id/lists/:lid/cards/:cid/comments` | Añadir comentario |
| PUT | `/api/boards/:id/lists/:lid/cards/:cid/fields` | Actualizar campos personalizados |
| GET | `/api/boards/:id/reports` | Estadísticas de tiempo |

---

## Qué se guarda dónde

| Campo de tarjeta | Backend (MongoDB) | Local (localStorage) |
|-----------------|-------------------|----------------------|
| título, descripción | ✅ | — |
| prioridad, fecha, estado | ✅ | — |
| tags (desde API) | ✅ | — |
| tiempo registrado | ✅ | — |
| etiquetas (con color) | — | ✅ `card_ext_v1` |
| miembros asignados | — | ✅ `card_ext_v1` |
| checklist | — | ✅ `card_ext_v1` |
| comentarios | — | ✅ `card_ext_v1` |
| portada | — | ✅ `card_ext_v1` |
| campos personalizados | — | ✅ `card_ext_v1` |
| votos | — | ✅ `card_ext_v1` |
| recurrencia | — | ✅ `card_ext_v1` |

> **Para producción**: implementa los endpoints nuevos en el backend para que los campos
> extendidos también persistan en MongoDB. El frontend enviará las llamadas automáticamente
> en cuanto los endpoints existan.

---

## Actualizar el modelo Card en el backend

Copia `backend-upgrade/Card.java` a:
```
backend/src/main/java/com/trellotracker/model/Card.java
```

Copia `backend-upgrade/BoardController.java` a:
```
backend/src/main/java/com/trellotracker/controller/BoardController.java
```

Luego implementa los nuevos métodos en `BoardService.java`:
- `voteCard(boardId, listId, cardId)` — incrementa `card.votes`
- `addCheckItem(boardId, listId, cardId, text)` — añade a `card.checklist`
- `toggleCheckItem(boardId, listId, cardId, itemId, done)` — actualiza item
- `addComment(boardId, listId, cardId, authorId, authorName, authorInitials, text)` — añade a `card.comments`
- `updateCustomFields(boardId, listId, cardId, fields)` — merge en `card.customFields`
- `getBoardReport(boardId)` — devuelve stats de tiempo

---

## Despliegue en producción

El frontend es un solo archivo HTML — despliégalo en cualquier CDN o servidor estático:

```bash
# Opción 1: Netlify Drop
# Arrastra Tablero.dc.html al dashboard de netlify.com

# Opción 2: GitHub Pages
# Sube el archivo al repo y activa Pages

# Opción 3: Servidor nginx
cp Tablero.dc.html /var/www/html/
```

El backend en producción necesita cambiar el `REACT_APP_API_URL` / la URL del tweak `api`
para apuntar al servidor real. Recuerda habilitar CORS para el dominio del frontend
(el backend ya tiene `@CrossOrigin(origins = "*")` en desarrollo).
