import httpService from "./httpService";

/**
 * Servicio de cuestionarios / invitados
 * Maneja la creación de invitados
 */
class CuestService {
  /**
   * Crear un invitado
   * @param {Object} invitadoData - Datos del invitado a crear
   */
  async createInvitado(invitadoData) {
    try {
      // Nuevo endpoint manteniendo el estilo anterior
      const response = await httpService.post(
        "/invitadosAlumnos/crear",
        invitadoData
      );

      return {
        success: true,
        invitado: response,
        message: "Invitado creado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage,
      };
    }
  }
}

// Crear instancia singleton
const cuestService = new CuestService();

export default cuestService;
