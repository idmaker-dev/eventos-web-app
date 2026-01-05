import httpService from "./httpService";

/**
 * Servicio de Boletos
 * Maneja operaciones relacionadas con diseños de invitaciones y generación de boletos con QR
 */
class BoletoService {
  /**
   * Subir diseño base de invitación (Admin)
   * @param {string} eventoId - ID del evento
   * @param {File} imageFile - Archivo de imagen (PNG/JPEG)
   * @returns {Promise<Object>}
   */
  async subirDiseno(eventoId, imageFile) {
    try {
      const formData = new FormData();
      formData.append("imagen", imageFile);

      const response = await httpService.post(
        `/eventos/${eventoId}/boletos/diseno`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000, // 2 minutos para archivos grandes
        }
      );

      return {
        success: true,
        data: response.data || response,
        message: response.message || "Diseño subido exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al subir diseño",
        details: error,
      };
    }
  }

  /**
   * Guardar configuración de posición y tamaño del QR (Admin)
   * @param {string} eventoId - ID del evento
   * @param {Object} qrConfig - { x, y, width, height } en porcentajes (0-1)
   * @returns {Promise<Object>}
   */
  async guardarConfiguracionQR(eventoId, qrConfig) {
    try {
      const response = await httpService.put(
        `/eventos/${eventoId}/boletos/configuracion-qr`,
        { qr_config: qrConfig }
      );

      return {
        success: true,
        data: response.data || response,
        message: response.message || "Configuración guardada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al guardar configuración",
        details: error,
      };
    }
  }

  /**
   * Obtener configuración actual del boleto de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>}
   */
  async obtenerConfiguracion(eventoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/boletos/configuracion`
      );

      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      // 404 es esperado si no hay configuración
      if (error.status === 404) {
        return {
          success: false,
          notFound: true,
          error: "No hay configuración de boleto para este evento",
        };
      }

      return {
        success: false,
        error: error.userMessage || "Error al obtener configuración",
        details: error,
      };
    }
  }

  /**
   * Generar boleto individual con QR
   * @param {string} eventoId - ID del evento
   * @param {string} invitadoId - ID del invitado
   * @returns {Promise<Object>}
   */
  async generarBoletoIndividual(eventoId, invitadoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/boletos/invitado/${invitadoId}`
      );

      return {
        success: true,
        data: response.data || response,
        message: "Boleto generado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al generar boleto",
        details: error,
      };
    }
  }

  /**
   * Descargar boletos masivos en ZIP (Admin)
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Blob>}
   */
  async descargarBoletosMasivo(eventoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/boletos/descargar-masivo`,
        {
          responseType: "blob",
          timeout: 300000, // 5 minutos para generación masiva
        }
      );

      // Crear URL del blob y descargar
      const blob = new Blob([response], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `boletos_evento_${eventoId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: "Descarga iniciada exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al descargar boletos",
        details: error,
      };
    }
  }

  /**
   * Compartir boleto (Web Share API)
   * @param {string} boletoUrl - URL del boleto
   * @param {string} nombreInvitado - Nombre del invitado
   * @returns {Promise<Object>}
   */
  async compartirBoleto(boletoUrl, nombreInvitado = "invitado") {
    try {
      if (!navigator.share) {
        throw new Error("Compartir no disponible en este navegador");
      }

      // Descargar imagen como blob
      const response = await fetch(boletoUrl);
      const blob = await response.blob();
      const file = new File([blob], `boleto_${nombreInvitado}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Mi Boleto de Invitación",
          text: `Boleto de invitación`,
          files: [file],
        });

        return {
          success: true,
          message: "Boleto compartido exitosamente",
        };
      } else {
        // Fallback: descargar
        const link = document.createElement("a");
        link.href = boletoUrl;
        link.download = `boleto_${nombreInvitado}.png`;
        link.click();

        return {
          success: true,
          message: "Boleto descargado (compartir no disponible)",
        };
      }
    } catch (error) {
      if (error.name === "AbortError") {
        // Usuario canceló el compartir
        return {
          success: false,
          cancelled: true,
          error: "Compartir cancelado",
        };
      }

      return {
        success: false,
        error: error.message || "Error al compartir boleto",
        details: error,
      };
    }
  }

  /**
   * Validar archivo de imagen antes de subir
   * @param {File} file - Archivo a validar
   * @returns {Object} { valid: boolean, error?: string }
   */
  validarImagen(file) {
    // Validar tipo
    const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg"];
    if (!tiposPermitidos.includes(file.type)) {
      return {
        valid: false,
        error: "Solo se aceptan imágenes PNG o JPEG",
      };
    }

    // Validar tamaño (100 MB)
    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "El archivo excede el tamaño máximo de 100 MB",
      };
    }

    return { valid: true };
  }
}

// Exportar instancia singleton
const boletoService = new BoletoService();
export default boletoService;
