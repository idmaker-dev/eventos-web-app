import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";
import ticketsService from "../services/ticketsService";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para gestionar la lista de tickets
 * @param {Object} filtrosIniciales - Filtros iniciales (estatus, telefono, limite)
 * @returns {Object} - Estado y funciones para manejar tickets
 */
export const useTickets = (filtrosIniciales = {}) => {
  const [tickets, setTickets] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const { execute, loading, error } = useApi({
    showSuccessNotification: false,
    showErrorNotification: true,
    errorContext: "tickets",
  });

  /**
   * Cargar tickets desde el servidor
   */
  const cargarTickets = useCallback(async (options = {}) => {
    if (EnvConfig.DEBUG_MODE) {
      console.log("🎫 [useTickets] Cargando tickets con filtros:", filtros);
    }

    const result = await execute(
      () => ticketsService.getAllTickets(filtros),
      {
        showSuccessMsg: false,
        showLoading: options.silent ? false : true,
      }
    );

    if (result?.success) {
      setTickets(result.tickets);
      setEstadisticas(result.estadisticas);

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ [useTickets] Tickets cargados:", {
          total: result.total,
          tickets: result.tickets.length,
        });
      }
    }

    return result;
  }, [filtros, execute]);

  /**
   * Actualizar filtros y recargar tickets
   */
  const actualizarFiltros = useCallback((nuevosFiltros) => {
    if (EnvConfig.DEBUG_MODE) {
      console.log("🔄 [useTickets] Actualizando filtros:", nuevosFiltros);
    }
    setFiltros((prev) => ({
      ...prev,
      ...nuevosFiltros,
    }));
  }, []);

  /**
   * Limpiar todos los filtros
   */
  const limpiarFiltros = useCallback(() => {
    if (EnvConfig.DEBUG_MODE) {
      console.log("🧹 [useTickets] Limpiando filtros");
    }
    setFiltros({});
  }, []);

  /**
   * Cerrar un ticket
   */
  const cerrarTicket = useCallback(
    async (ticketId) => {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔒 [useTickets] Cerrando ticket:", ticketId);
      }

      const result = await execute(
        () => ticketsService.closeTicket(ticketId),
        {
          successMsg: "Ticket cerrado exitosamente",
          showSuccessMsg: true,
        }
      );

      if (result?.success) {
        // Actualizar el ticket en la lista local
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, estatus: "cerrado" }
              : ticket
          )
        );
      }

      return result;
    },
    [execute]
  );

  /**
   * Marcar ticket como pendiente
   */
  const marcarPendiente = useCallback(
    async (ticketId) => {
      if (EnvConfig.DEBUG_MODE) {
        console.log("⏳ [useTickets] Marcando ticket como pendiente:", ticketId);
      }

      const result = await execute(
        () => ticketsService.markAsPending(ticketId),
        {
          successMsg: "Ticket marcado como pendiente",
          showSuccessMsg: true,
        }
      );

      if (result?.success) {
        // Actualizar el ticket en la lista local
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, estatus: "pendiente" }
              : ticket
          )
        );
      }

      return result;
    },
    [execute]
  );

  /**
   * Asignar promotor a un ticket
   */
  const asignarPromotor = useCallback(
    async (ticketId, promotorId) => {
      if (EnvConfig.DEBUG_MODE) {
        console.log("👤 [useTickets] Asignando promotor al ticket:", {
          ticketId,
          promotorId,
        });
      }

      const result = await execute(
        () => ticketsService.assignPromotor(ticketId, promotorId),
        {
          successMsg: "Promotor asignado exitosamente",
          showSuccessMsg: true,
        }
      );

      if (result?.success) {
        // Actualizar el ticket en la lista local
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, promotor_asignado: promotorId }
              : ticket
          )
        );
      }

      return result;
    },
    [execute]
  );

  /**
   * Buscar tickets por término
   */
  const buscarTickets = useCallback(
    (termino) => {
      if (!termino.trim()) {
        return tickets;
      }

      const terminoLower = termino.toLowerCase();
      return tickets.filter(
        (ticket) =>
          ticket.nombre?.toLowerCase().includes(terminoLower) ||
          ticket.ticket?.toLowerCase().includes(terminoLower) ||
          ticket.telefono?.includes(terminoLower)
      );
    },
    [tickets]
  );

  /**
   * Obtener estadísticas de tickets por estado
   */
  const obtenerEstadisticasLocales = useCallback(() => {
    const activos = tickets.filter((t) => {
      const estado = t.estado || t.estatus;
      return estado !== 'cerrado' && estado !== 'closed';
    }).length;
    const cerrados = tickets.filter((t) => {
      const estado = t.estado || t.estatus;
      return estado === 'cerrado' || estado === 'closed';
    }).length;

    return {
      total: tickets.length,
      activos,
      cerrados,
    };
  }, [tickets]);

  // Cargar tickets al montar y cuando cambien los filtros
  useEffect(() => {
    cargarTickets();
  }, [cargarTickets]);

  return {
    // Estado
    tickets,
    estadisticas: estadisticas || obtenerEstadisticasLocales(),
    loading,
    error,
    filtros,

    // Funciones
    cargarTickets,
    actualizarFiltros,
    limpiarFiltros,
    cerrarTicket,
    marcarPendiente,
    asignarPromotor,
    buscarTickets,
    refetch: cargarTickets, // Alias para compatibilidad
  };
};

export default useTickets;
