import httpService from "./httpService";

/**
 * Servicio para gestionar turnos de selección de mesas
 * Maneja todas las operaciones relacionadas con el sistema de turnos
 */
class TurnosService {
  // ==================== CONFIGURACIÓN ====================

  /**
   * Crear o actualizar configuración del proceso de selección
   * @param {string} eventoId - ID del evento
   * @param {Object} configuracion - Datos de configuración
   */
  async configurarProcesoSeleccion(eventoId, configuracion) {
    try {
      const response = await httpService.post(
        `/eventos/${eventoId}/seleccion-mesas/configuracion`,
        configuracion
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al configurar proceso de selección",
      };
    }
  }

  /**
   * Obtener configuración actual del evento
   * @param {string} eventoId - ID del evento
   */
  async obtenerConfiguracion(eventoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/seleccion-mesas/configuracion`
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      // Si es 404, no hay configuración aún
      if (error.response?.status === 404) {
        return { success: true, data: null };
      }
      return {
        success: false,
        error: error.userMessage || "Error al obtener configuración",
      };
    }
  }

  /**
   * Actualizar estado de la configuración
   * @param {string} eventoId - ID del evento
   * @param {string} estado - ACTIVO, PAUSADO, FINALIZADO
   */
  async actualizarEstado(eventoId, estado) {
    try {
      const response = await httpService.put(
        `/eventos/${eventoId}/seleccion-mesas/configuracion/estado`,
        { estado }
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al actualizar estado",
      };
    }
  }

  // ==================== TURNOS (ADMIN) ====================

  /**
   * Generar o regenerar turnos del evento (automático por fecha de liquidación)
   * @param {string} eventoId - ID del evento
   */
  async generarTurnos(eventoId) {
    try {
      const response = await httpService.post(
        `/eventos/${eventoId}/seleccion-mesas/generar-turnos`
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al generar turnos",
      };
    }
  }

  /**
   * Generar turnos con orden manual de invitados
   * @param {string} eventoId - ID del evento
   * @param {Array<string>} invitadosOrdenados - Array de IDs de invitados en orden deseado
   */
  async generarTurnosManual(eventoId, invitadosOrdenados) {
    try {
      const response = await httpService.post(
        `/eventos/${eventoId}/seleccion-mesas/generar-turnos`,
        {
          ordenManual: true,
          invitadosOrdenados,
        }
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al generar turnos con orden manual",
      };
    }
  }

  /**
   * Generar turnos con orden manual
   * @param {string} eventoId - ID del evento
   * @param {Array<string>} invitadosOrdenados - IDs de invitados en el orden deseado
   */
  async generarTurnosManual(eventoId, invitadosOrdenados) {
    try {
      const response = await httpService.post(
        `/eventos/${eventoId}/seleccion-mesas/generar-turnos`,
        {
          ordenManual: true,
          invitadosOrdenados: invitadosOrdenados,
        }
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al generar turnos con orden manual",
      };
    }
  }

  /**
   * Obtener todos los turnos del evento (Admin)
   * @param {string} eventoId - ID del evento
   */
  async obtenerTodosLosTurnos(eventoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/seleccion-mesas/turnos`
      );
      return {
        success: true,
        data: response.data || response,
        turnos: response.turnos || response.data?.turnos || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al obtener turnos",
        turnos: [],
      };
    }
  }

  /**
   * Reprogramar un turno manualmente
   * @param {string} eventoId - ID del evento
   * @param {string} invitadoId - ID del invitado
   * @param {Object} nuevosTiempos - { fecha_hora_inicio, fecha_hora_fin }
   */
  async reprogramarTurno(eventoId, invitadoId, nuevosTiempos) {
    try {
      const response = await httpService.put(
        `/eventos/${eventoId}/seleccion-mesas/reprogramar`,
        {
          invitado_id: invitadoId,
          ...nuevosTiempos,
        }
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al reprogramar turno",
      };
    }
  }

  // ==================== TURNOS (INVITADO) ====================

  /**
   * Obtener turno de un invitado específico
   * @param {string} eventoId - ID del evento
   * @param {string} invitadoId - ID del invitado
   */
  async obtenerMiTurno(eventoId, invitadoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/seleccion-mesas/mi-turno?invitadoId=${invitadoId}`
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al obtener turno",
      };
    }
  }

  /**
   * Verificar si el invitado puede acceder ahora
   * @param {string} eventoId - ID del evento
   * @param {string} invitadoId - ID del invitado
   */
  async verificarAcceso(eventoId, invitadoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/seleccion-mesas/verificar-acceso?invitadoId=${invitadoId}`
      );
      return {
        success: true,
        data: response.data || response,
        puede_acceder:
          response.puede_acceder || response.data?.puede_acceder || false,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al verificar acceso",
        puede_acceder: false,
      };
    }
  }

  // ==================== SELECCIÓN ====================

  /**
   * Guardar selección de mesas del invitado
   * @param {string} eventoId - ID del evento
   * @param {string} invitadoId - ID del invitado
   * @param {Object} seleccion - Datos de la selección
   */
  async guardarSeleccion(eventoId, invitadoId, seleccion) {
    try {
      const response = await httpService.post(
        `/eventos/${eventoId}/seleccion-mesas/guardar?invitadoId=${invitadoId}`,
        seleccion
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al guardar selección",
      };
    }
  }

  /**
   * Guardar selección de mesas por un administrador (sin validar turnos)
   * @param {string} eventoId - ID del evento
   * @param {string} invitadoId - ID del invitado al que se asigna
   * @param {Object} seleccion - Datos de la selección
   */
  async guardarSeleccionAdmin(eventoId, invitadoId, seleccion) {
    try {
      const response = await httpService.post(
        `/eventos/${eventoId}/seleccion-mesas/guardar-admin?invitadoId=${invitadoId}`,
        seleccion
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al guardar selección",
      };
    }
  }

  /**
   * Obtener selección del invitado
   * @param {string} eventoId - ID del evento
   * @param {string} invitadoId - ID del invitado
   */
  async obtenerMiSeleccion(eventoId, invitadoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/seleccion-mesas/mi-seleccion?invitadoId=${invitadoId}`
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      // Si es 404, no hay selección aún
      if (error.response?.status === 404) {
        return { success: true, data: null };
      }
      return {
        success: false,
        error: error.userMessage || "Error al obtener selección",
      };
    }
  }

  /**
   * Obtener estado de ocupación de mesas
   * @param {string} eventoId - ID del evento
   */
  async obtenerEstadoOcupacion(eventoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/seleccion-mesas/estado-ocupacion`
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al obtener estado de ocupación",
      };
    }
  }

  // ==================== REPORTES (ADMIN) ====================

  /**
   * Obtener reporte completo de selecciones
   * @param {string} eventoId - ID del evento
   */
  async obtenerReporte(eventoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/seleccion-mesas/reporte`
      );
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al obtener reporte",
      };
    }
  }

  /**
   * Obtener todas las selecciones del evento
   * @param {string} eventoId - ID del evento
   */
  async obtenerSelecciones(eventoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/seleccion-mesas/selecciones`
      );
      return {
        success: true,
        data: response.data || response,
        selecciones: response.selecciones || response.data?.selecciones || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al obtener selecciones",
        selecciones: [],
      };
    }
  }

  /**
   * Descargar Excel con relación de turnos
   * @param {string} eventoId - ID del evento
   */
  async descargarExcelTurnos(eventoId) {
    try {
      const response = await httpService.get(
        `/eventos/${eventoId}/seleccion-mesas/turnos/descargar-excel`,
        { responseType: "blob" }
      );

      // Crear blob y descargar archivo
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Crear nombre de archivo con fecha actual
      const fecha = new Date().toISOString().split("T")[0];
      const nombreArchivo = `Turnos_Evento_${eventoId}_${fecha}.xlsx`;

      // Crear link temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: "Excel descargado exitosamente",
      };
    } catch (error) {
      return {
        success: false,
        error: error.userMessage || "Error al descargar Excel de turnos",
      };
    }
  }
}

const turnosService = new TurnosService();
export default turnosService;
