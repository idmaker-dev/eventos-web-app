import { useEffect, useCallback } from "react";
import { useSignalR } from "../contexts/SignalRContext";

/**
 * Hook personalizado para manejar notificaciones de mesas seleccionadas via SignalR
 * Diseñado para invitados en espera que quieren ver actualizaciones en vivo
 *
 * @param {Function} onMesaSeleccionada - Callback que se ejecuta cuando se recibe una notificación de mesa seleccionada
 * @returns {Object} - Estado de la conexión
 */
export const useSignalRInvitado = (onMesaSeleccionada) => {
  const { conectado, registrarCallbackMonitor, desregistrarCallbackMonitor } =
    useSignalR();

  // Callback memoizado para manejar actualizaciones de mesas
  const handleMesaSeleccionada = useCallback(
    (data) => {
      console.log("🔔 [useSignalRInvitado] Mesa seleccionada recibida:", data);

      if (onMesaSeleccionada && typeof onMesaSeleccionada === "function") {
        console.log(
          "🔔 [useSignalRInvitado] Ejecutando callback del componente..."
        );
        onMesaSeleccionada(data);
      }
    },
    [onMesaSeleccionada]
  );

  // Registrar el callback cuando el componente se monta o cambia
  useEffect(() => {
    console.log(
      "✅ [useSignalRInvitado] Registrando callback de mesa seleccionada (conectado:",
      conectado,
      ")"
    );
    registrarCallbackMonitor(handleMesaSeleccionada);

    // Limpiar al desmontar o cuando cambie el callback
    return () => {
      console.log(
        "🧹 [useSignalRInvitado] Limpiando callback de mesa seleccionada"
      );
      desregistrarCallbackMonitor();
    };
  }, [
    handleMesaSeleccionada,
    registrarCallbackMonitor,
    desregistrarCallbackMonitor,
    conectado,
  ]);

  return {
    conectado,
  };
};

export default useSignalRInvitado;
