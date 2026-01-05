import httpService from "./httpService";

/**
 * Servicio para obtener reportes de selección de mesas
 */
const reporteSeleccionService = {
  /**
   * Obtiene el reporte completo de selecciones de mesas para un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Reporte con datos, evento, tipos_menu, etc.
   */
  async obtenerReporteSelecciones(eventoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/seleccion-mesas/reporte`
      );

      // La respuesta esperada es: { success, data: { datos, evento, tipos_menu, resumen, ocupacion, columnas } }
      if (response.success) {
        return response.data;
      }

      throw new Error(
        response.message || "Error al obtener reporte de selecciones"
      );
    } catch (error) {
      console.error("Error en obtenerReporteSelecciones:", error);
      throw error;
    }
  },
};

export default reporteSeleccionService;
