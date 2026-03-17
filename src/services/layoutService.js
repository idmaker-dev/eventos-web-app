import httpService from "./httpService";
import EnvConfig from "../utils/config";

/**
 * Servicio para gestionar configuraciones de layout (salones) de lugares
 * Maneja todas las operaciones CRUD relacionadas con configuraciones de layout
 */
class LayoutService {
  constructor() {
    this.baseUrl = "/lugares";
    this.configUrl = "/configuraciones";
  }

  /**
   * Crear una nueva configuración (salón) para un lugar
   * @param {string} lugarId - ID del lugar
   * @param {Object} configuracion - Datos de la configuración
   * @param {string} configuracion.nombre - Nombre del salón
   * @param {string} configuracion.descripcion - Descripción del salón
   * @param {number} configuracion.totalMesas - Total de mesas en el salón
   * @param {Array} configuracion.elementos - Array de elementos del layout
   * @returns {Promise<Object>} Resultado de la operación
   */
  async crearConfiguracion(lugarId, configuracion) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Creando configuración de lugar:", {
          lugarId,
          configuracion,
        });
      }

      // Validar datos requeridos
      if (!lugarId) {
        throw new Error("lugarId es requerido");
      }

      if (!configuracion.nombre?.trim()) {
        throw new Error("El nombre de la configuración es requerido");
      }

      if (!Array.isArray(configuracion.elementos)) {
        throw new Error("Los elementos deben ser un array");
      }

      // Validar estructura de elementos
      const validacionElementos = this._validarElementos(
        configuracion.elementos
      );
      if (!validacionElementos.valido) {
        throw new Error(
          `Elementos inválidos: ${validacionElementos.errores.join(", ")}`
        );
      }

      // Contar mesas reales
      const mesasReales = configuracion.elementos.filter(
        (el) => el.type === "mesa" || el.type === "mesaRectangular"
      ).length;

      // Validar que totalMesas coincida con mesas reales
      if (
        configuracion.totalMesas &&
        configuracion.totalMesas !== mesasReales
      ) {
        console.warn(
          `⚠️ totalMesas (${configuracion.totalMesas}) no coincide con mesas reales (${mesasReales}). Se ajustará automáticamente.`
        );
      }

      const payload = {
        ...configuracion,
        totalMesas: mesasReales, // Usar el conteo real
      };

      const response = await httpService.post(
        `${this.baseUrl}/${lugarId}/configuraciones`,
        payload
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Configuración creada exitosamente:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Configuración creada exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al crear configuración:", error);
      }

      return {
        success: false,
        error:
          error.userMessage || error.message || "Error al crear configuración",
        details: error,
      };
    }
  }

  /**
   * Listar todas las configuraciones de un lugar
   * @param {string} lugarId - ID del lugar
   * @param {boolean} incluirInactivas - Si incluir configuraciones inactivas
   * @returns {Promise<Object>} Lista de configuraciones
   */
  async listarConfiguraciones(lugarId, incluirInactivas = false) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Listando configuraciones del lugar:", lugarId);
      }

      if (!lugarId) {
        throw new Error("lugarId es requerido");
      }

      const params = incluirInactivas ? { incluir_inactivas: true } : {};

      const response = await httpService.get(
        `${this.baseUrl}/${lugarId}/configuraciones`,
        { params }
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Configuraciones listadas:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al listar configuraciones:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al listar configuraciones",
        details: error,
        data: { configuraciones: [], total: 0 },
      };
    }
  }

  /**
   * Obtener una configuración específica
   * @param {string} configId - ID de la configuración
   * @param {string} lugarId - ID del lugar (requerido para partition key)
   * @returns {Promise<Object>} Configuración completa
   */
  async obtenerConfiguracion(configId, lugarId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Obteniendo configuración:", { configId, lugarId });
      }

      if (!configId || !lugarId) {
        throw new Error("configId y lugarId son requeridos");
      }

      const response = await httpService.get(`${this.configUrl}/${configId}`, {
        params: { lugar_id: lugarId },
      });

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Configuración obtenida:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al obtener configuración:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al obtener configuración",
        details: error,
      };
    }
  }

  /**
   * Actualizar una configuración existente
   * @param {string} configId - ID de la configuración
   * @param {string} lugarId - ID del lugar
   * @param {Object} datosActualizados - Datos a actualizar
   * @returns {Promise<Object>} Configuración actualizada
   */
  async actualizarConfiguracion(configId, lugarId, datosActualizados) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Actualizando configuración:", {
          configId,
          lugarId,
          datosActualizados,
        });
      }

      if (!configId || !lugarId) {
        throw new Error("configId y lugarId son requeridos");
      }

      // Si se están actualizando elementos, validarlos
      if (datosActualizados.elementos) {
        const validacionElementos = this._validarElementos(
          datosActualizados.elementos
        );
        if (!validacionElementos.valido) {
          throw new Error(
            `Elementos inválidos: ${validacionElementos.errores.join(", ")}`
          );
        }

        // Ajustar totalMesas automáticamente
        const mesasReales = datosActualizados.elementos.filter(
          (el) => el.type === "mesa" || el.type === "mesaRectangular"
        ).length;
        datosActualizados.totalMesas = mesasReales;
      }

      const response = await httpService.put(
        `${this.configUrl}/${configId}?lugar_id=${lugarId}`,
        datosActualizados
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Configuración actualizada:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Configuración actualizada exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al actualizar configuración:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al actualizar configuración",
        details: error,
      };
    }
  }

  /**
   * Desactivar una configuración (soft delete)
   * @param {string} configId - ID de la configuración
   * @param {string} lugarId - ID del lugar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async desactivarConfiguracion(configId, lugarId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Desactivando configuración:", { configId, lugarId });
      }

      if (!configId || !lugarId) {
        throw new Error("configId y lugarId son requeridos");
      }

      const response = await httpService.delete(
        `${this.configUrl}/${configId}`,
        { params: { lugar_id: lugarId } }
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Configuración desactivada:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Configuración desactivada exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al desactivar configuración:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al desactivar configuración",
        details: error,
      };
    }
  }

  /**
   * Duplicar una configuración existente
   * @param {string} configId - ID de la configuración a duplicar
   * @param {string} lugarId - ID del lugar
   * @param {string} nuevoNombre - Nombre para la nueva configuración
   * @returns {Promise<Object>} Nueva configuración creada
   */
  async duplicarConfiguracion(configId, lugarId, nuevoNombre) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Duplicando configuración:", {
          configId,
          lugarId,
          nuevoNombre,
        });
      }

      if (!configId || !lugarId) {
        throw new Error("configId y lugarId son requeridos");
      }

      if (!nuevoNombre?.trim()) {
        throw new Error("El nuevo nombre es requerido");
      }

      const response = await httpService.post(
        `${this.configUrl}/${configId}/duplicar`,
        { nuevo_nombre: nuevoNombre },
        { params: { lugar_id: lugarId } }
      );

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ Configuración duplicada:", response);
      }

      return {
        success: true,
        data: response.data,
        message: response.message || "Configuración duplicada exitosamente",
      };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al duplicar configuración:", error);
      }

      return {
        success: false,
        error:
          error.userMessage ||
          error.message ||
          "Error al duplicar configuración",
        details: error,
      };
    }
  }

  /**
   * Obtener estadísticas de configuraciones de un lugar
   * @param {string} lugarId - ID del lugar
   * @returns {Promise<Object>} Estadísticas de configuraciones
   */
  async obtenerEstadisticas(lugarId) {
    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Obteniendo estadísticas de configuraciones:", lugarId);
      }

      if (!lugarId) {
        throw new Error("lugarId es requerido");
      }

      const response = await httpService.get(
        `${this.baseUrl}/${lugarId}/configuraciones/estadisticas`
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
            total_configuraciones: 0,
            activas: 0,
            inactivas: 0,
            total_mesas_disponibles: 0,
          },
        },
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
      "pistaRedonda",
      "pistaBaileCuadrada",
      "pistaBaileRectangular",
      "pistaRectangular",
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
            `Mesa ${elemento.id || index} - graduados debe ser número >= 0`
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
   * Contar total de mesas en un array de elementos
   * @param {Array} elementos - Array de elementos
   * @returns {number} Total de mesas
   */
  contarMesas(elementos) {
    if (!Array.isArray(elementos)) return 0;
    return elementos.filter(
      (el) => el.type === "mesa" || el.type === "mesaRectangular"
    ).length;
  }

  /**
   * Validar datos de configuración antes de enviar
   * @param {Object} configuracion - Configuración a validar
   * @returns {Object} Resultado de validación
   */
  validarConfiguracion(configuracion) {
    const errores = [];

    if (!configuracion.nombre?.trim()) {
      errores.push("El nombre es requerido");
    }

    if (!Array.isArray(configuracion.elementos)) {
      errores.push("Los elementos deben ser un array");
    } else {
      const validacionElementos = this._validarElementos(
        configuracion.elementos
      );
      if (!validacionElementos.valido) {
        errores.push(...validacionElementos.errores);
      }
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }
}

// Crear instancia singleton
const layoutService = new LayoutService();

export default layoutService;
