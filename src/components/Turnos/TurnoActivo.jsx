import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2, Calendar } from 'lucide-react';
import clsx from 'clsx';

/**
 * Componente que muestra el estado actual del turno del invitado
 * Incluye countdown timer para turnos activos
 * 
 * @param {Object} props
 * @param {string} props.estadoTurno - Estado actual: 'verificando' | 'espera' | 'activo' | 'completado' | 'sin_turno' | 'expirado'
 * @param {Object} props.turno - Datos del turno
 * @param {number} props.tiempoRestante - Tiempo restante en segundos (solo para turno activo)
 * @param {boolean} props.loading - Indicador de carga
 * @param {Function} props.onRefresh - Función para refrescar datos
 */
export default function TurnoActivo({ 
  estadoTurno, 
  turno, 
  tiempoRestante, 
  loading,
  onRefresh 
}) {
  /**
   * Formatear segundos a formato HH:MM:SS
   */
  const formatearTiempo = (segundos) => {
    if (segundos === null || segundos === undefined) return '--:--:--';
    
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  };

  /**
   * Formatear fecha y hora para mostrar
   */
  const formatearFechaHora = (fechaHora) => {
    if (!fechaHora) return '';
    
    const fecha = new Date(fechaHora);
    return fecha.toLocaleString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Obtener color según tiempo restante
   */
  const getColorTiempo = () => {
    if (!tiempoRestante) return 'text-gray-600 dark:text-gray-400';
    
    if (tiempoRestante <= 300) return 'text-red-600 dark:text-red-400'; // Menos de 5 minutos
    if (tiempoRestante <= 600) return 'text-yellow-600 dark:text-yellow-400'; // Menos de 10 minutos
    return 'text-[#246370] dark:text-[#2a9d8f]'; // Más de 10 minutos
  };

  // Estado: Verificando
  if (loading || estadoTurno === 'verificando') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#246370] dark:text-[#2a9d8f]" />
          <p className="text-gray-600 dark:text-gray-400">
            Verificando tu turno...
          </p>
        </div>
      </div>
    );
  }

  // Estado: Sin turno asignado
  if (estadoTurno === 'sin_turno') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-yellow-300 dark:border-yellow-600 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              No tienes turno asignado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              El sistema de turnos aún no ha sido configurado o no se te ha asignado un turno. 
              Por favor, contacta al organizador del evento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Turno expirado
  if (estadoTurno === 'expirado') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-red-300 dark:border-red-600 p-6">
        <div className="flex items-start gap-4">
          <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Tu turno ha expirado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              El tiempo asignado para tu turno ha finalizado. Si necesitas realizar cambios, 
              contacta al organizador del evento.
            </p>
            {turno && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>Turno: {turno.numero_turno}</p>
                <p>Finalizó: {formatearFechaHora(turno.fecha_hora_fin)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Estado: Completado
  if (estadoTurno === 'completado') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-green-300 dark:border-green-600 p-6">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Selección completada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Has completado tu selección de mesas exitosamente. 
              Gracias por participar en el proceso.
            </p>
            {turno && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>Turno: {turno.numero_turno}</p>
                <p>Completado: {formatearFechaHora(turno.fecha_completado || turno.fecha_hora_fin)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Estado: En espera
  if (estadoTurno === 'espera' && turno) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-blue-300 dark:border-blue-600 p-6">
        <div className="flex items-start gap-4">
          <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Tu turno está programado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Podrás seleccionar tus mesas cuando llegue tu turno.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Número de turno:
                </span>
                <span className="text-lg font-bold text-[#246370] dark:text-[#2a9d8f]">
                  #{turno.numero_turno}
                </span>
              </div>
              
              <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Inicio:
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {formatearFechaHora(turno.fecha_hora_inicio)}
                </p>
              </div>
              
              <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Fin:
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {formatearFechaHora(turno.fecha_hora_fin)}
                </p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 italic">
              Recibirás una notificación cuando tu turno esté activo
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: Activo
  if (estadoTurno === 'activo' && turno) {
    const colorTiempo = getColorTiempo();
    const esUrgente = tiempoRestante <= 300; // Menos de 5 minutos
    
    return (
      <div className={clsx(
        "bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 p-6",
        esUrgente 
          ? "border-red-400 dark:border-red-500 animate-pulse" 
          : "border-[#246370] dark:border-[#2a9d8f]"
      )}>
        <div className="flex items-start gap-4">
          <Clock className={clsx(
            "w-8 h-8 flex-shrink-0 mt-1",
            esUrgente ? "text-red-600 dark:text-red-400" : "text-[#246370] dark:text-[#2a9d8f]"
          )} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              ¡Tu turno está activo!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Puedes seleccionar tus mesas ahora. Aprovecha tu tiempo asignado.
            </p>
            
            {/* Countdown principal */}
            <div className="bg-gradient-to-r from-[#246370]/10 to-[#2a9d8f]/10 dark:from-[#246370]/20 dark:to-[#2a9d8f]/20 rounded-lg p-6 mb-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-2">
                Tiempo restante
              </p>
              <div className={clsx(
                "text-5xl font-bold text-center tabular-nums",
                colorTiempo
              )}>
                {formatearTiempo(tiempoRestante)}
              </div>
              {esUrgente && (
                <p className="text-xs text-red-600 dark:text-red-400 text-center mt-2 font-semibold">
                  ⚠️ ¡Apúrate! Quedan menos de 5 minutos
                </p>
              )}
            </div>
            
            {/* Información del turno */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Número de turno
                </p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  #{turno.numero_turno}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Finaliza
                </p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {new Date(turno.fecha_hora_fin).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="mt-4 w-full text-xs text-[#246370] dark:text-[#2a9d8f] hover:underline"
              >
                Actualizar estado
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Estado por defecto (no debería llegar aquí)
  return null;
}
