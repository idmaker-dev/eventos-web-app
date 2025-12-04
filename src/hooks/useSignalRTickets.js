import { useEffect, useCallback } from "react";
import { useSignalR } from "../contexts/SignalRContext";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para manejar notificaciones de tickets y chat via SignalR
 * @param {Object} callbacks - Callbacks para diferentes eventos
 * @returns {Object} - Estado de la conexión
 */
export const useSignalRTickets = (callbacks = {}) => {
  const {
    conectado,
    registrarCallbackNuevoTicket,
    desregistrarCallbackNuevoTicket,
    registrarCallbackTicketActualizado,
    desregistrarCallbackTicketActualizado,
    registrarCallbackNuevoMensaje,
    desregistrarCallbackNuevoMensaje,
  } = useSignalR();

  const {
    onNuevoTicket,
    onTicketActualizado,
    onNuevoMensaje,
  } = callbacks;

  // Callback para nuevo ticket
  const handleNuevoTicket = useCallback(
    (data) => {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔔 [useSignalRTickets] Nuevo ticket recibido:", data);
      }

      if (onNuevoTicket && typeof onNuevoTicket === "function") {
        onNuevoTicket(data);
      }
    },
    [onNuevoTicket]
  );

  // Callback para ticket actualizado
  const handleTicketActualizado = useCallback(
    (data) => {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔔 [useSignalRTickets] Ticket actualizado recibido:", data);
      }

      if (onTicketActualizado && typeof onTicketActualizado === "function") {
        onTicketActualizado(data);
      }
    },
    [onTicketActualizado]
  );

  // Callback para nuevo mensaje
  const handleNuevoMensaje = useCallback(
    (data) => {
      console.log("🔔 [useSignalRTickets] Nuevo mensaje recibido:", data);
      console.log("🔔 [useSignalRTickets] onNuevoMensaje existe?", !!onNuevoMensaje);
      console.log("🔔 [useSignalRTickets] onNuevoMensaje es función?", typeof onNuevoMensaje === "function");

      if (onNuevoMensaje && typeof onNuevoMensaje === "function") {
        console.log("🔔 [useSignalRTickets] Ejecutando callback onNuevoMensaje...");
        onNuevoMensaje(data);
        console.log("✅ [useSignalRTickets] Callback onNuevoMensaje ejecutado");
      } else {
        console.warn("⚠️ [useSignalRTickets] No se puede ejecutar onNuevoMensaje - no es una función válida");
      }
    },
    [onNuevoMensaje]
  );

  // Registrar callbacks cuando el componente se monta
  useEffect(() => {
    console.log(
      "✅ [useSignalRTickets] Registrando callbacks de tickets (conectado:",
      conectado,
      ")"
    );
    console.log("✅ [useSignalRTickets] Callbacks disponibles:", {
      onNuevoTicket: !!onNuevoTicket,
      onTicketActualizado: !!onTicketActualizado,
      onNuevoMensaje: !!onNuevoMensaje,
    });

    // Registrar callback de nuevo ticket si existe
    if (onNuevoTicket) {
      console.log("✅ [useSignalRTickets] Registrando callback de nuevo ticket");
      registrarCallbackNuevoTicket(handleNuevoTicket);
    }

    // Registrar callback de ticket actualizado si existe
    if (onTicketActualizado) {
      console.log("✅ [useSignalRTickets] Registrando callback de ticket actualizado");
      registrarCallbackTicketActualizado(handleTicketActualizado);
    }

    // Registrar callback de nuevo mensaje si existe
    if (onNuevoMensaje) {
      console.log("✅ [useSignalRTickets] Registrando callback de nuevo mensaje");
      registrarCallbackNuevoMensaje(handleNuevoMensaje);
    }

    // Limpiar al desmontar
    return () => {
      console.log("🧹 [useSignalRTickets] Limpiando callbacks de tickets");

      if (onNuevoTicket) {
        desregistrarCallbackNuevoTicket();
      }

      if (onTicketActualizado) {
        desregistrarCallbackTicketActualizado();
      }

      if (onNuevoMensaje) {
        desregistrarCallbackNuevoMensaje();
      }
    };
  }, [
    handleNuevoTicket,
    handleTicketActualizado,
    handleNuevoMensaje,
    registrarCallbackNuevoTicket,
    desregistrarCallbackNuevoTicket,
    registrarCallbackTicketActualizado,
    desregistrarCallbackTicketActualizado,
    registrarCallbackNuevoMensaje,
    desregistrarCallbackNuevoMensaje,
    conectado,
  ]);

  return {
    conectado,
  };
};

export default useSignalRTickets;
