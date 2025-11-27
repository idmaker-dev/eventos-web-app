import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";
import ticketsService from "../services/ticketsService";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para obtener información completa del cliente
 * @param {string} telefono - Número de teléfono del cliente
 * @returns {Object} - Estado y funciones para manejar la información del cliente
 */
export const useClientInfo = (telefono) => {
  const [clientInfo, setClientInfo] = useState(null);
  const { execute, loading, error } = useApi({
    showSuccessNotification: false,
    showErrorNotification: true,
    errorContext: "información del cliente",
  });

  /**
   * Cargar información completa del cliente desde el servidor
   */
  const cargarClientInfo = useCallback(async () => {
    if (!telefono) {
      if (EnvConfig.DEBUG_MODE) {
        console.warn("⚠️ [useClientInfo] No se proporcionó teléfono");
      }
      return null;
    }

    if (EnvConfig.DEBUG_MODE) {
      console.log("👤 [useClientInfo] Cargando información del cliente:", telefono);
    }

    const result = await execute(
      () => ticketsService.getClientInfo(telefono),
      {
        showSuccessMsg: false,
      }
    );

    if (result?.success) {
      setClientInfo(result.clientInfo);

      if (EnvConfig.DEBUG_MODE) {
        console.log("✅ [useClientInfo] Información del cliente cargada:", {
          telefono,
          clientInfoCompleto: result.clientInfo,
          tieneTickets: !!result.clientInfo?.tickets,
          tieneDatosPersonales: !!result.clientInfo?.datos_personales,
          tieneInformacionPago: !!result.clientInfo?.informacion_pago,
        });
      }
    }

    return result;
  }, [telefono, execute]);

  /**
   * Obtener datos personales del cliente
   */
  const getDatosPersonales = useCallback(() => {
    return clientInfo?.datos_personales || null;
  }, [clientInfo]);

  /**
   * Obtener historial de acciones del cliente
   */
  const getHistorialAcciones = useCallback(() => {
    return clientInfo?.historial_acciones || [];
  }, [clientInfo]);

  /**
   * Obtener información de pago del cliente
   */
  const getInformacionPago = useCallback(() => {
    return clientInfo?.informacion_pago || null;
  }, [clientInfo]);

  /**
   * Obtener información de boletos del cliente
   */
  const getInformacionBoletos = useCallback(() => {
    return clientInfo?.informacion_boletos || null;
  }, [clientInfo]);

  /**
   * Obtener estadísticas de tickets del cliente
   */
  const getEstadisticasTickets = useCallback(() => {
    return {
      total: clientInfo?.tickets_totales || 0,
      abiertos: clientInfo?.tickets_abiertos || 0,
      cerrados: clientInfo?.tickets_cerrados || 0,
      pendientes: clientInfo?.tickets_pendientes || 0,
    };
  }, [clientInfo]);

  /**
   * Verificar si el cliente tiene boletos
   */
  const tieneBoletos = useCallback(() => {
    const boletos = getInformacionBoletos();
    return boletos && boletos.boletos && boletos.boletos.length > 0;
  }, [getInformacionBoletos]);

  /**
   * Obtener boletos con restricciones alimentarias
   */
  const getBoletosConRestricciones = useCallback(() => {
    const boletos = getInformacionBoletos();
    if (!boletos || !boletos.boletos) return [];

    return boletos.boletos.filter(
      (boleto) => boleto.restricciones && boleto.restricciones.length > 0
    );
  }, [getInformacionBoletos]);

  /**
   * Verificar si el cliente tiene pagos pendientes
   */
  const tienePagosPendientes = useCallback(() => {
    const pago = getInformacionPago();
    if (!pago) return false;

    return pago.monto_pendiente > 0;
  }, [getInformacionPago]);

  // Cargar información del cliente al montar o cuando cambie el teléfono
  useEffect(() => {
    if (telefono) {
      cargarClientInfo();
    } else {
      setClientInfo(null);
    }
  }, [telefono, cargarClientInfo]);

  return {
    // Estado completo
    clientInfo,
    loading,
    error,

    // Getters específicos
    datosPersonales: getDatosPersonales(),
    historialAcciones: getHistorialAcciones(),
    informacionPago: getInformacionPago(),
    informacionBoletos: getInformacionBoletos(),
    estadisticasTickets: getEstadisticasTickets(),

    // Funciones útiles
    cargarClientInfo,
    tieneBoletos: tieneBoletos(),
    boletosConRestricciones: getBoletosConRestricciones(),
    tienePagosPendientes: tienePagosPendientes(),
    refetch: cargarClientInfo, // Alias para compatibilidad
  };
};

export default useClientInfo;
