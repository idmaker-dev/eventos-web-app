import { useState, useCallback, useEffect } from "react";
import layoutEventoService from "../services/layoutEventoService";
import EnvConfig from "../utils/config";

/**
 * Hook para obtener la disponibilidad de mesas de un evento
 * Incluye información detallada de ocupación, invitados asignados, etc.
 */
export const useDisponibilidadMesas = (eventoId = null, autoLoad = true) => {
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [elementos, setElementos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar disponibilidad de mesas
   */
  const cargarDisponibilidad = useCallback(async () => {
    if (!eventoId) {
      if (EnvConfig.DEBUG_MODE) {
        console.warn("⚠️ No se puede cargar disponibilidad sin eventoId");
      }
      setDisponibilidad(null);
      setElementos([]);
      setEstadisticas(null);
      return { success: false, error: "eventoId requerido" };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await layoutEventoService.obtenerDisponibilidad(eventoId);

      if (result.success) {
        const data = result.data;

        setDisponibilidad(data);
        setElementos(data.layout?.elementos || []);
        setEstadisticas(data.estadisticas || null);

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Disponibilidad cargada:", {
            totalMesas: data.estadisticas?.total_mesas,
            mesasDisponibles: data.estadisticas?.mesas_disponibles,
            porcentajeOcupacion: data.estadisticas?.porcentaje_ocupacion,
          });
        }

        return result;
      } else {
        setError(result.error);
        setDisponibilidad(null);
        setElementos([]);
        setEstadisticas(null);
        return result;
      }
    } catch (error) {
      const errorMessage = "Error inesperado al cargar disponibilidad";
      setError(errorMessage);
      setDisponibilidad(null);
      setElementos([]);
      setEstadisticas(null);

      if (EnvConfig.DEBUG_MODE) {
        console.error("❌ Error al cargar disponibilidad:", error);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [eventoId]);

  /**
   * Obtener disponibilidad de una mesa específica
   */
  const obtenerDisponibilidadMesa = useCallback(
    (numeroMesa) => {
      if (!elementos || elementos.length === 0) {
        return null;
      }

      const mesa = elementos.find(
        (el) =>
          (el.type === "mesa" || el.type === "mesaRectangular") &&
          el.numero === numeroMesa
      );

      return mesa?.disponibilidad || null;
    },
    [elementos]
  );

  /**
   * Verificar si una mesa está disponible
   */
  const mesaEstaDisponible = useCallback(
    (numeroMesa) => {
      const disp = obtenerDisponibilidadMesa(numeroMesa);
      return disp?.esta_disponible === true;
    },
    [obtenerDisponibilidadMesa]
  );

  /**
   * Verificar si una mesa está llena
   */
  const mesaEstaLlena = useCallback(
    (numeroMesa) => {
      const disp = obtenerDisponibilidadMesa(numeroMesa);
      return disp?.esta_llena === true;
    },
    [obtenerDisponibilidadMesa]
  );

  /**
   * Obtener asientos disponibles de una mesa
   */
  const obtenerAsientosDisponibles = useCallback(
    (numeroMesa) => {
      const disp = obtenerDisponibilidadMesa(numeroMesa);
      return disp?.asientos_disponibles || 0;
    },
    [obtenerDisponibilidadMesa]
  );

  /**
   * Obtener todas las mesas disponibles
   */
  const obtenerMesasDisponibles = useCallback(() => {
    if (!elementos || elementos.length === 0) {
      return [];
    }

    return elementos.filter(
      (el) =>
        (el.type === "mesa" || el.type === "mesaRectangular") &&
        el.disponibilidad?.esta_disponible === true
    );
  }, [elementos]);

  /**
   * Obtener todas las mesas llenas
   */
  const obtenerMesasLlenas = useCallback(() => {
    if (!elementos || elementos.length === 0) {
      return [];
    }

    return elementos.filter(
      (el) =>
        (el.type === "mesa" || el.type === "mesaRectangular") &&
        el.disponibilidad?.esta_llena === true
    );
  }, [elementos]);

  /**
   * Limpiar error
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refrescar disponibilidad (alias de cargarDisponibilidad)
   */
  const refrescar = useCallback(() => {
    return cargarDisponibilidad();
  }, [cargarDisponibilidad]);

  // Cargar disponibilidad automáticamente
  useEffect(() => {
    if (eventoId && autoLoad) {
      cargarDisponibilidad();
    }
  }, [eventoId, autoLoad, cargarDisponibilidad]);

  return {
    // Estados
    disponibilidad,
    elementos,
    estadisticas,
    isLoading,
    error,

    // Métodos principales
    cargarDisponibilidad,
    refrescar,

    // Métodos de consulta
    obtenerDisponibilidadMesa,
    mesaEstaDisponible,
    mesaEstaLlena,
    obtenerAsientosDisponibles,
    obtenerMesasDisponibles,
    obtenerMesasLlenas,

    // Utilidad
    limpiarError,

    // Propiedades computadas
    totalMesas: estadisticas?.total_mesas || 0,
    mesasDisponibles: estadisticas?.mesas_disponibles || 0,
    mesasLlenas: estadisticas?.mesas_llenas || 0,
    capacidadTotal: estadisticas?.capacidad_total || 0,
    asientosOcupados: estadisticas?.asientos_ocupados || 0,
    asientosDisponibles: estadisticas?.asientos_disponibles || 0,
    porcentajeOcupacion: estadisticas?.porcentaje_ocupacion || 0,
  };
};

export default useDisponibilidadMesas;
