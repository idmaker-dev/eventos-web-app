import { useEffect, useCallback } from "react";
import { useSignalR } from "../contexts/SignalRContext";

/**
 * Hook personalizado para manejar notificaciones de mesas seleccionadas via SignalR
 * Diseñado específicamente para el modo Monitor del módulo de Asignación
 *
 * @param {Function} onMesaSeleccionada - Callback que se ejecuta cuando se recibe una notificación de mesa seleccionada
 * @returns {Object} - Estado de la conexión
 */
export const useSignalRMonitor = (onMesaSeleccionada) => {
  const { conectado, registrarCallbackMonitor, desregistrarCallbackMonitor } =
    useSignalR();

  // Callback memoizado para manejar actualizaciones de mesas
  const handleMesaSeleccionada = useCallback(
    (data) => {
      console.log("🔔 [useSignalRMonitor] Mesa seleccionada recibida:", data);
      console.log(
        "🔔 [useSignalRMonitor] onMesaSeleccionada existe?",
        !!onMesaSeleccionada
      );
      console.log(
        "🔔 [useSignalRMonitor] onMesaSeleccionada es función?",
        typeof onMesaSeleccionada === "function"
      );

      if (onMesaSeleccionada && typeof onMesaSeleccionada === "function") {
        console.log(
          "🔔 [useSignalRMonitor] Ejecutando callback del componente..."
        );
        onMesaSeleccionada(data);
        console.log("🔔 [useSignalRMonitor] Callback ejecutado exitosamente");
      } else {
        console.warn(
          "⚠️ [useSignalRMonitor] No se puede ejecutar callback - no es una función válida"
        );
      }
    },
    [onMesaSeleccionada]
  );

  // Registrar el callback cuando el componente se monta o cambia
  useEffect(() => {
    console.log(
      "✅ [useSignalRMonitor] Registrando callback de mesa seleccionada (conectado:",
      conectado,
      ")"
    );
    registrarCallbackMonitor(handleMesaSeleccionada);

    // Limpiar al desmontar o cuando cambie el callback
    return () => {
      console.log(
        "🧹 [useSignalRMonitor] Limpiando callback de mesa seleccionada"
      );
      desregistrarCallbackMonitor();
    };
  }, [
    handleMesaSeleccionada,
    registrarCallbackMonitor,
    desregistrarCallbackMonitor,
    conectado, // Incluir conectado para re-registrar cuando cambie
  ]);

  return {
    conectado,
  };
};

export default useSignalRMonitor;
