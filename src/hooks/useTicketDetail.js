import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";
import ticketsService from "../services/ticketsService";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para obtener el detalle de un ticket específico
 * @param {string} ticketId - ID del ticket
 * @returns {Object} - Estado y funciones para manejar el detalle del ticket
 */
export const useTicketDetail = (ticketId) => {
  const [ticket, setTicket] = useState(null);
  const { execute, loading, error } = useApi({
    showSuccessNotification: false,
    showErrorNotification: true,
    errorContext: "detalle del ticket",
  });

  /**
   * Cargar detalle del ticket desde el servidor
   */
  const cargarTicket = useCallback(async () => {
    if (!ticketId) {
      if (EnvConfig.DEBUG_MODE) {
        console.warn("⚠️ [useTicketDetail] No se proporcionó ticketId");
      }
      return null;
    }

    if (EnvConfig.DEBUG_MODE) {
      console.log("🎫 [useTicketDetail] Cargando detalle del ticket:", ticketId);
    }

    const result = await execute(
      () => ticketsService.getTicketDetail(ticketId),
      {
        showSuccessMsg: false,
      }
    );

    if (result?.success) {
      setTicket(result.ticketDetail);

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ [useTicketDetail] Ticket cargado:", result.ticketDetail);
      }
    }

    return result;
  }, [ticketId, execute]);

  /**
   * Actualizar estado del ticket
   */
  const actualizarEstado = useCallback(
    async (nuevoEstado) => {
      if (!ticketId) return null;

      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 [useTicketDetail] Actualizando estado del ticket:", {
          ticketId,
          nuevoEstado,
        });
      }

      const result = await execute(
        () => ticketsService.updateTicket(ticketId, { estatus: nuevoEstado }),
        {
          successMsg: `Ticket ${nuevoEstado} exitosamente`,
          showSuccessMsg: true,
        }
      );

      if (result?.success) {
        // Actualizar el ticket local
        setTicket((prev) => ({
          ...prev,
          estatus: nuevoEstado,
        }));
      }

      return result;
    },
    [ticketId, execute]
  );

  /**
   * Registrar una acción en el historial del ticket
   */
  const registrarAccion = useCallback(
    async (tipoAccion, descripcion, metadata = {}) => {
      if (!ticketId) return null;

      if (EnvConfig.DEBUG_MODE) {
        console.log("📝 [useTicketDetail] Registrando acción:", {
          ticketId,
          tipoAccion,
          descripcion,
        });
      }

      const result = await execute(
        () =>
          ticketsService.registerAction(ticketId, {
            tipo_accion: tipoAccion,
            descripcion,
            metadata,
          }),
        {
          successMsg: "Acción registrada exitosamente",
          showSuccessMsg: true,
        }
      );

      if (result?.success) {
        // Recargar el ticket para obtener el historial actualizado
        await cargarTicket();
      }

      return result;
    },
    [ticketId, execute, cargarTicket]
  );

  /**
   * Cerrar el ticket
   */
  const cerrarTicket = useCallback(async () => {
    return await actualizarEstado("cerrado");
  }, [actualizarEstado]);

  /**
   * Marcar como pendiente
   */
  const marcarPendiente = useCallback(async () => {
    return await actualizarEstado("pendiente");
  }, [actualizarEstado]);

  /**
   * Reabrir ticket cerrado
   */
  const reabrirTicket = useCallback(async () => {
    return await actualizarEstado("abierto");
  }, [actualizarEstado]);

  // Cargar ticket al montar o cuando cambie el ticketId
  useEffect(() => {
    if (ticketId) {
      cargarTicket();
    }
  }, [ticketId, cargarTicket]);

  return {
    // Estado
    ticket,
    ticketDetail: ticket, // Alias para compatibilidad
    loading,
    error,

    // Funciones
    cargarTicket,
    actualizarEstado,
    registrarAccion,
    cerrarTicket,
    marcarPendiente,
    reabrirTicket,
    refetch: cargarTicket, // Alias para compatibilidad
  };
};

export default useTicketDetail;
