import { useEffect, useCallback } from "react";
import { useSignalR } from "../contexts/SignalRContext";

/**
 * Hook personalizado para manejar notificaciones de pagos via SignalR
 * @param {Function} onPagoCompletado - Callback que se ejecuta cuando se recibe un pago completado
 * @returns {Object} - Estado de la conexión
 */
export const useSignalRPagos = (onPagoCompletado) => {
  const {
    conectado,
    registrarCallbackPagoCompletado,
    desregistrarCallbackPagoCompletado,
  } = useSignalR();

  // Callback memoizado para manejar actualizaciones de pago
  const handlePagoCompletado = useCallback(
    (data) => {
      console.log("🔔 [useSignalRPagos] Pago completado recibido:", data);
      console.log(
        "🔔 [useSignalRPagos] onPagoCompletado existe?",
        !!onPagoCompletado
      );
      console.log(
        "🔔 [useSignalRPagos] onPagoCompletado es función?",
        typeof onPagoCompletado === "function"
      );

      if (onPagoCompletado && typeof onPagoCompletado === "function") {
        console.log(
          "🔔 [useSignalRPagos] Ejecutando callback del componente..."
        );
        onPagoCompletado(data);
        console.log("🔔 [useSignalRPagos] Callback ejecutado exitosamente");
      } else {
        console.warn(
          "⚠️ [useSignalRPagos] No se puede ejecutar callback - no es una función válida"
        );
      }
    },
    [onPagoCompletado]
  );

  // Registrar el callback cuando el componente se monta o cambia
  useEffect(() => {
    console.log(
      "✅ [useSignalRPagos] Registrando callback de pago completado (conectado:",
      conectado,
      ")"
    );
    registrarCallbackPagoCompletado(handlePagoCompletado);

    // Limpiar al desmontar o cuando cambie el callback
    return () => {
      console.log("🧹 [useSignalRPagos] Limpiando callback de pago completado");
      desregistrarCallbackPagoCompletado();
    };
  }, [
    handlePagoCompletado,
    registrarCallbackPagoCompletado,
    desregistrarCallbackPagoCompletado,
    conectado, // Incluir conectado para re-registrar cuando cambie
  ]);

  return {
    conectado,
  };
};

export default useSignalRPagos;
