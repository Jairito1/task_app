# Despliegue de una aplicación web completa con contenedores

Este proyecto es una aplicación pequeña de tareas que cumple con los requisitos del enunciado:

- **Backend** con framework: **Express.js**
- **Frontend** con framework/librería: **React**
- **Frontend servido con Nginx**
- **Nginx como proxy inverso** hacia el backend
- **Base de datos PostgreSQL** con persistencia mediante volumen Docker
- **Imágenes personalizadas** para `back` y `front`
- **Multi-stage build** en ambas imágenes
- **Dos redes Docker**:
  - `front_back_net`
  - `back_db_net`
- **Sin docker-compose**

## Estructura del repositorio

```text
/
├── back/
├── front/
└── README.md
```

## Tecnologías utilizadas

### Backend
- Node.js 20
- Express.js
- PostgreSQL (`pg`)

### Frontend
- React
- Vite
- Nginx

### Base de datos
- PostgreSQL 16

---

## 1. Clonar el repositorio

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>
```

---

## 2. Construir imágenes Docker personalizadas

### Imagen del backend
```bash
docker build -t miniapp-back ./back
```

### Imagen del frontend
```bash
docker build -t miniapp-front ./front
```

---

## 3. Crear redes Docker

### Red entre frontend y backend
```bash
docker network create front_back_net
```

### Red entre backend y base de datos
```bash
docker network create back_db_net
```

---

## 4. Crear volumen Docker para PostgreSQL

```bash
docker volume create pgdata_miniapp
```

---

## 5. Ejecutar la base de datos

```bash
docker run -d \
  --name bd \
  --network back_db_net \
  -e POSTGRES_DB=appdb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -v pgdata_miniapp:/var/lib/postgresql/data \
  postgres:16-alpine
```

---

## 6. Ejecutar el backend

```bash
docker run -d \
  --name back \
  --network back_db_net \
  -e DB_HOST=bd \
  -e DB_PORT=5432 \
  -e DB_NAME=appdb \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -p 3000:3000 \
  miniapp-back
```

Luego conecta el contenedor `back` también a la red del frontend:

```bash
docker network connect front_back_net back
```

---

## 7. Ejecutar el frontend

```bash
docker run -d \
  --name front \
  --network front_back_net \
  -p 8080:80 \
  miniapp-front
```

---

## 8. Probar la aplicación

Frontend:
```bash
http://localhost:8080
```

Healthcheck del backend:
```bash
curl http://localhost:3000/api/health
```

Listado de tareas:
```bash
curl http://localhost:3000/api/tasks
```

Crear una tarea:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Primera tarea"}'
```

---

## 9. Verificar redes, volumen y contenedores

### Ver contenedores
```bash
docker ps
```

### Ver redes
```bash
docker network ls
```

### Inspeccionar red frontend-backend
```bash
docker network inspect front_back_net
```

### Inspeccionar red backend-bd
```bash
docker network inspect back_db_net
```

### Ver volumen
```bash
docker volume ls
```

---

## 10. Detener y eliminar contenedores

```bash
docker stop front back bd
```

```bash
docker rm front back bd
```

---

## ¿Qué hace la aplicación?

La aplicación permite:

- Verificar conexión con el backend
- Crear tareas
- Listar tareas
- Marcart tareas como completadas
- Eliminar tareas

El frontend consume el backend por medio de `/api`, y **Nginx actúa como proxy inverso** redirigiendo esas solicitudes al contenedor `back`.

---

## Evidencia de cumplimiento de requisitos

- Backend con framework: **Express.js**
- Frontend con framework/librería: **React**
- Frontend servido por **Nginx**
- **Nginx proxy inverso** a backend
- Imágenes Docker personalizadas para `back` y `front`
- **Multi-stage build** en ambas imágenes
- PostgreSQL con **volumen Docker**
- Dos redes Docker separadas
- Despliegue manual con comandos Docker
- Sin `docker-compose`

