import { useState, useCallback } from "react";
import boletoService from "../services/boletoService";
import { useSelectedEvent } from "../contexts/SelectedEventContext";

/**
 * Hook personalizado para gestión de boletos
 * Maneja la lógica de estado y llamadas al API
 */
export const useBoletos = () => {
  const { eventoActual } = useSelectedEvent();
  const [configuracion, setConfiguracion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar configuración actual del evento
   */
  const cargarConfiguracion = useCallback(async (eventoId = null) => {
    const idEvento = eventoId || eventoActual?.id;
    if (!idEvento) {
      setError("No hay evento seleccionado");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await boletoService.obtenerConfiguracion(idEvento);

      if (result.success) {
        setConfiguracion(result.data);
        return result.data;
      } else {
        if (result.notFound) {
          setConfiguracion(null);
        } else {
          setError(result.error);
        }
        return null;
      }
    } catch (err) {
      setError("Error al cargar configuración");
      return null;
    } finally {
      setLoading(false);
    }
  }, [eventoActual]);

  /**
   * Subir diseño de invitación
   */
  const subirDiseno = useCallback(async (imageFile, eventoId = null) => {
    const idEvento = eventoId || eventoActual?.id;
    if (!idEvento) {
      return {
        success: false,
        error: "No hay evento seleccionado",
      };
    }

    // Validar imagen
    const validacion = boletoService.validarImagen(imageFile);
    if (!validacion.valid) {
      return {
        success: false,
        error: validacion.error,
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await boletoService.subirDiseno(idEvento, imageFile);

      if (result.success) {
        setConfiguracion(result.data);
      } else {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMsg = "Error al subir diseño";
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, [eventoActual]);

  /**
   * Guardar configuración de QR
   */
  const guardarConfiguracionQR = useCallback(async (qrConfig, eventoId = null) => {
    const idEvento = eventoId || eventoActual?.id;
    if (!idEvento) {
      return {
        success: false,
        error: "No hay evento seleccionado",
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await boletoService.guardarConfiguracionQR(
        idEvento,
        qrConfig
      );

      if (result.success) {
        setConfiguracion(result.data);
      } else {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMsg = "Error al guardar configuración";
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, [eventoActual]);

  /**
   * Generar boleto individual
   */
  const generarBoletoIndividual = useCallback(async (invitadoId, eventoId = null) => {
    const idEvento = eventoId || eventoActual?.id;
    if (!idEvento) {
      return {
        success: false,
        error: "No hay evento seleccionado",
      };
    }

    if (!invitadoId) {
      return {
        success: false,
        error: "ID de invitado requerido",
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await boletoService.generarBoletoIndividual(
        idEvento,
        invitadoId
      );

      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMsg = "Error al generar boleto";
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, [eventoActual]);

  /**
   * Descargar boletos masivos
   */
  const descargarBoletosMasivo = useCallback(async (eventoId = null) => {
    const idEvento = eventoId || eventoActual?.id;
    if (!idEvento) {
      return {
        success: false,
        error: "No hay evento seleccionado",
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await boletoService.descargarBoletosMasivo(idEvento);

      if (!result.success) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMsg = "Error al descargar boletos";
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, [eventoActual]);

  /**
   * Compartir boleto
   */
  const compartirBoleto = useCallback(async (boletoUrl, nombreInvitado) => {
    setLoading(true);
    setError(null);

    try {
      const result = await boletoService.compartirBoleto(
        boletoUrl,
        nombreInvitado
      );

      if (!result.success && !result.cancelled) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMsg = "Error al compartir boleto";
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar error
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    configuracion,
    loading,
    error,

    // Métodos
    cargarConfiguracion,
    subirDiseno,
    guardarConfiguracionQR,
    generarBoletoIndividual,
    descargarBoletosMasivo,
    compartirBoleto,
    limpiarError,
  };
};

export default useBoletos;
