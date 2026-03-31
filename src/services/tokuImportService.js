import httpService from './httpService';

/**
 * Servicio para importación individual de alumnos desde Toku
 * Sistema V3: BASE es la verdad, Toku es la infraestructura
 */
class TokuImportService {
  /**
   * Analiza un alumno en BASE y Toku para determinar el caso de sincronización
   * @param {string} email - Email del alumno
   * @param {string} escuela - Nombre de la escuela (debe coincidir exactamente)
   * @returns {Promise<{success: boolean, data: object, error: string}>}
   * 
   * Casos posibles:
   * - sincronizado: Existe en BASE y Toku con wallet sincronizado
   * - desajuste: Existe en ambos pero hay diferencias en facturas
   * - solo_toku: Solo existe en Toku (necesita crearse en BASE)
   * - solo_base: Solo existe en BASE (necesita crearse en Toku)
   */
  async analyzeStudent(email, escuela) {
    try {
      const response = await httpService.get('/toku/analizar-individual', {
        params: { 
          email: email.trim(), 
          escuela: escuela.trim() 
        }
      });

      return {
        success: true,
        data: response.data || response,
        error: null
      };
    } catch (error) {
      console.error('Error al analizar alumno:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Error al analizar alumno'
      };
    }
  }

  /**
   * Importa un alumno en BASE o Toku según el caso identificado
   * @param {object} config - Configuración de importación
   * @param {string} config.caso - Tipo: 'solo_toku', 'solo_base', 'desajuste'
   * @param {object} config.datosToku - Datos del alumno en Toku
   * @param {object} config.datosBase - Datos del alumno en BASE
   * @param {string} config.decision - Decisión tomada (ej: 'aplicar_toku', 'crear_en_base')
   * @param {string} config.escuela - Nombre de la escuela
   * @returns {Promise<{success: boolean, data: object, error: string}>}
   */
  async importStudent(config) {
    try {
      const response = await httpService.post('/toku/importar-individual', config);

      return {
        success: true,
        data: response.data || response,
        message: response.data?.message || 'Importación completada exitosamente',
        error: null
      };
    } catch (error) {
      console.error('Error al importar alumno:', error);
      return {
        success: false,
        data: null,
        message: null,
        error: error.response?.data?.message || error.message || 'Error al importar alumno'
      };
    }
  }

  /**
   * Valida que un email tenga formato correcto
   * @param {string} email 
   * @returns {boolean}
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email?.trim());
  }

  /**
   * Formatea un monto en pesos mexicanos
   * @param {number} amount 
   * @returns {string}
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  }
}

const tokuImportServiceInstance = new TokuImportService();
export default tokuImportServiceInstance;
