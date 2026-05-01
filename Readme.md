# 📋 Sistema de Examen en Línea — MVC

Sistema de exámenes en línea desarrollado con el patrón **Modelo-Vista-Controlador (MVC)**, construido como práctica de Usabilidad y Accesibilidad en Sistemas MVC.

---

## 🧱 Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| **Vista** | React 19 + TypeScript + Tailwind CSS + Vite |
| **Controlador** | Node.js + Express.js |
| **Modelo** | MySQL 8 (Docker) |
| **Autenticación** | JWT (jsonwebtoken) + bcryptjs |
| **Gestor de paquetes** | pnpm |

---

## 📁 Estructura del proyecto

```
SistemaMVC_fixed/
│
├── backend/                        # Capa Controlador + Modelo
│   ├── app.js                      # Punto de entrada del servidor Express
│   ├── .env                        # Variables de entorno (puerto, DB, JWT)
│   ├── docker-compose.yml          # Configuración del contenedor MySQL
│   ├── migrate.js                  # Script ejecutor de migraciones SQL
│   │
│   ├── config/
│   │   └── db.js                   # Conexión a la base de datos MySQL
│   │
│   ├── controllers/
│   │   ├── authController.js       # Lógica de registro e inicio de sesión
│   │   └── examController.js       # Lógica de listar, obtener y calificar exámenes
│   │
│   ├── middleware/
│   │   └── authMiddleware.js       # Verificación de token JWT en rutas protegidas
│   │
│   ├── routes/
│   │   ├── authRoutes.js           # POST /api/auth/register, POST /api/auth/login
│   │   └── examRoutes.js           # GET /api/exams, GET /api/exams/:id, POST /api/exams/submit
│   │
│   ├── migrations/                 # Scripts SQL ejecutados en orden
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_exams.sql
│   │   ├── 003_exams.sql
│   │   ├── 004_questions.sql
│   │   └── 005_options.sql
│   │
│   └── seed/
│       ├── users.js                # Crea el usuario de prueba (admin@test.com)
│       └── seedData.sql            # Inserta exámenes, preguntas y opciones
│
└── frontend/                       # Capa Vista
    ├── index.html                  # HTML raíz con lang="es" y meta accesibles
    ├── .env                        # VITE_API_URL apuntando al backend
    │
    └── src/
        ├── main.tsx                # Punto de entrada React
        ├── App.tsx                 # Definición de rutas (React Router)
        │
        ├── api/
        │   └── api.js              # Funciones fetch() hacia el backend con JWT
        │
        ├── context/
        │   └── AuthContext.jsx     # Estado global de autenticación + persistencia
        │
        ├── components/
        │   ├── Layout.jsx          # Navbar, skip link, estructura base de página
        │   └── PrivateRoute.jsx    # Protección de rutas para usuarios no autenticados
        │
        └── pages/
            ├── Login.jsx           # Pantalla de inicio de sesión
            ├── ExamList.jsx        # Lista de exámenes disponibles
            └── ExamDetail.jsx      # Vista del examen + calificación de resultado
```

---

## ⚙️ Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [pnpm](https://pnpm.io/) — instalar con `npm install -g pnpm`

---

## 🚀 Pasos para ejecutar el proyecto

### Paso 1 — Levantar la base de datos

```bash
cd SistemaMVC/backend
docker-compose up -d
```

Espera 10–15 segundos. Verifica que el contenedor esté corriendo:

```bash
docker ps
# Debes ver: mysql_exam   Up
```

---

### Paso 2 — Instalar dependencias del backend

```bash
cd SistemaMVC_/backend
pnpm install
```

---

### Paso 3 — Ejecutar migraciones (crea las tablas)

```bash
pnpm run migrate
```

Salida esperada:
```
✅ Migración ejecutada: 001_create_users.sql
✅ Migración ejecutada: 002_create_exams.sql
...
🚀 Base de datos actualizada
```

---

### Paso 4 — Cargar datos de prueba (seed)

**Primero los usuarios:**
```bash
pnpm run seed
```

**Luego los exámenes, preguntas y opciones:**

> ⚠️ En **PowerShell** usa este comando (el operador `<` no funciona en PS):

```powershell
# Copiar el archivo al contenedor
docker cp seed/seedData.sql mysql_exam:/seedData.sql

# Ejecutar con encoding UTF-8
docker exec -it mysql_exam mysql -uroot -proot --default-character-set=utf8mb4 exam_db -e "source /seedData.sql"
```

> En **Linux / macOS / Git Bash**:
```bash
docker exec -i mysql_exam mysql -uroot -proot --default-character-set=utf8mb4 exam_db < seed/seedData.sql
```

---

### Paso 5 — Iniciar el backend

```bash
cd SistemaMVC/backend
pnpm run dev
```

Salida esperada:
```
🟢 MySQL conectado
🚀 Backend listo en puerto 3000
```

**Deja esta terminal abierta.**

---

### Paso 6 — Instalar dependencias del frontend

Abre una **nueva terminal**:

```bash
cd SistemaMVC/frontend
pnpm install
```

---

### Paso 7 — Iniciar el frontend

```bash
pnpm run dev
```

Salida esperada:
```
VITE ready in 300ms
➜  Local:   http://localhost:5173/
```

---

### Paso 8 — Abrir en el navegador

Ingresa a **http://localhost:5173**

Credenciales de prueba:
```
Email:    admin@test.com
Password: 123456
```

---

## 🖥️ Resumen de terminales

| Terminal | Directorio | Comando | Qué hace |
|----------|-----------|---------|----------|
| 1 | `backend/` | `docker-compose up -d` | Base de datos MySQL en Docker |
| 2 | `backend/` | `pnpm run dev` | API REST en `http://localhost:3000` |
| 3 | `frontend/` | `pnpm run dev` | Interfaz web en `http://localhost:5173` |

---

## 🔌 Endpoints de la API

| Método | Ruta | Protegida | Descripción |
|--------|------|-----------|-------------|
| `POST` | `/api/auth/register` | No | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | No | Iniciar sesión, retorna JWT |
| `GET` | `/api/exams` | ✅ Sí | Listar todos los exámenes |
| `GET` | `/api/exams/:id` | ✅ Sí | Obtener examen con preguntas y opciones |
| `POST` | `/api/exams/submit` | ✅ Sí | Enviar respuestas y recibir calificación |

Las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

---

## 🗄️ Variables de entorno

**`backend/.env`**
```env
JWT_SECRET=mi_clave_super_segura_123
JWT_EXPIRES=2h
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=exam_db
DB_PORT=3307
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🐛 Solución de problemas comunes

**Error: "MySQL conectando..." / no conecta**
El contenedor todavía está iniciando. Espera 15 segundos y vuelve a correr `pnpm run dev` en el backend.

**Error: Puerto 3307 ocupado**
Edita `docker-compose.yml` y cambia `"3307:3306"` a `"3308:3306"`. Luego actualiza `DB_PORT=3308` en `backend/.env`.

**Error: "pnpm: command not found"**
```bash
npm install -g pnpm
```

**Textos con caracteres extraños (Â¿, Ã¡, etc.)**
Al cargar el seed, asegúrate de incluir `--default-character-set=utf8mb4` en el comando de Docker.

**Error: "Cannot add or update a child row" (foreign key)**
Las tablas tienen datos inconsistentes de intentos anteriores. Limpia con:
```powershell
docker exec -it mysql_exam mysql -uroot -proot exam_db -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE options; TRUNCATE TABLE questions; TRUNCATE TABLE exams; SET FOREIGN_KEY_CHECKS=1;"
```
Luego vuelve a ejecutar el seed del Paso 4.

---

## 🔒 Seguridad implementada

- Contraseñas encriptadas con **bcrypt** (salt rounds = 10)
- Autenticación por **JWT** con expiración de 2 horas
- Las respuestas correctas (`is_correct`) **nunca se exponen** al cliente
- Mensajes de error genéricos en login para prevenir enumeración de usuarios
- Todas las rutas de exámenes protegidas por middleware JWT

---

## ♿ Accesibilidad implementada

- `role="alert"` + `aria-live` en mensajes de error (no solo color)
- `aria-label` descriptivos en todos los botones
- `<fieldset>` + `<legend>` en grupos de opciones radio
- Skip link "Ir al contenido principal" para navegación por teclado
- Focus rings visibles en todos los elementos interactivos
- `lang="es"` en el HTML raíz
- Indicador de progreso de preguntas respondidas

---

*Práctica: Usabilidad y Accesibilidad en Sistemas MVC — PUCESE*