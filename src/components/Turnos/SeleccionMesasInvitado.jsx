import React, { useState, useCallback } from 'react';
import { Save, Users, AlertCircle, Loader2, X, Info } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import clsx from 'clsx';

/**
 * Componente para que el graduado seleccione mesas durante su turno activo
 * Versión simplificada enfocada en el flujo de turnos
 * 
 * @param {Object} props
 * @param {string} props.eventoId - ID del evento
 * @param {string} props.invitadoId - ID del invitado actual
 * @param {Object} props.invitado - Datos del invitado
 * @param {Object} props.estadoOcupacion - Estado actual de ocupación de mesas
 * @param {Object} props.configuracionTurnos - Configuración del sistema de turnos
 * @param {Object} props.layoutEvento - Layout del evento
 * @param {Array} props.elementosLayout - Elementos del layout (mesas)
 * @param {boolean} props.loadingLayout - Estado de carga del layout
 * @param {Function} props.onGuardarSeleccion - Callback al guardar selección
 * @param {boolean} props.guardando - Indicador de guardado en proceso
 * @param {boolean} props.puedeSeleccionar - Si el usuario puede seleccionar ahora
 */
export default function SeleccionMesasInvitado({
  eventoId,
  invitadoId,
  invitado,
  estadoOcupacion,
  configuracionTurnos,
  layoutEvento,
  elementosLayout,
  loadingLayout,
  onGuardarSeleccion,
  guardando = false,
  puedeSeleccionar = false
}) {
  const { showError, showWarning } = useNotifications();

  // Estado de selección
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState([]);
  const [lugaresSeleccionados, setLugaresSeleccionados] = useState([]);
  const [personasPorMesa, setPersonasPorMesa] = useState({});
  const [tipoMenuSeleccionado, setTipoMenuSeleccionado] = useState(null);
  const [restriccionDietetica, setRestriccionDietetica] = useState('Ninguna');

  // Cantidad total de personas a asignar
  const cantidadTotal = invitado?.cantidad_personas || 1;
  const personasAsignadas = Object.values(personasPorMesa).reduce((sum, val) => sum + val, 0);
  const faltanAsignar = cantidadTotal - personasAsignadas;

  /**
   * Verificar si una mesa está disponible
   */
  const esMesaDisponible = useCallback((mesaId) => {
    if (!estadoOcupacion?.mesas) return false;
    
    const mesa = estadoOcupacion.mesas.find(m => m.id === mesaId);
    if (!mesa) return false;
    
    return mesa.lugares_disponibles > 0;
  }, [estadoOcupacion]);

  /**
   * Obtener lugares disponibles de una mesa
   */
  const getLugaresDisponibles = useCallback((mesaId) => {
    if (!estadoOcupacion?.mesas) return 0;
    
    const mesa = estadoOcupacion.mesas.find(m => m.id === mesaId);
    return mesa?.lugares_disponibles || 0;
  }, [estadoOcupacion]);

  /**
   * Manejar selección de mesa
   */
  const handleSeleccionarMesa = (mesa) => {
    if (!puedeSeleccionar) {
      showWarning('No puedes seleccionar mesas fuera de tu turno activo');
      return;
    }

    if (!esMesaDisponible(mesa.id)) {
      showWarning('Esta mesa no tiene lugares disponibles');
      return;
    }

    // Si ya está seleccionada, solo notificar
    if (mesasSeleccionadas.includes(mesa.id)) {
      showWarning('Esta mesa ya está en tu selección');
      return;
    }

    // Verificar si aún faltan personas por asignar
    if (faltanAsignar === 0) {
      showWarning('Ya has asignado todas tus personas');
      return;
    }

    // Agregar mesa a selección
    setMesasSeleccionadas(prev => [...prev, mesa.id]);
    setPersonasPorMesa(prev => ({
      ...prev,
      [mesa.id]: Math.min(faltanAsignar, getLugaresDisponibles(mesa.id))
    }));
  };

  /**
   * Remover mesa de selección
   */
  const handleRemoverMesa = (mesaId) => {
    setMesasSeleccionadas(prev => prev.filter(id => id !== mesaId));
    setPersonasPorMesa(prev => {
      const nuevo = { ...prev };
      delete nuevo[mesaId];
      return nuevo;
    });
    setLugaresSeleccionados(prev => prev.filter(l => l.mesa_id !== mesaId));
  };

  /**
   * Actualizar cantidad de personas en una mesa
   */
  const handleCambiarCantidad = (mesaId, cantidad) => {
    const disponibles = getLugaresDisponibles(mesaId);
    const nuevaCantidad = Math.min(Math.max(1, cantidad), disponibles);
    
    setPersonasPorMesa(prev => ({
      ...prev,
      [mesaId]: nuevaCantidad
    }));
  };

  /**
   * Validar selección antes de guardar
   */
  const validarSeleccion = () => {
    if (mesasSeleccionadas.length === 0) {
      showError('Debes seleccionar al menos una mesa');
      return false;
    }

    if (faltanAsignar > 0) {
      showError(`Faltan ${faltanAsignar} graduados por asignar`);
      return false;
    }

    if (faltanAsignar < 0) {
      showError('Has asignado más personas de las permitidas');
      return false;
    }

    if (!tipoMenuSeleccionado && configuracionTurnos?.tipos_menu?.length > 0) {
      showError('Debes seleccionar un tipo de menú');
      return false;
    }

    return true;
  };

  /**
   * Guardar selección
   */
  const handleGuardar = async () => {
    if (!validarSeleccion()) return;

    const seleccion = {
      mesas_seleccionadas: mesasSeleccionadas.map(mesaId => ({
        mesa_id: mesaId,
        cantidad_personas: personasPorMesa[mesaId] || 0,
        lugares: lugaresSeleccionados.filter(l => l.mesa_id === mesaId)
      })),
      tipo_menu: tipoMenuSeleccionado,
      restriccion_dietetica: restriccionDietetica,
      cantidad_total: cantidadTotal
    };

    await onGuardarSeleccion(seleccion);
  };

  return (
    <div className="space-y-6">
      {/* Header con instrucciones */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
              Instrucciones de Selección
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Selecciona las mesas donde deseas sentarte. Debes asignar exactamente {cantidadTotal} {cantidadTotal === 1 ? 'lugar' : 'lugares'}.
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de selección */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Tu Selección
          </h3>
          <div className={clsx(
            "px-3 py-1 rounded-full text-sm font-semibold",
            faltanAsignar === 0 
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
          )}>
            {personasAsignadas} / {cantidadTotal} graduados
          </div>
        </div>

        {mesasSeleccionadas.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No has seleccionado ninguna mesa</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mesasSeleccionadas.map(mesaId => {
              const mesa = estadoOcupacion?.mesas?.find(m => m.id === mesaId);
              if (!mesa) return null;

              return (
                <div 
                  key={mesaId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#246370] dark:bg-[#2a9d8f] flex items-center justify-center text-white font-semibold">
                      {mesa.numero}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        Mesa {mesa.numero}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {mesa.lugares_disponibles} lugares disponibles
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCambiarCantidad(mesaId, (personasPorMesa[mesaId] || 1) - 1)}
                        className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center"
                        disabled={!puedeSeleccionar || (personasPorMesa[mesaId] || 1) <= 1}
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white w-8 text-center">
                        {personasPorMesa[mesaId] || 0}
                      </span>
                      <button
                        onClick={() => handleCambiarCantidad(mesaId, (personasPorMesa[mesaId] || 1) + 1)}
                        className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center"
                        disabled={!puedeSeleccionar || (personasPorMesa[mesaId] || 1) >= getLugaresDisponibles(mesaId)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoverMesa(mesaId)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      disabled={!puedeSeleccionar}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selección de tipo de menú */}
      {configuracionTurnos?.tipos_menu && configuracionTurnos.tipos_menu.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Tipo de Menú
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {configuracionTurnos.tipos_menu.map(tipo => (
              <button
                key={tipo.id}
                onClick={() => setTipoMenuSeleccionado(tipo.id)}
                disabled={!puedeSeleccionar}
                className={clsx(
                  "p-3 rounded-lg border-2 transition-all text-left",
                  tipoMenuSeleccionado === tipo.id
                    ? "border-[#246370] dark:border-[#2a9d8f] bg-[#246370]/10 dark:bg-[#2a9d8f]/10"
                    : "border-gray-200 dark:border-gray-600 hover:border-[#246370]/50 dark:hover:border-[#2a9d8f]/50",
                  !puedeSeleccionar && "opacity-50 cursor-not-allowed"
                )}
              >
                <p className="font-semibold text-gray-800 dark:text-white text-sm">
                  {tipo.nombre}
                </p>
                {tipo.descripcion && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {tipo.descripcion}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Restricciones dietéticas */}
      {configuracionTurnos?.restricciones_dieteticas && configuracionTurnos.restricciones_dieteticas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Restricciones Dietéticas
          </h3>
          <select
            value={restriccionDietetica}
            onChange={(e) => setRestriccionDietetica(e.target.value)}
            disabled={!puedeSeleccionar}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-[#246370] dark:focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#246370]/20 dark:focus:ring-[#2a9d8f]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {configuracionTurnos.restricciones_dieteticas.map(restriccion => (
              <option key={restriccion} value={restriccion}>
                {restriccion}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Botón de guardar */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGuardar}
          disabled={!puedeSeleccionar || guardando || faltanAsignar !== 0}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all",
            faltanAsignar === 0 && puedeSeleccionar
              ? "bg-[#246370] dark:bg-[#2a9d8f] text-white hover:bg-[#1d4f5c] dark:hover:bg-[#228b7f]"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          )}
        >
          {guardando ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Selección
            </>
          )}
        </button>
      </div>

      {/* Advertencias */}
      {faltanAsignar > 0 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Faltan {faltanAsignar} {faltanAsignar === 1 ? 'graduado' : 'graduados'} por asignar
          </p>
        </div>
      )}

      {!puedeSeleccionar && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-400">
            No puedes realizar cambios fuera de tu turno activo
          </p>
        </div>
      )}

      {/* Vista de mesas disponibles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Mesas Disponibles
        </h3>
        
        {loadingLayout ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cargando mesas del evento...
            </p>
          </div>
        ) : !elementosLayout || elementosLayout.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay mesas configuradas para este evento
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {elementosLayout
              .filter(el => (el.type === 'mesa' || el.type === 'mesaRectangular') && el.numero)
              .sort((a, b) => (a.numero || 0) - (b.numero || 0))
              .map(mesa => {
                // Buscar disponibilidad en estadoOcupacion
                const estadoMesa = estadoOcupacion?.mesas?.find(m => m.numero === mesa.numero);
                const lugaresDisponibles = estadoMesa?.lugares_disponibles || mesa.capacidad || 0;
                const estaDisponible = lugaresDisponibles > 0;
                
                return (
                  <button
                    key={mesa.id}
                    onClick={() => handleSeleccionarMesa({ 
                      id: mesa.id, 
                      numero: mesa.numero,
                      capacidad: mesa.capacidad,
                      lugares_disponibles: lugaresDisponibles
                    })}
                    disabled={!puedeSeleccionar || !estaDisponible}
                    className={clsx(
                      "p-4 rounded-lg border-2 transition-all text-center",
                      mesasSeleccionadas.includes(mesa.id)
                        ? "border-[#246370] dark:border-[#2a9d8f] bg-[#246370]/10 dark:bg-[#2a9d8f]/10"
                        : estaDisponible
                          ? "border-gray-200 dark:border-gray-600 hover:border-[#246370]/50 dark:hover:border-[#2a9d8f]/50"
                          : "border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-50",
                      (!puedeSeleccionar || !estaDisponible) && "cursor-not-allowed"
                    )}
                  >
                    <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                      {mesa.numero}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {estaDisponible 
                        ? `${lugaresDisponibles} ${lugaresDisponibles === 1 ? 'lugar' : 'lugares'}`
                        : 'No disponible'
                      }
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Cap: {mesa.capacidad}
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
