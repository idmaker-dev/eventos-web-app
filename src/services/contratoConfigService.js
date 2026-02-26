import httpService from './httpService';

const contratoConfigService = {
  /**
   * Obtiene la configuración del contrato de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>}
   */
  async obtenerConfiguracion(eventoId) {
    try {
      const response = await httpService.get(`/eventos/${eventoId}/configuracion-contrato`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener configuración de contrato:', error);
      throw error;
    }
  },

  /**
   * Guarda o actualiza la configuración del contrato
   * @param {string} eventoId - ID del evento
   * @param {Object} configuracion - Datos de configuración
   * @returns {Promise<Object>}
   */
  async guardarConfiguracion(eventoId, configuracion) {
    try {
      const response = await httpService.post(
        `/eventos/${eventoId}/configuracion-contrato`,
        configuracion
      );
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de contrato:', error);
      throw error;
    }
  },

  /**
   * Lista todos los eventos con configuración de contrato
   * @returns {Promise<Array>}
   */
  async listarEventosConConfiguracion() {
    try {
      const response = await httpService.get('/eventos/configuracion-contrato/disponibles');
      return response.data;
    } catch (error) {
      console.error('Error al listar eventos con configuración:', error);
      throw error;
    }
  },

  /**
   * Copia la configuración de un evento a otro
   * @param {string} eventoDestinoId - ID del evento destino
   * @param {string} eventoOrigenId - ID del evento origen
   * @returns {Promise<Object>}
   */
  async copiarConfiguracion(eventoDestinoId, eventoOrigenId) {
    try {
      const response = await httpService.post(
        `/eventos/${eventoDestinoId}/configuracion-contrato/copiar/${eventoOrigenId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error al copiar configuración:', error);
      throw error;
    }
  },

  /**
   * Obtiene el catálogo de campos disponibles de Planoria
   * @returns {Promise<Object>}
   */
  async obtenerCatalogoCampos() {
    try {
      const response = await httpService.get('/eventos/configuracion-contrato/catalogo-campos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener catálogo de campos:', error);
      throw error;
    }
  },
};

export default contratoConfigService;
