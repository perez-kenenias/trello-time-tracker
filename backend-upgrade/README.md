# Trello Time Tracker — Documentación completa

Tablero Kanban moderno con time tracking, vistas múltiples y features premium.

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

## Índice

1. [Estructura del proyecto](#1-estructura-del-proyecto)
2. [Opción A — Con Docker (recomendado)](#2-opción-a--con-docker-recomendado)
3. [Opción B — Sin Docker (desarrollo local)](#3-opción-b--sin-docker-desarrollo-local)
4. [Frontend moderno — Tablero.dc.html](#4-frontend-moderno--tablerodyhtml)
5. [Aplicar actualizaciones del backend](#5-aplicar-actualizaciones-del-backend)
6. [API — Endpoints completos](#6-api--endpoints-completos)
7. [Modelo de datos](#7-modelo-de-datos)
8. [Plantillas disponibles](#8-plantillas-disponibles)
9. [Variables de entorno](#9-variables-de-entorno)
10. [Despliegue en producción](#10-despliegue-en-producción)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Estructura del proyecto

```
trello-time-tracker/
├── backend/                        ← Spring Boot API
│   ├── src/main/java/com/trellotracker/
│   │   ├── model/
│   │   │   ├── Board.java
│   │   │   ├── BoardList.java
│   │   │   ├── Card.java           ← reemplazar con backend-upgrade/Card.java
│   │   │   ├── TimeEntry.java
│   │   │   └── Template.java
│   │   ├── controller/
│   │   │   ├── BoardController.java ← reemplazar con backend-upgrade/BoardController.java
│   │   │   ├── HomeController.java
│   │   │   └── TemplateController.java
│   │   ├── service/
│   │   │   └── BoardService.java    ← reemplazar con backend-upgrade/BoardService.java
│   │   ├── dto/
│   │   │   ├── BoardRequest.java
│   │   │   ├── CardRequest.java
│   │   │   ├── MoveCardRequest.java
│   │   │   └── TimeEntryRequest.java
│   │   └── repository/
│   │       ├── BoardRepository.java
│   │       └── TemplateRepository.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                       ← React app original (puerto 3000)
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Board.js
│   │   │   ├── BoardList.js
│   │   │   ├── Card.js
│   │   │   └── CreateBoard.js
│   │   └── LanguageContext.js
│   └── package.json
├── Tablero.dc.html                 ← Frontend moderno (abre directo en navegador)
├── backend-upgrade/                ← Archivos Java actualizados
│   ├── Card.java
│   ├── BoardController.java
│   ├── BoardService.java
│   └── README.md (este archivo)
└── docker-compose.yml
```

---

## 2. Opción A — Con Docker (recomendado)

Levanta MongoDB + backend + frontend React con un solo comando.  
No necesitas instalar MongoDB ni configurar nada manualmente.

### Requisitos previos

- **Docker Desktop** instalado y corriendo
- **Java 17+** instalado
- **Maven 3.8+** instalado

Verifica:
```bash
docker -v          # Docker version 20.10+
java -version      # openjdk 17 o superior
mvn -version       # Apache Maven 3.8+
```

> Si `java -version` muestra 1.8 u 11 — instala JDK 17 desde https://adoptium.net  
> Si Docker Desktop no corre — ábrelo desde el menú de aplicaciones y espera el ícono verde.

### Paso 1 — Compilar el backend

```bash
cd trello-time-tracker/backend
mvn clean package -DskipTests
cd ..
```

Resultado esperado:
```
BUILD SUCCESS
```

Esto genera `backend/target/trello-time-tracker-1.0.0.jar`, que Docker necesita para construir la imagen.

### Paso 2 — Levantar todos los servicios

```bash
docker compose up --build -d
```

Esto construye y arranca 3 contenedores:

| Contenedor | Puerto | Descripción |
|------------|--------|-------------|
| `trello-mongodb` | 27017 | Base de datos MongoDB |
| `trello-backend` | 8080 | API Spring Boot |
| `trello-frontend` | 3000 | React app |

Espera 2-3 minutos la primera vez. Para ver el progreso:
```bash
docker compose logs -f
```

Cuando veas esto en los logs, el backend está listo:
```
Started TrelloTrackerApplication in X.XXX seconds
```

### Paso 3 — Verificar que todo funciona

```bash
# Ver contenedores activos (deben salir los 3)
docker compose ps

# Verificar API
curl http://localhost:8080/api/boards
# Respuesta esperada: [] (array vacío si no hay tableros)

# Verificar MongoDB
docker exec -it trello-mongodb mongosh --eval "db.adminCommand('ping')"
# Respuesta esperada: { ok: 1 }
```

### Paso 4 — Abrir las aplicaciones

| Aplicación | URL |
|------------|-----|
| **Frontend React original** | http://localhost:3000 |
| **Frontend moderno** | Abre `Tablero.dc.html` en el navegador |
| **API REST** | http://localhost:8080/api/boards |
| **Swagger UI** | http://localhost:8080/swagger-ui.html |

### Comandos Docker útiles

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f
docker compose logs -f backend     # solo el backend
docker compose logs -f frontend    # solo el frontend

# Reiniciar un servicio
docker compose restart backend

# Parar todo (los datos se conservan)
docker compose down

# Parar todo y borrar datos (¡cuidado! borra MongoDB)
docker compose down -v

# Reconstruir desde cero
docker compose down
docker compose up --build -d

# Entrar a un contenedor
docker exec -it trello-backend sh
docker exec -it trello-mongodb mongosh
```

---

## 3. Opción B — Sin Docker (desarrollo local)

Útil si no tienes Docker o quieres iterar rápido en el código.

### Requisitos previos

- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+** y **npm**
- **MongoDB** corriendo localmente

Verifica:
```bash
java -version      # openjdk 17+
mvn -version       # 3.8+
node -v            # v18+
npm -v             # 9+
mongod --version   # 5.0+ (o usa Docker solo para Mongo)
```

### Paso 1 — Levantar MongoDB

**Opción 1: MongoDB instalado localmente**
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Opción 2: MongoDB en Docker (solo la base de datos)**
```bash
docker run -d \
  --name trello-mongo \
  -p 27017:27017 \
  -v mongo-local:/data/db \
  mongo:7
```

### Paso 2 — Configurar el backend para desarrollo local

Edita `backend/src/main/resources/application.properties`:

```properties
spring.application.name=trello-time-tracker

# Cambiar "mongodb" por "localhost" para desarrollo sin Docker
spring.data.mongodb.uri=mongodb://localhost:27017/trellotracker

server.port=8080
```

> En Docker Compose, `mongodb` es el nombre del contenedor (hostname interno).  
> En local, usa `localhost`.

### Paso 3 — Arrancar el backend

```bash
cd trello-time-tracker/backend
mvn spring-boot:run
```

Verás en la consola:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
...
Started TrelloTrackerApplication in X.XXX seconds (JVM running for X.XXX)
```

El API queda disponible en: **http://localhost:8080**

Para compilar y ejecutar el JAR directamente:
```bash
mvn clean package -DskipTests
java -jar target/trello-time-tracker-1.0.0.jar
```

### Paso 4 — Arrancar el frontend React

En una nueva terminal:

```bash
cd trello-time-tracker/frontend
npm install        # solo la primera vez
npm start
```

Se abre automáticamente **http://localhost:3000**

El `package.json` tiene configurado `"proxy": "http://localhost:8080"`, así que las llamadas al API funcionan sin CORS.

### Paso 5 — Abrir el frontend moderno

Abre `Tablero.dc.html` directamente en el navegador.  
El indicador en la barra superior mostrará **"API conectada"** en verde si el backend responde en `http://localhost:8080/api`.

### Resumen — qué terminal hace qué

```
Terminal 1: mongod (o docker run mongo)   → MongoDB en :27017
Terminal 2: mvn spring-boot:run           → API en :8080
Terminal 3: npm start                     → React en :3000
Navegador:  Tablero.dc.html              → Frontend moderno
```

---

## 4. Frontend moderno — Tablero.dc.html

`Tablero.dc.html` es el frontend rediseñado. No necesita build ni servidor — abre directo en el navegador.

### Detección automática del backend

Al cargar, intenta conectarse a `http://localhost:8080/api`:

- **🟢 "API conectada"** → sincroniza con MongoDB en tiempo real.
- **🟠 "Modo local"** → guarda en `localStorage`. Cuando el backend esté disponible, recarga la página para sincronizar.

### Cambiar la URL del backend

Si tu backend corre en otro puerto o servidor, ajusta el Tweak **api** en el panel de configuración del editor:

```
Por defecto:   http://localhost:8080/api
Otro puerto:   http://localhost:9090/api
Producción:    https://api.mi-dominio.com/api
```

### Vistas disponibles

| Vista | Tecla | Descripción |
|-------|-------|-------------|
| ▦ Tablero | — | Kanban con drag & drop, barra de progreso por columna |
| ☰ Lista | — | Vista tabla agrupada por columna |
| ▥ Calendario | — | Tarjetas con fecha en rejilla mensual |
| ⊏ Timeline | — | Gantt semanal de tarjetas con fecha de vencimiento |
| 📊 Informes | — | Tiempo por lista, estadísticas, registro de sesiones |

### Features premium

- **Cronómetro** por tarjeta — ▶ iniciar / ■ detener / guardar sesión
- **Votos** 👍 en tarjetas
- **Campos personalizados** — atributos propios por tarjeta
- **Recurrencia** — diaria / semanal / mensual
- **Automatizaciones** ⚡ — reglas configurables
- **Portadas** de color
- **Etiquetas** renombrables con editor inline
- **Checklist** con barra de progreso
- **Comentarios** con avatar
- **Filtros** por etiqueta, prioridad y miembro
- **Búsqueda** en tiempo real
- **Plantillas** al crear tablero
- **Múltiples tableros**
- **Responsive** — columnas se apilan en móvil

---

## 5. Aplicar actualizaciones del backend

Copia los archivos de `backend-upgrade/` al proyecto:

```bash
# Desde la raíz del proyecto
cp backend-upgrade/Card.java \
   backend/src/main/java/com/trellotracker/model/Card.java

cp backend-upgrade/BoardController.java \
   backend/src/main/java/com/trellotracker/controller/BoardController.java

cp backend-upgrade/BoardService.java \
   backend/src/main/java/com/trellotracker/service/BoardService.java
```

Luego recompila y relanza:

```bash
# Con Docker
cd backend && mvn clean package -DskipTests && cd ..
docker compose up --build -d

# Sin Docker
cd backend && mvn spring-boot:run
```

---

## 6. API — Endpoints completos

Base URL: `http://localhost:8080/api`

### Boards

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/boards` | Crear tablero |
| `GET` | `/boards` | Listar todos los tableros |
| `GET` | `/boards/{id}` | Obtener tablero completo (listas + tarjetas) |
| `DELETE` | `/boards/{id}` | Eliminar tablero |
| `GET` | `/boards/{id}/reports` | Informe de tiempo y estadísticas |

**Crear tablero — body:**
```json
{
  "title": "Mi proyecto",
  "description": "Descripción opcional",
  "templateType": "kanban"
}
```

### Lists (columnas)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/boards/{boardId}/lists` | Añadir lista/columna |

**Body:**
```json
{ "title": "Nueva columna" }
```

### Cards (tarjetas)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/boards/{boardId}/lists/{listId}/cards` | Crear tarjeta |
| `PUT` | `/boards/{boardId}/lists/{listId}/cards/{cardId}` | Editar tarjeta |
| `DELETE` | `/boards/{boardId}/lists/{listId}/cards/{cardId}` | Eliminar tarjeta |
| `POST` | `/boards/{boardId}/cards/{cardId}/move` | Mover tarjeta entre listas |

**Crear/editar tarjeta — body:**
```json
{
  "title": "Nombre de la tarea",
  "description": "Detalle opcional",
  "priority": "high",
  "status": "active",
  "dueDate": "2026-07-20T00:00:00.000Z",
  "tags": ["frontend", "urgente"]
}
```

**Mover tarjeta — body:**
```json
{
  "sourceListId": "lista-origen-id",
  "targetListId": "lista-destino-id",
  "newOrder": 0
}
```

### Time tracking

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/boards/{boardId}/lists/{listId}/cards/{cardId}/time` | Guardar sesión de tiempo |

**Body:**
```json
{
  "description": "Sesión de trabajo",
  "startTime": "2026-07-07T10:00:00",
  "endTime": "2026-07-07T11:30:00"
}
```

### Features premium (nuevos endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/boards/{boardId}/lists/{listId}/cards/{cardId}/vote` | Votar tarjeta |
| `POST` | `/boards/{boardId}/lists/{listId}/cards/{cardId}/checklist` | Añadir item al checklist |
| `PUT` | `/boards/{boardId}/lists/{listId}/cards/{cardId}/checklist/{itemId}` | Marcar/desmarcar item |
| `DELETE` | `/boards/{boardId}/lists/{listId}/cards/{cardId}/checklist/{itemId}` | Eliminar item |
| `POST` | `/boards/{boardId}/lists/{listId}/cards/{cardId}/comments` | Añadir comentario |
| `PUT` | `/boards/{boardId}/lists/{listId}/cards/{cardId}/fields` | Actualizar campos personalizados |

**Añadir checklist item — body:**
```json
{ "text": "Revisar el diseño" }
```

**Marcar checklist item — body:**
```json
{ "done": true }
```

**Añadir comentario — body:**
```json
{
  "authorId": "me",
  "authorName": "Tu nombre",
  "authorInitials": "TN",
  "text": "Texto del comentario"
}
```

**Campos personalizados — body:**
```json
{
  "Estimación": "3 días",
  "Enlace": "https://figma.com/..."
}
```

### Templates

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/boards/templates` | Listar plantillas disponibles |
| `GET` | `/templates` | Ídem (ruta alternativa) |

---

## 7. Modelo de datos

### Card (completo)

```java
{
  // Campos base
  "id":                 "string",
  "title":              "string",
  "description":        "string",
  "order":              0,
  "priority":           "high | medium | low | null",
  "status":             "active | done",
  "done":               false,
  "tags":               ["string"],
  "dueDate":            "2026-07-20T00:00:00",
  "createdAt":          "2026-07-07T10:00:00",
  "updatedAt":          "2026-07-07T10:00:00",

  // Time tracking
  "timeEntries": [
    {
      "id":          "string",
      "description": "string",
      "startTime":   "2026-07-07T10:00:00",
      "endTime":     "2026-07-07T11:30:00",
      "minutes":     90,
      "createdAt":   "2026-07-07T10:00:00"
    }
  ],
  "totalMinutesSpent": 90,

  // Nuevos (premium)
  "labels":         { "Urgente": "rose", "Personal": "violet" },
  "assignedMembers": ["userId1", "userId2"],
  "checklist": [
    { "id": "string", "text": "Tarea", "done": false, "createdAt": "..." }
  ],
  "comments": [
    {
      "id":             "string",
      "authorId":       "string",
      "authorName":     "string",
      "authorInitials": "string",
      "text":           "string",
      "createdAt":      "..."
    }
  ],
  "cover":         "rose | amber | green | teal | blue | violet | null",
  "customFields":  { "Estimación": "3 días", "Enlace": "https://..." },
  "votes":         0,
  "recurring":     "daily | weekly | monthly | null"
}
```

### Dónde vive cada dato

| Campo | MongoDB | localStorage |
|-------|---------|--------------|
| título, descripción, prioridad, fecha, estado | ✅ | — |
| tags, time entries, totalMinutesSpent | ✅ | — |
| votos, checklist, comentarios, campos personalizados | ✅ (con nuevos endpoints) | ✅ fallback |
| etiquetas con color, portada, recurrencia, miembros | — | ✅ `card_ext_v1` |

> Los campos marcados como "fallback" funcionan en localStorage hasta que el endpoint backend esté disponible. Una vez activo, el frontend los envía automáticamente.

---

## 8. Plantillas disponibles

| ID | Nombre | Listas |
|----|--------|--------|
| `kanban` | Kanban | Por hacer → En progreso → Hecho |
| `scrum` | Scrum | Backlog → Por hacer → En progreso → Revisión → Hecho |
| `personal` | Personal | Ideas → Hoy → Esta semana → Hecho |
| `blank` | En blanco | (sin listas) |
| `daily` | Daily Life | Morning → Afternoon → Evening → Notes |
| `project` | Project Management | Planning → Execution → Testing → Deployment → Maintenance |

---

## 9. Variables de entorno

### Backend (`application.properties`)

```properties
# Desarrollo local
spring.data.mongodb.uri=mongodb://localhost:27017/trellotracker
server.port=8080

# Docker (docker-compose.yml lo inyecta automáticamente)
spring.data.mongodb.uri=mongodb://mongodb:27017/trellotracker
```

### Frontend React (`frontend/.env`)

Crea un archivo `.env` en la carpeta `frontend/` si necesitas cambiar la URL del API:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

Por defecto usa el proxy configurado en `package.json` (`"proxy": "http://localhost:8080"`).

### Frontend moderno (`Tablero.dc.html`)

Ajusta el Tweak **api** en el panel de configuración del editor. No requiere archivo `.env`.

---

## 10. Despliegue en producción

### Backend

```bash
# Compilar
cd backend && mvn clean package -DskipTests

# El JAR resultante es autocontenido
java -jar target/trello-time-tracker-1.0.0.jar \
  --spring.data.mongodb.uri=mongodb://tu-mongo-server:27017/trellotracker \
  --server.port=8080
```

Con Docker en un servidor Linux:
```bash
# Subir el proyecto al servidor
scp -r trello-time-tracker usuario@servidor:/app/

# En el servidor
cd /app/trello-time-tracker/backend
mvn clean package -DskipTests
cd ..
docker compose up -d
```

### Frontend React

```bash
cd frontend
npm run build
# Sube la carpeta build/ a tu CDN, Netlify, Vercel, o servidor nginx
```

### Frontend moderno (Tablero.dc.html)

Es un único archivo HTML — despliégalo en cualquier sitio estático:

```bash
# Netlify
# Arrastra Tablero.dc.html al dashboard en app.netlify.com

# GitHub Pages
git add Tablero.dc.html && git commit -m "deploy frontend" && git push

# Nginx
cp Tablero.dc.html /var/www/html/index.html
```

Actualiza el Tweak `api` con la URL pública del backend antes de desplegar.

### CORS en producción

El `@CrossOrigin(origins = "*")` del `BoardController` permite cualquier origen (válido para desarrollo). En producción restringe al dominio real:

```java
@CrossOrigin(origins = "https://tu-dominio.com")
```

---

## 11. Troubleshooting

### "Modo local" — no conecta al backend

```bash
# 1. Verificar que el backend responde
curl http://localhost:8080/api/boards

# 2. Verificar que los contenedores corren
docker compose ps

# 3. Ver logs del backend
docker compose logs backend

# 4. Si el backend cayó, reiniciarlo
docker compose restart backend
```

### Error `invalid flag: --release` al compilar

Java 8 u 11 detectado. Necesitas Java 17+:
```bash
# Verificar versión
java -version

# macOS (Homebrew)
brew install --cask temurin@17

# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Después verificar
java -version  # debe decir 17
```

### Error `unable to get image` o `Docker not running`

Docker Desktop no está corriendo:
1. Abre Docker Desktop desde el menú de aplicaciones
2. Espera el ícono verde "Engine running"
3. Ejecuta `docker ps` para confirmar (debe mostrar tabla vacía, no error)

### Frontend React — pantalla en blanco en localhost:3000

```bash
# Ver logs del contenedor
docker compose logs frontend

# Reconstruir
docker compose down
docker compose up --build -d
```

### Puerto 8080 ocupado

```bash
# Ver qué proceso usa el puerto
lsof -i :8080       # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Cambiar el puerto del backend en docker-compose.yml
ports:
  - "8090:8080"   # usa 8090 en el host

# Y actualizar el Tweak api a: http://localhost:8090/api
```

### MongoSocketOpenException — backend no conecta a MongoDB

```bash
# Reiniciar en orden correcto
docker compose down
docker compose up -d mongodb
# Esperar 10 segundos
docker compose up -d backend frontend
```

### Reset completo — borrar todo y empezar de cero

```bash
docker compose down -v          # para todo y borra datos
docker compose up --build -d    # reconstruye desde cero
```
