import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { X, GripVertical, Loader2, AlertCircle, CheckCircle2, Sparkles, Users, Calendar } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import guestService from '../../services/guestService';
import turnosService from '../../services/turnosService';
import { useNotifications } from '../../contexts/NotificationContext';

/**
 * Modal para ordenar manualmente los invitados para la generación de turnos
 */
const ModalOrdenManualTurnos = ({ isOpen, onClose, eventoId }) => {
  const { showSuccess, showError } = useNotifications();
  const [invitados, setInvitados] = useState([]);
  const [invitadosOrdenados, setInvitadosOrdenados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modoSeleccion, setModoSeleccion] = useState(null); // null, 'automatico', 'manual'
  
  const [dryRunResult, setDryRunResult] = useState(null);
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [overrideConflicts, setOverrideConflicts] = useState(false);
  const [showSampleAssignments, setShowSampleAssignments] = useState(false);

  /**
   * Cargar invitados del evento
   */
  useEffect(() => {
    if (!(isOpen && eventoId)) return;

    const cargarInvitados = async () => {
      setIsLoading(true);
      try {
        const response = await guestService.getGuests(eventoId);
        if (response.success && response.guests) {
          const todosInvitados = response.guests;

          if (todosInvitados.length === 0) {
            showError('No hay graduados en este evento');
            setInvitados([]);
            setInvitadosOrdenados([]);
          } else {
            const ordenados = [...todosInvitados].sort((a, b) => {
              if (a.deuda_liquidada && !b.deuda_liquidada) return -1;
              if (!a.deuda_liquidada && b.deuda_liquidada) return 1;

              if (a.deuda_liquidada && b.deuda_liquidada) {
                const fechaA = a.fecha_liquidacion || '';
                const fechaB = b.fecha_liquidacion || '';
                if (fechaA && fechaB) return new Date(fechaA) - new Date(fechaB);
              }

              return (a.nombre_completo || a.nombre || '').localeCompare(
                b.nombre_completo || b.nombre || ''
              );
            });

            setInvitados(ordenados);
            setInvitadosOrdenados(ordenados);
          }
        } else {
          showError('Error al cargar graduados');
          setInvitados([]);
          setInvitadosOrdenados([]);
        }
      } catch (error) {
        console.error('Error al cargar invitados:', error);
        showError('Error al cargar graduados del evento');
        setInvitados([]);
        setInvitadosOrdenados([]);
      } finally {
        setIsLoading(false);
      }
    };

    cargarInvitados();
  }, [isOpen, eventoId, showError]);

  /**
   * Configurar sensores para drag & drop
   */
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeInvitado, setActiveInvitado] = useState(null);

  /**
   * Manejar el reordenamiento drag & drop
   */
  const handleDragStart = (event) => {
    const { active } = event;
    const invitado = invitadosOrdenados.find(inv => inv.id === active.id);
    setActiveInvitado(invitado);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    setActiveInvitado(null);

    if (!over || active.id === over.id) return;

    setInvitadosOrdenados((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  };

  /**
   * Generar turnos con orden automático (por fecha de liquidación)
   */
  const handleGenerarAutomatico = async () => {
    setIsGenerating(true);
    try {
      const response = await turnosService.generarTurnos(eventoId);
      
      if (response.success) {
        showSuccess(
          `Turnos generados automáticamente: ${response.data?.turnos_generados || 0} turnos creados`
        );
        onClose(true); // true indica que se generaron turnos
      } else {
        showError(response.error || 'Error al generar turnos');
      }
    } catch (error) {
      console.error('Error al generar turnos automáticos:', error);
      showError('Error al generar turnos. Por favor, intente nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

    /**
     * Importar Excel con columna Turnos (dry-run)
     */
    const handleFileSelected = async (file) => {
      if (!file) return;
      setDryRunResult(null);
      setLastUploadedFile(file);
      setShowSampleAssignments(false);

      try {
        const response = await turnosService.importarTurnos(eventoId, file);
        if (response.success) {
          setDryRunResult(response.data?.dryRun || response.data);
          showSuccess('Dry-run realizado. Revisa el resumen antes de aplicar.');
        } else {
          showError(response.error || 'Error realizando dry-run');
        }
      } catch (err) {
        console.error('Error importando archivo:', err);
        showError('Error importando archivo');
      }
    };

    const handleApply = async () => {
      if (!lastUploadedFile) return showError('No hay archivo para aplicar.');
      setIsApplying(true);
      try {
        const response = await turnosService.importarTurnos(eventoId, lastUploadedFile, true, overrideConflicts, (p) => {});
        if (response.success) {
          showSuccess('Asignaciones aplicadas correctamente');
          // cerrar modal indicando cambios
          onClose(true);
        } else {
          showError(response.error || 'Error aplicando asignaciones');
        }
      } catch (err) {
        console.error('Error aplicando asignaciones:', err);
        showError('Error aplicando asignaciones');
      } finally {
        setIsApplying(false);
      }
    };

  /**
   * Generar turnos con orden manual
   */
  const handleGenerarManual = async () => {
    if (invitadosOrdenados.length === 0) {
      showError('No hay graduados para generar turnos');
      return;
    }

    setIsGenerating(true);
    try {
      const invitadosIds = invitadosOrdenados.map(inv => inv.id);
      
      const response = await turnosService.generarTurnosManual(eventoId, invitadosIds);
      
      if (response.success) {
        showSuccess(
          `Turnos generados con orden manual: ${response.data?.turnos_generados || 0} turnos creados`
        );
        onClose(true); // true indica que se generaron turnos
      } else {
        showError(response.error || 'Error al generar turnos con orden manual');
      }
    } catch (error) {
      console.error('Error al generar turnos manuales:', error);
      showError('Error al generar turnos. Por favor, intente nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setModoSeleccion(null);
    onClose(false);
  };

  if (!isOpen) return null;

  // Componente para item sortable individual
  const SortableInvitadoItem = ({ invitado, index }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: invitado.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-4 p-4 bg-white dark:bg-gray-700 border-2 rounded-lg transition-all ${
          isDragging
            ? 'border-purple-500 shadow-lg z-50'
            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
        }`}
      >
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-6 h-6 text-gray-400 flex-shrink-0" />
        </div>
        
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-purple-700 dark:text-purple-300 font-bold text-lg">
            {index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {invitado.nombre_completo || invitado.nombre || 'Sin nombre'}
            </h4>
            {invitado.deuda_liquidada ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                ✓ Liquidado
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                ⚠ Pendiente
              </span>
            )}
          </div>
          <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>👤 {invitado.cantidad_boletos || 0} boletos</span>
            {invitado.email && (
              <span>📧 {invitado.email}</span>
            )}
            {invitado.numero_invitado && (
              <span>#{invitado.numero_invitado}</span>
            )}
          </div>
          {invitado.fecha_liquidacion && (
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600 dark:text-green-400">
              <Calendar className="w-3 h-3" />
              <span>Liquidó: {new Date(invitado.fecha_liquidacion).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Turno #{index + 1}
          </div>
        </div>
      </div>
    );
  };

  // Pantalla de selección de modo
  if (modoSeleccion === null) {
    return (
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-7 h-7 text-casal" />
                Generar Turnos de Selección
              </DialogTitle>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              

              
            </div>

            

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Selecciona cómo deseas generar los turnos para la selección de mesas
              </p>

              {/* Opción Automática */}
              <button
                onClick={() => setModoSeleccion('automatico')}
                className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-casal hover:bg-casal/5 transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-casal/10 rounded-lg group-hover:bg-casal/20 transition-colors">
                    <Sparkles className="w-8 h-8 text-casal" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Generación Automática (Recomendado)
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Los turnos se asignan automáticamente según la <strong>fecha de liquidación de la deuda</strong>.
                      Quien pagó primero obtiene el primer turno.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-casal font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Justo y transparente</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Opción Manual */}
              <button
                onClick={() => setModoSeleccion('manual')}
                className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-casal hover:bg-casal/5 transition-all duration-200 group"
                disabled={isLoading}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <GripVertical className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Orden Manual Personalizado
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Arrastra y suelta los graduados para definir manualmente el orden de los turnos.
                      Útil para casos especiales o consideraciones específicas.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Control total del orden</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Opción Importar: se inserta al final del contenedor de opciones */}
              <div>
                <input id="import-turnos-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={(e) => handleFileSelected(e.target.files[0])} />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => document.getElementById('import-turnos-file')?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('import-turnos-file')?.click(); } }}
                  className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/5 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Importar Turnos desde Excel</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Sube el archivo generado previamente con la columna <strong>Turnos</strong>. Se realizará un dry-run antes de aplicar.</p>
                      {dryRunResult ? (
                        <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          <div>Dry-run: <strong>{dryRunResult.assignmentsCount}</strong> asignaciones, <strong>{dryRunResult.conflicts?.length || 0}</strong> conflictos</div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowSampleAssignments(s => !s); }}
                              className="text-xs text-casal hover:underline"
                            >
                              {showSampleAssignments ? 'Ocultar ejemplo' : 'Ver ejemplo de asignaciones'}
                            </button>
                            <label className="text-xs text-gray-500 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" checked={overrideConflicts} onChange={(e) => setOverrideConflicts(e.target.checked)} />
                              Forzar conflictos
                            </label>
                          </div>
                          <div className="pt-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApply(); }}
                              disabled={isApplying}
                              className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                            >
                              {isApplying ? 'Aplicando...' : 'Aplicar asignaciones'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">Dry-run automático al subir el archivo</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {showSampleAssignments && dryRunResult?.sampleAssignments && (
                <div className="mt-3 p-3 border rounded bg-gray-50 dark:bg-gray-900 text-sm">
                  <div className="font-semibold mb-2">Asignaciones de ejemplo (filas)</div>
                  <ul className="space-y-2 max-h-44 overflow-auto">
                    {dryRunResult.sampleAssignments.map(s => (
                      <li key={s.row} className="flex justify-between">
                        <div>{s.row} — {s.invitado_nombre}</div>
                        <div className="text-gray-600">{s.parsed.type === 'number' ? `#${s.parsed.numero}` : new Date(s.parsed.fecha_hora_inicio).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-casal" />
                  <p className="text-sm text-gray-500 mt-2">Cargando graduados...</p>
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    );
  }

  // Pantalla de confirmación automática
  if (modoSeleccion === 'automatico') {
    return (
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Confirmar Generación Automática
              </DialogTitle>
              <button
                onClick={() => setModoSeleccion(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-blue-900 dark:text-blue-300 font-semibold mb-2">
                      Regla de Asignación Automática
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Los turnos se asignarán en orden según la <strong>fecha de liquidación de la deuda</strong>:
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 ml-4 space-y-1">
                      <li>• Quien pagó <strong>primero</strong> → Primer turno</li>
                      <li>• Quien pagó segundo → Segundo turno</li>
                      <li>• Y así sucesivamente...</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total de graduados: <strong>{invitados.length}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Con deuda liquidada: <strong>{invitados.filter(inv => inv.deuda_liquidada).length}</strong>
                </p>
                {invitados.filter(inv => !inv.deuda_liquidada).length > 0 && (
                  <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                    ⚠️ Los graduados sin deuda liquidada serán omitidos automáticamente
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModoSeleccion(null)}
                disabled={isGenerating}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              >
                Volver
              </button>
              <button
                onClick={handleGenerarAutomatico}
                disabled={isGenerating}
                className="px-6 py-2 bg-casal hover:bg-casal/80 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generar Automáticamente
                  </>
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    );
  }

  // Pantalla de ordenamiento manual
  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-3xl rounded-xl bg-white dark:bg-gray-800 shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <GripVertical className="w-7 h-7 text-purple-600" />
              Ordenar Invitados Manualmente
            </DialogTitle>
            <button
              onClick={() => setModoSeleccion(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Instructions */}
          <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800 space-y-3">
            <p className="text-sm text-purple-900 dark:text-purple-300">
              <strong>Instrucciones:</strong> Arrastra los invitados para definir el orden de los turnos. 
              El primer invitado en la lista tendrá el primer turno de selección.
            </p>
            
            {/* Estadísticas */}
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-purple-900 dark:text-purple-300">
                  Total: {invitados.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-semibold">
                  ✓ Liquidados: {invitados.filter(inv => inv.deuda_liquidada).length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 font-semibold">
                  ⚠ Pendientes: {invitados.filter(inv => !inv.deuda_liquidada).length}
                </span>
              </div>
            </div>
            
            {invitados.filter(inv => !inv.deuda_liquidada).length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-2 text-xs text-yellow-800 dark:text-yellow-300">
                <strong>Nota:</strong> Los invitados sin deuda liquidada aparecerán en la lista pero serán omitidos automáticamente al generar los turnos.
              </div>
            )}
          </div>

          {/* Lista de invitados */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-casal" />
                <p className="text-gray-500 mt-3">Cargando graduados...</p>
              </div>
            ) : invitadosOrdenados.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No hay graduados con deuda liquidada</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={invitadosOrdenados.map(inv => inv.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {invitadosOrdenados.map((invitado, index) => (
                      <SortableInvitadoItem
                        key={invitado.id}
                        invitado={invitado}
                        index={index}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeInvitado ? (
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 border-2 border-purple-500 rounded-lg shadow-2xl opacity-90">
                      <GripVertical className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {activeInvitado.nombre_completo || activeInvitado.nombre || 'Sin nombre'}
                        </h4>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{invitadosOrdenados.length}</strong> graduados en orden
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setModoSeleccion(null)}
                  disabled={isGenerating}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  Volver
                </button>
                <button
                  onClick={handleGenerarManual}
                  disabled={isGenerating || invitadosOrdenados.length === 0}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generando turnos...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Generar Turnos con Este Orden
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ModalOrdenManualTurnos;
