import httpService from "./httpService";

/**
 * Servicio para manejar la firma de contratos y completar el registro en Toku
 */
class ContratoService {
  /**
   * Envía el contrato para firma usando DocuSign
   * @param {string} invitadoId - ID del invitado
   * @param {string} modo - Modo de firma: "embedded" o "email"
   * @returns {Promise<Object>} URL de firma (embedded) o confirmación (email)
   */
  async enviarContrato(invitadoId, modo = "embedded") {
    try {
      const response = await httpService.post(
        "/invitadosAlumnos/enviar-contrato",
        {
          invitado_id: invitadoId,
          modo: modo,
        }
      );

      return {
        success: true,
        data: response.data,
        message: response.message || "Contrato enviado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al enviar el contrato",
      };
    }
  }

  /**
   * Completa el registro del invitado en Toku después de firmar el contrato
   * @param {string} invitadoId - ID del invitado
   * @param {string} envelopeId - ID del contrato en DocuSign (opcional)
   * @returns {Promise<Object>} Resultado del registro en Toku
   */
  async completarRegistroToku(invitadoId, envelopeId = null) {
    try {
      const response = await httpService.post(
        "/invitadosAlumnos/completar-registro-toku",
        {
          invitado_id: invitadoId,
          envelope_id: envelopeId,
        }
      );

      return {
        success: true,
        data: response.data,
        message: response.message || "Registro completado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al completar el registro",
      };
    }
  }

  /**
   * Obtiene el estado del contrato de un invitado
   * @param {string} invitadoId - ID del invitado
   * @returns {Promise<Object>} Estado del contrato
   */
  async obtenerEstadoContrato(invitadoId) {
    try {
      // TODO: Implementar endpoint para obtener estado del contrato
      // Por ahora retornamos un placeholder
      const response = await httpService.get(
        `/invitadosAlumnos/${invitadoId}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al obtener estado del contrato",
      };
    }
  }

  /**
   * Simula la firma del contrato (desarrollo/pruebas)
   * En producción, esto lo manejará DocuSign
   * @param {string} invitadoId - ID del invitado
   * @returns {Promise<Object>} Resultado de la simulación
   */
  async simularFirmaContrato(invitadoId) {
    try {
      // Simulación: generar un envelope_id ficticio
      const envelopeId = `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Llamar al endpoint de completar registro
      const result = await this.completarRegistroToku(invitadoId, envelopeId);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message || "Error al simular firma",
      };
    }
  }
}

const contratoService = new ContratoService();

export default contratoService;
