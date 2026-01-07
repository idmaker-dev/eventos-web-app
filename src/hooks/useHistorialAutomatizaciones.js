import { useState, useCallback } from "react";
import automatizacionesService from "../services/automatizacionesService";

/**
 * Hook para gestionar historial de ejecuciones de automatizaciones
 * Proporciona funciones para consultar y analizar el historial
 */
export const useHistorialAutomatizaciones = () => {
  const [historial, setHistorial] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtener historial de una automatización específica
   */
  const obtenerHistorial = useCallback(async (automatizacionId, filtros = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await automatizacionesService.getHistorial(automatizacionId, filtros);

      if (result.success) {
        setHistorial(result.historial || []);
        return result;
      } else {
        throw new Error(result.error || "Error al obtener historial");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al obtener historial";
      setError(errorMsg);
      console.error("Error en obtenerHistorial:", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas agregadas del historial
   */
  const obtenerEstadisticas = useCallback(
    async (automatizacionId, fechaDesde, fechaHasta) => {
      try {
        setLoading(true);
        setError(null);

        const result = await automatizacionesService.getEstadisticas(
          automatizacionId,
          fechaDesde,
          fechaHasta
        );

        if (result.success) {
          setEstadisticas(result.estadisticas);
          return result.estadisticas;
        } else {
          throw new Error(result.error || "Error al obtener estadísticas");
        }
      } catch (err) {
        const errorMsg = err.message || "Error al obtener estadísticas";
        setError(errorMsg);
        console.error("Error en obtenerEstadisticas:", err);
        throw new Error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Limpiar historial antiguo
   */
  const limpiarHistorialAntiguo = useCallback(async (diasAntiguedad = 90) => {
    try {
      setLoading(true);
      setError(null);

      const result = await automatizacionesService.limpiarHistorialAntiguo(diasAntiguedad);

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || "Error al limpiar historial");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al limpiar historial";
      setError(errorMsg);
      console.error("Error en limpiarHistorialAntiguo:", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    historial,
    estadisticas,
    loading,
    error,
    obtenerHistorial,
    obtenerEstadisticas,
    limpiarHistorialAntiguo,
  };
};

/**
 * Agrupa registros por día para gráficos
 */
function agruparPorDia(registros) {
  const grupos = {};

  registros.forEach((registro) => {
    const fecha = new Date(registro.fecha_ejecucion)
      .toISOString()
      .split("T")[0];

    if (!grupos[fecha]) {
      grupos[fecha] = {
        fecha,
        ejecuciones: 0,
        exitosos: 0,
        fallidos: 0,
      };
    }

    grupos[fecha].ejecuciones++;
    grupos[fecha].exitosos += registro.exitosos || 0;
    grupos[fecha].fallidos += registro.fallidos || 0;
  });

  return Object.values(grupos).sort((a, b) =>
    a.fecha.localeCompare(b.fecha)
  );
}

export default useHistorialAutomatizaciones;
