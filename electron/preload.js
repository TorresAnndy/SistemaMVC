const { contextBridge, ipcRenderer } = require("electron");

/**
 * API expuesta al renderer (React) de forma segura.
 * Solo los métodos listados aquí son accesibles desde el frontend.
 */
contextBridge.exposeInMainWorld("electronAPI", {
  // ── Control del modo examen ──────────────────────
  /** Avisar al proceso principal que el examen comenzó */
  examStart: () => ipcRenderer.send("exam:start"),

  /** Avisar al proceso principal que el examen terminó normalmente */
  examEnd: () => ipcRenderer.send("exam:end"),

  /** Reportar pérdida de foco al proceso principal */
  reportFocusLost: (data) => ipcRenderer.send("exam:focus-lost", data),

  /**
   * Mostrar diálogo de advertencia nativo del SO.
   * @returns {Promise<number>} 0 = volver al examen, 1 = salir
   */
  showWarning: (message) => ipcRenderer.invoke("exam:warn-dialog", message),

  /** Cerrar la aplicación (abandono del examen) */
  forceQuit: () => ipcRenderer.send("exam:force-quit"),

  // ── Utilidades ───────────────────────────────────
  /** Detectar si estamos dentro de Electron */
  isElectron: true,
});
