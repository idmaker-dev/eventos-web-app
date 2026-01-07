import { useState, useEffect, useCallback } from "react";
import automatizacionesService from "../services/automatizacionesService";

/**
 * Hook para gestionar automatizaciones
 * Proporciona funciones CRUD y estado reactivo
 */
export const useAutomatizaciones = (filtrosIniciales = {}) => {
  const [automatizaciones, setAutomatizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtener lista de automatizaciones con filtros opcionales
   */
  const obtenerAutomatizaciones = useCallback(async (filtros = {}) => {
    try {
      setLoading(true);
      setError(null);

      const mergedFiltros = { ...filtrosIniciales, ...filtros };
      const result = await automatizacionesService.getAutomatizaciones(mergedFiltros);

      if (result.success) {
        setAutomatizaciones(result.automatizaciones || []);
        return result.automatizaciones || [];
      } else {
        throw new Error(result.error || "Error al obtener automatizaciones");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al obtener automatizaciones";
      setError(errorMsg);
      setAutomatizaciones([]); // Resetear a array vacío en caso de error
      console.error("Error en obtenerAutomatizaciones:", err);
      return []; // Retornar array vacío en lugar de lanzar error
    } finally {
      setLoading(false);
    }
  }, [filtrosIniciales]);

  /**
   * Obtener plantillas disponibles
   */
  const obtenerPlantillas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await automatizacionesService.getPlantillas();

      if (result.success) {
        return result.plantillas || [];
      } else {
        throw new Error(result.error || "Error al obtener plantillas");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al obtener plantillas";
      setError(errorMsg);
      console.error("Error en obtenerPlantillas:", err);
      return []; // Retornar array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener una automatización por ID
   */
  const obtenerAutomatizacionPorId = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const result = await automatizacionesService.getAutomatizacion(id);

      if (result.success) {
        return result.automatizacion;
      } else {
        throw new Error(result.error || "Error al obtener automatización");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al obtener automatización";
      setError(errorMsg);
      console.error("Error en obtenerAutomatizacionPorId:", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva automatización
   */
  const crearAutomatizacion = useCallback(async (datos) => {
    try {
      setLoading(true);
      setError(null);

      const result = await automatizacionesService.crearAutomatizacion(datos);

      if (result.success) {
        setAutomatizaciones((prev) => [result.automatizacion, ...prev]);
        return result.automatizacion;
      } else {
        throw new Error(result.error || "Error al crear automatización");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al crear automatización";
      setError(errorMsg);
      console.error("Error en crearAutomatizacion:", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar automatización existente
   */
  const actualizarAutomatizacion = useCallback(async (id, datos) => {
    try {
      setLoading(true);
      setError(null);

      const result = await automatizacionesService.actualizarAutomatizacion(id, datos);

      if (result.success) {
        setAutomatizaciones((prev) =>
          prev.map((a) => (a.id === id ? result.automatizacion : a))
        );
        return result.automatizacion;
      } else {
        throw new Error(result.error || "Error al actualizar automatización");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al actualizar automatización";
      setError(errorMsg);
      console.error("Error en actualizarAutomatizacion:", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cambiar estado activo/inactivo
   */
  const cambiarEstado = useCallback(async (id, activa) => {
    try {
      setLoading(true);
      setError(null);

      const result = await automatizacionesService.cambiarEstado(id, activa);

      if (result.success) {
        setAutomatizaciones((prev) =>
          prev.map((a) => (a.id === id ? { ...a, activa } : a))
        );
        return result.automatizacion;
      } else {
        throw new Error(result.error || "Error al cambiar estado");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al cambiar estado";
      setError(errorMsg);
      console.error("Error en cambiarEstado:", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar automatización
   */
  const eliminarAutomatizacion = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const result = await automatizacionesService.eliminarAutomatizacion(id);

      if (result.success) {
        setAutomatizaciones((prev) => prev.filter((a) => a.id !== id));
        return true;
      } else {
        throw new Error(result.error || "Error al eliminar automatización");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al eliminar automatización";
      setError(errorMsg);
      console.error("Error en eliminarAutomatizacion:", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Duplicar automatización existente
   */
  const duplicarAutomatizacion = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const result = await automatizacionesService.duplicarAutomatizacion(id);

      if (result.success) {
        setAutomatizaciones((prev) => [result.automatizacion, ...prev]);
        return result.automatizacion;
      } else {
        throw new Error(result.error || "Error al duplicar automatización");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al duplicar automatización";
      setError(errorMsg);
      console.error("Error en duplicarAutomatizacion:", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ejecutar automatización manualmente
   */
  const ejecutarManual = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const result = await automatizacionesService.ejecutarManual(id);

      if (result.success) {
        return result.resultado;
      } else {
        throw new Error(result.error || "Error al ejecutar automatización");
      }
    } catch (err) {
      const errorMsg = err.message || "Error al ejecutar automatización";
      setError(errorMsg);
      console.error("Error en ejecutarManual:", err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar automatizaciones al montar el componente
  useEffect(() => {
    obtenerAutomatizaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  return {
    automatizaciones,
    loading,
    error,
    obtenerAutomatizaciones,
    obtenerAutomatizacionPorId,
    obtenerPlantillas,
    crearAutomatizacion,
    actualizarAutomatizacion,
    cambiarEstado,
    eliminarAutomatizacion,
    duplicarAutomatizacion,
    ejecutarManual,
  };
};

export default useAutomatizaciones;
