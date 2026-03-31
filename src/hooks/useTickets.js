import { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "./useApi";
import ticketsService from "../services/ticketsService";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para gestionar la lista de tickets
 * @param {Object} filtrosIniciales - Filtros iniciales (estatus, telefono, limite, eventoId)
 * @returns {Object} - Estado y funciones para manejar tickets
 */
export const useTickets = (filtrosIniciales = {}) => {
  const [tickets, setTickets] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [filtros, setFiltros] = useState(filtrosIniciales);
  
  const filtrosRef = useRef(filtros);
  
  useEffect(() => {
    filtrosRef.current = filtros;
  }, [filtros]);

  useEffect(() => {
    if (filtrosIniciales && Object.keys(filtrosIniciales).length > 0) {
      setFiltros(prev => {
        const hasChanged = Object.keys(filtrosIniciales).some(key => filtrosIniciales[key] !== prev[key]);
        if (hasChanged) {
          // Si el evento cambió, limpiamos los tickets inmediatamente para evitar mostrar datos "sucios"
          if (String(prev.eventoId) !== String(filtrosIniciales.eventoId)) {
            if (EnvConfig.DEBUG_MODE) console.log("🧹 [useTickets] Limpiando tickets por cambio de evento");
            setTickets([]);
            setEstadisticas(null);
          }
          return { ...prev, ...filtrosIniciales };
        }
        return prev;
      });
    }
  }, [JSON.stringify(filtrosIniciales)]);

  const { execute, loading, error } = useApi({
    showSuccessNotification: false,
    showErrorNotification: true,
    errorContext: "tickets",
  });

  const cargarTickets = useCallback(async (options = {}) => {
    if (EnvConfig.DEBUG_MODE) {
      console.log("🎫 [useTickets] Cargando tickets con filtros (ref):", filtrosRef.current);
    }

    const result = await execute(
      () => ticketsService.getAllTickets(filtrosRef.current),
      {
        showSuccessMsg: false,
        showLoading: options.silent ? false : true,
      }
    );

    if (result?.success) {
      setTickets(result.tickets);
      setEstadisticas(result.estadisticas);

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ [useTickets] Tickets cargados:", result.tickets.length);
      }
    } else {
      // Si falló y no es una carga silenciosa, limpiamos para no mostrar data obsoleta
      if (!options.silent) {
        setTickets([]);
        setEstadisticas(null);
      }
    }

    return result;
  }, [execute]);

  const actualizarFiltros = useCallback((nuevosFiltros) => {
    setFiltros((prev) => ({
      ...prev,
      ...nuevosFiltros,
    }));
  }, []);

  /**
   * Obtener valor de 'leido' actual de un ticket o true si no existe
   */
  const obtenerLeidoSeguro = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return true;
    return ticket.leido ?? true; // Si no existe, por defecto es true al interactuar
  };

  /**
   * Marcar ticket como leído de forma robusta
   */
  const marcarComoLeido = useCallback(
    async (ticketId) => {
      // Buscar el ticket actual en el estado local
      const ticketActual = tickets.find((t) => t.id === ticketId);

      // Si el ticket ya está leído y NO tiene mensajes pendientes, no hacemos nada
      if (
        ticketActual &&
        ticketActual.leido === true &&
        (!ticketActual.msg_no_leidos || ticketActual.msg_no_leidos === 0)
      ) {
        if (EnvConfig.DEBUG_MODE) {
          console.log(
            "⏭️ [useTickets] Ticket ya está leído y sin mensajes pendientes, saltando actualización:",
            ticketId
          );
        }
        return { success: true, message: "Ticket ya leído" };
      }

      if (EnvConfig.DEBUG_MODE) {
        console.log("📖 [useTickets] Marcando ticket como leído:", ticketId);
      }

      // Sincronización con el servidor
      const result = await execute(
        () =>
          ticketsService.updateTicket(ticketId, {
            leido: true,
          }),
        { showSuccessMsg: false, showLoading: false }
      );

      // Actualización local solo si fue exitoso
      if (result?.success) {
        setTickets((prev) =>
          prev.map((t) => {
            if (t.id === ticketId) {
              return {
                ...t,
                leido: true,
                msg_no_leidos: 0,
              };
            }
            return t;
          })
        );
      }

      return result;
    },
    [execute, tickets]
  );

  /**
   * Cerrar ticket, manteniendo o forzando el estado de lectura
   */
  const cerrarTicket = useCallback(
    async (ticketId) => {
      // Al cerrar un ticket, usualmente se considera leído o se preserva el estado
      const leidoActual = obtenerLeidoSeguro(ticketId);

      const result = await execute(
        () => ticketsService.updateTicket(ticketId, { 
          estatus: "cerrado",
          leido: leidoActual
        }),
        {
          successMsg: "Ticket cerrado exitosamente",
          showSuccessMsg: true,
        }
      );

      if (result?.success) {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, estatus: "cerrado", leido: leidoActual }
              : ticket
          )
        );
      }

      return result;
    },
    [execute, tickets]
  );

  /**
   * Marcar pendiente, manteniendo o forzando el estado de lectura
   */
  const marcarPendiente = useCallback(
    async (ticketId) => {
      const leidoActual = obtenerLeidoSeguro(ticketId);

      const result = await execute(
        () => ticketsService.updateTicket(ticketId, { 
          estatus: "pendiente",
          leido: leidoActual
        }),
        {
          successMsg: "Ticket marcado como pendiente",
          showSuccessMsg: true,
        }
      );

      if (result?.success) {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, estatus: "pendiente", leido: leidoActual }
              : ticket
          )
        );
      }

      return result;
    },
    [execute, tickets]
  );

  const obtenerEstadisticasLocales = useCallback(() => {
    const activos = tickets.filter(t => (t.estado || t.estatus) !== 'cerrado').length;
    const cerrados = tickets.filter(t => (t.estado || t.estatus) === 'cerrado').length;
    const pendientes = tickets.filter(t => ['pendiente', 'en espera'].includes((t.estado || t.estatus || "").toLowerCase())).length;

    return {
      total: tickets.length,
      activos,
      pendientes,
      cerrados,
    };
  }, [tickets]);

  useEffect(() => {
    cargarTickets();
  }, [cargarTickets, filtros]);

  return {
    tickets,
    estadisticas: estadisticas || obtenerEstadisticasLocales(),
    loading,
    error,
    filtros,
    cargarTickets,
    actualizarFiltros,
    marcarComoLeido,
    cerrarTicket,
    marcarPendiente,
    refetch: cargarTickets,
  };
};

export default useTickets;
