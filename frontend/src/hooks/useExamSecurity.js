import { useEffect, useRef, useCallback } from "react";

/**
 * Hook de seguridad para exámenes.
 *
 * Detecta:
 *  - Pérdida de foco de la ventana (blur)
 *  - Cambio de visibilidad de la pestaña (visibilitychange)
 *  - Atajos de teclado peligrosos (Alt+Tab, Alt+F4, Win, etc.)
 *
 * Registra cada evento y muestra advertencias. Después de `maxWarnings`
 * advertencias, cierra el examen automáticamente.
 *
 * @param {Object} options
 * @param {boolean}  options.active       - Si el hook está activo (true durante el examen)
 * @param {number}   options.maxWarnings  - Número de advertencias antes de forzar el cierre (default: 3)
 * @param {Function} options.onWarning    - Callback cuando se registra una advertencia (recibe el evento)
 * @param {Function} options.onForceClose - Callback cuando se supera el límite de advertencias
 */
export default function useExamSecurity({
  active = false,
  maxWarnings = 3,
  onWarning = () => {},
  onForceClose = () => {},
} = {}) {
  const warningCount = useRef(0);
  const isProcessing = useRef(false); // Evita bucles infinitos
  const isElectron = typeof window !== "undefined" && !!window.electronAPI;

  // ── Registrar evento de seguridad ──────────────────
  const registerEvent = useCallback(
    async (type, detail = "") => {
      if (!active || isProcessing.current) return;

      isProcessing.current = true; // Bloqueamos nuevos eventos temporalmente

      const event = {
        type,
        detail,
        timestamp: new Date().toISOString(),
        count: ++warningCount.current,
      };

      console.warn("[ExamSecurity]", event);

      // Notificar al proceso principal de Electron
      if (isElectron) {
        window.electronAPI.reportFocusLost(event);
      }

      // Llamar al callback del componente padre
      onWarning(event);

      // ── Mostrar advertencia ──
      if (isElectron) {
        const remaining = maxWarnings - warningCount.current;
        const msg =
          remaining > 0
            ? `Has salido del examen. Te quedan ${remaining} advertencia(s) antes de que el examen se cierre automáticamente.`
            : "Has superado el límite de advertencias. El examen será cerrado.";

        // Esta llamada bloquea la ejecución hasta que el usuario cierra el diálogo
        const response = await window.electronAPI.showWarning(msg);

        // Una vez cerrado el diálogo, liberamos el bloqueo con un pequeño retraso
        // para que la ventana recupere el foco sin disparar un nuevo blur/focus
        setTimeout(() => {
          isProcessing.current = false;
        }, 500);

        if (response === 1 || warningCount.current >= maxWarnings) {
          handleForceClose();
        }
      } else {
        // Fallback para modo web
        isProcessing.current = false;
        if (warningCount.current >= maxWarnings) {
          handleForceClose();
        }
      }
    },
    [active, isElectron, maxWarnings, onWarning]
  );

  // ── Forzar cierre del examen ───────────────────────
  const handleForceClose = useCallback(() => {
    onForceClose({ reason: "max_warnings_exceeded", count: warningCount.current });
    if (isElectron) {
      window.electronAPI.forceQuit();
    }
  }, [isElectron, onForceClose]);

  // ── Efecto: activar/desactivar Electron kiosk ─────
  useEffect(() => {
    if (!isElectron) return;
    if (active) {
      window.electronAPI.examStart();
    } else {
      window.electronAPI.examEnd();
    }
  }, [active, isElectron]);

  // ── Efecto: detectar blur de ventana ──────────────
  useEffect(() => {
    if (!active) return;

    const handleBlur = () => {
      registerEvent("window_blur", "El alumno cambió de ventana o aplicación");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        registerEvent("tab_hidden", "La pestaña quedó oculta o minimizada");
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active, registerEvent]);

  // ── Efecto: bloquear atajos de teclado peligrosos ─
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
      // Alt+F4, Alt+Tab, Meta (tecla Windows), F11 (fullscreen toggle)
      const dangerous =
        (e.altKey && e.key === "F4") ||
        (e.altKey && e.key === "Tab") ||
        e.key === "Meta" ||
        (e.ctrlKey && e.key === "w") || // cerrar pestaña
        (e.ctrlKey && e.key === "n") || // nueva ventana
        (e.ctrlKey && e.key === "t") || // nueva pestaña
        (e.ctrlKey && e.key === "r") || // recargar
        e.key === "F5" ||               // recargar
        e.key === "Escape";             // salir de fullscreen

      if (dangerous) {
        e.preventDefault();
        e.stopPropagation();
        registerEvent("blocked_shortcut", `Tecla bloqueada: ${e.key}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [active, registerEvent]);

  // ── Efecto: evitar clic derecho ───────────────────
  useEffect(() => {
    if (!active) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      registerEvent("right_click", "Intento de abrir menú contextual");
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [active, registerEvent]);

  return {
    warningCount: warningCount.current,
    isElectron,
  };
}
