import { useState, useCallback, useEffect } from "react";
import layoutService from "../services/layoutService";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para gestionar configuraciones de layout de lugares
 * Proporciona funcionalidades CRUD y manejo de estado para layouts/salones
 */
export const useLayouts = (lugarId = null) => {
  // Estados principales
  const [configuraciones, setConfiguraciones] = useState([]);
  const [configuracionActual, setConfiguracionActual] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado de error
  const [error, setError] = useState(null);

  /**
   * Cargar todas las configuraciones de un lugar
   */
  const cargarConfiguraciones = useCallback(
    async (incluirInactivas = false) => {
      if (!lugarId) {
        if (EnvConfig.DEBUG_MODE) {
          console.warn("⚠️ No se puede cargar configuraciones sin lugarId");
        }
        setConfiguraciones([]);
        return { success: false, error: "lugarId requerido" };
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await layoutService.listarConfiguraciones(
          lugarId,
          incluirInactivas
        );

        if (result.success) {
          setConfiguraciones(result.data.configuraciones || []);

          if (EnvConfig.DEBUG_MODE) {
            console.log(
              "✅ Configuraciones cargadas:",
              result.data.configuraciones?.length
            );
          }

          return result;
        } else {
          setError(result.error);
          setConfiguraciones([]);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al cargar configuraciones";
        setError(errorMessage);
        setConfiguraciones([]);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al cargar configuraciones:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [lugarId]
  );

  /**
   * Obtener una configuración específica
   */
  const obtenerConfiguracion = useCallback(
    async (configId) => {
      if (!lugarId || !configId) {
        const error = "lugarId y configId son requeridos";
        setError(error);
        return { success: false, error };
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await layoutService.obtenerConfiguracion(
          configId,
          lugarId
        );

        if (result.success) {
          setConfiguracionActual(result.data.configuracion);

          if (EnvConfig.DEBUG_MODE) {
            console.log(
              "✅ Configuración obtenida:",
              result.data.configuracion
            );
          }

          return result;
        } else {
          setError(result.error);
          setConfiguracionActual(null);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al obtener configuración";
        setError(errorMessage);
        setConfiguracionActual(null);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al obtener configuración:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [lugarId]
  );

  /**
   * Crear nueva configuración
   */
  const crearConfiguracion = useCallback(
    async (configuracion) => {
      if (!lugarId) {
        const error = "lugarId es requerido";
        setError(error);
        return { success: false, error };
      }

      setIsCreating(true);
      setError(null);

      try {
        // Validar antes de enviar
        const validacion = layoutService.validarConfiguracion(configuracion);
        if (!validacion.valido) {
          const error = `Datos inválidos: ${validacion.errores.join(", ")}`;
          setError(error);
          setIsCreating(false);
          return { success: false, error };
        }

        const result = await layoutService.crearConfiguracion(
          lugarId,
          configuracion
        );

        if (result.success) {
          // Actualizar lista de configuraciones
          setConfiguraciones((prev) => [...prev, result.data.configuracion]);

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Configuración creada:", result.data.configuracion);
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al crear configuración";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al crear configuración:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsCreating(false);
      }
    },
    [lugarId]
  );

  /**
   * Actualizar configuración existente
   */
  const actualizarConfiguracion = useCallback(
    async (configId, datosActualizados) => {
      if (!lugarId || !configId) {
        const error = "lugarId y configId son requeridos";
        setError(error);
        return { success: false, error };
      }

      setIsUpdating(true);
      setError(null);

      try {
        const result = await layoutService.actualizarConfiguracion(
          configId,
          lugarId,
          datosActualizados
        );

        if (result.success) {
          // Actualizar en la lista
          setConfiguraciones((prev) =>
            prev.map((config) =>
              config.id === configId ? result.data.configuracion : config
            )
          );

          // Actualizar actual si es la misma
          if (configuracionActual?.id === configId) {
            setConfiguracionActual(result.data.configuracion);
          }

          if (EnvConfig.DEBUG_MODE) {
            console.log(
              "✅ Configuración actualizada:",
              result.data.configuracion
            );
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al actualizar configuración";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al actualizar configuración:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsUpdating(false);
      }
    },
    [lugarId, configuracionActual]
  );

  /**
   * Desactivar configuración
   */
  const desactivarConfiguracion = useCallback(
    async (configId) => {
      if (!lugarId || !configId) {
        const error = "lugarId y configId son requeridos";
        setError(error);
        return { success: false, error };
      }

      setIsDeleting(true);
      setError(null);

      try {
        const result = await layoutService.desactivarConfiguracion(
          configId,
          lugarId
        );

        if (result.success) {
          // Remover de la lista o marcar como inactivo
          setConfiguraciones((prev) =>
            prev.map((config) =>
              config.id === configId ? { ...config, activo: false } : config
            )
          );

          // Limpiar actual si es la misma
          if (configuracionActual?.id === configId) {
            setConfiguracionActual(null);
          }

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Configuración desactivada:", configId);
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al desactivar configuración";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al desactivar configuración:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsDeleting(false);
      }
    },
    [lugarId, configuracionActual]
  );

  /**
   * Duplicar configuración
   */
  const duplicarConfiguracion = useCallback(
    async (configId, nuevoNombre) => {
      if (!lugarId || !configId) {
        const error = "lugarId y configId son requeridos";
        setError(error);
        return { success: false, error };
      }

      setIsCreating(true);
      setError(null);

      try {
        const result = await layoutService.duplicarConfiguracion(
          configId,
          lugarId,
          nuevoNombre
        );

        if (result.success) {
          // Agregar a la lista
          setConfiguraciones((prev) => [...prev, result.data.configuracion]);

          if (EnvConfig.DEBUG_MODE) {
            console.log(
              "✅ Configuración duplicada:",
              result.data.configuracion
            );
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al duplicar configuración";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al duplicar configuración:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsCreating(false);
      }
    },
    [lugarId]
  );

  /**
   * Obtener estadísticas de configuraciones
   */
  const cargarEstadisticas = useCallback(async () => {
    if (!lugarId) {
      return { success: false, error: "lugarId requerido" };
    }

    try {
      const result = await layoutService.obtenerEstadisticas(lugarId);

      if (result.success) {
        setEstadisticas(result.data.estadisticas);

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Estadísticas cargadas:", result.data.estadisticas);
        }

        return result;
      } else {
        setEstadisticas(null);
        return result;
      }
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al cargar estadísticas:", error);
      }

      return { success: false, error: "Error al cargar estadísticas" };
    }
  }, [lugarId]);

  /**
   * Limpiar error
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpiar configuración actual
   */
  const limpiarConfiguracionActual = useCallback(() => {
    setConfiguracionActual(null);
  }, []);

  /**
   * Limpiar todo el estado
   */
  const limpiarTodo = useCallback(() => {
    setConfiguraciones([]);
    setConfiguracionActual(null);
    setEstadisticas(null);
    setError(null);
  }, []);

  // Cargar configuraciones automáticamente cuando cambia el lugarId
  useEffect(() => {
    if (lugarId) {
      cargarConfiguraciones();
      cargarEstadisticas();
    } else {
      limpiarTodo();
    }
  }, [lugarId, cargarConfiguraciones, cargarEstadisticas, limpiarTodo]);

  // Retornar API del hook
  return {
    // Estados
    configuraciones,
    configuracionActual,
    estadisticas,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,

    // Métodos CRUD
    cargarConfiguraciones,
    obtenerConfiguracion,
    crearConfiguracion,
    actualizarConfiguracion,
    desactivarConfiguracion,
    duplicarConfiguracion,

    // Métodos adicionales
    cargarEstadisticas,
    limpiarError,
    limpiarConfiguracionActual,
    limpiarTodo,

    // Métodos de utilidad
    obtenerConfiguracionPorId: (id) =>
      configuraciones.find((config) => config.id === id),
    obtenerConfiguracionesActivas: () =>
      configuraciones.filter((config) => config.activo !== false),
    cantidadConfiguraciones: configuraciones.length,
    tieneConfiguraciones: configuraciones.length > 0,

    // Utilidades del servicio expuestas
    contarMesas: layoutService.contarMesas,
    validarConfiguracion: layoutService.validarConfiguracion,
  };
};

export default useLayouts;
