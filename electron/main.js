const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

// ─────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────
// app.isPackaged = true solo cuando se empaquetó con electron-builder
// En desarrollo (npx electron) siempre es false
const isDev = !app.isPackaged;
const BACKEND_PORT = 3000;
const FRONTEND_PORT = 5173; // solo en dev con vite corriendo

let backendProcess = null;
let mainWindow = null;

// ─────────────────────────────────────────────────
// Arrancar el backend embebido (Node / Express)
// ─────────────────────────────────────────────────
function startBackend() {
  const backendPath = isDev
    ? path.join(__dirname, "..", "backend", "app.js")
    : path.join(process.resourcesPath, "backend", "app.js");

  if (!fs.existsSync(backendPath)) {
    console.error("❌ No se encontró el backend en:", backendPath);
    return;
  }

  console.log("🚀 Iniciando backend en:", backendPath);

  backendProcess = spawn("node", [backendPath], {
    env: {
      ...process.env,
      PORT: BACKEND_PORT,
      NODE_ENV: "production",
    },
    cwd: isDev
      ? path.join(__dirname, "..", "backend")
      : path.join(process.resourcesPath, "backend"),
    stdio: "pipe",
  });

  backendProcess.stdout.on("data", (data) => {
    console.log("[Backend]", data.toString().trim());
  });

  backendProcess.stderr.on("data", (data) => {
    console.error("[Backend ERR]", data.toString().trim());
  });

  backendProcess.on("exit", (code) => {
    console.log(`[Backend] proceso terminó con código ${code}`);
  });
}

// ─────────────────────────────────────────────────
// Crear ventana principal (modo kiosco / fullscreen)
// ─────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    // Pantalla completa sin bordes para examen
    fullscreen: true,
    // Kioscko real (bloquea Alt+F4 en Windows)
    kiosk: false, // lo activamos solo durante el examen via IPC
    // Sin menú
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev, // solo en desarrollo
      // Bloquear navegación a sitios externos
      navigateOnDragDrop: false,
    },
    backgroundColor: "#0f172a",
    show: false,
  });

  // Eliminar la barra de menú completamente
  mainWindow.setMenu(null);

  // Cargar la app
  if (isDev) {
    // Abrir consola automáticamente para depurar
    mainWindow.webContents.openDevTools();

    // Intentar conectar al servidor de Vite (HMR activo)
    mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`).catch(() => {
      // Si falla (ej. vite no ha terminado de arrancar), intentar cargar el dist local
      const distPath = path.join(__dirname, "..", "frontend", "dist", "index.html");
      if (fs.existsSync(distPath)) {
        mainWindow.loadFile(distPath);
      }
    });
  } else {
    mainWindow.loadFile(path.join(process.resourcesPath, "dist", "index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // ── Bloquear apertura de nuevas ventanas ──
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // No permitir abrir ninguna URL nueva
    console.warn("[Seguridad] Intento de abrir nueva ventana:", url);
    shell.openExternal(url); // si quieres puedes denegarlo en su lugar
    return { action: "deny" };
  });

  // ── Bloquear navegación a URLs externas ──
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const appUrl = isDev
      ? `http://localhost:${FRONTEND_PORT}`
      : `file://`;
    if (!url.startsWith(appUrl)) {
      console.warn("[Seguridad] Navegación bloqueada a:", url);
      event.preventDefault();
    }
  });

  // ── Bloquear DevTools ──
  mainWindow.webContents.on("devtools-opened", () => {
    if (!isDev) {
      mainWindow.webContents.closeDevTools();
    }
  });

  // ── Cerrar DevTools con F12 en producción ──
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (!isDev) {
      // Bloquear F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (ver fuente)
      const blockedKeys = ["F12"];
      const blockedCombos = [
        { ctrl: true, shift: true, key: "I" },
        { ctrl: true, shift: true, key: "J" },
        { ctrl: true, shift: true, key: "C" },
        { ctrl: true, key: "U" },
      ];
      if (blockedKeys.includes(input.key)) {
        event.preventDefault();
        return;
      }
      for (const combo of blockedCombos) {
        if (
          combo.key.toLowerCase() === input.key.toLowerCase() &&
          !!combo.ctrl === input.control &&
          !!combo.shift === input.shift
        ) {
          event.preventDefault();
          return;
        }
      }
    }
  });
}

// ─────────────────────────────────────────────────
// Handlers IPC — comunicación con el renderer
// ─────────────────────────────────────────────────

// El renderer avisa que empezó el examen → activar kiosco y fullscreen
ipcMain.on("exam:start", () => {
  if (mainWindow) {
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
    console.log("[Exam] Modo examen activado");
  }
});

// El renderer avisa que el examen terminó → desactivar kiosco
ipcMain.on("exam:end", () => {
  if (mainWindow) {
    mainWindow.setKiosk(false);
    mainWindow.setFullScreen(false);
    console.log("[Exam] Modo examen desactivado");
  }
});

// El renderer reporta que el alumno perdió el foco
ipcMain.on("exam:focus-lost", (_, data) => {
  console.warn("[Exam] Pérdida de foco detectada:", data);
  if (mainWindow) {
    // Traer la ventana al frente
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true, "screen-saver");
    setTimeout(() => mainWindow.setAlwaysOnTop(false), 3000);
  }
});

// El renderer pide mostrar una advertencia nativa
ipcMain.handle("exam:warn-dialog", async (_, message) => {
  if (!mainWindow) return;
  const result = await dialog.showMessageBox(mainWindow, {
    type: "warning",
    title: "⚠️ Advertencia — Examen en curso",
    message: message || "Se ha detectado actividad fuera del examen.",
    detail:
      "Si continúas saliendo del examen, este será cerrado automáticamente y se registrará el incidente.",
    buttons: ["Volver al examen", "Salir del examen"],
    defaultId: 0,
    cancelId: 1,
    icon: null,
  });
  return result.response; // 0 = volver, 1 = salir
});

// El renderer pide cerrar la app (al terminar el examen o por abandono)
ipcMain.on("exam:force-quit", () => {
  app.quit();
});

// ─────────────────────────────────────────────────
// Ciclo de vida de la app
// ─────────────────────────────────────────────────
app.whenReady().then(() => {
  startBackend();

  // Esperar un momento a que el backend levante antes de abrir la ventana
  setTimeout(createWindow, isDev ? 0 : 1500);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
    console.log("[Backend] proceso terminado al cerrar la app");
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
