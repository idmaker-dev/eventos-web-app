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
  /**
   * Obtiene la previsualización del contrato en Base64
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>}
   */
  async previewContrato(eventoId) {
    try {
      const response = await httpService.get(`/eventos/${eventoId}/preview-contrato`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener previsualización de contrato:', error);
      throw error;
    }
  },

  // ==================== PLANTILLAS HTML (TIPO INTERNO) ====================

  /**
   * Lista todas las plantillas de contrato
   * @param {Object} filtros - Filtros opcionales
   * @param {string} filtros.evento_id - Filtrar por evento
   * @param {boolean} filtros.activo - Filtrar por estado
   * @returns {Promise<Object>}
   */
  async listarPlantillas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      if (filtros.evento_id) params.append('evento_id', filtros.evento_id);
      if (filtros.activo !== undefined) params.append('activo', filtros.activo);

      const queryString = params.toString();
      const url = `/plantillas${queryString ? `?${queryString}` : ''}`;
      
      const response = await httpService.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al listar plantillas:', error);
      throw error;
    }
  },

  /**
   * Obtiene una plantilla específica
   * @param {string} plantillaId - ID de la plantilla
   * @returns {Promise<Object>}
   */
  async obtenerPlantilla(plantillaId) {
    try {
      const response = await httpService.get(`/plantillas/${plantillaId}`);
      // El endpoint regresa { data: { plantilla: {...} } }
      return response.data.plantilla || response.data;
    } catch (error) {
      console.error('Error al obtener plantilla:', error);
      throw error;
    }
  },

  /**
   * Crea una nueva plantilla de contrato
   * @param {Object} plantillaData - Datos de la plantilla
   * @param {string} plantillaData.nombre - Nombre de la plantilla
   * @param {string} plantillaData.html_template - HTML de la plantilla
   * @param {string} plantillaData.css_template - CSS de la plantilla
   * @param {string} plantillaData.modo_firma - "SOLO_ACEPTAR" | "FIRMA_DIGITAL"
   * @param {string} plantillaData.id_evento - ID del evento (opcional)
   * @returns {Promise<Object>}
   */
  async crearPlantilla(plantillaData) {
    try {
      const response = await httpService.post('/plantillas', plantillaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      throw error;
    }
  },

  /**
   * Actualiza una plantilla existente
   * @param {string} plantillaId - ID de la plantilla
   * @param {Object} actualizaciones - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async actualizarPlantilla(plantillaId, actualizaciones) {
    try {
      const response = await httpService.put(`/plantillas/${plantillaId}`, actualizaciones);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar plantilla:', error);
      throw error;
    }
  },

  /**
   * Elimina (desactiva) una plantilla
   * @param {string} plantillaId - ID de la plantilla
   * @returns {Promise<Object>}
   */
  async eliminarPlantilla(plantillaId) {
    try {
      const response = await httpService.delete(`/plantillas/${plantillaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      throw error;
    }
  },

  /**
   * Previsualiza una plantilla con datos de ejemplo
   * @param {string} plantillaId - ID de la plantilla
   * @param {Object} datosEjemplo - Datos de ejemplo para procesar la plantilla
   * @returns {Promise<Object>} - { html, htmlSinEstilos, plantilla }
   */
  async previsualizarPlantilla(plantillaId, datosEjemplo = {}) {
    try {
      const response = await httpService.post(`/plantillas/${plantillaId}/preview`, datosEjemplo);
      return response.data;
    } catch (error) {
      console.error('Error al previsualizar plantilla:', error);
      throw error;
    }
  },

  /**
   * Obtiene el catálogo de variables disponibles para plantillas
   * @returns {Promise<Object>}
   */
  async obtenerCatalogoVariables() {
    try {
      const response = await httpService.get('/plantillas/variables');
      return response.data.catalogo_categorias || response.data;
    } catch (error) {
      console.error('Error al obtener catálogo de variables:', error);
      throw error;
    }
  },

  /**
   * Valida una plantilla Word (.docx) y extrae variables
   * @param {File} archivo - Archivo .docx a validar
   * @param {Function} onProgress - Callback para progreso de upload (opcional)
   * @returns {Promise<Object>} - { nombreArchivo, tamaño, variablesEncontradas, totalVariables, plantillaId, archivoUrl, blobPath }
   */
  async validarPlantillaWord(archivo, onProgress = null) {
    try {
      if (!archivo) {
        throw new Error('No se proporcionó ningún archivo');
      }

      if (!archivo.name.toLowerCase().endsWith('.docx')) {
        throw new Error('Solo se aceptan archivos .docx (Word 2007 o superior)');
      }

      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await httpService.post('/plantillas/validar-word', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        } : undefined,
      });

      return response.data;
    } catch (error) {
      console.error('Error al convertir Word a HTML:', error);
      throw error;
    }
  },
};

export default contratoConfigService;
