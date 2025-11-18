import httpService from "./httpService";

/**
 * Servicio de eventos
 * Maneja todas las operaciones relacionadas con la gestión de eventos
 */
class EventService {
  /**
   * Obtener todos los eventos del usuario
   */
  async getEvents() {
    try {
      const response = await httpService.get("/eventos");

      return {
        success: true,
        events: response.data || response,
        total: response.total || response.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        events: [],
      };
    }
  }

  /**
   * Obtener un evento específico
   */
  async getEvent(eventId) {
    try {
      const response = await httpService.get(`/eventos/${eventId}`);

      return {
        success: true,
        event: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener un evento específico para el cuestionario
   */
  async getEventCuestionario(eventId) {
    try {
      const response = await httpService.get(
        `/eventos/cuestionario/${eventId}`
      );

      return {
        success: true,
        event: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Crear nuevo evento
   */
  async createEvent(eventData) {
    try {
      const response = await httpService.post("/eventos/crear", eventData);

      return {
        success: true,
        event: response,
        message: "Evento creado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Actualizar evento
   */
  async updateEvent(eventId, eventData) {
    try {
      const response = await httpService.put(`/eventos/${eventId}`, eventData);

      return {
        success: true,
        event: response.data || response,
        message: "Evento actualizado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Eliminar evento
   */
  async deleteEvent(eventId) {
    try {
      await httpService.delete(`/eventos/${eventId}`);

      return {
        success: true,
        message: "Evento eliminado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener estadísticas del evento
   */
  async getEventStats(eventId) {
    try {
      const response = await httpService.get(`/eventos/${eventId}/stats`);

      return {
        success: true,
        stats: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        stats: {},
      };
    }
  }

  /**
   * Obtener estadísticas del dashboard del evento
   */
  async getDashboardStats(eventId) {
    try {
      const response = await httpService.get(
        `/dashboard/evento?evento_id=${eventId}`
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        data: null,
      };
    }
  }

  /**
   * Subir imagen del evento
   */
  async uploadEventImage(eventId, imageFile, onProgress = null) {
    try {
      const response = await httpService.upload(
        `/eventos/${eventId}/image`,
        imageFile,
        onProgress
      );

      return {
        success: true,
        imageUrl:
          response.imageUrl || (response.data && response.data.imageUrl),
        message: "Imagen subida exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener deudas del evento
   */
  async getEventDebts(eventId) {
    try {
      const response = await httpService.get(
        `/eventos/deudas?evento_id=${eventId}`
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        data: null,
      };
    }
  }

  /**
   * Obtener lugares disponibles para select
   */
  async getLugares() {
    try {
      const response = await httpService.get("/lugares/select/options");

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        data: [],
      };
    }
  }

  /**
   * Obtener estado de invitados y turnos por evento
   * Incluye estadísticas y lista de invitados agrupados por estado
   *
   * @param {string} eventId - ID del evento
   * @returns {Promise<Object>} - Estado completo de invitados con turnos
   */
  async getEstadoInvitados(eventId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventId}/seleccion-mesas/estado-invitados`
      );

      return {
        success: true,
        data: response.data || response,
        estadisticas: response.data?.estadisticas || {},
        invitados: response.data?.invitados || [],
        porEstado: response.data?.por_estado || {},
      };
    } catch (error) {
      console.error("Error al obtener estado de invitados:", error);
      return {
        success: false,
        error: error.userMessage || "Error al cargar estado de invitados",
        data: null,
        estadisticas: {},
        invitados: [],
        porEstado: {},
      };
    }
  }
}

// Crear instancia singleton
const eventService = new EventService();

export default eventService;
