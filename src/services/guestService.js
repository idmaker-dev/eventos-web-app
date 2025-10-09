import httpService from "./httpService";

/**
 * Servicio de invitados
 * Maneja todas las operaciones relacionadas con la gestión de invitados
 */
class GuestService {
  /**
   * Obtener todos los invitados de un evento
   */
  async getGuests(eventId, filters = {}) {
    try {
      const params = new URLSearchParams();

      // Agregar filtros como parámetros de consulta
      Object.keys(filters).forEach((key) => {
        if (
          filters[key] !== undefined &&
          filters[key] !== null &&
          filters[key] !== ""
        ) {
          params.append(key, filters[key]);
        }
      });

      const queryString = params.toString();
      const url = queryString
        ? `/eventos/${eventId}/guests?${queryString}`
        : `/eventos/${eventId}/guests`;

      const response = await httpService.get(url);

      return {
        success: true,
        guests: response.data || response,
        total: response.total || response.length,
        pagination: response.pagination,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        guests: [],
      };
    }
  }

  /**
   * Obtener un invitado específico
   */
  async getGuest(eventId, guestId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventId}/guests/${guestId}`
      );

      return {
        success: true,
        guest: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Crear nuevo invitado
   */
  async createGuest(eventId, guestData) {
    try {
      const response = await httpService.post(
        `/eventos/${eventId}/guests`,
        guestData
      );

      return {
        success: true,
        guest: response,
        message: "Invitado agregado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Actualizar invitado
   */
  async updateGuest(eventId, guestId, guestData) {
    try {
      const response = await httpService.put(
        `/eventos/${eventId}/guests/${guestId}`,
        guestData
      );

      return {
        success: true,
        guest: response,
        message: "Invitado actualizado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Eliminar invitado
   */
  async deleteGuest(eventId, guestId) {
    try {
      await httpService.delete(`/eventos/${eventId}/guests/${guestId}`);

      return {
        success: true,
        message: "Invitado eliminado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Eliminar múltiples invitados
   */
  async deleteMultipleGuests(eventId, guestIds) {
    try {
      const response = await httpService.post(
        `/eventos/${eventId}/guests/bulk-delete`,
        {
          guestIds,
        }
      );

      return {
        success: true,
        deletedCount: response.deletedCount,
        message: `${response.deletedCount} invitados eliminados exitosamente`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Actualizar estado de confirmación de un invitado
   */
  async updateGuestStatus(eventId, guestId, status) {
    try {
      const response = await httpService.patch(
        `/eventos/${eventId}/guests/${guestId}/status`,
        {
          status,
        }
      );

      return {
        success: true,
        guest: response,
        message: "Estado actualizado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Enviar invitación por email
   */
  async sendInvitation(eventId, guestId) {
    try {
      await httpService.post(
        `/eventos/${eventId}/guests/${guestId}/send-invitation`
      );

      return {
        success: true,
        message: "Invitación enviada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Enviar múltiples invitaciones
   */
  async sendBulkInvitations(eventId, guestIds) {
    try {
      const response = await httpService.post(
        `/eventos/${eventId}/guests/bulk-invite`,
        {
          guestIds,
        }
      );

      return {
        success: true,
        sentCount: response.sentCount,
        message: `${response.sentCount} invitaciones enviadas exitosamente`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Importar invitados desde CSV
   */
  async importGuests(eventId, csvFile, options = {}) {
    try {
      const response = await httpService.upload(
        `/eventos/${eventId}/guests/import`,
        csvFile,
        null,
        options
      );

      return {
        success: true,
        importedCount: response.importedCount,
        errors: response.errors || [],
        message: `${response.importedCount} invitados importados exitosamente`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Exportar invitados a CSV
   */
  async exportGuests(eventId, filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key]);
        }
      });

      const queryString = params.toString();
      const url = queryString
        ? `/eventos/${eventId}/guests/export?${queryString}`
        : `/eventos/${eventId}/guests/export`;

      await httpService.download(url, `invitados-evento-${eventId}.csv`);

      return {
        success: true,
        message: "Lista de invitados exportada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }

  /**
   * Obtener estadísticas de invitados
   */
  async getGuestStats(eventId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventId}/guests/stats`
      );

      return {
        success: true,
        stats: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
        stats: {
          total: 0,
          confirmed: 0,
          pending: 0,
          rejected: 0,
        },
      };
    }
  }

  /**
   * Obtener dashboard del invitado (Portal de Pagos)
   */
  async getGuestDashboard(guestId) {
    try {
      const response = await httpService.get(
        `/invitados/dashboard?invitado_id=${guestId}`
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.userMessage || "Error al obtener el dashboard del invitado",
      };
    }
  }

  /**
   * Obtener información de CLABE virtual del invitado
   */
  async getGuestClabe(guestId) {
    try {
      const response = await httpService.get(
        `/invitados/clabe?invitado_id=${guestId}`
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al obtener la información de CLABE",
      };
    }
  }
}

// Crear instancia singleton
const guestService = new GuestService();

export default guestService;
