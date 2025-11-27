import httpService from "./httpService";

/**
 * Servicio de Tickets/Solicitudes de Clientes
 * Maneja todas las operaciones relacionadas con la gestión de tickets del módulo de clientes
 */
class TicketsService {
  /**
   * Obtener todos los tickets con filtros opcionales
   * @param {Object} filters - Filtros opcionales (estatus, telefono, limite)
   * @returns {Promise<Object>} - Lista de tickets
   */
  async getAllTickets(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Agregar filtros como parámetros de consulta
      if (filters.estatus) {
        params.append("estatus", filters.estatus);
      }
      if (filters.telefono) {
        params.append("telefono", filters.telefono);
      }
      if (filters.limite) {
        params.append("limite", filters.limite);
      }

      const queryString = params.toString();
      const url = queryString ? `/tickets?${queryString}` : `/tickets`;

      const response = await httpService.get(url);

      // La respuesta del API es: { success, data: { tickets, estadisticas }, message }
      const apiData = response.data?.data || response.data || {};
      const tickets = Array.isArray(apiData.tickets) ? apiData.tickets : [];
      
      return {
        success: true,
        tickets: tickets,
        total: apiData.total || tickets.length,
        estadisticas: apiData.estadisticas || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al obtener tickets",
        tickets: [],
        total: 0,
      };
    }
  }

  /**
   * Obtener detalle de un ticket específico
   * @param {string} ticketId - ID del ticket
   * @returns {Promise<Object>} - Detalle del ticket
   */
  async getTicketDetail(ticketId) {
    try {
      const response = await httpService.get(`/tickets/${ticketId}`);

      // La respuesta del API es: { success, data: { ticket, invitado, historial_acciones, conversacion, ... }, message }
      const apiData = response.data?.data || response.data || {};

      return {
        success: true,
        ticketDetail: apiData,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al obtener detalle del ticket",
        ticketDetail: null,
      };
    }
  }

  /**
   * Obtener información completa del cliente por teléfono
   * Este es el endpoint PRINCIPAL que consolida toda la información
   * @param {string} telefono - Número de teléfono del cliente
   * @returns {Promise<Object>} - Información completa del cliente
   */
  async getClientInfo(telefono) {
    try {
      const response = await httpService.get(
        `/tickets/cliente?telefono=${telefono}`
      );

      // La respuesta del API es: { success, data: { telefono, invitado_id, datos_personales, tickets, ... }, message }
      const apiData = response.data?.data || response.data || {};

      return {
        success: true,
        clientInfo: apiData,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.userMessage || "Error al obtener información del cliente",
        clientInfo: null,
      };
    }
  }

  /**
   * Actualizar un ticket (estado, promotor, etc.)
   * @param {string} ticketId - ID del ticket
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Ticket actualizado
   */
  async updateTicket(ticketId, updateData) {
    try {
      const response = await httpService.put(
        `/tickets/${ticketId}`,
        updateData
      );

      return {
        success: true,
        ticket: response.data || response,
        message: "Ticket actualizado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al actualizar el ticket",
        ticket: null,
      };
    }
  }

  /**
   * Obtener mensajes del chat de un ticket
   * @param {string} ticketId - ID del ticket
   * @param {number} limite - Límite de mensajes a obtener (opcional)
   * @returns {Promise<Object>} - Mensajes y estadísticas de la conversación
   */
  async getMessages(ticketId, limite = null) {
    try {
      const url = limite
        ? `/tickets/${ticketId}/mensajes?limite=${limite}`
        : `/tickets/${ticketId}/mensajes`;

      const response = await httpService.get(url);

      return {
        success: true,
        mensajes: response.mensajes || response.data?.mensajes || [],
        conversacion: response.conversacion || response.data?.conversacion || null,
        estadisticas: response.estadisticas || response.data?.estadisticas || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al obtener mensajes",
        mensajes: [],
        conversacion: null,
        estadisticas: null,
      };
    }
  }

  /**
   * Enviar un mensaje desde el admin al cliente
   * @param {string} ticketId - ID del ticket
   * @param {Object} messageData - Datos del mensaje
   * @returns {Promise<Object>} - Mensaje enviado
   */
  async sendMessage(ticketId, messageData) {
    try {
      const response = await httpService.post(
        `/tickets/${ticketId}/mensajes`,
        messageData
      );

      return {
        success: true,
        mensaje: response.mensaje || response.data?.mensaje || response,
        message: "Mensaje enviado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al enviar el mensaje",
        mensaje: null,
      };
    }
  }

  /**
   * Registrar una acción manual en el historial del ticket
   * @param {string} ticketId - ID del ticket
   * @param {Object} actionData - Datos de la acción
   * @returns {Promise<Object>} - Acción registrada
   */
  async registerAction(ticketId, actionData) {
    try {
      const response = await httpService.post(
        `/tickets/${ticketId}/acciones`,
        actionData
      );

      return {
        success: true,
        accion: response.accion || response.data?.accion || response,
        message: "Acción registrada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al registrar la acción",
        accion: null,
      };
    }
  }

  /**
   * Cerrar un ticket
   * @param {string} ticketId - ID del ticket
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async closeTicket(ticketId) {
    return this.updateTicket(ticketId, { estatus: "cerrado" });
  }

  /**
   * Marcar ticket como pendiente
   * @param {string} ticketId - ID del ticket
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async markAsPending(ticketId) {
    return this.updateTicket(ticketId, { estatus: "pendiente" });
  }

  /**
   * Asignar promotor a un ticket
   * @param {string} ticketId - ID del ticket
   * @param {string} promotorId - ID del promotor
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async assignPromotor(ticketId, promotorId) {
    return this.updateTicket(ticketId, { promotor_asignado: promotorId });
  }

  /**
   * Enviar mensaje desde el sistema al cliente vía bot de WhatsApp
   * @param {Object} messageData - Datos del mensaje
   * @param {string} messageData.ticket - Número del ticket
   * @param {string} messageData.telefono - Teléfono del cliente
   * @param {string} messageData.mensaje - Contenido del mensaje
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendMessage(messageData) {
    try {
      const { ticket, telefono, mensaje } = messageData;

      if (!ticket || !telefono || !mensaje) {
        return {
          success: false,
          error: "Datos incompletos para enviar el mensaje",
        };
      }

      const response = await httpService.post(
        "https://planoria-bot.azurewebsites.net/api/v1/crm/enviarMensaje",
        {
          ticket,
          telefono,
          mensaje,
        },
        {
          // Usar configuración absoluta para este endpoint externo
          baseURL: "",
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Mensaje enviado exitosamente",
      };
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      return {
        success: false,
        error: error.userMessage || error.message || "Error al enviar el mensaje",
      };
    }
  }
}

// Exportar instancia única del servicio
export default new TicketsService();
