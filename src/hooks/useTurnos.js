import { useState, useEffect, useCallback, useRef } from "react";
import turnosService from "../services/turnosService";
import { useNotifications } from "../contexts/NotificationContext";

/**
 * Hook para gestionar turnos de selección de mesas
 * @param {string} eventoId - ID del evento
 * @param {string} invitadoId - ID del invitado (opcional para vista admin)
 */
export function useTurnos(eventoId, invitadoId = null) {
  const { showNotification } = useNotifications();

  // Estado del turno
  const [turno, setTurno] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [puedeAcceder, setPuedeAcceder] = useState(false);
  const [estadoTurno, setEstadoTurno] = useState("verificando"); // verificando, espera, activo, completado, sin_turno
  const [tiempoRestante, setTiempoRestante] = useState(null);

  // Estado de carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Referencias para intervalos
  const intervalRef = useRef(null);
  const checkIntervalRef = useRef(null);

  /**
   * Cargar configuración del evento
   */
  const cargarConfiguracion = useCallback(async () => {
    if (!eventoId) return;

    try {
      const response = await turnosService.obtenerConfiguracion(eventoId);
      if (response.success) {
        setConfiguracion(response.data);
        return response.data;
      }
    } catch (err) {
      console.error("Error al cargar configuración:", err);
      setError("No se pudo cargar la configuración");
    }
  }, [eventoId]);

  /**
   * Cargar turno del invitado
   */
  const cargarTurno = useCallback(async () => {
    if (!eventoId || !invitadoId) return;

    try {
      setIsLoading(true);
      const response = await turnosService.obtenerMiTurno(eventoId, invitadoId);

      if (response.success) {
        setTurno(response.data);
        return response.data;
      } else {
        setEstadoTurno("sin_turno");
        setError(response.message || "No se encontró turno asignado");
      }
    } catch (err) {
      console.error("Error al cargar turno:", err);
      setEstadoTurno("sin_turno");
      setError("No se pudo cargar el turno");
    } finally {
      setIsLoading(false);
    }
  }, [eventoId, invitadoId]);

  /**
   * Verificar acceso del invitado
   */
  const verificarAcceso = useCallback(async () => {
    if (!eventoId || !invitadoId) return;

    try {
      const response = await turnosService.verificarAcceso(
        eventoId,
        invitadoId
      );

      if (response.success) {
        setPuedeAcceder(response.data.puede_acceder);

        // Actualizar estado según respuesta
        if (response.data.puede_acceder) {
          setEstadoTurno("activo");
        } else if (response.data.turno_completado) {
          setEstadoTurno("completado");
        } else {
          setEstadoTurno("espera");
        }

        return response.data;
      }
    } catch (err) {
      console.error("Error al verificar acceso:", err);
      setPuedeAcceder(false);
      setEstadoTurno("espera");
    }
  }, [eventoId, invitadoId]);

  /**
   * Calcular tiempo restante del turno
   */
  const calcularTiempoRestante = useCallback(() => {
    if (!turno || estadoTurno !== "activo") {
      setTiempoRestante(null);
      return;
    }

    const ahora = new Date();
    const fin = new Date(turno.fecha_hora_fin);
    const diferencia = fin - ahora;

    if (diferencia <= 0) {
      setTiempoRestante(0);
      setPuedeAcceder(false);
      setEstadoTurno("completado");

      // Limpiar intervalo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      return;
    }

    // Calcular tiempo en minutos y segundos
    const minutos = Math.floor(diferencia / 1000 / 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    setTiempoRestante({
      minutos,
      segundos,
      total: diferencia,
    });
  }, [turno, estadoTurno]);

  /**
   * Guardar selección de mesas
   */
  const guardarSeleccion = useCallback(
    async (seleccionData) => {
      if (!eventoId || !invitadoId) {
        showNotification("error", "Datos incompletos para guardar selección");
        return { success: false };
      }

      if (!puedeAcceder && estadoTurno !== "activo") {
        showNotification("error", "No estás en tu turno activo");
        return { success: false };
      }

      try {
        const response = await turnosService.guardarSeleccion(
          eventoId,
          invitadoId,
          seleccionData
        );

        if (response.success) {
          showNotification("success", "Selección guardada exitosamente");
          setEstadoTurno("completado");
          setPuedeAcceder(false);

          // Limpiar intervalos
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
          }
        } else {
          showNotification(
            "error",
            response.message || "Error al guardar selección"
          );
        }

        return response;
      } catch (err) {
        console.error("Error al guardar selección:", err);
        showNotification("error", "Error al guardar la selección");
        return { success: false };
      }
    },
    [eventoId, invitadoId, puedeAcceder, estadoTurno, showNotification]
  );

  /**
   * Obtener selección existente
   */
  const obtenerSeleccion = useCallback(async () => {
    if (!eventoId || !invitadoId) return null;

    try {
      const response = await turnosService.obtenerMiSeleccion(
        eventoId,
        invitadoId
      );
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      console.error("Error al obtener selección:", err);
    }
    return null;
  }, [eventoId, invitadoId]);

  /**
   * Inicializar hook
   */
  useEffect(() => {
    if (!eventoId) return;

    const inicializar = async () => {
      setIsLoading(true);

      // Cargar configuración
      await cargarConfiguracion();

      // Si hay invitadoId, cargar turno y verificar acceso
      if (invitadoId) {
        const turnoData = await cargarTurno();
        if (turnoData) {
          await verificarAcceso();
        }
      }

      setIsLoading(false);
    };

    inicializar();
  }, [eventoId, invitadoId, cargarConfiguracion, cargarTurno, verificarAcceso]);

  /**
   * Iniciar contador de tiempo (cuando el turno está activo)
   */
  useEffect(() => {
    if (estadoTurno === "activo" && turno && !intervalRef.current) {
      // Calcular inmediatamente
      calcularTiempoRestante();

      // Actualizar cada segundo
      intervalRef.current = setInterval(() => {
        calcularTiempoRestante();
      }, 1000);
    }

    // Limpiar intervalo al desmontar o cambiar estado
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [estadoTurno, turno, calcularTiempoRestante]);

  /**
   * Verificar acceso periódicamente (cuando está en espera)
   */
  useEffect(() => {
    if (estadoTurno === "espera" && invitadoId && !checkIntervalRef.current) {
      // Verificar cada 30 segundos
      checkIntervalRef.current = setInterval(() => {
        verificarAcceso();
      }, 30000);
    }

    // Limpiar intervalo
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [estadoTurno, invitadoId, verificarAcceso]);

  return {
    // Estado
    turno,
    configuracion,
    puedeAcceder,
    estadoTurno,
    tiempoRestante,
    isLoading,
    error,

    // Métodos
    verificarAcceso,
    guardarSeleccion,
    obtenerSeleccion,
    cargarTurno,
    cargarConfiguracion,
  };
}

export default useTurnos;
