import React, { useState, useEffect } from 'react';
import { useSignalRConnection, useSignalRDebug } from '../hooks/useSignalR';
import { useAuth } from '../hooks/useAuth';

export default function SignalRTest() {
  const [mensajePrueba, setMensajePrueba] = useState('');
  const [historialConexiones, setHistorialConexiones] = useState([]);
  
  const { user } = useAuth();
  const {
    conectado,
    debugInfo,
    notificaciones,
    autoConnectEnabled,
    conectar,
    desconectar,
    setAutoConnect,
    limpiarNotificaciones,
    obtenerResumenEstado,
    usuarioId,
    usuarioAutenticado
  } = useSignalRConnection();
  
  const {
    logEstadoCompleto,
    obtenerInfoDebug,
    esDebugging
  } = useSignalRDebug();

  // Agregar registro al historial cuando cambie el estado de conexión
  useEffect(() => {
    const registro = {
      timestamp: new Date().toISOString(),
      estado: debugInfo.estadoConexion,
      conectado,
      intentos: debugInfo.intentosConexion,
      error: debugInfo.ultimoError?.message || null
    };
    
    setHistorialConexiones(prev => [registro, ...prev.slice(0, 9)]); // Mantener últimos 10
  }, [conectado, debugInfo]);

  const handleConectarManual = async () => {
    setMensajePrueba('Conectando manualmente...');
    const resultado = await conectar();
    setMensajePrueba(resultado.success ? 'Conectado exitosamente' : `Error: ${resultado.error}`);
  };

  const handleDesconectarManual = async () => {
    setMensajePrueba('Desconectando...');
    await desconectar();
    setMensajePrueba('Desconectado');
  };

  const handleLimpiarNotificaciones = () => {
    limpiarNotificaciones();
    setMensajePrueba('Notificaciones limpiadas');
  };

  const formatearFecha = (fechaString) => {
    return new Date(fechaString).toLocaleString('es-MX');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        🔧 Prueba de SignalR
      </h1>

      {/* Información del usuario */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
          👤 Información del Usuario
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Autenticado:</span> 
            <span className={`ml-2 px-2 py-1 rounded ${usuarioAutenticado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {usuarioAutenticado ? 'Sí' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium">Usuario ID:</span> 
            <span className="ml-2">{usuarioId || 'No disponible'}</span>
          </div>
          <div>
            <span className="font-medium">Email:</span> 
            <span className="ml-2">{user?.email || 'No disponible'}</span>
          </div>
          <div>
            <span className="font-medium">Rol:</span> 
            <span className="ml-2">{user?.rol || 'No disponible'}</span>
          </div>
        </div>
      </div>

      {/* Estado de conexión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            🌐 Estado de Conexión
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Estado:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                conectado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {conectado ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estado SignalR:</span>
              <span className="font-mono">{debugInfo.estadoConexion}</span>
            </div>
            <div className="flex justify-between">
              <span>Intentos de conexión:</span>
              <span>{debugInfo.intentosConexion}</span>
            </div>
            <div className="flex justify-between">
              <span>Auto-conexión:</span>
              <span className={autoConnectEnabled ? 'text-green-600' : 'text-red-600'}>
                {autoConnectEnabled ? 'Habilitada' : 'Deshabilitada'}
              </span>
            </div>
            {debugInfo.ultimoError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                <strong>Último error:</strong> {debugInfo.ultimoError.message || debugInfo.ultimoError}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            📊 Notificaciones
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-semibold">{notificaciones.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Dashboard:</span>
              <span>{notificaciones.filter(n => n.tipo === 'dashboard_update').length}</span>
            </div>
            {notificaciones.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">Última notificación:</span>
                <p className="text-xs mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  {formatearFecha(notificaciones[0].timestamp)} - {notificaciones[0].mensaje}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          🎮 Controles
        </h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={handleConectarManual}
            disabled={conectado}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Conectar manualmente
          </button>
          <button
            onClick={handleDesconectarManual}
            disabled={!conectado}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Desconectar
          </button>
          <button
            onClick={() => setAutoConnect(!autoConnectEnabled)}
            className={`px-4 py-2 rounded text-white ${
              autoConnectEnabled ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {autoConnectEnabled ? 'Desactivar auto-conexión' : 'Activar auto-conexión'}
          </button>
          <button
            onClick={handleLimpiarNotificaciones}
            disabled={notificaciones.length === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar notificaciones
          </button>
          <button
            onClick={logEstadoCompleto}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Log estado completo
          </button>
        </div>
        
        {mensajePrueba && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
            {mensajePrueba}
          </div>
        )}
      </div>

      {/* Historial de conexiones */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          📝 Historial de Conexiones
        </h2>
        <div className="max-h-64 overflow-y-auto">
          {historialConexiones.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay registros de conexión aún</p>
          ) : (
            <div className="space-y-2">
              {historialConexiones.map((registro, index) => (
                <div key={index} className="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-mono">{formatearFecha(registro.timestamp)}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      registro.conectado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {registro.estado}
                    </span>
                  </div>
                  {registro.error && (
                    <p className="text-red-600 mt-1">Error: {registro.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          📨 Notificaciones Recibidas
        </h2>
        <div className="max-h-64 overflow-y-auto">
          {notificaciones.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay notificaciones aún</p>
          ) : (
            <div className="space-y-2">
              {notificaciones.map((notif, index) => (
                <div key={index} className="text-xs p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">{notif.mensaje}</span>
                    <span className="text-gray-500">{formatearFecha(notif.timestamp)}</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    <strong>Tipo:</strong> {notif.tipo}
                  </div>
                  {notif.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        Ver datos
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs overflow-auto">
                        {JSON.stringify(notif.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Información de debug adicional */}
      {esDebugging && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-900 border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
            🐛 Información de Debug
          </h2>
          <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border overflow-auto">
            {JSON.stringify(obtenerInfoDebug(), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}