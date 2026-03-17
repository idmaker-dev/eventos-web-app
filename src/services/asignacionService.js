import httpService from "./httpService";
import EnvConfig from "../utils/config";

/**
 * Servicio para gestionar asignaciones de invitados a mesas
 * Maneja todas las operaciones CRUD relacionadas con asignaciones de distribución
 */
class AsignacionService {
  constructor() {
    this.baseUrl = "eventos";
  }

  /**
   * Crear asignación de invitado a mesa
   * @param {string} eventoId - ID del evento
   * @param {Object} asignacion - Datos de la asignación
   * @param {string} asignacion.invitado_id - ID del invitado
   * @param {string} asignacion.mesa_id - ID de la mesa
   * @param {number} asignacion.numero_mesa - Número de la mesa
   * @param {number} asignacion.cantidad_personas - Cantidad de personas del grupo
   * @returns {Promise<Object>} Resultado de la operación
   */
  async crearAsignacion(eventoId, asignacion) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Creando asignación:", { eventoId, asignacion });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      if (!asignacion.invitado_id) {
        throw new Error("graduado_id es requerido");
      }

      if (!asignacion.mesa_id) {
        throw new Error("mesa_id es requerido");
      }

      if (!asignacion.cantidad_personas || asignacion.cantidad_personas < 1) {
        throw new Error("cantidad_personas debe ser mayor a 0");
      }

      const payload = {
        invitado_id: asignacion.invitado_id,
        mesa_id: asignacion.mesa_id,
        numero_mesa: asignacion.numero_mesa || null,
        cantidad_personas: asignacion.cantidad_personas,
        necesidad_especial: asignacion.necesidad_especial || false,
        notas: asignacion.notas || "",
      };

      const response = await httpService.post(
        `${this.baseUrl}/${eventoId}/asignaciones`,
        payload
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Asignación creada exitosamente:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Asignación creada exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al crear asignación:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al crear asignación",
        details: error,
      };
    }
  }

  /**
   * Actualizar asignación existente
   * @param {string} eventoId - ID del evento
   * @param {string} asignacionId - ID de la asignación
   * @param {Object} datosActualizados - Datos a actualizar
   * @returns {Promise<Object>} Asignación actualizada
   */
  async actualizarAsignacion(eventoId, asignacionId, datosActualizados) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Actualizando asignación:", {
          eventoId,
          asignacionId,
          datosActualizados,
        });
      }

      if (!eventoId || !asignacionId) {
        throw new Error("eventoId y asignacionId son requeridos");
      }

      const response = await httpService.put(
        `${this.baseUrl}/${eventoId}/asignaciones/${asignacionId}`,
        datosActualizados
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Asignación actualizada:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Asignación actualizada exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al actualizar asignación:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al actualizar asignación",
        details: error,
      };
    }
  }

  /**
   * Eliminar asignación
   * @param {string} eventoId - ID del evento
   * @param {string} asignacionId - ID de la asignación
   * @returns {Promise<Object>} Resultado de la operación
   */
  async eliminarAsignacion(eventoId, asignacionId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Eliminando asignación:", { eventoId, asignacionId });
      }

      if (!eventoId || !asignacionId) {
        throw new Error("eventoId y asignacionId son requeridos");
      }

      const response = await httpService.delete(
        `${this.baseUrl}/${eventoId}/asignaciones/${asignacionId}`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Asignación eliminada:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Asignación eliminada exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al eliminar asignación:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al eliminar asignación",
        details: error,
      };
    }
  }

  /**
   * Listar todas las asignaciones de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Lista de asignaciones
   */
  async listarAsignaciones(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Listando asignaciones del evento:", eventoId);
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.get(
        `${this.baseUrl}/${eventoId}/asignaciones`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Asignaciones listadas:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al listar asignaciones:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al listar asignaciones",
        details: error,
        data: { asignaciones: [], total: 0 },
      };
    }
  }

  /**
   * Obtener asignaciones de una mesa específica
   * @param {string} eventoId - ID del evento
   * @param {string} mesaId - ID de la mesa
   * @returns {Promise<Object>} Asignaciones de la mesa
   */
  async obtenerAsignacionesMesa(eventoId, mesaId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Obteniendo asignaciones de mesa:", {
          eventoId,
          mesaId,
        });
      }

      if (!eventoId || !mesaId) {
        throw new Error("eventoId y mesaId son requeridos");
      }

      const response = await httpService.get(
        `${this.baseUrl}/${eventoId}/asignaciones/mesa/${mesaId}`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Asignaciones de mesa obtenidas:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al obtener asignaciones de mesa:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al obtener asignaciones de mesa",
        details: error,
        data: { asignaciones: [], total: 0 },
      };
    }
  }

  /**
   * Validar capacidad disponible en una mesa
   * @param {string} eventoId - ID del evento
   * @param {string} mesaId - ID de la mesa
   * @param {number} cantidadPersonas - Cantidad de personas a asignar
   * @returns {Promise<Object>} Resultado de validación
   */
  async validarCapacidad(eventoId, mesaId, cantidadPersonas) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Validando capacidad de mesa:", {
          eventoId,
          mesaId,
          cantidadPersonas,
        });
      }

      if (!eventoId || !mesaId) {
        throw new Error("eventoId y mesaId son requeridos");
      }

      if (!cantidadPersonas || cantidadPersonas < 1) {
        throw new Error("cantidadPersonas debe ser mayor a 0");
      }

      const response = await httpService.post(
        `${this.baseUrl}/${eventoId}/asignaciones/validar-capacidad`,
        {
          mesa_id: mesaId,
          cantidad_personas: cantidadPersonas,
        }
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Validación de capacidad:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al validar capacidad:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al validar capacidad",
        details: error,
        data: {
          tiene_capacidad: false,
          capacidad_total: 0,
          espacios_ocupados: 0,
          espacios_disponibles: 0,
        },
      };
    }
  }

  /**
   * Obtener estadísticas de asignaciones del evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Estadísticas de asignaciones
   */
  async obtenerEstadisticas(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Obteniendo estadísticas de asignaciones:", eventoId);
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.get(
        `${this.baseUrl}/${eventoId}/asignaciones/estadisticas`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Estadísticas obtenidas:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al obtener estadísticas:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al obtener estadísticas",
        details: error,
        data: {
          estadisticas: {
            total_invitados: 0,
            invitados_asignados: 0,
            invitados_sin_asignar: 0,
            mesas_ocupadas: 0,
            mesas_disponibles: 0,
            capacidad_total: 0,
            espacios_ocupados: 0,
            porcentaje_ocupacion: 0,
          },
        },
      };
    }
  }

  /**
   * Mover invitado de una mesa a otra
   * @param {string} eventoId - ID del evento
   * @param {string} asignacionId - ID de la asignación actual
   * @param {string} nuevaMesaId - ID de la nueva mesa
   * @returns {Promise<Object>} Asignación actualizada
   */
  async moverInvitado(eventoId, asignacionId, nuevaMesaId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Moviendo graduado a nueva mesa:", {
          eventoId,
          asignacionId,
          nuevaMesaId,
        });
      }

      if (!eventoId || !asignacionId || !nuevaMesaId) {
        throw new Error("eventoId, asignacionId y nuevaMesaId son requeridos");
      }

      const response = await httpService.put(
        `${this.baseUrl}/${eventoId}/asignaciones/${asignacionId}/mover`,
        { nueva_mesa_id: nuevaMesaId }
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Graduado movido exitosamente:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Graduado movido exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al mover graduado:", error);
      }

      return {
        success: false,
        error: error.userMessage || error.message || "Error al mover graduado",
        details: error,
      };
    }
  }

  /**
   * Asignación automática de invitados basada en reglas
   * @param {string} eventoId - ID del evento
   * @param {Object} reglas - Reglas de asignación automática
   * @returns {Promise<Object>} Resultado de asignación automática
   */
  async asignacionAutomatica(eventoId, reglas = {}) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Ejecutando asignación automática:", {
          eventoId,
          reglas,
        });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const payload = {
        priorizar_necesidades_especiales:
          reglas.priorizarNecesidadesEspeciales ?? true,
        optimizar_espacios: reglas.optimizarEspacios ?? true,
        permitir_mesas_incompletas: reglas.permitirMesasIncompletas ?? false,
      };

      const response = await httpService.post(
        `${this.baseUrl}/${eventoId}/asignaciones/automatica`,
        payload
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Asignación automática completada:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Asignación automática completada",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error en asignación automática:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error en asignación automática",
        details: error,
      };
    }
  }

  /**
   * Limpiar todas las asignaciones de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Resultado de la operación
   */
  async limpiarAsignaciones(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Limpiando todas las asignaciones:", eventoId);
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.delete(
        `${this.baseUrl}/${eventoId}/asignaciones/limpiar`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Asignaciones limpiadas:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Asignaciones limpiadas exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al limpiar asignaciones:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al limpiar asignaciones",
        details: error,
      };
    }
  }

  /**
   * Validar si un invitado ya tiene asignación
   * @param {string} eventoId - ID del evento
   * @param {string} invitadoId - ID del invitado
   * @returns {Promise<Object>} Información de asignación existente
   */
  async verificarAsignacionInvitado(eventoId, invitadoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Verificando asignación de graduado:", {
          eventoId,
          invitadoId,
        });
      }

      if (!eventoId || !invitadoId) {
        throw new Error("eventoId e invitadoId son requeridos");
      }

      const response = await httpService.get(
        `${this.baseUrl}/${eventoId}/asignaciones/invitado/${invitadoId}`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Verificación completada:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al verificar asignación:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al verificar asignación",
        details: error,
        data: {
          tiene_asignacion: false,
          asignacion: null,
        },
      };
    }
  }

  /**
   * Calcular estadísticas locales (sin llamar al backend)
   * @param {Array} asignaciones - Array de asignaciones
   * @param {Array} mesas - Array de mesas
   * @returns {Object} Estadísticas calculadas
   */
  calcularEstadisticasLocales(asignaciones, mesas) {
    if (!Array.isArray(asignaciones) || !Array.isArray(mesas)) {
      return {
        total_invitados: 0,
        invitados_asignados: 0,
        invitados_sin_asignar: 0,
        mesas_ocupadas: 0,
        mesas_disponibles: 0,
        capacidad_total: 0,
        espacios_ocupados: 0,
        porcentaje_ocupacion: 0,
      };
    }

    const capacidadTotal = mesas.reduce(
      (sum, mesa) => sum + (mesa.capacidad || 0),
      0
    );
    const espaciosOcupados = asignaciones.reduce(
      (sum, asig) => sum + (asig.cantidad_personas || 0),
      0
    );
    const mesasOcupadasSet = new Set(asignaciones.map((asig) => asig.mesa_id));

    return {
      total_invitados: asignaciones.length,
      invitados_asignados: asignaciones.length,
      invitados_sin_asignar: 0, // Esto vendría de otra fuente
      mesas_ocupadas: mesasOcupadasSet.size,
      mesas_disponibles: mesas.length - mesasOcupadasSet.size,
      capacidad_total: capacidadTotal,
      espacios_ocupados: espaciosOcupados,
      porcentaje_ocupacion:
        capacidadTotal > 0
          ? Math.round((espaciosOcupados / capacidadTotal) * 100)
          : 0,
    };
  }

  /**
   * Validar disponibilidad antes de asignar (local)
   * @param {Object} mesa - Mesa a validar
   * @param {Array} asignacionesActuales - Asignaciones actuales de la mesa
   * @param {number} cantidadNueva - Cantidad de personas a agregar
   * @returns {Object} Resultado de validación
   */
  validarDisponibilidadLocal(mesa, asignacionesActuales, cantidadNueva) {
    const espaciosOcupados = asignacionesActuales.reduce(
      (sum, asig) => sum + (asig.cantidad_personas || 0),
      0
    );
    const espaciosDisponibles = (mesa.capacidad || 0) - espaciosOcupados;
    const tieneCapacidad = espaciosDisponibles >= cantidadNueva;

    return {
      tiene_capacidad: tieneCapacidad,
      capacidad_total: mesa.capacidad || 0,
      espacios_ocupados: espaciosOcupados,
      espacios_disponibles: espaciosDisponibles,
      cantidad_solicitada: cantidadNueva,
      faltante: tieneCapacidad ? 0 : cantidadNueva - espaciosDisponibles,
    };
  }

  /**
   * Guardar selección de mesas y menús (sistema de turnos)
   * Endpoint: POST /api/eventos/{eventoId}/seleccion-mesas/guardar
   * @param {string} eventoId - ID del evento
   * @param {string} invitadoId - ID del invitado que hace la selección
   * @param {Object} seleccionData - Datos de la selección
   * @param {Array} seleccionData.mesas_seleccionadas - Array de mesas con asientos
   * @param {Array} seleccionData.personas - Array de personas con datos de menú y restricciones
   * @returns {Promise<Object>} Resultado de la operación
   */
  async guardarSeleccionMesas(eventoId, invitadoId, seleccionData) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Guardando selección de mesas:", { 
          eventoId, 
          invitadoId, 
          seleccionData 
        });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      if (!invitadoId) {
        throw new Error("invitadoId es requerido");
      }

      if (!seleccionData.mesas_seleccionadas || seleccionData.mesas_seleccionadas.length === 0) {
        throw new Error("Debe seleccionar al menos una mesa");
      }

      // El endpoint espera el query param "invitadoId" cuando no está autenticado
      const response = await httpService.post(
        `${this.baseUrl}/${eventoId}/seleccion-mesas/guardar?invitadoId=${invitadoId}`,
        seleccionData
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Selección guardada exitosamente:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Selección guardada exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al guardar selección:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al guardar la selección",
        details: error,
      };
    }
  }

  /**
   * Descargar Excel con todas las selecciones de mesas del evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Blob>} Archivo Excel
   */
  async descargarExcelSelecciones(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Descargando Excel de selecciones:", { eventoId });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.get(
        `${this.baseUrl}/${eventoId}/seleccion-mesas/descargar-excel`,
        { responseType: 'blob' }
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Excel descargado exitosamente");
      }

      return response;
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al descargar Excel:", error);
      }

      throw error;
    }
  }

  /**
   * Obtener estado de boletos de cortesía de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Estado de boletos (total, usados, disponibles)
   */
  async obtenerEstadoBoletosCortesia(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Obteniendo estado boletos cortesía:", { eventoId });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.get(
        `${this.baseUrl}/${eventoId}/boletos-cortesia`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Estado boletos cortesía obtenido:", response);
      }

      return response;
    } catch (error) {
      console.error("❌ Error al obtener estado boletos cortesía:", error);
      throw error;
    }
  }

  /**
   * Obtener asignaciones actuales de boletos de cortesía
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Asignaciones de cortesía
   */
  async obtenerAsignacionesCortesia(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Obteniendo asignaciones cortesía:", { eventoId });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.get(
        `${this.baseUrl}/${eventoId}/boletos-cortesia/asignaciones`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Asignaciones cortesía obtenidas:", response);
      }

      return {
        success: true,
        data: response.data || response,
        message: response.message || "Asignaciones obtenidas exitosamente",
      };
    } catch (error) {
      console.error("❌ Error al obtener asignaciones cortesía:", error);
      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al obtener asignaciones",
        details: error,
        data: { mesas_seleccionadas: [] },
      };
    }
  }

  /**
   * Configurar cantidad total de boletos de cortesía para un evento
   * @param {string} eventoId - ID del evento
   * @param {number} cantidad - Cantidad total de boletos de cortesía
   * @returns {Promise<Object>} Resultado de la configuración
   */
  async configurarBoletosCortesia(eventoId, cantidad) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Configurando boletos cortesía:", { eventoId, cantidad });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      if (typeof cantidad !== "number" || cantidad < 0) {
        throw new Error("cantidad debe ser un número mayor o igual a 0");
      }

      const response = await httpService.put(
        `${this.baseUrl}/${eventoId}/boletos-cortesia`,
        { cantidad }
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Boletos cortesía configurados:", response);
      }

      return response;
    } catch (error) {
      console.error("❌ Error al configurar boletos cortesía:", error);
      throw error;
    }
  }

  /**
   * Asignar boletos de cortesía a mesas
   * @param {string} eventoId - ID del evento
   * @param {Object} seleccion - Datos de la selección de mesas
   * @param {Array} seleccion.mesas_seleccionadas - Array de mesas seleccionadas
   * @returns {Promise<Object>} Resultado de la asignación
   */
  async asignarBoletosCortesia(eventoId, seleccion) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Asignando boletos cortesía:", { eventoId, seleccion });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      if (
        !seleccion ||
        !seleccion.mesas_seleccionadas ||
        seleccion.mesas_seleccionadas.length === 0
      ) {
        throw new Error("Se requiere al menos una mesa seleccionada");
      }

      // Usar el endpoint de guardar-admin (mismo que usa el monitor para asignaciones del admin)
      const response = await httpService.post(
        `${this.baseUrl}/${eventoId}/seleccion-mesas/guardar-admin?invitadoId=cortesia`,
        seleccion
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Boletos cortesía asignados:", response);
      }

      return response;
    } catch (error) {
      console.error("❌ Error al asignar boletos cortesía:", error);
      throw error;
    }
  }

  /**
   * Eliminar una mesa específica de las asignaciones de cortesía
   * @param {string} eventoId - ID del evento
   * @param {string} mesaId - ID de la mesa a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async eliminarMesaCortesia(eventoId, mesaId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Eliminando mesa de cortesía:", { eventoId, mesaId });
      }

      if (!eventoId || !mesaId) {
        throw new Error("eventoId y mesaId son requeridos");
      }

      const response = await httpService.delete(
        `${this.baseUrl}/${eventoId}/boletos-cortesia/mesas/${mesaId}`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Mesa de cortesía eliminada:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Mesa eliminada exitosamente",
      };
    } catch (error) {
      console.error("❌ Error al eliminar mesa de cortesía:", error);
      return {
        success: false,
        error: error.userMessage || error.message || "Error al eliminar mesa",
        details: error,
      };
    }
  }

  /**
   * Limpiar todas las asignaciones de cortesía de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Resultado de la operación
   */
  async limpiarAsignacionesCortesia(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Limpiando asignaciones de cortesía:", { eventoId });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.delete(
        `${this.baseUrl}/${eventoId}/boletos-cortesia`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Asignaciones de cortesía limpiadas:", response);
      }

      return {
        success: true,
        data: response.data,
        message:
          response.message || "Asignaciones eliminadas exitosamente",
      };
    } catch (error) {
      console.error("❌ Error al limpiar asignaciones de cortesía:", error);
      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al limpiar asignaciones",
        details: error,
      };
    }
  }
}

// Crear instancia singleton
const asignacionService = new AsignacionService();

export default asignacionService;
