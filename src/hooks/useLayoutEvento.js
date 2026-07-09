import { useState, useCallback, useEffect } from "react";
import layoutEventoService from "../services/layoutEventoService";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para gestionar layouts de eventos específicos
 * Proporciona funcionalidades para asignar, personalizar y gestionar configuraciones de layout por evento
 */
export const useLayoutEvento = (eventoId = null) => {
  // Estados principales
  const [layout, setLayout] = useState(null);
  const [elementos, setElementos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Estado de error
  const [error, setError] = useState(null);

  // Control de cambios no guardados
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Cargar layout del evento
   */
  const cargarLayout = useCallback(async () => {
    if (!eventoId) {
      if (EnvConfig.DEBUG_MODE) {
        console.warn("⚠️ No se puede cargar layout sin eventoId");
      }
      setLayout(null);
      setElementos([]);
      return { success: false, error: "eventoId requerido" };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await layoutEventoService.obtenerLayout(eventoId);

      if (result.success) {
        setLayout(result.data.layout);
        setElementos(result.data.layout?.elementos || []);

        // Calcular estadísticas
        const stats = layoutEventoService.calcularEstadisticasLayout(
          result.data.layout?.elementos || []
        );
        setEstadisticas(stats);

        setHasUnsavedChanges(false);

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Layout cargado:", result.data.layout);
        }

        return result;
      } else {
        setError(result.error);
        setLayout(null);
        setElementos([]);
        return result;
      }
    } catch (error) {
      const errorMessage = "Error inesperado al cargar layout";
      setError(errorMessage);
      setLayout(null);
      setElementos([]);

      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al cargar layout:", error);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [eventoId]);

  /**
   * Asignar configuración base del lugar al evento
   */
  const asignarConfiguracionBase = useCallback(
    async (configuracionLugarId) => {
      if (!eventoId) {
        const error = "eventoId es requerido";
        setError(error);
        return { success: false, error };
      }

      setIsAssigning(true);
      setError(null);

      try {
        const result = await layoutEventoService.asignarConfiguracionBase(
          eventoId,
          configuracionLugarId
        );

        if (result.success) {
          // Recargar layout completo
          await cargarLayout();

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Configuración base asignada");
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al asignar configuración";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al asignar configuración:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsAssigning(false);
      }
    },
    [eventoId, cargarLayout]
  );

  /**
   * Personalizar layout del evento (guardar cambios al backend)
   */
  const guardarLayoutPersonalizado = useCallback(
    async (elementosActualizados = null, metadata = null) => {
      if (!eventoId) {
        const error = "eventoId es requerido";
        setError(error);
        return { success: false, error };
      }

      const elementosAGuardar = elementosActualizados || elementos;

      setIsPersonalizing(true);
      setError(null);

      try {
        const result = await layoutEventoService.personalizarLayout(
          eventoId,
          elementosAGuardar,
          metadata // 🆕 Pasar metadata al servicio
        );

        if (result.success) {
          setLayout(result.data.layout);
          setElementos(result.data.layout?.elementos || elementosAGuardar);

          // Recalcular estadísticas
          const stats = layoutEventoService.calcularEstadisticasLayout(
            result.data.layout?.elementos || elementosAGuardar
          );
          setEstadisticas(stats);

          setHasUnsavedChanges(false);

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Layout personalizado guardado");
            if (metadata) {
              console.log("📦 Metadata guardada:", metadata);
            }
          }

          return result;
        } else {
          setError(result.error);
          return result;
        }
      } catch (error) {
        const errorMessage = "Error inesperado al guardar layout";
        setError(errorMessage);

        if (EnvConfig.DEBUG_MODE) {
          console.error("❌ Error al guardar layout:", error);
        }

        return { success: false, error: errorMessage };
      } finally {
        setIsPersonalizing(false);
      }
    },
    [eventoId, elementos]
  );

  /**
   * Actualizar elementos localmente (sin guardar al backend)
   */
  const actualizarElementosLocal = useCallback((nuevosElementos) => {
    setElementos(nuevosElementos);

    // Recalcular estadísticas
    const stats =
      layoutEventoService.calcularEstadisticasLayout(nuevosElementos);
    setEstadisticas(stats);

    setHasUnsavedChanges(true);

    if (EnvConfig.DEBUG_MODE) {
      console.log("📝 Elementos actualizados localmente (sin guardar)");
    }
  }, []);

  /**
   * Actualizar posición de un elemento
   */
  const actualizarPosicion = useCallback(
    async (elementoId, nuevaPosicion, guardarInmediatamente = false) => {
      const elementosActualizados = elementos.map((elemento) =>
        elemento.id === elementoId
          ? { ...elemento, position: nuevaPosicion }
          : elemento
      );

      if (guardarInmediatamente) {
        return await guardarLayoutPersonalizado(elementosActualizados);
      } else {
        actualizarElementosLocal(elementosActualizados);
        return { success: true, local: true };
      }
    },
    [elementos, guardarLayoutPersonalizado, actualizarElementosLocal]
  );

  /**
   * Agregar nuevo elemento al layout
   */
  const agregarElemento = useCallback(
    async (nuevoElemento, guardarInmediatamente = false) => {
      const elementosActualizados = [...elementos, nuevoElemento];

      if (guardarInmediatamente) {
        return await guardarLayoutPersonalizado(elementosActualizados);
      } else {
        actualizarElementosLocal(elementosActualizados);
        return { success: true, local: true };
      }
    },
    [elementos, guardarLayoutPersonalizado, actualizarElementosLocal]
  );

  /**
   * Eliminar elemento del layout
   */
  const eliminarElemento = useCallback(
    async (elementoId, guardarInmediatamente = false) => {
      const elementosActualizados = elementos.filter(
        (elemento) => elemento.id !== elementoId
      );

      if (guardarInmediatamente) {
        return await guardarLayoutPersonalizado(elementosActualizados);
      } else {
        actualizarElementosLocal(elementosActualizados);
        return { success: true, local: true };
      }
    },
    [elementos, guardarLayoutPersonalizado, actualizarElementosLocal]
  );

  /**
   * Actualizar propiedades de un elemento
   */
  const actualizarPropiedades = useCallback(
    async (elementoId, propiedades, guardarInmediatamente = false) => {
      const elementosActualizados = elementos.map((elemento) =>
        elemento.id === elementoId ? { ...elemento, ...propiedades } : elemento
      );

      if (guardarInmediatamente) {
        return await guardarLayoutPersonalizado(elementosActualizados);
      } else {
        actualizarElementosLocal(elementosActualizados);
        return { success: true, local: true };
      }
    },
    [elementos, guardarLayoutPersonalizado, actualizarElementosLocal]
  );

  /**
   * Resetear layout a la configuración base del lugar
   */
  const resetearLayout = useCallback(async () => {
    if (!eventoId) {
      const error = "eventoId es requerido";
      setError(error);
      return { success: false, error };
    }

    setIsResetting(true);
    setError(null);

    try {
      const result = await layoutEventoService.resetearLayout(eventoId);

      if (result.success) {
        // Recargar layout
        await cargarLayout();
        setHasUnsavedChanges(false);

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Layout reseteado a configuración base");
        }

        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (error) {
      const errorMessage = "Error inesperado al resetear layout";
      setError(errorMessage);

      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al resetear layout:", error);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsResetting(false);
    }
  }, [eventoId, cargarLayout]);

  /**
   * Eliminar configuración de layout del evento
   */
  const eliminarLayout = useCallback(async () => {
    if (!eventoId) {
      const error = "eventoId es requerido";
      setError(error);
      return { success: false, error };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await layoutEventoService.eliminarLayout(eventoId);

      if (result.success) {
        setLayout(null);
        setElementos([]);
        setEstadisticas(null);
        setHasUnsavedChanges(false);

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Layout eliminado");
        }

        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (error) {
      const errorMessage = "Error inesperado al eliminar layout";
      setError(errorMessage);

      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al eliminar layout:", error);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [eventoId]);

  /**
   * Limpiar error
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Descartar cambios no guardados
   */
  const descartarCambios = useCallback(async () => {
    await cargarLayout();
    setHasUnsavedChanges(false);

    if (EnvConfig.DEBUG_MODE) {
      console.log("🔄 Cambios descartados, layout recargado");
    }
  }, [cargarLayout]);

  /**
   * Limpiar todo el estado
   */
  const limpiarTodo = useCallback(() => {
    setLayout(null);
    setElementos([]);
    setEstadisticas(null);
    setError(null);
    setHasUnsavedChanges(false);
  }, []);

  // Cargar layout automáticamente cuando cambia el eventoId
  useEffect(() => {
    if (eventoId) {
      cargarLayout();
    } else {
      limpiarTodo();
    }
  }, [eventoId, cargarLayout, limpiarTodo]);

  // Retornar API del hook
  return {
    // Estados
    layout,
    elementos,
    estadisticas,
    isLoading,
    isAssigning,
    isPersonalizing,
    isResetting,
    error,
    hasUnsavedChanges,

    // Métodos principales
    cargarLayout,
    asignarConfiguracionBase,
    guardarLayoutPersonalizado,
    resetearLayout,
    eliminarLayout,

    // Métodos de manipulación de elementos
    actualizarElementosLocal,
    actualizarPosicion,
    agregarElemento,
    eliminarElemento,
    actualizarPropiedades,

    // Métodos de utilidad
    limpiarError,
    descartarCambios,
    limpiarTodo,

    // Propiedades computadas
    tieneLayout: layoutEventoService.tieneLayoutConfigurado(layout),
    esPersonalizado: layoutEventoService.esLayoutPersonalizado(layout),
    nombreConfiguracionBase: layout?.configuracion_lugar_base_nombre || null,
    totalMesas: estadisticas?.totalMesas || 0,
    capacidadTotal: estadisticas?.capacidadTotal || 0,
    porcentajeOcupacion: estadisticas?.porcentajeOcupacion || 0,

    // Métodos del servicio expuestos
    calcularEstadisticas: layoutEventoService.calcularEstadisticasLayout,
  };
};

export default useLayoutEvento;
