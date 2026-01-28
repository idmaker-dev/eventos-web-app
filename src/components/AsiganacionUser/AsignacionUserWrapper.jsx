import React, { useEffect } from 'react';
import useTurnosInvitado from '../../hooks/useTurnosInvitado';
import AsignacionUser from './AsiganacionUser';
import ModalEspera from './ModalEspera';
import Navbar from './Navbar';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSignalR } from '../../contexts/SignalRContext';

/**
 * Wrapper para AsignacionUser que integra el sistema de turnos
 * Funciona SIN autenticación, usando invitadoId del URL (como PortalPagos)
 * 
 * NOTA: AsignacionUser obtiene el layout directamente del endpoint de disponibilidad,
 * por lo que NO necesita recibir layoutEvento, elementosLayout ni loadingLayout
 */
export default function AsignacionUserWrapper({
  temporizadorActivo,
  onCambioEstado,
  invitadoId, // ID del invitado desde URL
  eventoId, // ID del evento desde URL
}) {
  const { showSuccess, showError } = useNotifications();
  const { conectado, conectarSignalR, desconectarSignalR } = useSignalR();
  
  // Hook de turnos (ahora incluye datos del invitado)
  const {
    turno,
    invitado, // ✅ Ahora viene del hook, no de props
    estadoTurno,
    puedeAcceder,
    tiempoRestante,
    seleccion,
    estadoOcupacion,
    configuracionTurnos, // ✅ Configuración de turnos (tipos_menu, restricciones, etc.)
    loading: loadingTurnos,
    error: errorTurnos,
    guardandoSeleccion,
    guardarSeleccion,
    refrescar,
  } = useTurnosInvitado(
    eventoId,
    invitadoId,
    {
      autoRefresh: true,
      refreshInterval: 30000, // 30 segundos
    }
  );

  /**
   * Determinar si el evento usa sistema de turnos
   */
  const usaSistemaTurnos = estadoTurno !== 'sin_turno' || loadingTurnos;

  // 🔍 Debug: Verificar que configuracionTurnos se extrae correctamente
  useEffect(() => {
    console.log('🔧 [AsignacionUserWrapper] configuracionTurnos desde hook:', configuracionTurnos);
  }, [configuracionTurnos]);

  /**
   * Conectar/Desconectar SignalR cuando cambia el estado del turno
   */
  useEffect(() => {
    // Solo conectar si está en espera o activo y no está conectado
    if (invitadoId && (estadoTurno === 'espera' || estadoTurno === 'activo') && !conectado) {
      console.log('🔌 [Wrapper] Conectando SignalR con invitadoId:', invitadoId);
      conectarSignalR(invitadoId);
    }

    // Desconectar cuando el componente se desmonte o cuando ya no esté en espera/activo
    return () => {
      if (conectado && estadoTurno !== 'espera' && estadoTurno !== 'activo') {
        console.log('🔌 [Wrapper] Desconectando SignalR');
        desconectarSignalR();
      }
    };
  }, [invitadoId, estadoTurno, conectado, conectarSignalR, desconectarSignalR]);

  /**
   * Manejar guardado de selección con turnos
   */
  const handleGuardarSeleccionConTurnos = async (datosSeleccion) => {
    const resultado = await guardarSeleccion(datosSeleccion);
    
    if (resultado.success) {
      showSuccess('Selección guardada exitosamente');
      // Notificar cambio de estado al padre si existe
      if (onCambioEstado) {
        onCambioEstado('completado');
      }
    } else {
      showError(resultado.error || 'Error al guardar selección');
    }
    
    return resultado;
  };

  // Loading inicial
  if (loadingTurnos && invitadoId && eventoId) {
    return (
      <>
        <Navbar usuario={{ nombre: 'Cargando...' }} />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#246370] dark:text-[#2a9d8f] mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Cargando información del evento...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Error al cargar turnos o datos no encontrados
  if (errorTurnos && usaSistemaTurnos) {
    // Determinar si es un error de URL incorrecta (404) o datos no encontrados
    const esUrlInvalida = errorTurnos.includes('404') || 
                          errorTurnos.includes('no encontrado') || 
                          errorTurnos.includes('not found') ||
                          !invitado;

    return (
      <>
        <Navbar usuario={{ nombre: 'Usuario' }} />
        <div className="min-h-screen flex items-center justify-center bg-fondoVs p-4">
          <div className="bg-white rounded-lg shadow-lg border-2 border-red-300 p-8 max-w-lg">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {esUrlInvalida ? 'URL Incorrecta' : 'Error al Cargar Datos'}
              </h3>
              
              <p className="text-gray-600 text-base mb-6">
                {esUrlInvalida ? (
                  <>
                    No se encontró información del turno con los datos proporcionados.
                    <br />
                    <br />
                    Por favor, verifica que la URL sea correcta y vuelve a intentarlo.
                  </>
                ) : (
                  <>
                    Ocurrió un error al cargar la información del evento.
                    <br />
                    <br />
                    {errorTurnos}
                  </>
                )}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>💡 Sugerencias:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 text-left space-y-1">
                  <li>• Verifica que hayas copiado la URL completa</li>
                  <li>• Asegúrate de usar el enlace enviado por el organizador</li>
                  <li>• Revisa que no hayan espacios adicionales en la URL</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={refrescar}
                  className="px-6 py-2 bg-casal text-white rounded-lg hover:bg-casal/90 transition-all font-medium"
                >
                  Reintentar
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Ir al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 🚫 MOSTRAR MODAL DE ESPERA si no está en su turno
  if (estadoTurno === 'espera') {
    const horaInicio = turno ? new Date(turno.fecha_hora_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const horaFin = turno ? new Date(turno.fecha_hora_fin).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    
    // Calcular duración real del turno en minutos desde las fechas
    let duracionMinutos = 30; // Valor por defecto
    if (turno?.fecha_hora_inicio && turno?.fecha_hora_fin) {
      const inicio = new Date(turno.fecha_hora_inicio);
      const fin = new Date(turno.fecha_hora_fin);
      duracionMinutos = Math.round((fin - inicio) / 60000); // Convertir ms a minutos
    }
    
    // Cargar configuración previa de localStorage si existe
    const loadConfiguracionPrevia = () => {
      try {
        const saved = localStorage.getItem(`config-asientos-${invitadoId}`);
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Error al cargar configuración previa:', error);
        return null;
      }
    };
    
    // Callback para guardar configuración
    const handleGuardarConfiguracion = (config) => {
      console.log('Configuración guardada desde wrapper:', config);
    };

    return (
      <>
        <Navbar usuario={{ nombre: invitado?.nombre_completo || invitado?.nombre || 'Usuario' }} />
        <ModalEspera
          open={true}
          usuario={{
            id: invitadoId,
            nombre: invitado?.nombre_completo || invitado?.nombre || 'Usuario',
            nombre_completo: invitado?.nombre_completo || invitado?.nombre || 'Usuario',
            cantidad_personas: invitado?.cantidad_personas || 1,
            cantidad: invitado?.cantidad_personas || 1,
          }}
          horario={{
            inicio: horaInicio,
            fin: horaFin,
            duracionMinutos: duracionMinutos
          }}
          eventoId={eventoId}
          invitadoId={invitadoId}
          configuracionPrevia={loadConfiguracionPrevia()}
          configuracionTurnos={configuracionTurnos}
          onGuardarConfiguracion={handleGuardarConfiguracion}
        />
      </>
    );
  }

  // ✅ Renderizar el componente AsignacionUser ORIGINAL con validaciones de turnos
  // AsignacionUser ahora obtiene el layout directamente del endpoint de disponibilidad
  return (
    <>
      <Navbar usuario={{ nombre: invitado?.nombre_completo || invitado?.nombre || 'Usuario' }} />
      <AsignacionUser
      // Props estándar
      temporizadorActivo={estadoTurno === 'activo'}
      invitado={invitado}
      invitadoId={invitadoId}
      eventoId={eventoId}
      onCambioEstado={onCambioEstado}
      
      // Props específicos de turnos
      usandoSistemaTurnos={usaSistemaTurnos}
      turno={turno}
      estadoTurno={estadoTurno}
      tiempoRestante={tiempoRestante}
      seleccion={seleccion}
      estadoOcupacion={estadoOcupacion}
      configuracionTurnos={configuracionTurnos} // ✅ Configuración desde el hook
      
      // Funciones
      onGuardarSeleccion={handleGuardarSeleccionConTurnos}
      guardandoSeleccion={guardandoSeleccion}
      puedeAcceder={puedeAcceder}
    />
    </>
  );
}
