const WHATSAPP_API_BASE = "https://planoria-bot.azurewebsites.net/api/v1";

/**
 * Servicio para manejar la verificación por WhatsApp
 */
export const whatsappService = {
  /**
   * Genera un código de verificación y lo envía por WhatsApp
   * @param {string} telefono - Número de teléfono
   * @returns {Promise<Object>} Respuesta con código y expiración
   */
  async generarCodigo(telefono) {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/rsvp/generar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telefono }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al generar código:", error);
      throw error;
    }
  },

  /**
   * Reenvía el código de verificación por WhatsApp
   * @param {string} telefono - Número de teléfono
   * @returns {Promise<Object>} Respuesta con código y expiración
   */
  async reenviarCodigo(telefono) {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/rsvp/reenviar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telefono }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al reenviar código:", error);
      throw error;
    }
  },

  /**
   * Confirma el registro exitoso y envía mensaje de confirmación por WhatsApp
   * @param {string} telefono - Número de teléfono
   * @returns {Promise<Object>} Respuesta de confirmación
   */
  async confirmarRegistro(telefono) {
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/rsvp/confirmar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ telefono }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al confirmar registro:", error);
      throw error;
    }
  },
};

export default whatsappService;
