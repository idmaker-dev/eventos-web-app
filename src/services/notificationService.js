import httpService from "./httpService";

/**
 * Servicio para la gestión de notificaciones del sistema
 */
class NotificationService {
  /**
   * Obtener todas las notificaciones del usuario actual
   * @returns {Promise<Object>} - Lista de notificaciones
   */
  async getAll() {
    try {
      const response = await httpService.get("/notificaciones");
      // Asumiendo formato { success: true, data: [...], message: "" }
      return {
        success: true,
        data: response.data?.data || response.data || [],
        message: response.data?.message || ""
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return {
        success: false,
        error: error.message || "Error al obtener notificaciones",
        data: []
      };
    }
  }

  /**
   * Marcar una notificación como leída
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async markAsRead(id) {
    try {
      const response = await httpService.patch(`/notificaciones/${id}/leida`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      return {
        success: false,
        error: error.message || "Error al marcar como leída"
      };
    }
  }

  /**
   * Eliminar una notificación
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async delete(id) {
    try {
      const response = await httpService.delete(`/notificaciones/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      return {
        success: false,
        error: error.message || "Error al eliminar notificación"
      };
    }
  }
}

export default new NotificationService();
