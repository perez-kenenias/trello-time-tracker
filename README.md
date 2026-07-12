# Trello Time Tracker

Tablero Kanban con time tracking, plantillas Scrum/Kanban y features premium (votos, checklist, comentarios, campos personalizados, informes). Construido con **Java Spring Boot**, **MongoDB**, **React** y **Docker**.

> ✅ **Actualización backend-upgrade integrada** (julio 2026). Los archivos de `backend-upgrade/` (diseño minimalista) ya están aplicados en `backend/src/`. Ver [§4 Actualizaciones aplicadas](#4-actualizaciones-aplicadas).
>
> ✅ **Frontend React rediseñado** (julio 2026). El frontend en `frontend/` ahora tiene navegación completa (volver al menú, seleccionar/eliminar tablero), drag & drop de tarjetas, y un panel de detalle con todas las features premium de Trello (portadas, etiquetas de color, checklist, comentarios, votos, campos personalizados, cronómetro en vivo, recurrencia, informes). Ver [§4](#4-actualizaciones-aplicadas).

| Tecnología | Versión |
|------------|---------|
| Java JDK | 17+ |
| Spring Boot | 3.2.0 |
| MongoDB | 7.0 |
| React | 18.2.0 |
| Maven | 3.8+ |
| Node.js | 18+ |
| Docker | 20.10+ (opcional) |

---

## Quick Start

Con Docker Desktop corriendo:

```bash
cd backend && mvn clean package -DskipTests && cd ..
docker compose up --build -d
```

Abre: **http://localhost:3000** (frontend React) — API en **http://localhost:8080/api/boards**.

> ⚠️ En Windows con varias JDK instaladas, asegúrate de compilar con JDK 17 (ver [Troubleshooting](#10-troubleshooting)).

---

## Índice

1. [Estructura del proyecto](#1-estructura-del-proyecto)
2. [Opción A — Con Docker (recomendado)](#2-opción-a--con-docker-recomendado)
3. [Opción B — Sin Docker (desarrollo local)](#3-opción-b--sin-docker-desarrollo-local)
4. [Actualizaciones aplicadas](#4-actualizaciones-aplicadas)
5. [Frontend moderno — Tablero.dc.html](#5-frontend-moderno--tablerodchtml)
6. [API — Endpoints completos](#6-api--endpoints-completos)
7. [Modelo de datos](#7-modelo-de-datos)
8. [Plantillas disponibles](#8-plantillas-disponibles)
9. [Variables de entorno](#9-variables-de-entorno)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Estructura del proyecto

```
trello-time-tracker/
├── backend/                        ← Spring Boot API (upgrade YA aplicado)
│   ├── src/main/java/com/trellotracker/
│   │   ├── model/
│   │   │   ├── Board.java
│   │   │   ├── BoardList.java
│   │   │   ├── Card.java           ← extendido: labels, checklist, comments, votes…
│   │   │   ├── TimeEntry.java
│   │   │   └── Template.java
│   │   ├── controller/
│   │   │   ├── BoardController.java ← extendido: vote, checklist, comments, fields, reports
│   │   │   ├── HomeController.java
│   │   │   └── TemplateController.java
│   │   ├── service/
│   │   │   └── BoardService.java    ← extendido con lógica de features premium
│   │   ├── dto/
│   │   │   ├── BoardRequest.java
│   │   │   ├── CardRequest.java
│   │   │   ├── MoveCardRequest.java
│   │   │   └── TimeEntryRequest.java ← nuevo campo `minutes`
│   │   └── repository/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                       ← React app original (puerto 3000)
├── backend-upgrade/                ← Fuente del upgrade (referencia; ya integrado)
│   ├── Card.java
│   ├── BoardController.java
│   ├── BoardService.java
│   ├── Card_original.java          ← respaldo del modelo anterior
│   ├── README.md
│   └── INTEGRACION.md
└── docker-compose.yml
```

> **Nota:** la documentación de `backend-upgrade/` menciona un frontend `Tablero.dc.html`
> (Design Component minimalista). **Ese archivo no está incluido en el repo ni en el zip** —
> los endpoints que necesita ya están activos en el backend; cuando obtengas el archivo,
> colócalo en la raíz y ábrelo en el navegador (ver §5).

---

## 2. Opción A — Con Docker (recomendado)

Levanta MongoDB + backend + frontend React con un solo comando.

### Requisitos previos

- **Docker Desktop** corriendo
- **Java 17+** y **Maven 3.8+** (solo para compilar el JAR)

### Paso 1 — Compilar el backend

```bash
cd backend
mvn clean package -DskipTests
cd ..
```

Genera `backend/target/trello-time-tracker-1.0.0.jar` (Docker lo necesita para la imagen).

### Paso 2 — Levantar los servicios

```bash
docker compose up --build -d
```

| Contenedor | Puerto | Descripción |
|------------|--------|-------------|
| `trello-mongodb` | 27017 | MongoDB (datos persisten en volumen `mongo-data`) |
| `trello-backend` | 8080 | API Spring Boot |
| `trello-frontend` | 3000 | React app |

### Paso 3 — Verificar

```bash
docker compose ps                          # 3 contenedores Up
curl http://localhost:8080/api/boards     # JSON con tableros (o [])
docker exec -it trello-mongodb mongosh --eval "db.adminCommand('ping')"   # { ok: 1 }
```

### URLs

| Aplicación | URL |
|------------|-----|
| Frontend React | http://localhost:3000 |
| API REST | http://localhost:8080/api/boards |
| Swagger UI | http://localhost:8080/swagger-ui.html |

### Comandos útiles

```bash
docker compose logs -f backend      # logs del backend
docker compose restart backend      # reiniciar servicio
docker compose down                 # parar todo (datos se conservan)
docker compose down -v              # ⚠️ parar y BORRAR datos de MongoDB
```

---

## 3. Opción B — Sin Docker (desarrollo local)

### Paso 1 — MongoDB

```bash
# Local instalado
net start MongoDB                   # Windows
brew services start mongodb-community  # macOS

# O solo Mongo en Docker
docker run -d --name trello-mongo -p 27017:27017 -v mongo-local:/data/db mongo:7
```

### Paso 2 — Configurar backend

Edita `backend/src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/trellotracker
server.port=8080
```

> En Docker Compose el hostname es `mongodb`; en local usa `localhost`.

### Paso 3 — Arrancar backend

```bash
cd backend
mvn spring-boot:run
# o: mvn clean package -DskipTests && java -jar target/trello-time-tracker-1.0.0.jar
```

Listo cuando veas: `Started TrelloTrackerApplication in X.XXX seconds`

### Paso 4 — Arrancar frontend React

```bash
cd frontend
npm install     # solo primera vez
npm start       # abre http://localhost:3000
```

El `package.json` tiene `"proxy": "http://localhost:8080"` — sin problemas de CORS.

---

## 4. Actualizaciones aplicadas

Los archivos de `backend-upgrade/` ya fueron copiados a `backend/src/` e integrados. **No necesitas volver a copiarlos.** Cambios incluidos:

| Archivo | Cambio |
|---------|--------|
| `model/Card.java` | Campos nuevos: `labels`, `assignedMembers`, `checklist`, `comments`, `cover`, `customFields`, `votes`, `recurring`, `done` + clases internas `CheckItem` y `Comment` |
| `controller/BoardController.java` | Endpoints nuevos: vote, checklist (add/toggle/**delete**), comments, custom fields, reports, templates estáticos |
| `service/BoardService.java` | Lógica de features premium + update parcial de tarjetas + plantilla "Personal" |
| `dto/TimeEntryRequest.java` | Campo `minutes` para registrar tiempo sin start/end |

**Correcciones aplicadas durante la integración** (los archivos de `backend-upgrade/` tal cual no compilaban):

1. `BoardService.createBoard` — variable `listTitles` reasignada y usada en lambda (error de compilación). Se cambió a `listTitles.addAll(...)`.
2. `TimeEntryRequest` — faltaba el campo `minutes` que el service nuevo usa.
3. `BoardController` — faltaba el endpoint `DELETE .../checklist/{itemId}` (el service ya tenía `deleteCheckItem`).
4. MongoDB — la plantilla "Personal" solo se siembra en BD vacía; se insertó manualmente en la colección `templates` para BDs existentes.

**Compatibilidad con datos existentes:** verificada. Los tableros/tarjetas creados con el modelo anterior cargan sin problema; los campos nuevos se serializan con valores default (`votes: 0`, `checklist: []`, etc.).

### Frontend React rediseñado (julio 2026)

El frontend en `frontend/src/` fue reconstruido para exponer todas las features premium del backend y arreglar la navegación:

| Componente | Rol |
|------------|-----|
| `App.js` | Menú de tableros: grid con barra de progreso, botón **eliminar tablero** (con confirmación), botón **volver** siempre visible, crear tablero |
| `components/CreateBoard.js` | Formulario con botón **Cancelar/volver**; preview de listas de la plantilla; abre el tablero recién creado |
| `components/Board.js` | Cabecera con volver / eliminar / **informes**; añadir listas; contiene el modal de tarjeta y el drag & drop |
| `components/BoardList.js` | Columna con contador, barra de progreso y **drop zone** (arrastrar tarjetas entre listas) |
| `components/Card.js` | Tarjeta compacta **arrastrable**: portada, etiquetas de color, badges (prioridad, fecha, tiempo, checklist, comentarios, votos, recurrencia) |
| `components/CardModal.js` | Detalle completo: título, descripción, prioridad, fecha límite, **portada**, **etiquetas de color**, **checklist** con progreso, **comentarios**, **campos personalizados**, **votos**, **recurrencia**, **cronómetro en vivo** + registro manual, mover de lista, marcar hecha, eliminar |
| `components/Reports.js` | Modal de informes: tarjetas totales/completadas/vencidas, tiempo total, tiempo por lista, sesiones |
| `translations.js` | ES/EN + paleta `COLORS` para labels y portadas |

Nuevos endpoints de escritura para portadas/labels/recurrencia: se extendió `CardRequest` (campos `cover`, `labels`, `recurring`, `done`, `assignedMembers`) y `BoardService.updateCard` los aplica, todo vía el `PUT` de tarjeta existente.

> **Drag & drop** usa HTML5 nativo (sin librerías extra). Arrastra una tarjeta a otra columna para moverla.

**Personalización de tablero (premium, julio 2026):**

| Feature | Cómo |
|---------|------|
| **Fondo de tablero** | Botón 🎨 *Background* → 10 colores sólidos + 8 degradados (`components/BoardSettings.js`, paleta `BACKGROUNDS` en `translations.js`) |
| **Favoritos** ★ | Estrella en la cabecera del tablero y en cada card del menú; los favoritos se ordenan primero |
| **Renombrar tablero** | Título y descripción editables desde ⚙ *Board settings* |
| **Renombrar lista** | Clic en el título de la columna → editable inline |
| **Eliminar lista** | 🗑 en la cabecera de la columna (con confirmación) |

Backend correspondiente: `Board` gana `background` (String) y `starred` (Boolean); `CardRequest`→`BoardRequest` gana `background`/`starred`; nuevos métodos `updateBoard`, `renameList`, `deleteList` y endpoints `PUT /boards/{id}`, `PUT /boards/{id}/lists/{listId}`, `DELETE /boards/{id}/lists/{listId}`.

---

## 5. Frontend moderno — Tablero.dc.html (opcional, externo)

`Tablero.dc.html` es el frontend rediseñado (un solo archivo HTML, sin build). **No está incluido en este repo** — cuando lo tengas, colócalo en la raíz del proyecto y ábrelo directo en el navegador.

- **🟢 "API conectada"** → sincroniza con MongoDB vía `http://localhost:8080/api`.
- **🟠 "Modo local"** → guarda en `localStorage` hasta que el backend responda.

Si el backend corre en otro puerto/servidor, ajusta el Tweak **api** en el panel de configuración:

```
Por defecto:   http://localhost:8080/api
Producción:    https://api.mi-dominio.com/api
```

Todos los endpoints que este frontend necesita **ya están activos** en el backend (ver §6).

---

## 6. API — Endpoints completos

Base URL: `http://localhost:8080/api`

### Boards

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/boards` | Crear tablero |
| `GET` | `/boards` | Listar tableros |
| `GET` | `/boards/{id}` | Obtener tablero completo |
| `PUT` | `/boards/{id}` | Actualizar tablero (título, descripción, **background**, **starred**) |
| `DELETE` | `/boards/{id}` | Eliminar tablero |
| `GET` | `/boards/{id}/reports` | Informe de tiempo y estadísticas |

**Crear tablero — body:**
```json
{ "title": "Mi proyecto", "description": "Opcional", "templateType": "kanban" }
```

**Actualizar tablero — body** (todos los campos opcionales):
```json
{ "background": "grad-ocean", "starred": true, "title": "Nuevo título" }
```

### Lists (columnas)

| Método | Ruta | Body / Descripción |
|--------|------|------|
| `POST` | `/boards/{boardId}/lists` | `{ "title": "Nueva columna" }` |
| `PUT` | `/boards/{boardId}/lists/{listId}` | Renombrar: `{ "title": "..." }` |
| `DELETE` | `/boards/{boardId}/lists/{listId}` | Eliminar lista y sus tarjetas |

### Cards (tarjetas)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/boards/{boardId}/lists/{listId}/cards` | Crear tarjeta |
| `PUT` | `/boards/{boardId}/lists/{listId}/cards/{cardId}` | Editar tarjeta (update **parcial**: solo campos enviados) |
| `DELETE` | `/boards/{boardId}/lists/{listId}/cards/{cardId}` | Eliminar tarjeta |
| `POST` | `/boards/{boardId}/cards/{cardId}/move` | Mover tarjeta entre listas |

**Crear/editar tarjeta — body:**
```json
{
  "title": "Nombre de la tarea",
  "description": "Detalle opcional",
  "priority": "high",
  "status": "active",
  "dueDate": "2026-07-20T00:00:00",
  "tags": ["frontend", "urgente"]
}
```

**Mover tarjeta — body:**
```json
{ "sourceListId": "lista-origen-id", "targetListId": "lista-destino-id", "newOrder": 0 }
```

### Time tracking

| Método | Ruta |
|--------|------|
| `POST` | `/boards/{boardId}/lists/{listId}/cards/{cardId}/time` |

**Body** (con `startTime`/`endTime` calcula minutos automáticamente, o envía `minutes` directo):
```json
{ "description": "Sesión de trabajo", "startTime": "2026-07-10T10:00:00", "endTime": "2026-07-10T11:30:00" }
```
```json
{ "description": "Sesión cronómetro", "minutes": 45 }
```

### Features premium

| Método | Ruta | Body |
|--------|------|------|
| `POST` | `.../cards/{cardId}/vote` | — (incrementa votos) |
| `POST` | `.../cards/{cardId}/checklist` | `{ "text": "Revisar el diseño" }` |
| `PUT` | `.../cards/{cardId}/checklist/{itemId}` | `{ "done": true }` |
| `DELETE` | `.../cards/{cardId}/checklist/{itemId}` | — |
| `POST` | `.../cards/{cardId}/comments` | `{ "authorId": "me", "authorName": "Tu nombre", "authorInitials": "TN", "text": "Comentario" }` |
| `PUT` | `.../cards/{cardId}/fields` | `{ "Estimación": "3 días", "Enlace": "https://..." }` |

(Prefijo completo: `/boards/{boardId}/lists/{listId}`)

### Templates

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/templates` | Plantillas desde MongoDB (5) |
| `GET` | `/boards/templates` | Lista estática para el frontend moderno |

---

## 7. Modelo de datos

### Card (completo)

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "order": 0,
  "priority": "high | medium | low | null",
  "status": "active | done | <nombre de lista tras mover>",
  "done": false,
  "tags": ["string"],
  "dueDate": "2026-07-20T00:00:00",
  "timeEntries": [
    { "id": "string", "description": "string", "startTime": "...", "endTime": "...", "minutes": 90, "createdAt": "..." }
  ],
  "totalMinutesSpent": 90,
  "labels": { "Urgente": "rose" },
  "assignedMembers": ["userId1"],
  "checklist": [ { "id": "string", "text": "Tarea", "done": false, "createdAt": "..." } ],
  "comments": [ { "id": "string", "authorId": "...", "authorName": "...", "authorInitials": "...", "text": "...", "createdAt": "..." } ],
  "cover": "rose | amber | green | teal | blue | violet | null",
  "customFields": { "Estimación": "3 días" },
  "votes": 0,
  "recurring": "daily | weekly | monthly | null",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Dónde persiste cada dato

| Campo | MongoDB | Notas |
|-------|---------|-------|
| título, descripción, prioridad, fecha, estado, tags | ✅ | vía POST/PUT cards |
| time entries, totalMinutesSpent | ✅ | vía POST .../time |
| votos, checklist, comentarios, campos personalizados | ✅ | vía endpoints premium (§6) |
| labels con color, cover, recurring, assignedMembers | ⚠️ | existen en el modelo, pero aún **sin endpoint** para escribirlos — el frontend moderno los guarda en `localStorage` (`card_ext_v1`) como fallback |

---

## 8. Plantillas disponibles

| type | Nombre | Listas |
|------|--------|--------|
| `kanban` | Kanban | To Do → In Progress → Done |
| `scrum` | Scrum | Backlog → To Do → In Progress → Review → Done |
| `personal` | Personal | Ideas → Hoy → Esta semana → Hecho |
| `daily` | Daily Life | Morning → Afternoon → Evening → Notes |
| `project` | Project Management | Planning → Execution → Testing → Deployment → Maintenance |

> Las plantillas se siembran automáticamente solo si la colección `templates` está vacía. En BDs existentes que no tengan "Personal", insértala manualmente:
> ```bash
> docker exec trello-mongodb mongosh trellotracker --eval 'db.templates.updateOne({type:"personal"},{$setOnInsert:{name:"Personal",description:"Personal task management",type:"personal",defaultLists:["Ideas","Hoy","Esta semana","Hecho"],_class:"com.trellotracker.model.Template"}},{upsert:true})'
> ```

---

## 9. Variables de entorno

### Backend (`application.properties`)

```properties
# Desarrollo local
spring.data.mongodb.uri=mongodb://localhost:27017/trellotracker
server.port=8080
```

En Docker, `docker-compose.yml` inyecta `SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/trellotracker`.

### Frontend React (`frontend/.env`, opcional)

```env
REACT_APP_API_URL=http://localhost:8080/api
```

Por defecto usa el proxy de `package.json`.

---

## 10. Troubleshooting

### Maven falla con `Non-resolvable parent POM ... nexus.infonavitqa.net`

Tu `settings.xml` global apunta a un Nexus corporativo inaccesible. Compila con un settings limpio que use Maven Central:

```bash
# Crea un settings vacío una sola vez
echo '<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"/>' > ~/settings-central.xml

mvn clean package -DskipTests -s ~/settings-central.xml
```

### Enforcer: `You must install JDK 17 or higher`

Maven está usando otra JDK. En Windows con varias JDK, apunta `JAVA_HOME` a la 17 solo para el build:

```bash
# Git Bash
JAVA_HOME="C:/Program Files/Java/jdk-17" mvn clean package -DskipTests

# PowerShell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"; mvn clean package -DskipTests
```

### "Modo local" — el frontend no conecta al backend

```bash
curl http://localhost:8080/api/boards   # ¿responde?
docker compose ps                       # ¿contenedores Up?
docker compose logs backend             # ¿errores?
docker compose restart backend
```

### Puerto 8080 ocupado

```bash
netstat -ano | findstr :8080            # Windows
# Cambia el mapeo en docker-compose.yml: "8090:8080" y usa http://localhost:8090/api
```

### Backend no conecta a MongoDB (`MongoSocketOpenException`)

```bash
docker compose down
docker compose up -d mongodb
# espera ~10s
docker compose up -d backend frontend
```

### Reset completo (⚠️ borra todos los datos)

```bash
docker compose down -v
docker compose up --build -d
```
