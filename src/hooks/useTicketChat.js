import { useState, useEffect, useCallback, useRef } from "react";
import { useApi } from "./useApi";
import ticketsService from "../services/ticketsService";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para gestionar el chat de un ticket
 * Incluye polling automático y soporte para SignalR (preparado)
 * @param {string} ticketId - ID del ticket
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Estado y funciones para manejar el chat
 */
export const useTicketChat = (ticketId, options = {}) => {
  const {
    enablePolling = true,
    pollingInterval = 5000, // 5 segundos por defecto
    limite = null,
    autoMarkAsRead = true,
  } = options;

  const [mensajes, setMensajes] = useState([]);
  const [conversacion, setConversacion] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const pollingIntervalRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  const { execute, loading, error } = useApi({
    showSuccessNotification: false,
    showErrorNotification: true,
    errorContext: "chat del ticket",
  });

  /**
   * Cargar mensajes del chat desde el servidor
   */
  const cargarMensajes = useCallback(async () => {
    if (!ticketId) {
      if (EnvConfig.DEBUG_MODE) {
        console.warn("⚠️ [useTicketChat] No se proporcionó ticketId");
      }
      return null;
    }

    if (EnvConfig.DEBUG_MODE) {
      console.log("💬 [useTicketChat] Cargando mensajes del ticket:", ticketId);
    }

    const result = await execute(
      () => ticketsService.getMessages(ticketId, limite),
      {
        showSuccessMsg: false,
      }
    );

    if (result?.success) {
      const nuevosMensajes = result.mensajes || [];
      setMensajes(nuevosMensajes);
      setConversacion(result.conversacion);
      setEstadisticas(result.estadisticas);

      // Actualizar última ID de mensaje para detectar nuevos mensajes
      if (nuevosMensajes.length > 0) {
        const ultimoMensaje = nuevosMensajes[nuevosMensajes.length - 1];
        lastMessageIdRef.current = ultimoMensaje.id;
      }

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ [useTicketChat] Mensajes cargados:", {
          total: nuevosMensajes.length,
          ultimoId: lastMessageIdRef.current,
        });
      }
    }

    return result;
  }, [ticketId, limite, execute]);

  /**
   * Enviar un mensaje al chat
   */
  const enviarMensaje = useCallback(
    async (texto) => {
      if (!ticketId) {
        if (EnvConfig.DEBUG_MODE) {
          console.warn("⚠️ [useTicketChat] No se proporcionó ticketId");
        }
        return null;
      }

      if (!texto || !texto.trim()) {
        if (EnvConfig.DEBUG_MODE) {
          console.warn("⚠️ [useTicketChat] Mensaje vacío");
        }
        return {
          success: false,
          error: "El mensaje no puede estar vacío",
        };
      }

      setEnviando(true);

      if (EnvConfig.DEBUG_MODE) {
        console.log("📤 [useTicketChat] Enviando mensaje:", {
          ticketId,
          texto: texto.substring(0, 50) + "...",
        });
      }

      const result = await execute(
        () =>
          ticketsService.sendMessage(ticketId, {
            texto: texto.trim(),
          }),
        {
          successMsg: "Mensaje enviado",
          showSuccessMsg: false, // No mostrar notificación (feedback inmediato en UI)
        }
      );

      setEnviando(false);

      if (result?.success) {
        // Agregar mensaje optimista a la lista (antes de recargar)
        const mensajeOptimista = {
          id: `temp-${Date.now()}`,
          texto: texto.trim(),
          es_admin: true,
          fecha: new Date().toISOString(),
          leido: false,
        };

        setMensajes((prev) => [...prev, mensajeOptimista]);

        // Recargar mensajes para obtener la versión del servidor
        setTimeout(() => {
          cargarMensajes();
        }, 500);

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ [useTicketChat] Mensaje enviado exitosamente");
        }
      }

      return result;
    },
    [ticketId, autoMarkAsRead, execute, cargarMensajes]
  );

  /**
   * Marcar todos los mensajes como leídos
   */
  const marcarMensajesComoLeidos = useCallback(async () => {
    if (!ticketId) return null;

    // Enviar un mensaje especial para marcar como leídos
    // (esto podría ser un endpoint separado en el futuro)
    if (EnvConfig.DEBUG_MODE) {
      console.log("👁️ [useTicketChat] Marcando mensajes como leídos:", ticketId);
    }

    // Por ahora, solo recargar mensajes
    return await cargarMensajes();
  }, [ticketId, cargarMensajes]);

  /**
   * Obtener mensajes no leídos del cliente
   */
  const getMensajesNoLeidos = useCallback(() => {
    return mensajes.filter((msg) => !msg.es_admin && !msg.leido);
  }, [mensajes]);

  /**
   * Contar mensajes no leídos
   */
  const contarMensajesNoLeidos = useCallback(() => {
    return getMensajesNoLeidos().length;
  }, [getMensajesNoLeidos]);

  /**
   * Verificar si hay nuevos mensajes desde la última carga
   */
  const hayNuevosMensajes = useCallback(() => {
    if (mensajes.length === 0) return false;
    const ultimoMensaje = mensajes[mensajes.length - 1];
    return ultimoMensaje.id !== lastMessageIdRef.current;
  }, [mensajes]);

  /**
   * Iniciar polling automático
   */
  const iniciarPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      if (EnvConfig.DEBUG_MODE) {
        console.log("⚠️ [useTicketChat] Polling ya está activo");
      }
      return;
    }

    if (EnvConfig.DEBUG_MODE) {
      console.log(
        `🔄 [useTicketChat] Iniciando polling cada ${pollingInterval}ms`
      );
    }

    pollingIntervalRef.current = setInterval(() => {
      cargarMensajes();
    }, pollingInterval);
  }, [pollingInterval, cargarMensajes]);

  /**
   * Detener polling automático
   */
  const detenerPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🛑 [useTicketChat] Deteniendo polling");
      }
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  /**
   * Callback para recibir mensajes de SignalR
   * Este será utilizado por el hook useSignalRTickets
   */
  const handleSignalRMessage = useCallback(
    (data) => {
      if (EnvConfig.DEBUG_MODE) {
        console.log("📨 [useTicketChat] Mensaje recibido vía SignalR:", data);
      }

      // Verificar que el mensaje es para este ticket
      if (data.ticketId === ticketId) {
        // Agregar el nuevo mensaje a la lista
        setMensajes((prev) => {
          // Evitar duplicados
          const existe = prev.some((msg) => msg.id === data.mensaje.id);
          if (existe) return prev;

          return [...prev, data.mensaje];
        });

        // Actualizar estadísticas si vienen en el evento
        if (data.estadisticas) {
          setEstadisticas(data.estadisticas);
        }

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ [useTicketChat] Mensaje agregado vía SignalR");
        }
      }
    },
    [ticketId]
  );

  // Cargar mensajes al montar o cuando cambie el ticketId
  useEffect(() => {
    if (ticketId) {
      cargarMensajes();
    } else {
      setMensajes([]);
      setConversacion(null);
      setEstadisticas(null);
    }
  }, [ticketId, cargarMensajes]);

  // Iniciar/detener polling según configuración
  useEffect(() => {
    if (enablePolling && ticketId) {
      iniciarPolling();
    } else {
      detenerPolling();
    }

    // Limpiar al desmontar
    return () => {
      detenerPolling();
    };
  }, [enablePolling, ticketId, iniciarPolling, detenerPolling]);

  return {
    // Estado
    mensajes,
    conversacion,
    estadisticas,
    loading,
    error,
    enviando,

    // Funciones principales
    cargarMensajes,
    enviarMensaje,
    marcarMensajesComoLeidos,

    // Funciones de utilidad
    mensajesNoLeidos: getMensajesNoLeidos(),
    contarMensajesNoLeidos: contarMensajesNoLeidos(),
    hayNuevosMensajes: hayNuevosMensajes(),

    // Control de polling
    iniciarPolling,
    detenerPolling,
    pollingActivo: pollingIntervalRef.current !== null,

    // SignalR (preparado)
    handleSignalRMessage,

    // Alias
    refetch: cargarMensajes,
  };
};

export default useTicketChat;
