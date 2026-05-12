# 📋 Sistema de Examen Seguro — Desktop (Electron)

Sistema de exámenes de alta seguridad desarrollado con el patrón **MVC**, convertido en una aplicación de escritorio utilizando **ElectronJS**. Incluye funciones de "Safe Browser" para prevenir el fraude durante las evaluaciones.

---

## 🧱 Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| **Escritorio** | **ElectronJS** (Seguridad + Kiosk Mode) |
| **Vista** | React 19 + TypeScript + Tailwind CSS + Vite |
| **Controlador** | Node.js + Express.js (Embebido en la App) |
| **Modelo** | MySQL 8 (Docker) |
| **Autenticación** | JWT + bcryptjs |

---

## 📁 Estructura del proyecto (Arquitectura Desktop)

```
SistemaMVC/
│
├── electron/                       # Configuración Desktop
│   ├── main.js                     # Proceso principal (Kiosk, Backend Spawner)
│   └── preload.js                  # Puente seguro IPC (Seguridad de API)
│
├── backend/                        # API REST (Embebida en Electron)
│   ├── app.js                      # Servidor Express
│   └── migrations/                 # Base de datos
│
└── frontend/                       # Interfaz de Usuario
    ├── src/hooks/
    │   └── useExamSecurity.js      # Hook de detección de fraude
    └── src/pages/
        └── ExamDetail.jsx          # Examen con modo seguro activo
```

---

## ⚙️ Requisitos previos

- [Node.js](https://nodejs.org/) v20 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para MySQL)
- [pnpm](https://pnpm.io/)

---

## 🚀 Cómo ejecutar el proyecto (Modo Desktop)

### Paso 1 — Levantar la base de datos
```bash
cd backend
docker-compose up -d
```

### Paso 2 — Instalar dependencias del backend
```bash
cd backend
pnpm install
```

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

### Paso 4 — Cargar datos de prueba (seed)
**Primero los usuarios:**
```bash
pnpm run seed
```

**Luego los exámenes, preguntas y opciones:**
> ⚠️ En **PowerShell** usa este comando:
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

### Paso 5 — Ejecutar en Desarrollo
Para ver los cambios en tiempo real (Vite + Electron):
```bash
cd frontend
# Inicia el frontend, el backend embebido y electron
pnpm run electron:dev
```

### Paso 6 — Generar el Instalador (.exe)
Para crear el archivo ejecutable para Windows:
```bash
cd frontend
pnpm run electron:build
```
El instalador generado aparecerá en la carpeta `dist-electron/`.


---

## 🔒 Funciones de Seguridad (Safe Browser)

La aplicación implementa medidas rigurosas para garantizar la integridad del examen:

1.  **Modo Kiosco**: Al iniciar un examen, la aplicación entra en pantalla completa y bloquea el uso de la tecla Windows y Alt+Tab.
2.  **Detección de Pérdida de Foco**: Si el estudiante intenta cambiar de ventana o minimizar la aplicación, el sistema:
    *   Registra el incidente con marca de tiempo.
    *   Muestra una advertencia nativa del sistema.
    *   Bloquea la interfaz con un overlay de advertencia.
3.  **Límite de Advertencias**: Tras **3 intentos** de salir del examen, este se cierra automáticamente y el estudiante es retirado de la prueba.
4.  **Bloqueo de Hardware/Teclado**:
    *   Desactiva Clic Derecho.
    *   Bloquea `F12` (DevTools).
    *   Bloquea `Ctrl+R` (Recargar) y `Ctrl+W` (Cerrar).
5.  **Backend Embebido**: El servidor corre dentro de la aplicación, eliminando la necesidad de configurar servidores externos por parte del alumno.

---

## 🖥️ Resumen de comandos útiles

| Comando | Descripción |
|---------|-------------|
| `pnpm run electron:dev` | Inicia el entorno de desarrollo completo. |
| `pnpm run electron:preview` | Prueba la versión compilada dentro de Electron. |
| `pnpm run electron:build` | Genera el instalador `.exe` para distribución. |

---

## ♿ Accesibilidad
Se mantiene el cumplimiento de accesibilidad (WCAG) con skip links, navegación por teclado y soporte para lectores de pantalla, incluso dentro del contenedor de Electron.

---

*Proyecto: Práctica de Usabilidad y Accesibilidad — Sistemas MVC — PUCESE*