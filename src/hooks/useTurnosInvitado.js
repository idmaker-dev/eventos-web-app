import { useState, useEffect, useCallback, useRef } from "react";
import turnosService from "../services/turnosService";

/**
 * Hook para gestionar turnos desde la perspectiva del invitado
 * Incluye polling automático para mantener el estado actualizado
 *
 * ⚠️ IMPORTANTE: El endpoint obtenerMiTurno ahora devuelve los datos del invitado
 * Estructura esperada de la respuesta:
 * {
 *   success: true,
 *   data: {
 *     turno: { id, evento_id, invitado_id, numero_turno, fecha_hora_inicio, fecha_hora_fin, estado, ... },
 *     invitado: { id, nombre_completo, cantidad_personas, numero, necesidades_especiales }
 *   }
 * }
 *
 * @param {string} eventoId - ID del evento
 * @param {string} invitadoId - ID del invitado
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoRefresh - Activar polling automático (default: true)
 * @param {number} options.refreshInterval - Intervalo de polling en ms (default: 30000)
 * @returns {Object} - { turno, invitado, estadoTurno, puedeAcceder, tiempoRestante, seleccion, estadoOcupacion, loading, error, guardandoSeleccion, guardarSeleccion, refrescar }
 */
export default function useTurnosInvitado(eventoId, invitadoId, options = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 segundos
  } = options;

  // Estado del turno
  const [turno, setTurno] = useState(null);
  const [estadoTurno, setEstadoTurno] = useState("verificando"); // verificando | espera | activo | completado | sin_turno | expirado
  const [puedeAcceder, setPuedeAcceder] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(null);

  // Estado de selección
  const [seleccion, setSeleccion] = useState(null);
  const [estadoOcupacion, setEstadoOcupacion] = useState(null);

  // Estado del invitado (viene de obtenerMiTurno)
  const [invitado, setInvitado] = useState(null);
  
  // Configuración de turnos (tipos de menú, restricciones, etc.)
  const [configuracionTurnos, setConfiguracionTurnos] = useState(null);

  // Estados de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardandoSeleccion, setGuardandoSeleccion] = useState(false);

  // Referencias para polling y countdown
  const pollingIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  /**
   * Calcular tiempo restante del turno activo
   */
  const calcularTiempoRestante = useCallback((fechaHoraFin) => {
    if (!fechaHoraFin) return null;

    const ahora = new Date();
    const fin = new Date(fechaHoraFin);
    const diferencia = fin - ahora;

    if (diferencia <= 0) return 0;

    return Math.floor(diferencia / 1000); // Retornar en segundos
  }, []);

  /**
   * Determinar el estado actual del turno
   */
  const determinarEstadoTurno = useCallback((turnoData) => {
    if (!turnoData) return "sin_turno";

    const ahora = new Date();
    const inicio = new Date(turnoData.fecha_hora_inicio);
    const fin = new Date(turnoData.fecha_hora_fin);

    // Verificar si el turno fue completado
    if (turnoData.completado || turnoData.estado === "completado") {
      return "completado";
    }

    // Verificar si el turno ya expiró
    if (ahora > fin) {
      return "expirado";
    }

    // Verificar si el turno está activo
    if (ahora >= inicio && ahora <= fin) {
      return "activo";
    }

    // El turno está programado pero aún no inicia
    if (ahora < inicio) {
      return "espera";
    }

    return "sin_turno";
  }, []);

  /**
   * Obtener información del turno del invitado
   */
  const cargarTurno = useCallback(async () => {
    if (!eventoId || !invitadoId) {
      setLoading(false);
      return;
    }

    try {
      const response = await turnosService.obtenerMiTurno(eventoId, invitadoId);

      if (response.success && response.data) {
        // Extraer datos del invitado de la respuesta
        if (response.data.invitado) {
          setInvitado(response.data.invitado);
        }

        // Guardar turno (puede ser el objeto turno o toda la data)
        setTurno(response.data.turno || response.data);
        const estado = determinarEstadoTurno(
          response.data.turno || response.data
        );
        setEstadoTurno(estado);

        // Si está activo, calcular tiempo restante
        if (estado === "activo") {
          const tiempo = calcularTiempoRestante(
            (response.data.turno || response.data).fecha_hora_fin
          );
          setTiempoRestante(tiempo);
        } else {
          setTiempoRestante(null);
        }

        setError(null);
      } else if (response.success && !response.data) {
        // No tiene turno asignado
        setTurno(null);
        setInvitado(null);
        setEstadoTurno("sin_turno");
        setError(null);
      } else {
        setError(response.error);
        setEstadoTurno("sin_turno");
      }
    } catch (err) {
      console.error("Error al cargar turno:", err);
      setError("Error al cargar información del turno");
      setEstadoTurno("sin_turno");
    } finally {
      setLoading(false);
    }
  }, [eventoId, invitadoId, determinarEstadoTurno, calcularTiempoRestante]);

  /**
   * Verificar si el invitado puede acceder ahora
   */
  const verificarAccesoActual = useCallback(async () => {
    if (!eventoId || !invitadoId) return;

    try {
      const response = await turnosService.verificarAcceso(
        eventoId,
        invitadoId
      );

      if (response.success) {
        setPuedeAcceder(response.puede_acceder || false);
      } else {
        setPuedeAcceder(false);
      }
    } catch (err) {
      console.error("Error al verificar acceso:", err);
      setPuedeAcceder(false);
    }
  }, [eventoId, invitadoId]);

  /**
   * Cargar configuración de turnos del evento
   */
  const cargarConfiguracion = useCallback(async () => {
    if (!eventoId) return;

    try {
      const response = await turnosService.obtenerConfiguracion(eventoId);
      console.log('📋 [useTurnosInvitado] Configuración recibida:', response);

      if (response.success && response.data) {
        console.log('📋 [useTurnosInvitado] tipos_menu:', response.data.tipos_menu);
        setConfiguracionTurnos(response.data);
      } else {
        console.log('📋 [useTurnosInvitado] No hay configuración disponible');
      }
    } catch (err) {
      console.error("Error al cargar configuración de turnos:", err);
    }
  }, [eventoId]);

  /**
   * Cargar selección actual del invitado
   */
  const cargarSeleccion = useCallback(async () => {
    if (!eventoId || !invitadoId) return;

    try {
      const response = await turnosService.obtenerMiSeleccion(
        eventoId,
        invitadoId
      );

      if (response.success && response.data) {
        setSeleccion(response.data);
      } else {
        setSeleccion(null);
      }
    } catch (err) {
      console.error("Error al cargar selección:", err);
    }
  }, [eventoId, invitadoId]);

  /**
   * Cargar estado de ocupación de mesas
   */
  const cargarEstadoOcupacion = useCallback(async () => {
    if (!eventoId) return;

    try {
      const response = await turnosService.obtenerEstadoOcupacion(eventoId);

      if (response.success && response.data) {
        setEstadoOcupacion(response.data);
      }
    } catch (err) {
      console.error("Error al cargar estado de ocupación:", err);
    }
  }, [eventoId]);

  /**
   * Guardar selección de mesas
   */
  const guardarSeleccion = useCallback(
    async (datosSeleccion) => {
      if (!eventoId || !invitadoId) {
        return { success: false, error: "Datos incompletos" };
      }

      setGuardandoSeleccion(true);
      try {
        const response = await turnosService.guardarSeleccion(
          eventoId,
          invitadoId,
          datosSeleccion
        );

        if (response.success) {
          // Recargar datos después de guardar
          await Promise.all([
            cargarSeleccion(),
            cargarTurno(),
            cargarEstadoOcupacion(),
          ]);
        }

        return response;
      } catch (err) {
        console.error("Error al guardar selección:", err);
        return {
          success: false,
          error: "Error al guardar selección",
        };
      } finally {
        setGuardandoSeleccion(false);
      }
    },
    [eventoId, invitadoId, cargarSeleccion, cargarTurno, cargarEstadoOcupacion]
  );

  /**
   * Refrescar todos los datos
   */
  const refrescar = useCallback(async () => {
    await Promise.all([
      cargarTurno(),
      verificarAccesoActual(),
      cargarSeleccion(),
      cargarEstadoOcupacion(),
      cargarConfiguracion(),
    ]);
  }, [
    cargarTurno,
    verificarAccesoActual,
    cargarSeleccion,
    cargarEstadoOcupacion,
    cargarConfiguracion,
  ]);

  // Efecto: Carga inicial
  useEffect(() => {
    if (eventoId && invitadoId) {
      refrescar();
    }
  }, [eventoId, invitadoId, refrescar]);

  // Efecto: Polling automático
  useEffect(() => {
    if (!autoRefresh || !eventoId || !invitadoId) return;

    pollingIntervalRef.current = setInterval(() => {
      refrescar();
    }, refreshInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, eventoId, invitadoId, refrescar]);

  // Efecto: Countdown para turno activo
  useEffect(() => {
    if (estadoTurno === "activo" && turno) {
      // Actualizar countdown cada segundo
      countdownIntervalRef.current = setInterval(() => {
        const tiempo = calcularTiempoRestante(turno.fecha_hora_fin);
        setTiempoRestante(tiempo);

        // Si el tiempo se acabó, recargar turno
        if (tiempo <= 0) {
          cargarTurno();
          clearInterval(countdownIntervalRef.current);
        }
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [estadoTurno, turno, calcularTiempoRestante, cargarTurno]);

  // Efecto: Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return {
    // Datos
    turno,
    invitado, // Datos del invitado desde obtenerMiTurno
    estadoTurno, // 'verificando' | 'espera' | 'activo' | 'completado' | 'sin_turno' | 'expirado'
    puedeAcceder,
    tiempoRestante, // En segundos
    seleccion,
    estadoOcupacion,
    configuracionTurnos, // Configuración de turnos (tipos_menu, restricciones, etc.)

    // Estados
    loading,
    error,
    guardandoSeleccion,

    // Acciones
    guardarSeleccion,
    refrescar,
    cargarEstadoOcupacion,
  };
}
