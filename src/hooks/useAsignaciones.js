import { useState, useCallback, useEffect } from "react";
import asignacionService from "../services/asignacionService";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para gestionar asignaciones de invitados a mesas
 * Proporciona funcionalidades CRUD, validaciones y estadísticas en tiempo real
 */
export const useAsignaciones = (eventoId = null) => {
  // Estados principales
  const [asignaciones, setAsignaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Estado de error
  const [error, setError] = useState(null);

  // Cache para validaciones
  const [validacionesCache, setValidacionesCache] = useState({});

  /**
   * Cargar estadísticas del evento
   */
  const cargarEstadisticas = useCallback(async () => {
    if (!eventoId) {
      return { success: false, error: "eventoId requerido" };
    }

    try {
      const result = await asignacionService.obtenerEstadisticas(eventoId);

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
  }, [eventoId]);

  /**
   * Cargar todas las asignaciones del evento
   */
  const cargarAsignaciones = useCallback(async () => {
    if (!eventoId) {
      if (EnvConfig.DEBUG_MODE) {
        console.warn("⚠️ No se puede cargar asignaciones sin eventoId");
      }
      setAsignaciones([]);
      return { success: false, error: "eventoId requerido" };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await asignacionService.listarAsignaciones(eventoId);

      if (result.success) {
        setAsignaciones(result.data.asignaciones || []);

        if (EnvConfig.DEBUG_MODE) {
          console.log(
            "✅ Asignaciones cargadas:",
            result.data.asignaciones?.length
          );
        }

        return result;
      } else {
        setError(result.error);
        setAsignaciones([]);
        return result;
      }
    } catch (error) {
      const errorMessage = "Error inesperado al cargar asignaciones";
      setError(errorMessage);
      setAsignaciones([]);

      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al cargar asignaciones:", error);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [eventoId]);

  /**
   * Crear nueva asignación
   */
  const crearAsignacion = useCallback(
    async (asignacion) => {
      if (!eventoId) {
        const error = "eventoId es requerido";
        setError(error);
        return { success: false, error };
      }

      setIsCreating(true);
      setError(null);

      try {
        const result = await asignacionService.crearAsignacion(
          eventoId,
          asignacion
        );

        if (result.success) {
          // Actualizar lista de asignaciones
          setAsignaciones((prev) => [...prev, result.data.asignacion]);

          // Recargar estadísticas
          await cargarEstadisticas();

          // Limpiar cache de validaciones
          setValidacionesCache({});

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Asignación creada:", result.data.asignacion);
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al crear asignación";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al crear asignación:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsCreating(false);
      }
    },
    [eventoId, cargarEstadisticas]
  );

  /**
   * Actualizar asignación existente
   */
  const actualizarAsignacion = useCallback(
    async (asignacionId, datosActualizados) => {
      if (!eventoId || !asignacionId) {
        const error = "eventoId y asignacionId son requeridos";
        setError(error);
        return { success: false, error };
      }

      setIsUpdating(true);
      setError(null);

      try {
        const result = await asignacionService.actualizarAsignacion(
          eventoId,
          asignacionId,
          datosActualizados
        );

        if (result.success) {
          // Actualizar en la lista
          setAsignaciones((prev) =>
            prev.map((asig) =>
              asig.id === asignacionId ? result.data.asignacion : asig
            )
          );

          // Recargar estadísticas si cambió la mesa
          if (datosActualizados.mesa_id) {
            await cargarEstadisticas();
            setValidacionesCache({});
          }

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Asignación actualizada:", result.data.asignacion);
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al actualizar asignación";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al actualizar asignación:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsUpdating(false);
      }
    },
    [eventoId, cargarEstadisticas]
  );

  /**
   * Eliminar asignación
   */
  const eliminarAsignacion = useCallback(
    async (asignacionId) => {
      if (!eventoId || !asignacionId) {
        const error = "eventoId y asignacionId son requeridos";
        setError(error);
        return { success: false, error };
      }

      setIsDeleting(true);
      setError(null);

      try {
        const result = await asignacionService.eliminarAsignacion(
          eventoId,
          asignacionId
        );

        if (result.success) {
          // Remover de la lista
          setAsignaciones((prev) =>
            prev.filter((asig) => asig.id !== asignacionId)
          );

          // Recargar estadísticas
          await cargarEstadisticas();

          // Limpiar cache de validaciones
          setValidacionesCache({});

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Asignación eliminada:", asignacionId);
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al eliminar asignación";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al eliminar asignación:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsDeleting(false);
      }
    },
    [eventoId, cargarEstadisticas]
  );

  /**
   * Obtener asignaciones de una mesa específica
   */
  const obtenerAsignacionesMesa = useCallback(
    async (mesaId) => {
      if (!eventoId || !mesaId) {
        return { success: false, error: "eventoId y mesaId requeridos" };
      }

      try {
        const result = await asignacionService.obtenerAsignacionesMesa(
          eventoId,
          mesaId
        );

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Asignaciones de mesa obtenidas:", result);
        }

        return result;
      } catch (error) {
        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al obtener asignaciones de mesa:", error);
        }

        return {
          success: false,
          error: "Error al obtener asignaciones de mesa",
        };
      }
    },
    [eventoId]
  );

  /**
   * Validar capacidad de una mesa
   */
  const validarCapacidad = useCallback(
    async (mesaId, cantidadPersonas) => {
      if (!eventoId || !mesaId) {
        return {
          success: false,
          error: "eventoId y mesaId requeridos",
          data: { tiene_capacidad: false },
        };
      }

      // Revisar cache primero
      const cacheKey = `${mesaId}-${cantidadPersonas}`;
      if (validacionesCache[cacheKey]) {
        if (EnvConfig.DEBUG_MODE) {
          console.log("📦 Usando validación en cache:", cacheKey);
        }
        return validacionesCache[cacheKey];
      }

      setIsValidating(true);

      try {
        const result = await asignacionService.validarCapacidad(
          eventoId,
          mesaId,
          cantidadPersonas
        );

        // Guardar en cache
        setValidacionesCache((prev) => ({
          ...prev,
          [cacheKey]: result,
        }));

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Capacidad validada:", result);
        }

        return result;
      } catch (error) {
        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al validar capacidad:", error);
        }

        return {
          success: false,
          error: "Error al validar capacidad",
          data: { tiene_capacidad: false },
        };
      } finally {
        setIsValidating(false);
      }
    },
    [eventoId, validacionesCache]
  );

  /**
   * Mover invitado a otra mesa
   */
  const moverInvitado = useCallback(
    async (asignacionId, nuevaMesaId) => {
      if (!eventoId || !asignacionId || !nuevaMesaId) {
        const error = "eventoId, asignacionId y nuevaMesaId son requeridos";
        setError(error);
        return { success: false, error };
      }

      setIsUpdating(true);
      setError(null);

      try {
        const result = await asignacionService.moverInvitado(
          eventoId,
          asignacionId,
          nuevaMesaId
        );

        if (result.success) {
          // Actualizar en la lista
          setAsignaciones((prev) =>
            prev.map((asig) =>
              asig.id === asignacionId ? result.data.asignacion : asig
            )
          );

          // Recargar estadísticas
          await cargarEstadisticas();

          // Limpiar cache de validaciones
          setValidacionesCache({});

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Invitado movido exitosamente");
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al mover graduado";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al mover invitado:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsUpdating(false);
      }
    },
    [eventoId, cargarEstadisticas]
  );

  /**
   * Ejecutar asignación automática
   */
  const ejecutarAsignacionAutomatica = useCallback(
    async (reglas = {}) => {
      if (!eventoId) {
        const error = "eventoId es requerido";
        setError(error);
        return { success: false, error };
      }

      setIsCreating(true);
      setError(null);

      try {
        const result = await asignacionService.asignacionAutomatica(
          eventoId,
          reglas
        );

        if (result.success) {
          // Recargar todas las asignaciones
          await cargarAsignaciones();
          await cargarEstadisticas();

          // Limpiar cache de validaciones
          setValidacionesCache({});

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Asignación automática completada");
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado en asignación automática";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error en asignación automática:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsCreating(false);
      }
    },
    [eventoId, cargarAsignaciones, cargarEstadisticas]
  );

  /**
   * Limpiar todas las asignaciones
   */
  const limpiarAsignaciones = useCallback(async () => {
    if (!eventoId) {
      const error = "eventoId es requerido";
      setError(error);
      return { success: false, error };
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await asignacionService.limpiarAsignaciones(eventoId);

      if (result.success) {
        setAsignaciones([]);
        await cargarEstadisticas();
        setValidacionesCache({});

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Asignaciones limpiadas");
        }

        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (error) {
      const errorMessage = "Error inesperado al limpiar asignaciones";
      setError(errorMessage);

      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al limpiar asignaciones:", error);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsDeleting(false);
    }
  }, [eventoId, cargarEstadisticas]);

  /**
   * Verificar si un invitado tiene asignación
   */
  const verificarAsignacionInvitado = useCallback(
    async (invitadoId) => {
      if (!eventoId || !invitadoId) {
        return { success: false, error: "eventoId e invitadoId requeridos" };
      }

      try {
        const result = await asignacionService.verificarAsignacionInvitado(
          eventoId,
          invitadoId
        );

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Verificación completada:", result);
        }

        return result;
      } catch (error) {
        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al verificar asignación:", error);
        }

        return {
          success: false,
          error: "Error al verificar asignación",
          data: { tiene_asignacion: false },
        };
      }
    },
    [eventoId]
  );

  /**
   * Calcular estadísticas locales sin llamar al backend
   */
  const calcularEstadisticasLocales = useCallback(
    (mesas) => {
      return asignacionService.calcularEstadisticasLocales(asignaciones, mesas);
    },
    [asignaciones]
  );

  /**
   * Validar disponibilidad local (sin API)
   */
  const validarDisponibilidadLocal = useCallback(
    (mesa, cantidadNueva) => {
      const asignacionesMesa = asignaciones.filter(
        (asig) => asig.mesa_id === mesa.id
      );
      return asignacionService.validarDisponibilidadLocal(
        mesa,
        asignacionesMesa,
        cantidadNueva
      );
    },
    [asignaciones]
  );

  /**
   * Limpiar error
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpiar cache de validaciones
   */
  const limpiarCacheValidaciones = useCallback(() => {
    setValidacionesCache({});
  }, []);

  /**
   * Limpiar todo el estado
   */
  const limpiarTodo = useCallback(() => {
    setAsignaciones([]);
    setEstadisticas(null);
    setError(null);
    setValidacionesCache({});
  }, []);

  // Cargar asignaciones automáticamente cuando cambia el eventoId
  useEffect(() => {
    if (eventoId) {
      cargarAsignaciones();
      cargarEstadisticas();
    } else {
      limpiarTodo();
    }
  }, [eventoId, cargarAsignaciones, cargarEstadisticas, limpiarTodo]);

  // Retornar API del hook
  return {
    // Estados
    asignaciones,
    estadisticas,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isValidating,
    error,

    // Métodos CRUD
    cargarAsignaciones,
    crearAsignacion,
    actualizarAsignacion,
    eliminarAsignacion,
    moverInvitado,

    // Métodos de consulta
    obtenerAsignacionesMesa,
    verificarAsignacionInvitado,

    // Métodos de validación
    validarCapacidad,
    validarDisponibilidadLocal,

    // Métodos de estadísticas
    cargarEstadisticas,
    calcularEstadisticasLocales,

    // Métodos especiales
    ejecutarAsignacionAutomatica,
    limpiarAsignaciones,

    // Métodos de utilidad
    limpiarError,
    limpiarCacheValidaciones,
    limpiarTodo,

    // Propiedades computadas
    obtenerAsignacionesPorMesa: (mesaId) =>
      asignaciones.filter((asig) => asig.mesa_id === mesaId),
    obtenerAsignacionPorInvitado: (invitadoId) =>
      asignaciones.find((asig) => asig.invitado_id === invitadoId),
    cantidadAsignaciones: asignaciones.length,
    tieneAsignaciones: asignaciones.length > 0,
    totalPersonasAsignadas: asignaciones.reduce(
      (sum, asig) => sum + (asig.cantidad_personas || 0),
      0
    ),
  };
};

export default useAsignaciones;
