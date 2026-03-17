import httpService from "./httpService";

/**
 * Servicio para verificar códigos de confirmación
 */
export const codigoVerificacionService = {
  /**
   * Envía el código de verificación por email como respaldo
   * @param {string} email - Correo electrónico
   * @param {string} codigo - Código de verificación
   * @param {string} nombre - Nombre del destinatario (opcional)
   * @returns {Promise<Object>} Respuesta del envío
   */
  async enviarCodigoPorEmail(email, codigo, nombre = '') {
    try {
      const response = await httpService.post(
        "/codigos-confirmacion/enviar-email",
        {
          email,
          codigo,
          nombre,
        }
      );

      return response;
    } catch (error) {
      console.error("Error al enviar código por email:", error);
      // No lanzar error, solo retornar false para que no bloquee el flujo
      return {
        success: false,
        error: error.message || "Error al enviar código por email",
      };
    }
  },

  /**
   * Verifica el código de confirmación
   * @param {string} telefono - Número de teléfono
   * @param {string} codigo - Código de verificación
   * @returns {Promise<Object>} Respuesta de verificación
   */
  async verificarCodigo(telefono, codigo) {
    try {
      const response = await httpService.post(
        "/codigos-confirmacion/verificar",
        {
          telefono,
          codigo,
        }
      );

      return response;
    } catch (error) {
      console.log("Error capturado en el servicio:", error);

      // Manejo específico de errores según el nuevo formato de respuesta
      if (error.data) {
        console.log("Error data:", error.data);

        const data = error.data;

        // Si la respuesta tiene success: false, lanzar el error directamente
        if (data.success === false && data.error) {
          throw new Error(data.error);
        }

        // Fallback para otros formatos de error
        // switch (data.code) {
        //   case "PHONE_REQUIRED":
        //     throw new Error("El teléfono es requerido");
        //   case "CODE_REQUIRED":
        //     throw new Error("El código es requerido");
        //   case "CODE_NOT_FOUND":
        //     throw new Error("No se encontró un código para este teléfono");
        //   case "CODE_EXPIRED":
        //     throw new Error("El código ha expirado");
        //   case "CODE_ALREADY_CONFIRMED":
        //     throw new Error("El código ya ha sido confirmado");
        //   case "CODE_INVALID":
        //     throw new Error("Código incorrecto");
        //   case "MAX_ATTEMPTS_EXCEEDED":
        //     throw new Error("Se ha alcanzado el máximo de intentos permitidos");
        //   case "DB_OPERATION_FAILED":
        //     throw new Error("Error en la base de datos al verificar el código");
        //   default:
        //     throw new Error(data.message || "Error al verificar el código");
        // }
      }

      console.error("Error al verificar código:", error);
      //   throw new Error("Error de conexión al verificar el código");
    }
  },
};

export default codigoVerificacionService;
