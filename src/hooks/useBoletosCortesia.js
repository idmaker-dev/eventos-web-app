import { useState, useCallback } from "react";
import asignacionService from "../services/asignacionService";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para manejar boletos de cortesía
 * Proporciona funcionalidades para configurar y asignar boletos de cortesía
 */
export const useBoletosCortesia = (eventoId) => {
  // Estados del hook
  const [estado, setEstado] = useState({
    boletos_cortesia: 0,
    boletos_usados: 0,
    boletos_disponibles: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para operaciones específicas
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Asignaciones actuales
  const [asignaciones, setAsignaciones] = useState([]);

  /**
   * Cargar estado actual de boletos de cortesía
   */
  const fetchEstado = useCallback(async () => {
    if (!eventoId) {
      setEstado({
        boletos_cortesia: 0,
        boletos_usados: 0,
        boletos_disponibles: 0,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Cargando estado boletos cortesía...", { eventoId });
      }

      const result = await asignacionService.obtenerEstadoBoletosCortesia(
        eventoId
      );

      if (result.success) {
        setEstado({
          boletos_cortesia: result.data.boletos_cortesia || 0,
          boletos_usados: result.data.boletos_usados || 0,
          boletos_disponibles: result.data.boletos_disponibles || 0,
        });

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Estado boletos cortesía cargado:", result.data);
        }
      } else {
        throw new Error(result.message || "Error al cargar estado");
      }
    } catch (err) {
      console.error("❌ Error al cargar estado boletos cortesía:", err);
      setError(err.message);
      setEstado({
        boletos_cortesia: 0,
        boletos_usados: 0,
        boletos_disponibles: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [eventoId]);

  /**
   * Cargar asignaciones actuales de boletos de cortesía
   */
  const fetchAsignaciones = useCallback(async () => {
    if (!eventoId) {
      setAsignaciones([]);
      return;
    }

    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Cargando asignaciones cortesía...", { eventoId });
      }

      const result = await asignacionService.obtenerAsignacionesCortesia(
        eventoId
      );

      if (result.success) {
        setAsignaciones(result.data.mesas_seleccionadas || []);

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Asignaciones cortesía cargadas:", result.data);
        }
      } else {
        setAsignaciones([]);
      }
    } catch (err) {
      console.error("❌ Error al cargar asignaciones cortesía:", err);
      setAsignaciones([]);
    }
  }, [eventoId]);

  /**
   * Configurar cantidad total de boletos de cortesía
   * @param {number} cantidad - Nueva cantidad total de boletos
   * @returns {Promise<boolean>} true si la configuración fue exitosa
   */
  const configurar = useCallback(
    async (cantidad) => {
      if (!eventoId) {
        setError("ID de evento requerido");
        return false;
      }

      if (typeof cantidad !== "number" || cantidad < 0) {
        setError("La cantidad debe ser un número mayor o igual a 0");
        return false;
      }

      setIsConfiguring(true);
      setError(null);

      try {
        if (EnvConfig.DEBUG_MODE) {
          console.log("🔄 Configurando boletos cortesía:", {
            eventoId,
            cantidad,
          });
        }

        const result = await asignacionService.configurarBoletosCortesia(
          eventoId,
          cantidad
        );

        if (result.success) {
          // Actualizar estado local con la respuesta
          setEstado({
            boletos_cortesia: result.data.boletos_cortesia || 0,
            boletos_usados: result.data.boletos_usados || 0,
            boletos_disponibles: result.data.boletos_disponibles || 0,
          });

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Boletos cortesía configurados:", result.data);
          }

          return true;
        } else {
          throw new Error(result.message || "Error al configurar boletos");
        }
      } catch (err) {
        console.error("❌ Error al configurar boletos cortesía:", err);
        setError(err.message);
        return false;
      } finally {
        setIsConfiguring(false);
      }
    },
    [eventoId]
  );

  /**
   * Asignar boletos de cortesía a mesas
   * @param {Object} seleccion - Datos de la selección de mesas
   * @returns {Promise<boolean>} true si la asignación fue exitosa
   */
  const asignar = useCallback(
    async (seleccion) => {
      if (!eventoId) {
        setError("ID de evento requerido");
        return false;
      }

      if (
        !seleccion ||
        !seleccion.mesas_seleccionadas ||
        seleccion.mesas_seleccionadas.length === 0
      ) {
        setError("Se requiere al menos una mesa seleccionada");
        return false;
      }

      setIsAssigning(true);
      setError(null);

      try {
        if (EnvConfig.DEBUG_MODE) {
          console.log("🔄 Asignando boletos cortesía:", {
            eventoId,
            seleccion,
          });
        }

        const result = await asignacionService.asignarBoletosCortesia(
          eventoId,
          seleccion
        );

        if (result.success) {
          // Recargar estado después de asignar
          await fetchEstado();
          await fetchAsignaciones();

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Boletos cortesía asignados:", result);
          }

          return true;
        } else {
          throw new Error(result.message || "Error al asignar boletos");
        }
      } catch (err) {
        console.error("❌ Error al asignar boletos cortesía:", err);
        setError(err.message);
        return false;
      } finally {
        setIsAssigning(false);
      }
    },
    [eventoId, fetchEstado, fetchAsignaciones]
  );

  /**
   * Resetear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Eliminar una mesa específica de las asignaciones de cortesía
   * @param {string} mesaId - ID de la mesa a eliminar
   * @returns {Promise<boolean>} true si la eliminación fue exitosa
   */
  const eliminarMesa = useCallback(
    async (mesaId) => {
      if (!eventoId || !mesaId) {
        setError("ID de evento y mesa requeridos");
        return false;
      }

      setError(null);

      try {
        if (EnvConfig.DEBUG_MODE) {
          console.log("🔄 Eliminando mesa de cortesía:", {
            eventoId,
            mesaId,
          });
        }

        const result = await asignacionService.eliminarMesaCortesia(
          eventoId,
          mesaId
        );

        if (result.success) {
          // Recargar estado después de eliminar
          await fetchEstado();
          await fetchAsignaciones();

          if (EnvConfig.DEBUG_MODE) {
            console.log("✅ Mesa de cortesía eliminada:", result);
          }

          return true;
        } else {
          throw new Error(result.error || "Error al eliminar mesa");
        }
      } catch (err) {
        console.error("❌ Error al eliminar mesa de cortesía:", err);
        setError(err.message);
        return false;
      }
    },
    [eventoId, fetchEstado, fetchAsignaciones]
  );

  /**
   * Limpiar todas las asignaciones de cortesía
   * @returns {Promise<boolean>} true si la limpieza fue exitosa
   */
  const limpiarAsignaciones = useCallback(async () => {
    if (!eventoId) {
      setError("ID de evento requerido");
      return false;
    }

    setError(null);

    try {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Limpiando asignaciones de cortesía:", {
          eventoId,
        });
      }

      const result = await asignacionService.limpiarAsignacionesCortesia(
        eventoId
      );

      if (result.success) {
        // Recargar estado después de limpiar
        await fetchEstado();
        await fetchAsignaciones();

        if (EnvConfig.DEBUG_MODE) {
          console.log("✅ Asignaciones de cortesía limpiadas:", result);
        }

        return true;
      } else {
        throw new Error(result.error || "Error al limpiar asignaciones");
      }
    } catch (err) {
      console.error("❌ Error al limpiar asignaciones de cortesía:", err);
      setError(err.message);
      return false;
    }
  }, [eventoId, fetchEstado, fetchAsignaciones]);

  return {
    estado,
    asignaciones,
    isLoading,
    error,
    isConfiguring,
    isAssigning,
    fetchEstado,
    fetchAsignaciones,
    configurar,
    asignar,
    eliminarMesa,
    limpiarAsignaciones,
    clearError,
  };
};

export default useBoletosCortesia;
