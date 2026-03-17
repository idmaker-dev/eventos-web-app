import httpService from "./httpService";

const BASE_URL = "/contratos";

/**
 * Servicio para manejar contratos INTERNO (HTML + firma digital)
 */
const contratoInternoService = {
  /**
   * Obtener preview del contrato procesado con variables
   * @param {string} invitadoId
   * @returns {Promise<Object>} HTML procesado, modo de firma, etc.
   */
  async obtenerPreview(invitadoId) {
    try {
      const response = await httpService.get(`${BASE_URL}/preview/${invitadoId}`);
      return {
        success: true,
        data: response.data,
        message: response.message || "Preview obtenido exitosamente",
      };
    } catch (error) {
      console.error("Error al obtener preview de contrato:", error);
      return {
        success: false,
        error: error.userMessage || error.message || "Error al obtener preview",
      };
    }
  },

  /**
   * Aceptar o firmar contrato INTERNO
   * @param {Object} params
   * @param {string} params.invitadoId
   * @param {string} params.firmaBase64 - Opcional, solo si modo = FIRMA_DIGITAL
   * @param {string} params.ipAddress
   * @param {string} params.userAgent
   * @param {Object} params.geolocalizacion - Opcional
   * @returns {Promise<Object>}
   */
  async aceptarOFirmar({ invitadoId, firmaBase64, ipAddress, userAgent, geolocalizacion }) {
    try {
      const response = await httpService.post(`${BASE_URL}/aceptar-o-firmar`, {
        invitado_id: invitadoId,
        firma_base64: firmaBase64,
        ip_address: ipAddress,
        user_agent: userAgent,
        geolocalizacion: geolocalizacion,
      });
      return {
        success: true,
        data: response.data,
        message: response.message || "Contrato firmado exitosamente",
      };
    } catch (error) {
      console.error("Error al aceptar/firmar contrato:", error);
      return {
        success: false,
        error: error.userMessage || error.message || "Error al firmar contrato",
      };
    }
  },

  /**
   * Obtener IP pública del cliente
   * @returns {Promise<string>}
   */
  async obtenerIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn("No se pudo obtener IP pública:", error);
      return "0.0.0.0";
    }
  },

  /**
   * Obtener geolocalización del navegador (requiere permiso del usuario)
   * @returns {Promise<Object|null>}
   */
  async obtenerGeolocalizacion() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocalización no disponible en este navegador");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.warn("Error al obtener geolocalización:", error.message);
          resolve(null);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  },
};

export default contratoInternoService;
