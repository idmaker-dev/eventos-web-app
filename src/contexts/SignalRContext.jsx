import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import EnvConfig from '../utils/config';

// Contexto de SignalR
const SignalRContext = createContext();

// Provider del contexto
export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [conectado, setConectado] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    intentosConexion: 0,
    ultimoError: null,
    estadoConexion: 'disconnected',
  });

  // Referencia para manejar callbacks
  const dashboardUpdateCallbackRef = useRef(null);
  const intentosConexionRef = useRef(0);
  const conectandoRef = useRef(false); // Flag para evitar conexiones simultáneas
  const ultimoIntentoRef = useRef(0); // Timestamp del último intento

  // Función para conectar a SignalR
  const conectarSignalR = useCallback(async (userId) => {
    // Verificar si ya está conectado, conectando, o si es muy pronto para otro intento
    const ahora = Date.now();
    const tiempoMinimo = 2000; // 2 segundos entre intentos
    
    if (conectado || conectandoRef.current) {
      if (EnvConfig.DEBUG_MODE) {
        console.log('⚠️ Ya está conectado o conectando a SignalR');
      }
      return { success: true };
    }
    
    if (ahora - ultimoIntentoRef.current < tiempoMinimo) {
      if (EnvConfig.DEBUG_MODE) {
        console.log('⏳ Demasiado pronto para otro intento de conexión');
      }
      return { success: false, error: 'Demasiado pronto para reconectar' };
    }

    // Marcar como conectando y actualizar timestamp
    conectandoRef.current = true;
    ultimoIntentoRef.current = ahora;

    setDebugInfo(prev => ({
      ...prev,
      intentosConexion: prev.intentosConexion + 1
    }));
    
    // Incrementar el ref también
    intentosConexionRef.current = intentosConexionRef.current + 1;

    if (EnvConfig.DEBUG_MODE) {
      console.log(`🔄 Intento de conexión SignalR #${intentosConexionRef.current}`);
    }

    try {
      // Crear nueva conexión SignalR
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`http://localhost:7071/api/v1?userId=${userId}`)
        .withAutomaticReconnect([0, 20000, 50000, 60000]) // Intervalos más controlados
        .configureLogging(signalR.LogLevel.Information) // Reducir logs
        .build();

      // Eventos de conexión
      newConnection.onreconnecting((error) => {
        if (EnvConfig.DEBUG_MODE) {
          console.log('🔄 Reconectando SignalR...', error);
        }
        setDebugInfo(prev => ({
          ...prev,
          estadoConexion: 'reconnecting'
        }));
      });

      newConnection.onreconnected((connectionId) => {
        if (EnvConfig.DEBUG_MODE) {
          console.log('✅ Reconectado a SignalR:', connectionId);
        }
        setDebugInfo(prev => ({
          ...prev,
          estadoConexion: 'connected'
        }));
      });

      newConnection.onclose((error) => {
        if (EnvConfig.DEBUG_MODE) {
          console.log('🔌 Conexión SignalR cerrada:', error);
        }
        setConectado(false);
        setDebugInfo(prev => ({
          ...prev,
          estadoConexion: 'disconnected',
          ultimoError: error
        }));
      });

      // Escuchar evento principal para actualización del dashboard
      newConnection.on('actualizarDashboard', (data) => {
        if (EnvConfig.DEBUG_MODE) {
          console.log('📩 Notificación recibida: actualizarDashboard');
          console.log('📊 Datos completos:', JSON.stringify(data, null, 2));
        }

        // Agregar notificación al estado
        const nuevaNotificacion = {
          tipo: 'dashboard_update',
          mensaje: 'El dashboard requiere actualización',
          data,
          timestamp: new Date().toISOString(),
        };

        setNotificaciones(prev => [nuevaNotificacion, ...prev]);

        // Ejecutar callback si existe
        if (dashboardUpdateCallbackRef.current) {
          dashboardUpdateCallbackRef.current(data);
        }
      });

      // Listener genérico para debug
      newConnection.onreceive = (data) => {
        if (EnvConfig.DEBUG_MODE) {
          console.log('📨 Mensaje raw recibido:', data);
        }
      };

      if (EnvConfig.DEBUG_MODE) {
        console.log('🚀 Iniciando conexión SignalR...');
      }

      await newConnection.start();

      setConnection(newConnection);
      setConectado(true);
      setDebugInfo(prev => ({
        ...prev,
        estadoConexion: 'connected'
      }));

      if (EnvConfig.DEBUG_MODE) {
        console.log('✅ Conectado a SignalR exitosamente');
        console.log('🆔 Connection ID:', newConnection.connectionId);
      }

      // Limpiar flag de conectando
      conectandoRef.current = false;
      return { success: true };
    } catch (error) {
      if (EnvConfig.DEBUG_MODE) {
        console.error('❌ Error conectando a SignalR:', error);
      }
      
      setDebugInfo(prev => ({
        ...prev,
        ultimoError: error,
        estadoConexion: 'error'
      }));

      // Limpiar flag de conectando
      conectandoRef.current = false;
      return { success: false, error };
    }
  }, [conectado]); // Eliminar debugInfo.intentosConexion de las dependencias

  // Función para desconectar SignalR
  const desconectarSignalR = useCallback(async () => {
    if (connection && conectado) {
      try {
        await connection.stop();
        setConnection(null);
        setConectado(false);
        setDebugInfo(prev => ({
          ...prev,
          estadoConexion: 'disconnected'
        }));
        
        // Limpiar flag de conectando
        conectandoRef.current = false;
        
        if (EnvConfig.DEBUG_MODE) {
          console.log('🔌 Desconectado de SignalR');
        }
      } catch (error) {
        if (EnvConfig.DEBUG_MODE) {
          console.error('❌ Error al desconectar SignalR:', error);
        }
        // Limpiar flag incluso si hay error
        conectandoRef.current = false;
      }
    }
  }, [connection, conectado]);

  // Función para limpiar notificaciones
  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([]);
  }, []);

  // Función para registrar callback de actualización del dashboard
  const registrarCallbackDashboard = useCallback((callback) => {
    dashboardUpdateCallbackRef.current = callback;
  }, []);

  // Función para desregistrar callback
  const desregistrarCallbackDashboard = useCallback(() => {
    dashboardUpdateCallbackRef.current = null;
  }, []);

  // Función para obtener información de estado
  const obtenerEstadoConexion = useCallback(() => {
    return {
      conectado,
      connection,
      debugInfo,
      notificaciones: notificaciones.length
    };
  }, [conectado, connection, debugInfo, notificaciones.length]);

  const value = {
    // Estado
    connection,
    notificaciones,
    conectado,
    debugInfo,
    
    // Funciones
    conectarSignalR,
    desconectarSignalR,
    limpiarNotificaciones,
    registrarCallbackDashboard,
    desregistrarCallbackDashboard,
    obtenerEstadoConexion,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};

// Hook personalizado para usar el contexto de SignalR
export const useSignalR = () => {
  const context = useContext(SignalRContext);

  if (!context) {
    throw new Error('useSignalR debe ser usado dentro de un SignalRProvider');
  }

  return context;
};

export default SignalRContext;