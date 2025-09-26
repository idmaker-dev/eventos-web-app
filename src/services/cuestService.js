import httpService from "./httpService";

class CuestService {
  /**
   * Crear un invitado
   * @param {Object} invitadoData - Datos del invitado a crear
   */
  async createInvitado(invitadoData) {
    try {
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

const cuestService = new CuestService();

export default cuestService;
