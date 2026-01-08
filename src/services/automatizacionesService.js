import httpService from "./httpService";

/**
 * Servicio de automatizaciones
 * Maneja todas las operaciones relacionadas con automatizaciones de notificaciones
 */
class AutomatizacionesService {
  /**
   * Obtener todas las automatizaciones con filtros opcionales
   */
  async getAutomatizaciones(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.activa !== undefined) {
        params.append('activa', filtros.activa);
      }
      if (filtros.tipo) {
        params.append('tipo', filtros.tipo);
      }
      if (filtros.id_evento) {
        params.append('id_evento', filtros.id_evento);
      }

      const queryString = params.toString();
      const url = queryString ? `/automatizaciones?${queryString}` : '/automatizaciones';
      
      const response = await httpService.get(url);

      // Extraer automatizaciones de la respuesta
      const data = response.data || response;
      const automatizaciones = data.automatizaciones || data || [];

      return {
        success: true,
        automatizaciones: Array.isArray(automatizaciones) ? automatizaciones : [],
      };
    } catch (error) {
      console.error('Error en getAutomatizaciones:', error);
      return {
        success: false,
        error: error.userMessage || error.message || 'Error al obtener automatizaciones',
        automatizaciones: [],
      };
    }
  }

  /**
   * Obtener plantillas disponibles para crear automatizaciones
   */
  async getPlantillas() {
    try {
      const response = await httpService.get('/automatizaciones/plantillas');
      
      const data = response.data || response;
      const plantillas = data.plantillas || [];

      return {
        success: true,
        plantillas: Array.isArray(plantillas) ? plantillas : [],
      };
    } catch (error) {
      console.error('Error en getPlantillas:', error);
      return {
        success: false,
        error: error.userMessage || error.message || 'Error al obtener plantillas',
        plantillas: [],
      };
    }
  }

  /**
   * Obtener una automatización específica por ID
   */
  async getAutomatizacion(id) {
    try {
      const response = await httpService.get(`/automatizaciones/${id}`);

      return {
        success: true,
        automatizacion: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || error.message,
      };
    }
  }

  /**
   * Crear una nueva automatización
   */
  async crearAutomatizacion(datos) {
    try {
      const response = await httpService.post('/automatizaciones', datos);

      return {
        success: true,
        automatizacion: response.data || response,
        message: response.message || 'Automatización creada exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || error.message,
      };
    }
  }

  /**
   * Actualizar una automatización existente
   */
  async actualizarAutomatizacion(id, datos) {
    try {
      const response = await httpService.put(`/automatizaciones/${id}`, datos);

      return {
        success: true,
        automatizacion: response.data || response,
        message: response.message || 'Automatización actualizada exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || error.message,
      };
    }
  }

  /**
   * Cambiar el estado activo/inactivo de una automatización
   */
  async cambiarEstado(id, activa) {
    try {
      const response = await httpService.patch(`/automatizaciones/${id}/estado`, {
        activa,
      });

      return {
        success: true,
        automatizacion: response.data || response,
        message: response.message || `Automatización ${activa ? 'activada' : 'desactivada'} exitosamente`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || error.message,
      };
    }
  }

  /**
   * Eliminar una automatización
   */
  async eliminarAutomatizacion(id) {
    try {
      const response = await httpService.delete(`/automatizaciones/${id}`);

      return {
        success: true,
        message: response.message || 'Automatización eliminada exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || error.message,
      };
    }
  }

  /**
   * Duplicar una automatización existente
   */
  async duplicarAutomatizacion(id) {
    try {
      const response = await httpService.post(`/automatizaciones/${id}/duplicar`);

      return {
        success: true,
        automatizacion: response.data || response,
        message: response.message || 'Automatización duplicada exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || error.message,
      };
    }
  }

  /**
   * Ejecutar manualmente una automatización
   */
  async ejecutarManual(id) {
    try {
      const response = await httpService.post(`/automatizaciones/${id}/ejecutar`);

      return {
        success: true,
        resultado: response.data || response,
        message: response.message || 'Automatización ejecutada manualmente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || error.message,
      };
    }
  }

  /**
   * Obtener historial de ejecuciones con filtros
   */
  async getHistorial(automatizacionId = null, filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.estado) {
        params.append('estado', filtros.estado);
      }
      if (filtros.fecha_desde) {
        params.append('fecha_desde', filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        params.append('fecha_hasta', filtros.fecha_hasta);
      }
      if (filtros.limit) {
        params.append('limit', filtros.limit);
      }
      if (filtros.offset) {
        params.append('offset', filtros.offset);
      }

      const queryString = params.toString();
      
      let url;
      if (automatizacionId) {
        url = queryString 
          ? `/automatizaciones/${automatizacionId}/historial?${queryString}`
          : `/automatizaciones/${automatizacionId}/historial`;
      } else {
        url = queryString
          ? `/automatizaciones/historial?${queryString}`
          : `/automatizaciones/historial`;
      }
      
      const response = await httpService.get(url);

      return {
        success: true,
        historial: response.data || response,
        total: response.total,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || error.message,
        historial: [],
      };
    }
  }

  /**
   * Obtener estadísticas de ejecuciones
   */
  async getEstadisticas(automatizacionId, fechaDesde = null, fechaHasta = null) {
    try {
      const params = new URLSearchParams();
      
      if (fechaDesde) {
        params.append('fecha_desde', fechaDesde);
      }
      if (fechaHasta) {
        params.append('fecha_hasta', fechaHasta);
      }

      const queryString = params.toString();
      const url = queryString
        ? `/automatizaciones/${automatizacionId}/estadisticas?${queryString}`
        : `/automatizaciones/${automatizacionId}/estadisticas`;
      
      const response = await httpService.get(url);

      return {
        success: true,
        estadisticas: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || error.message,
        estadisticas: null,
      };
    }
  }

  /**
   * Limpiar historial antiguo
   */
  async limpiarHistorialAntiguo(diasAntiguo = 90) {
    try {
      const response = await httpService.delete('/automatizaciones/historial/limpiar', {
        dias: diasAntiguo,
      });

      return {
        success: true,
        message: response.message || 'Historial antiguo eliminado',
        eliminados: response.eliminados || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || error.message,
      };
    }
  }
}

// Exportar instancia única del servicio
const automatizacionesService = new AutomatizacionesService();
export default automatizacionesService;
