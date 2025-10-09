import { useEffect, useCallback, useState } from "react";
import { useSignalR } from "../contexts/SignalRContext";
import { useAuth } from "./useAuth";
import EnvConfig from "../utils/config";

/**
 * Hook personalizado para gestionar la conexión SignalR
 * Basado en la implementación de Vue proporcionada
 */
export const useSignalRConnection = () => {
  const {
    conectarSignalR,
    desconectarSignalR,
    conectado,
    debugInfo,
    notificaciones,
    limpiarNotificaciones,
    obtenerEstadoConexion,
  } = useSignalR();

  const { user, isAuthenticated } = useAuth();
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(true);
  const [lastUserId, setLastUserId] = useState(null);

  // Efecto para conectar/desconectar automáticamente basado en autenticación
  useEffect(() => {
    const currentUserId = user?.id;

    if (EnvConfig.DEBUG_MODE) {
      console.log("🔍 [useSignalRConnection] Verificando conexión:", {
        autoConnectEnabled,
        isAuthenticated,
        currentUserId,
        conectado,
        lastUserId,
        userObject: user,
      });
    }

    // Solo intentar conectar si:
    // 1. Auto-connect está habilitado
    // 2. Usuario está autenticado
    // 3. Hay un userId válido
    // 4. No está conectado
    if (autoConnectEnabled && isAuthenticated && currentUserId && !conectado) {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔄 Auto-conectando SignalR para usuario:", currentUserId);
      }
      setLastUserId(currentUserId);
      conectarSignalR(currentUserId);
    }
    // Desconectar si el usuario no está autenticado y estaba conectado
    else if (!isAuthenticated && conectado) {
      if (EnvConfig.DEBUG_MODE) {
        console.log("🔌 Auto-desconectando SignalR (usuario no autenticado)");
      }
      setLastUserId(null);
      desconectarSignalR();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    user?.id,
    conectado,
    autoConnectEnabled,
    conectarSignalR,
    desconectarSignalR,
    // Nota: lastUserId se omite intencionalmente para permitir reconexión después de reload
  ]);

  // Función para conectar manualmente
  const conectarManualmente = useCallback(async () => {
    const userId = user?.id;

    if (!userId) {
      if (EnvConfig.DEBUG_MODE) {
        console.warn("⚠️ No se puede conectar: usuario no válido", { user });
      }
      return { success: false, error: "Usuario no válido" };
    }

    return await conectarSignalR(userId);
  }, [user, conectarSignalR]);

  // Función para desconectar manualmente
  const desconectarManualmente = useCallback(async () => {
    return await desconectarSignalR();
  }, [desconectarSignalR]);

  // Función para habilitar/deshabilitar auto-conexión
  const setAutoConnect = useCallback((enabled) => {
    setAutoConnectEnabled(enabled);
    if (EnvConfig.DEBUG_MODE) {
      console.log(
        `🔧 Auto-conexión SignalR ${enabled ? "habilitada" : "deshabilitada"}`
      );
    }
  }, []);

  // Función para obtener resumen del estado
  const obtenerResumenEstado = useCallback(() => {
    const estado = obtenerEstadoConexion();
    return {
      ...estado,
      usuario: user?.id || null,
      autenticado: isAuthenticated,
      autoConnectEnabled,
      ultimasNotificaciones: notificaciones.slice(0, 5), // Últimas 5 notificaciones
    };
  }, [
    obtenerEstadoConexion,
    user?.id,
    isAuthenticated,
    autoConnectEnabled,
    notificaciones,
  ]);

  return {
    // Estado
    conectado,
    debugInfo,
    notificaciones,
    autoConnectEnabled,

    // Funciones de conexión
    conectar: conectarManualmente,
    desconectar: desconectarManualmente,

    // Configuración
    setAutoConnect,

    // Utilidades
    limpiarNotificaciones,
    obtenerResumenEstado,

    // Información del usuario
    usuarioId: user?.id || null,
    usuarioAutenticado: isAuthenticated,
  };
};

/**
 * Hook específico para el dashboard que maneja las actualizaciones automáticas
 */
export const useSignalRDashboard = (onDashboardUpdate) => {
  const { registrarCallbackDashboard, desregistrarCallbackDashboard } =
    useSignalR();
  const { conectado, notificaciones } = useSignalRConnection();
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  // Registrar callback para actualizaciones del dashboard
  useEffect(() => {
    if (onDashboardUpdate && typeof onDashboardUpdate === "function") {
      const callbackWrapper = (data) => {
        if (EnvConfig.DEBUG_MODE) {
          console.log("🔄 Actualizando dashboard desde SignalR:", data);
        }
        setUltimaActualizacion(new Date().toISOString());
        onDashboardUpdate(data);
      };

      registrarCallbackDashboard(callbackWrapper);

      return () => {
        desregistrarCallbackDashboard();
      };
    }
  }, [
    onDashboardUpdate,
    registrarCallbackDashboard,
    desregistrarCallbackDashboard,
  ]);

  // Contar notificaciones de actualización de dashboard
  const notificacionesDashboard = notificaciones.filter(
    (notif) => notif.tipo === "dashboard_update"
  );

  return {
    conectado,
    ultimaActualizacion,
    notificacionesDashboard: notificacionesDashboard.length,
    ultimaNotificacion: notificacionesDashboard[0] || null,
  };
};

/**
 * Hook para debug y monitoreo de SignalR
 */
export const useSignalRDebug = () => {
  const { debugInfo, obtenerEstadoConexion } = useSignalR();
  const { obtenerResumenEstado } = useSignalRConnection();

  const logEstadoCompleto = useCallback(() => {
    if (EnvConfig.DEBUG_MODE) {
      console.group("🔍 Estado completo de SignalR");
      console.log("Estado de conexión:", obtenerEstadoConexion());
      console.log("Resumen:", obtenerResumenEstado());
      console.groupEnd();
    }
  }, [obtenerEstadoConexion, obtenerResumenEstado]);

  const obtenerInfoDebug = useCallback(() => {
    return {
      ...debugInfo,
      estadoCompleto: obtenerEstadoConexion(),
      resumen: obtenerResumenEstado(),
      timestamp: new Date().toISOString(),
    };
  }, [debugInfo, obtenerEstadoConexion, obtenerResumenEstado]);

  return {
    debugInfo,
    logEstadoCompleto,
    obtenerInfoDebug,
    esDebugging: EnvConfig.DEBUG_MODE,
  };
};

export default useSignalRConnection;
