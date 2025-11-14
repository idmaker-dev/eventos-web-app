import httpService from "./httpService";
import EnvConfig from "../utils/config";

/**
 * Servicio para gestionar layouts de eventos específicos
 * Maneja asignación, personalización y gestión de configuraciones de layout por evento
 */
class LayoutEventoService {
  constructor() {
    this.baseUrl = "/eventos";
  }

  /**
   * Asignar configuración base del lugar a un evento
   * @param {string} eventoId - ID del evento
   * @param {string} configuracionLugarId - ID de la configuración del lugar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async asignarConfiguracionBase(eventoId, configuracionLugarId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Asignando configuración base al evento:", {
          eventoId,
          configuracionLugarId,
        });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      if (!configuracionLugarId) {
        throw new Error("configuracionLugarId es requerido");
      }

      const response = await httpService.post(
        `${this.baseUrl}/${eventoId}/layout/asignar`,
        { configuracion_lugar_id: configuracionLugarId }
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Configuración base asignada:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Configuración asignada exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al asignar configuración base:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al asignar configuración",
        details: error,
      };
    }
  }

  /**
   * Obtener layout de un evento (puede ser base o personalizado)
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Layout del evento
   */
  async obtenerLayout(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Obteniendo layout del evento:", eventoId);
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.get(
        `${this.baseUrl}/${eventoId}/layout`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Layout obtenido:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al obtener layout:", error);
      }

      return {
        success: false,
        error: error.userMessage || error.message || "Error al obtener layout",
        details: error,
        data: {
          layout: {
            tiene_configuracion: false,
            evento_id: eventoId,
            configuracion_lugar_base_id: null,
            personalizado: false,
            elementos: [],
            totalMesas: 0,
          },
        },
      };
    }
  }

  /**
   * Obtener disponibilidad de mesas del evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Layout con información de disponibilidad de cada mesa
   */
  async obtenerDisponibilidad(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log(
          "🔄 Obteniendo disponibilidad de mesas del evento:",
          eventoId
        );
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.get(
        `${this.baseUrl}/${eventoId}/seleccion-mesas/disponibilidad`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Disponibilidad obtenida:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Disponibilidad obtenida exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al obtener disponibilidad:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al obtener disponibilidad",
        details: error,
      };
    }
  }

  /**
   * Personalizar layout de un evento
   * @param {string} eventoId - ID del evento
   * @param {Array} elementos - Array de elementos personalizados
   * @returns {Promise<Object>} Layout personalizado actualizado
   */
  async personalizarLayout(eventoId, elementos) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Personalizando layout del evento:", {
          eventoId,
          totalElementos: elementos.length,
        });
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      if (!Array.isArray(elementos)) {
        throw new Error("Los elementos deben ser un array");
      }

      // Validar estructura de elementos
      const validacionElementos = this._validarElementos(elementos);
      if (!validacionElementos.valido) {
        throw new Error(
          `Elementos inválidos: ${validacionElementos.errores.join(", ")}`
        );
      }

      const response = await httpService.put(
        `${this.baseUrl}/${eventoId}/layout/personalizar`,
        { elementos }
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Layout personalizado exitosamente:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Layout personalizado exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al personalizar layout:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al personalizar layout",
        details: error,
      };
    }
  }

  /**
   * Resetear layout del evento a la configuración base del lugar
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Resultado de la operación
   */
  async resetearLayout(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Reseteando layout del evento:", eventoId);
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.post(
        `${this.baseUrl}/${eventoId}/layout/resetear`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Layout reseteado exitosamente:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Layout reseteado a configuración base",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al resetear layout:", error);
      }

      return {
        success: false,
        error: error.userMessage || error.message || "Error al resetear layout",
        details: error,
      };
    }
  }

  /**
   * Eliminar configuración de layout de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Resultado de la operación
   */
  async eliminarLayout(eventoId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Eliminando layout del evento:", eventoId);
      }

      if (!eventoId) {
        throw new Error("eventoId es requerido");
      }

      const response = await httpService.delete(
        `${this.baseUrl}/${eventoId}/layout`
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Layout eliminado exitosamente:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Layout eliminado exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al eliminar layout:", error);
      }

      return {
        success: false,
        error: error.userMessage || error.message || "Error al eliminar layout",
        details: error,
      };
    }
  }

  /**
   * Actualizar posición de un elemento en el layout personalizado
   * @param {string} eventoId - ID del evento
   * @param {string} elementoId - ID del elemento a mover
   * @param {Object} nuevaPosicion - Nueva posición {x, y}
   * @param {Array} todosElementos - Array completo de elementos actuales
   * @returns {Promise<Object>} Layout actualizado
   */
  async actualizarPosicionElemento(
    eventoId,
    elementoId,
    nuevaPosicion,
    todosElementos
  ) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Actualizando posición de elemento:", {
          eventoId,
          elementoId,
          nuevaPosicion,
        });
      }

      // Actualizar el elemento en el array
      const elementosActualizados = todosElementos.map((elemento) =>
        elemento.id === elementoId
          ? { ...elemento, position: nuevaPosicion }
          : elemento
      );

      // Guardar layout completo personalizado
      return await this.personalizarLayout(eventoId, elementosActualizados);
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al actualizar posición:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al actualizar posición",
        details: error,
      };
    }
  }

  /**
   * Agregar elemento al layout personalizado
   * @param {string} eventoId - ID del evento
   * @param {Object} nuevoElemento - Nuevo elemento a agregar
   * @param {Array} elementosActuales - Array de elementos actuales
   * @returns {Promise<Object>} Layout actualizado
   */
  async agregarElemento(eventoId, nuevoElemento, elementosActuales) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Agregando elemento al layout:", {
          eventoId,
          nuevoElemento,
        });
      }

      // Validar nuevo elemento
      const validacionElementos = this._validarElementos([nuevoElemento]);
      if (!validacionElementos.valido) {
        throw new Error(
          `Elemento inválido: ${validacionElementos.errores.join(", ")}`
        );
      }

      const elementosActualizados = [...elementosActuales, nuevoElemento];

      return await this.personalizarLayout(eventoId, elementosActualizados);
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al agregar elemento:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al agregar elemento",
        details: error,
      };
    }
  }

  /**
   * Eliminar elemento del layout personalizado
   * @param {string} eventoId - ID del evento
   * @param {string} elementoId - ID del elemento a eliminar
   * @param {Array} elementosActuales - Array de elementos actuales
   * @returns {Promise<Object>} Layout actualizado
   */
  async eliminarElemento(eventoId, elementoId, elementosActuales) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Eliminando elemento del layout:", {
          eventoId,
          elementoId,
        });
      }

      const elementosActualizados = elementosActuales.filter(
        (elemento) => elemento.id !== elementoId
      );

      return await this.personalizarLayout(eventoId, elementosActualizados);
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al eliminar elemento:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al eliminar elemento",
        details: error,
      };
    }
  }

  /**
   * Actualizar propiedades de un elemento (capacidad, número, etc.)
   * @param {string} eventoId - ID del evento
   * @param {string} elementoId - ID del elemento
   * @param {Object} propiedades - Propiedades a actualizar
   * @param {Array} elementosActuales - Array de elementos actuales
   * @returns {Promise<Object>} Layout actualizado
   */
  async actualizarPropiedadesElemento(
    eventoId,
    elementoId,
    propiedades,
    elementosActuales
  ) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Actualizando propiedades de elemento:", {
          eventoId,
          elementoId,
          propiedades,
        });
      }

      const elementosActualizados = elementosActuales.map((elemento) =>
        elemento.id === elementoId ? { ...elemento, ...propiedades } : elemento
      );

      return await this.personalizarLayout(eventoId, elementosActualizados);
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al actualizar propiedades:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al actualizar propiedades",
        details: error,
      };
    }
  }

  /**
   * Validar estructura de elementos del layout
   * @private
   * @param {Array} elementos - Array de elementos a validar
   * @returns {Object} Resultado de la validación
   */
  _validarElementos(elementos) {
    const errores = [];
    const tiposValidos = [
      "mesa",
      "mesaRectangular",
      "mesa-principal",
      "entrada",
      "barra",
      "pistaBaileRedonda",
      "pistaBaileCuadrada",
      "escenario",
      "buffet",
      "cocina",
      "bano",
      "decoracion",
    ];
    const idsVistos = new Set();

    elementos.forEach((elemento, index) => {
      // Validar ID único
      if (!elemento.id) {
        errores.push(`Elemento en índice ${index} no tiene ID`);
      } else if (idsVistos.has(elemento.id)) {
        errores.push(`ID duplicado: ${elemento.id}`);
      } else {
        idsVistos.add(elemento.id);
      }

      // Validar tipo
      if (!elemento.type) {
        errores.push(`Elemento ${elemento.id || index} no tiene type`);
      } else if (!tiposValidos.includes(elemento.type)) {
        errores.push(`Tipo inválido: ${elemento.type}`);
      }

      // Validar position
      if (!elemento.position) {
        errores.push(`Elemento ${elemento.id || index} no tiene position`);
      } else {
        if (typeof elemento.position.x !== "number") {
          errores.push(
            `Elemento ${elemento.id || index} - position.x debe ser número`
          );
        }
        if (typeof elemento.position.y !== "number") {
          errores.push(
            `Elemento ${elemento.id || index} - position.y debe ser número`
          );
        }
      }

      // Validaciones específicas por tipo
      if (elemento.type === "mesa" || elemento.type === "mesaRectangular") {
        if (typeof elemento.numero !== "number") {
          errores.push(`Mesa ${elemento.id || index} - numero debe ser número`);
        }
        if (typeof elemento.capacidad !== "number" || elemento.capacidad <= 0) {
          errores.push(
            `Mesa ${elemento.id || index} - capacidad debe ser número positivo`
          );
        }
        if (typeof elemento.invitados !== "number" || elemento.invitados < 0) {
          errores.push(
            `Mesa ${elemento.id || index} - invitados debe ser número >= 0`
          );
        }
      }

      if (elemento.type === "mesa-principal") {
        if (!elemento.capacidad || typeof elemento.capacidad !== "number") {
          errores.push(
            `Mesa principal ${elemento.id || index} - capacidad requerida`
          );
        }
      }
    });

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  /**
   * Calcular estadísticas del layout
   * @param {Array} elementos - Array de elementos
   * @returns {Object} Estadísticas calculadas
   */
  calcularEstadisticasLayout(elementos) {
    if (!Array.isArray(elementos)) {
      return {
        totalMesas: 0,
        capacidadTotal: 0,
        espaciosOcupados: 0,
        espaciosDisponibles: 0,
        porcentajeOcupacion: 0,
      };
    }

    const mesas = elementos.filter(
      (el) => el.type === "mesa" || el.type === "mesaRectangular"
    );

    const capacidadTotal = mesas.reduce(
      (sum, mesa) => sum + (mesa.capacidad || 0),
      0
    );
    const espaciosOcupados = mesas.reduce(
      (sum, mesa) => sum + (mesa.invitados || 0),
      0
    );
    const espaciosDisponibles = capacidadTotal - espaciosOcupados;
    const porcentajeOcupacion =
      capacidadTotal > 0
        ? Math.round((espaciosOcupados / capacidadTotal) * 100)
        : 0;

    return {
      totalMesas: mesas.length,
      capacidadTotal,
      espaciosOcupados,
      espaciosDisponibles,
      porcentajeOcupacion,
      elementos: {
        mesas: mesas.length,
        entradas: elementos.filter((el) => el.type === "entrada").length,
        barras: elementos.filter((el) => el.type === "barra").length,
        escenarios: elementos.filter((el) => el.type === "escenario").length,
        buffets: elementos.filter((el) => el.type === "buffet").length,
        pistasBaile: elementos.filter(
          (el) =>
            el.type === "pistaBaileRedonda" || el.type === "pistaBaileCuadrada"
        ).length,
      },
    };
  }

  /**
   * Verificar si un layout está personalizado
   * @param {Object} layout - Layout a verificar
   * @returns {boolean} True si está personalizado
   */
  esLayoutPersonalizado(layout) {
    return layout?.personalizado === true;
  }

  /**
   * Verificar si un evento tiene layout configurado
   * @param {Object} layout - Layout a verificar
   * @returns {boolean} True si tiene layout
   */
  tieneLayoutConfigurado(layout) {
    return layout?.tiene_configuracion === true;
  }
}

// Crear instancia singleton
const layoutEventoService = new LayoutEventoService();

export default layoutEventoService;
