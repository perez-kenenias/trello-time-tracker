# Trello Time Tracker

A Trello-like project management dashboard with built-in time tracking, Scrum/Kanban templates, and activity logging. Built with **Java Spring Boot**, **MongoDB**, **React**, and **Docker**.

## Quick Start (I just want to see the app NOW)

If you already have Docker Desktop running, just run these 3 commands:

```bash
cd backend && mvn clean package -DskipTests && cd ..
docker compose up --build -d
```

Then open: **http://localhost:3000**

That's it. The full instructions are below if something goes wrong.

---

## Features

- **Boards & Lists**: Create boards with customizable lists (columns)
- **Templates**: Pre-built templates including Scrum, Kanban, Daily Life, and Project Management
- **Cards**: Add tasks/activities with priorities, tags, descriptions, and due dates
- **Drag & Drop**: Move cards between lists to update status
- **Time Tracking**: Log hours/minutes spent on each card with detailed time entries
- **API Testing**: Swagger UI available to test all endpoints
- **Dockerized**: Ready to deploy with Docker Compose

## Required Versions (Very Important)

You MUST have these exact (or higher) versions installed:

| Technology | Minimum Version | How to Check | Download Link |
|------------|----------------|--------------|---------------|
| **Java JDK** | 17 | `java -version` | https://adoptium.net (Eclipse Temurin JDK 17) |
| **Maven** | 3.8+ | `mvn -version` | https://maven.apache.org/download.cgi |
| **Node.js** | 18+ | `node -v` | https://nodejs.org (LTS version) |
| **MongoDB** | 5.0+ | `mongod --version` | https://mongodb.com/try/download/community |
| **Docker** (optional) | 20.10+ | `docker -v` | https://docker.com/products/docker-desktop |
| **Docker Compose** (optional) | 2.0+ | `docker compose version` | Included with Docker Desktop |

### Quick Check (run these in your terminal)

```bash
# Check Java version - MUST say "17" or higher
java -version

# Check Maven version - MUST say 3.8 or higher
mvn -version

# Check Node.js version - MUST say 18 or higher
node -v

# Check npm version
npm -v
```

**If `java -version` shows 1.8, 8, 11, or anything below 17, the build WILL fail.**

**Install Java 17:**
1. Go to https://adoptium.net
2. Download "Eclipse Temurin JDK 17" for your OS
3. Install it
4. Set `JAVA_HOME` environment variable to the JDK 17 folder

**On Windows, verify JAVA_HOME:**
```cmd
echo %JAVA_HOME%
# Should show something like: C:\Program Files\Eclipse Adoptium\jdk-17
```

## Tech Stack

- **Backend**: Java 17, Spring Boot 3.2.0, Spring Data MongoDB, Lombok
- **Database**: MongoDB 7.0
- **Frontend**: React 18.2.0
- **Build Tool**: Maven 3.8+
- **Docs**: OpenAPI / Swagger UI (springdoc-openapi 2.3.0)
- **Deployment**: Docker 20.10+ & Docker Compose 2.0+

## Project Structure

```
trello-time-tracker/
├── backend/           # Spring Boot application
├── frontend/          # React application
├── docker-compose.yml # Orchestrates all services
└── README.md
```

## How This README is Organized

Read this if you get lost:
1. **"Quick Start"** right above - If you just want to see the app NOW
2. **"How to See the Frontend"** below - If the app is running but you can't see it
3. **"Troubleshooting Guide"** further down - If something is broken

---

## Quick Start (Docker)

### What You Need Before Starting
| Software | Required For | Download |
|----------|-------------|----------|
| **Docker Desktop** | Running containers | https://docker.com/products/docker-desktop |
| **Maven** | Building Java JAR | https://maven.apache.org/download.cgi |
| **Java JDK 17** | Compiling backend | https://adoptium.net |

### CRITICAL: Docker Desktop Must Be Running (Windows)

Before running any Docker command, **Docker Desktop must be installed AND running**.

1. **Install Docker Desktop**
   - Download from https://docker.com/products/docker-desktop
   - Run the installer
   - Restart your computer if asked

2. **Start Docker Desktop**
   - Open Docker Desktop from Start Menu
   - Wait until you see the green "Engine running" indicator
   - You should see the whale icon in your system tray

3. **Verify Docker is running**
   ```bash
   docker ps
   ```
   Should show an empty table (not an error).

   **If you see:** `error during connect` or `The system cannot find the file specified`
   → Docker Desktop is NOT running. Start it first.

### Step 1: Verify Java Version (IMPORTANT)
Before building, make sure you have Java 17+ installed:

```bash
java -version
```

Must show `17` or higher. If not, install JDK 17 from https://adoptium.net and set `JAVA_HOME`.

On Windows, run the included script to check all versions:
```bash
check-versions.bat
```

### Step 2: Build the Backend JAR
The backend is a Spring Boot application that needs to be compiled into a JAR file before building the Docker image.

```bash
# Navigate to the backend folder
cd backend

# Build the JAR file (skip tests for faster build)
mvn clean package -DskipTests

# Go back to the root project folder
cd ..
```

After this step, you should see `target/trello-time-tracker-1.0.0.jar` inside the `backend/` folder.

### Step 3: Build and Start All Services with Docker Compose
**Make sure Docker Desktop is running before this step.**

The `docker-compose.yml` file defines three services:
- **mongodb** - Database on port 27017
- **backend** - Java API on port 8080
- **frontend** - React app on port 3000

**Run this ONE command and wait:**
```bash
docker compose up --build -d
```

**What this does:**
1. Downloads MongoDB image
2. Builds the Java backend (takes 2-3 minutes)
3. Builds the React frontend (takes 1-2 minutes)
4. Starts all 3 services

**Wait 3-5 minutes.** You will see a lot of text scrolling. When it stops and you get your command prompt back, it's done.

**If you want to see the logs while it builds (no `-d`):**
```bash
docker compose up --build
```
This shows you everything happening. Press `Ctrl+C` to stop viewing logs (containers keep running).

### Step 4: Verify the Services are Running
```bash
# Check running containers
docker ps

# View logs
docker compose logs

# View logs for a specific service
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb
```

### Step 5: Access the Applications
Once all containers are running, open your browser:

| What you want | URL | What you should see |
|--------------|-----|---------------------|
| **API Home / Health Check** | http://localhost:8080/ | JSON message: `{"message":"Trello Time Tracker API is running!",...}` |
| **Swagger UI (API Docs)** | http://localhost:8080/swagger-ui.html | Interactive API testing page |
| **List all boards** | http://localhost:8080/api/boards | JSON list of boards (empty `[]` at first) |
| **Frontend** | http://localhost:3000 | React dashboard |

**IMPORTANT:** If you visit `http://localhost:8080` with no path and see a "Whitelabel Error Page" with "404 Not Found", that means the backend IS running but you need to add a path (like `/api/boards` or `/swagger-ui.html`).

---

## How to See the Frontend (Super Simple Guide)

This is the **main app** you will actually use. It looks like Trello.

### Step 1: Make sure everything is running
Open your terminal and type:
```bash
docker ps
```

You MUST see 3 containers running:
```
CONTAINER ID   IMAGE                           STATUS          PORTS                    NAMES
xxxxxxxxxxxx   trello-time-tracker-frontend    Up 2 minutes    0.0.0.0:3000->3000/tcp   trello-frontend
xxxxxxxxxxxx   trello-time-tracker-backend     Up 2 minutes    0.0.0.0:8080->8080/tcp   trello-backend
xxxxxxxxxxxx   mongo:7                         Up 2 minutes    0.0.0.0:27017->27017/tcp trello-mongodb
```

If you only see 1 or 2, they are not all running. Scroll up to "Troubleshooting Guide".

### Step 2: Open your web browser
Use **Chrome, Edge, or Firefox**.

### Step 3: Type this exact URL
```
http://localhost:3000
```

Press Enter.

### Step 4: What you should see
A webpage with:
- **A blue bar at the top** that says "Trello Time Tracker"
- **A white button** on the right that says "New Board"
- **Gray background**
- **Text in the middle** that says: "No boards yet. Create one!"

It looks like this:
```
+--------------------------------------------------+
|  Trello Time Tracker              [ New Board ]  |  <- Blue bar
+--------------------------------------------------+
|                                                  |
|              No boards yet. Create one!          |  <- Gray area
|                                                  |
+--------------------------------------------------+
```

### Step 5: Create your first board
1. Click the **"New Board"** button
2. Fill in:
   - **Title**: `My First Board`
   - **Description**: `Learning Scrum`
   - **Template**: Select "Scrum" from the dropdown
3. Click **"Create Board"**

You will now see your board with 5 columns:
- Backlog
- To Do
- In Progress
- Review
- Done

### Step 6: Add a card
1. Under "To Do", click **"+ Add a card"**
2. Type: `Learn Docker basics`
3. Click **"Add"**

### Step 7: Log time on a card
1. Click the card you just created
2. Click **"Log Time"**
3. Fill in:
   - Description: `Watched tutorial`
   - Start: pick a time
   - End: pick a time 2 hours later
4. Click **"Save Time"**

---

## Switch Language (English / Spanish)

The app supports **English** and **Spanish**. You can switch anytime.

### How to change language
1. Look at the **top blue bar**
2. Next to the "New Board" button, you will see a small button that says **"EN"** or **"ES"**
3. Click it to switch between English and Spanish
4. The entire app will instantly change language

### What gets translated
- All buttons ("New Board", "Add a card", "Log Time", etc.)
- All labels ("Title", "Description", "Template")
- All messages ("No boards yet. Create one!")
- Priority labels ("High" / "Alta", "Medium" / "Media", "Low" / "Baja")
- Template names ("Scrum", "Kanban", "Daily Life" / "Vida Diaria")

### Your choice is saved
The app remembers your language preference. Next time you open it, it will be in the same language.

---

### What if I see a BLANK WHITE PAGE at localhost:3000?

This means the frontend is not loading. Do this:

```bash
# 1. Check if frontend is running
docker compose ps

# 2. Look at frontend logs
docker compose logs frontend

# 3. If you see errors, rebuild it
docker compose down
docker compose build --no-cache frontend
docker compose up -d

# 4. Wait 30 seconds, then refresh your browser
```

### What if I see "Cannot GET /" at localhost:3000?

This means the old frontend build failed. The fix is the same as above - rebuild the frontend.

### What if I see "This site can't be reached"?

1. Make sure Docker Desktop is running
2. Make sure you typed `http://localhost:3000` (not https, not www)
3. Make sure containers are up: `docker ps`

---

### Quick URL Cheat Sheet

| What you want to see | Type this in browser | Should look like |
|---------------------|----------------------|------------------|
| **The app (Trello board)** | `http://localhost:3000` | Blue bar, gray background, cards |
| **API test page** | `http://localhost:8080/swagger-ui.html` | White page with list of URLs |
| **API "is it working?"** | `http://localhost:8080/` | Computer text (JSON) |

---

### Step 6: How to Verify Everything is Working

```bash
# 1. Check containers are running
docker ps
# Should show 3 containers: trello-mongodb, trello-backend, trello-frontend

# 2. Check backend health
curl http://localhost:8080/
# Should return: {"message":"Trello Time Tracker API is running!",...}

# 3. Check API is responding
curl http://localhost:8080/api/boards
# Should return: [] (empty array at first)

# 4. Check MongoDB is accepting connections
docker exec -it trello-mongodb mongosh --eval "db.adminCommand('ping')"
# Should return: { ok: 1 }
```

### Step 7: Stop the Services
```bash
# Stop and remove containers (keps images and volumes)
docker-compose down

# Stop and remove everything including volumes (WARNING: deletes database data)
docker-compose down -v
```

---

## Troubleshooting Guide

We collected every error you might hit and how to fix it.

### Error: `unable to get image 'trello-time-tracker-backend': failed to connect to the docker API`
**What it means:** Docker Desktop is not running.
**Fix:**
1. Open Docker Desktop from your Start Menu
2. Wait until the whale icon shows "Engine running" (green dot)
3. Run `docker ps` in terminal to confirm it works (should show empty table, not error)
4. Then run `docker compose up --build` again

### Error: `docker ps` shows nothing (empty table)
**What it means:** No containers exist yet. Either you never ran `docker compose up`, or they all stopped.
**Fix:**
```bash
# Start them
docker compose up --build -d

# If they keep stopping, check logs
docker compose logs backend
docker compose logs frontend
```

### Error: `invalid flag: --release` during Maven build
**What it means:** You are using Java 8 or 11, but this project requires Java 17.
**Fix:**
1. Install JDK 17 from https://adoptium.net
2. Set `JAVA_HOME` environment variable to the JDK 17 folder
3. On Windows:
   ```cmd
   echo %JAVA_HOME%
   # Must show something like: C:\Program Files\Eclipse Adoptium\jdk-17
   ```
4. Verify: `java -version` must show `17` or higher
5. Rebuild: `cd backend && mvn clean package -DskipTests`

### Error: `openjdk:17-jdk-slim: not found` during Docker build
**What it means:** The `openjdk` Docker images were removed from Docker Hub.
**Fix:** Already fixed in this project. The `backend/Dockerfile` now uses `eclipse-temurin:17-jdk-jammy` instead.
If you still see this, make sure your `backend/Dockerfile` has:
```dockerfile
FROM eclipse-temurin:17-jdk-jammy
```

### Error: "Whitelabel Error Page" with status 404
**What it means:** The backend IS running, but you are visiting the wrong URL.
**Fix:** Visit one of these instead:
- http://localhost:8080/ (API info page)
- http://localhost:8080/swagger-ui.html (API docs)
- http://localhost:8080/api/boards (list boards)

The root `/` with no path used to show an error, but now it shows a helpful JSON response.

### Error: Frontend shows blank page, "Cannot GET /", or nothing at port 3000
**What it means:** The frontend container built but is not serving correctly.
**Fix:**
```bash
# 1. Check if frontend container is running
docker ps

# 2. Check frontend logs
docker compose logs frontend

# 3. If you see build errors, rebuild:
docker compose down
docker compose up --build

# 4. If still blank, the old 'serve' package failed. 
#    We fixed this by using nginx instead. Just rebuild:
docker compose down
docker compose build --no-cache frontend
docker compose up -d
```

**After the fix, visit:** http://localhost:3000
**You should see:** The Trello dashboard with "No boards yet. Create one!" and a "New Board" button.

### Error: `Connection refused` when calling API
**What it means:** The backend hasn't finished starting or crashed.
**Fix:**
```bash
# Check if backend is running
docker ps

# View backend logs
docker compose logs -f backend

# Wait until you see: "Started TrelloTrackerApplication in X seconds"
```

### Error: `MongoSocketOpenException` or MongoDB connection timeout
**What it means:** Backend started before MongoDB was ready.
**Fix:** Already fixed in this project with `depends_on` and health checks. If you still see it:
```bash
# Restart just the backend
docker compose restart backend
```

### How to completely reset everything
If nothing works, start from scratch:
```bash
# Stop and delete everything
docker compose down -v

# Delete old images (forces rebuild)
docker rmi trello-time-tracker-backend

# Rebuild from zero
docker compose up --build
```

---

## Building Docker Images Manually

If you want to build and push images individually (e.g., for a registry like Docker Hub), follow these steps.

### 1. Build the Backend Image
```bash
# Make sure the JAR is built first
cd backend
mvn clean package -DskipTests

# Build the Docker image
docker build -t trello-time-tracker-backend:latest .

# Tag it for a registry (optional)
docker tag trello-time-tracker-backend:latest yourusername/trello-time-tracker-backend:latest

# Push to registry (optional)
docker push yourusername/trello-time-tracker-backend:latest
```

### 2. Build the Frontend Image
```bash
cd frontend

# Build the Docker image
docker build -t trello-time-tracker-frontend:latest .

# Tag it for a registry (optional)
docker tag trello-time-tracker-frontend:latest yourusername/trello-time-tracker-frontend:latest

# Push to registry (optional)
docker push yourusername/trello-time-tracker-frontend:latest
```

### 3. Run Containers Individually
```bash
# Create a network
docker network create trello-net

# Run MongoDB
docker run -d --name trello-mongodb --network trello-net -p 27017:27017 -v mongo-data:/data/db mongo:7

# Run Backend
docker run -d --name trello-backend --network trello-net -p 8080:8080 -e SPRING_DATA_MONGODB_URI=mongodb://trello-mongodb:27017/trellotracker trello-time-tracker-backend:latest

# Run Frontend
docker run -d --name trello-frontend --network trello-net -p 3000:3000 -e REACT_APP_API_URL=http://localhost:8080/api trello-time-tracker-frontend:latest
```

### 4. Useful Docker Commands
```bash
# List all images
docker images

# Remove an image
docker rmi trello-time-tracker-backend:latest

# Inspect a running container
docker inspect trello-backend

# Execute commands inside a container
docker exec -it trello-backend sh
docker exec -it trello-mongodb mongosh

# Restart a service
docker restart trello-backend

# View real-time logs
docker logs -f trello-backend
```

## API Endpoints

### Boards
- `POST /api/boards` - Create board
- `GET /api/boards` - List boards
- `GET /api/boards/{id}` - Get board
- `DELETE /api/boards/{id}` - Delete board
- `POST /api/boards/{id}/lists` - Add list

### Cards
- `POST /api/boards/{boardId}/lists/{listId}/cards` - Create card
- `PUT /api/boards/{boardId}/lists/{listId}/cards/{cardId}` - Update card
- `DELETE /api/boards/{boardId}/lists/{listId}/cards/{cardId}` - Delete card
- `POST /api/boards/{boardId}/cards/{cardId}/move` - Move card

### Time Tracking
- `POST /api/boards/{boardId}/lists/{listId}/cards/{cardId}/time` - Log time

### Templates
- `GET /api/templates` - Get available templates

## Manual Development

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### MongoDB (local)
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

## Templates Included

| Template | Lists |
|----------|-------|
| Scrum | Backlog, To Do, In Progress, Review, Done |
| Kanban | To Do, In Progress, Done |
| Daily Life | Morning, Afternoon, Evening, Notes |
| Project Management | Planning, Execution, Testing, Deployment, Maintenance |

## Time Tracking

Each card can have multiple time entries. When you log time, the system calculates total minutes and accumulates it on the card. You can view a history of all time entries per card.

## Docker Deployment

The `docker-compose.yml` includes:
- `mongodb` - MongoDB 7 with persistent volume
- `backend` - Spring Boot app on port 8080
- `frontend` - React production build served on port 3000

All services communicate over the `trello-net` bridge network.
