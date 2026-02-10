import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Checkbox,
} from '@headlessui/react';
import clsx from 'clsx';
import { X, Calendar, Clock, Coffee, UtensilsCrossed, Plus, Trash2 } from 'lucide-react';
import turnosService from '../../services/turnosService';
import { useNotifications } from '../../contexts/NotificationContext';

/**
 * Modal para configurar el proceso de selección de mesas por turnos
 */
const ModalConfiguracionTurnos = ({ isOpen, onClose, eventoId, configuracionExistente = null }) => {
  const { showSuccess, showError, showInfo } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del formulario
  const [config, setConfig] = useState({
    fecha_inicio_seleccion: '',
    fecha_fin_seleccion: '',
    duracion_turno_minutos: 15,
    tiempo_muerto_minutos: 2,
    horarios_disponibles: [
      { dia_semana: 'lunes', hora_inicio: '09:00', hora_fin: '17:00' },
      { dia_semana: 'martes', hora_inicio: '09:00', hora_fin: '17:00' },
      { dia_semana: 'miercoles', hora_inicio: '09:00', hora_fin: '17:00' },
      { dia_semana: 'jueves', hora_inicio: '09:00', hora_fin: '17:00' },
      { dia_semana: 'viernes', hora_inicio: '09:00', hora_fin: '17:00' }
    ],
    periodos_tiempo_muerto: [],
    dias_excluidos: [],
    tipos_menu: [
      { id: 'normal', nombre: 'Normal', descripcion: 'Menú estándar' },
      { id: 'infantil', nombre: 'Infantil', descripcion: 'Menú para niños' },
      { id: 'vegano', nombre: 'Vegano', descripcion: 'Menú vegano' },
      { id: 'especial', nombre: 'Especial', descripcion: 'Menú especial' }
    ],
    restricciones_dieteticas: ['Ninguna', 'Vegetariano', 'Vegano', 'Sin gluten', 'Sin lactosa'],
    generar_turnos_inmediatamente: true
  });

  const [nuevoTiempoMuerto, setNuevoTiempoMuerto] = useState({
    descripcion: '',
    fecha_hora_inicio: '',
    fecha_hora_fin: ''
  });

  const [nuevoDiaExcluido, setNuevoDiaExcluido] = useState('');

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  
  const tiposMenuDisponibles = [
    { id: 'normal', nombre: 'Normal', descripcion: 'Menú estándar' },
    { id: 'infantil', nombre: 'Infantil', descripcion: 'Menú para niños' },
    { id: 'vegano', nombre: 'Vegano', descripcion: 'Menú vegano' },
    { id: 'especial', nombre: 'Especial', descripcion: 'Menú especial' },
    { id: 'celiaco', nombre: 'Celíaco', descripcion: 'Sin gluten' },
    { id: 'kosher', nombre: 'Kosher', descripcion: 'Certificado Kosher' }
  ];

  /**
   * Cargar configuración existente
   */
  useEffect(() => {
    if (configuracionExistente) {
      setConfig({
        fecha_inicio_seleccion: configuracionExistente.fecha_inicio_seleccion || '',
        fecha_fin_seleccion: configuracionExistente.fecha_fin_seleccion || '',
        duracion_turno_minutos: configuracionExistente.duracion_turno_minutos || 15,
        tiempo_muerto_minutos: configuracionExistente.tiempo_muerto_minutos || 5,
        horarios_disponibles: configuracionExistente.horarios_disponibles || [],
        periodos_tiempo_muerto: configuracionExistente.periodos_tiempo_muerto || [],
        dias_excluidos: configuracionExistente.dias_excluidos || [],
        tipos_menu: configuracionExistente.tipos_menu || [],
        restricciones_dieteticas: configuracionExistente.restricciones_dieteticas || [],
        generar_turnos_inmediatamente: false // No regenerar automáticamente al editar
      });
    }
  }, [configuracionExistente]);

  /**
   * Manejar cambio en campos simples
   */
  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Manejar cambio en horarios disponibles
   */
  const handleHorarioChange = (index, field, value) => {
    const nuevosHorarios = [...(config.horarios_disponibles || [])];
    if (nuevosHorarios[index]) {
      nuevosHorarios[index] = {
        ...nuevosHorarios[index],
        [field]: value
      };
      setConfig(prev => ({
        ...prev,
        horarios_disponibles: nuevosHorarios
      }));
    }
  };

  /**
   * Agregar/Quitar día de la semana
   */
  const toggleDiaSemana = (dia) => {
    const horariosActuales = config.horarios_disponibles || [];
    const existe = horariosActuales.find(h => h.dia_semana === dia);
    
    if (existe) {
      // Remover día
      setConfig(prev => ({
        ...prev,
        horarios_disponibles: (prev.horarios_disponibles || []).filter(h => h.dia_semana !== dia)
      }));
    } else {
      // Agregar día
      setConfig(prev => ({
        ...prev,
        horarios_disponibles: [
          ...(prev.horarios_disponibles || []),
          { dia_semana: dia, hora_inicio: '09:00', hora_fin: '17:00' }
        ]
      }));
    }
  };

  /**
   * Agregar tiempo muerto
   */
  const agregarTiempoMuerto = () => {
    if (!nuevoTiempoMuerto.descripcion || !nuevoTiempoMuerto.fecha_hora_inicio || !nuevoTiempoMuerto.fecha_hora_fin) {
      showError('Completa todos los campos del tiempo muerto');
      return;
    }

    setConfig(prev => ({
      ...prev,
      periodos_tiempo_muerto: [...(prev.periodos_tiempo_muerto || []), nuevoTiempoMuerto]
    }));

    setNuevoTiempoMuerto({
      descripcion: '',
      fecha_hora_inicio: '',
      fecha_hora_fin: ''
    });
  };

  /**
   * Eliminar tiempo muerto
   */
  const eliminarTiempoMuerto = (index) => {
    setConfig(prev => ({
      ...prev,
      periodos_tiempo_muerto: (prev.periodos_tiempo_muerto || []).filter((_, i) => i !== index)
    }));
  };

  /**
   * Agregar día excluido
   */
  const agregarDiaExcluido = () => {
    if (!nuevoDiaExcluido) {
      showError('Selecciona una fecha');
      return;
    }

    if ((config.dias_excluidos || []).includes(nuevoDiaExcluido)) {
      showError('Esta fecha ya está excluida');
      return;
    }

    setConfig(prev => ({
      ...prev,
      dias_excluidos: [...(prev.dias_excluidos || []), nuevoDiaExcluido]
    }));

    setNuevoDiaExcluido('');
  };

  /**
   * Eliminar día excluido
   */
  const eliminarDiaExcluido = (fecha) => {
    setConfig(prev => ({
      ...prev,
      dias_excluidos: (prev.dias_excluidos || []).filter(d => d !== fecha)
    }));
  };

  /**
   * Manejar cambio en tipos de menú
   */
  const toggleTipoMenu = (tipoMenu) => {
    const tiposActuales = config.tipos_menu || [];
    const existe = tiposActuales.find(t => t.id === tipoMenu.id);
    
    if (existe) {
      // Remover
      setConfig(prev => ({
        ...prev,
        tipos_menu: (prev.tipos_menu || []).filter(t => t.id !== tipoMenu.id)
      }));
    } else {
      // Agregar
      setConfig(prev => ({
        ...prev,
        tipos_menu: [...(prev.tipos_menu || []), tipoMenu]
      }));
    }
  };

  /**
   * Validar formulario
   */
  const validar = () => {
    if (!config.fecha_inicio_seleccion || !config.fecha_fin_seleccion) {
      showError('Debes especificar las fechas de inicio y fin');
      return false;
    }

    if (new Date(config.fecha_inicio_seleccion) >= new Date(config.fecha_fin_seleccion)) {
      showError('La fecha de inicio debe ser anterior a la fecha de fin');
      return false;
    }

    if (config.duracion_turno_minutos < 2 || config.duracion_turno_minutos > 60) {
      showError('La duración del turno debe estar entre 5 y 60 minutos');
      return false;
    }

    if (!config.horarios_disponibles || config.horarios_disponibles.length === 0) {
      showError('Debes configurar al menos un día disponible');
      return false;
    }

    if (!config.tipos_menu || config.tipos_menu.length === 0) {
      showError('Debes seleccionar al menos un tipo de menú');
      return false;
    }

    return true;
  };

  /**
   * Guardar configuración
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validar()) return;

    setIsSubmitting(true);

    try {
      const response = await turnosService.configurarProcesoSeleccion(eventoId, config);
      
      if (response.success) {
        showSuccess('Configuración guardada exitosamente');
        
        // Si se solicitó generar turnos
        if (config.generar_turnos_inmediatamente) {
          showInfo('Generando turnos...');
          const turnosResponse = await turnosService.generarTurnos(eventoId);
          
          if (turnosResponse.success) {
            showSuccess(`${turnosResponse.data.total_turnos} turnos generados`);
          }
        }
        
        onClose(true); // true indica que se guardó
      } else {
        showError(response.message || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      showError('Error al guardar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = clsx(
    "block w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white",
    "focus:outline-none focus:ring-2 focus:ring-[#246370] focus:border-[#246370]"
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50 focus:outline-none">
      <div className="fixed inset-0 z-50 bg-black/30" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-5xl rounded-xl bg-white dark:bg-[#1a1a1a] p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-2xl font-semibold text-[#246370] dark:text-[#2a9d8f] flex items-center gap-2">
              <Calendar size={28} />
              {configuracionExistente ? 'Editar Configuración de Turnos' : 'Configurar Proceso de Selección'}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <DialogTitle className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-6">
            Configura los parámetros del proceso de selección de mesas por turnos
          </DialogTitle>

          {/* Body */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fechas del Proceso */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Período del Proceso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300 mb-2">
                    Fecha de Inicio *
                  </label>
                  <Input
                    type="date"
                    value={config.fecha_inicio_seleccion}
                    onChange={(e) => handleChange('fecha_inicio_seleccion', e.target.value)}
                    className={inputClasses}
                    required
                  />
                </Field>
                <Field>
                  <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300 mb-2">
                    Fecha de Fin *
                  </label>
                  <Input
                    type="date"
                    value={config.fecha_fin_seleccion}
                    onChange={(e) => handleChange('fecha_fin_seleccion', e.target.value)}
                    className={inputClasses}
                    required
                  />
                </Field>
              </div>
            </div>

            {/* Duración de Turnos */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4 flex items-center gap-2">
                <Clock size={20} />
                Configuración de Turnos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300 mb-2">
                    Duración del Turno (minutos) *
                  </label>
                  <Input
                    type="number"
                    min="2"
                    max="60"
                    step="1"
                    value={config.duracion_turno_minutos}
                    onChange={(e) => handleChange('duracion_turno_minutos', parseInt(e.target.value))}
                    className={inputClasses}
                    required
                  />
                </Field>
                <Field>
                  <label className="block text-sm font-semibold text-[#246370] dark:text-gray-300 mb-2">
                    Tiempo Muerto entre Turnos (minutos)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="15"
                    value={config.tiempo_muerto_minutos}
                    onChange={(e) => handleChange('tiempo_muerto_minutos', parseInt(e.target.value))}
                    className={inputClasses}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                    Pausa entre turnos para preparación
                  </p>
                </Field>
              </div>
            </div>

            {/* Horarios Disponibles */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4">
                Horarios Disponibles por Día
              </h3>
              
              {/* Selector de días */}
              <div className="flex flex-wrap gap-2 mb-4">
                {diasSemana.map(dia => {
                  const diaConfig = (config.horarios_disponibles || []).find(h => h.dia_semana === dia);
                  return (
                    <label key={dia} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-[#246370] transition-colors">
                      <Checkbox
                        checked={!!diaConfig}
                        onChange={() => toggleDiaSemana(dia)}
                        className={clsx(
                          "group size-5 rounded border-2 bg-white dark:bg-gray-700",
                          "data-[checked]:bg-[#246370] data-[checked]:border-[#246370]"
                        )}
                      >
                        <svg className="stroke-white opacity-0 group-data-[checked]:opacity-100" viewBox="0 0 14 14" fill="none">
                          <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Checkbox>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Horarios de cada día */}
              {config.horarios_disponibles && config.horarios_disponibles.length > 0 && (
                <div className="space-y-2">
                  {config.horarios_disponibles.map((horario, index) => (
                    <div key={horario.dia_semana} className="flex items-center gap-3 bg-white dark:bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm font-semibold text-[#246370] dark:text-[#2a9d8f] w-24">
                        {horario.dia_semana.charAt(0).toUpperCase() + horario.dia_semana.slice(1)}
                      </span>
                      <Input
                        type="time"
                        value={horario.hora_inicio}
                        onChange={(e) => handleHorarioChange(index, 'hora_inicio', e.target.value)}
                        className={clsx(inputClasses, "flex-1")}
                      />
                      <span className="text-gray-500 dark:text-gray-400">-</span>
                      <Input
                        type="time"
                        value={horario.hora_fin}
                        onChange={(e) => handleHorarioChange(index, 'hora_fin', e.target.value)}
                        className={clsx(inputClasses, "flex-1")}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tiempos Muertos */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4 flex items-center gap-2">
                <Coffee size={20} />
                Tiempos Muertos (opcional)
              </h3>
              
              {/* Agregar tiempo muerto */}
              <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Descripción (ej: Almuerzo)"
                  value={nuevoTiempoMuerto.descripcion}
                  onChange={(e) => setNuevoTiempoMuerto(prev => ({ ...prev, descripcion: e.target.value }))}
                  className={clsx(inputClasses, "flex-1 placeholder:italic")}
                />
                <Input
                  type="datetime-local"
                  value={nuevoTiempoMuerto.fecha_hora_inicio}
                  onChange={(e) => setNuevoTiempoMuerto(prev => ({ ...prev, fecha_hora_inicio: e.target.value }))}
                  className={clsx(inputClasses, "flex-1")}
                />
                <Input
                  type="datetime-local"
                  value={nuevoTiempoMuerto.fecha_hora_fin}
                  onChange={(e) => setNuevoTiempoMuerto(prev => ({ ...prev, fecha_hora_fin: e.target.value }))}
                  className={clsx(inputClasses, "flex-1")}
                />
                <button
                  type="button"
                  onClick={agregarTiempoMuerto}
                  className="px-3 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Lista de tiempos muertos */}
              {config.periodos_tiempo_muerto && config.periodos_tiempo_muerto.length > 0 && (
                <div className="space-y-2">
                  {config.periodos_tiempo_muerto.map((tiempo, index) => (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>{tiempo.descripcion}</strong>: {new Date(tiempo.fecha_hora_inicio).toLocaleString()} - {new Date(tiempo.fecha_hora_fin).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => eliminarTiempoMuerto(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Días Excluidos */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4">
                Días Excluidos (opcional)
              </h3>
              
              {/* Agregar día excluido */}
              <div className="flex gap-2 mb-4">
                <Input
                  type="date"
                  value={nuevoDiaExcluido}
                  onChange={(e) => setNuevoDiaExcluido(e.target.value)}
                  className={clsx(inputClasses, "flex-1")}
                />
                <button
                  type="button"
                  onClick={agregarDiaExcluido}
                  className="px-3 py-2 bg-[#2a9d8f] hover:bg-[#238276] text-white rounded-lg transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Lista de días excluidos */}
              {config.dias_excluidos && config.dias_excluidos.length > 0 && (
                <div className="space-y-2">
                  {config.dias_excluidos.map((fecha, index) => (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 p-3 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(fecha).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => eliminarDiaExcluido(fecha)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tipos de Menú */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#246370] dark:text-[#2a9d8f] mb-4 flex items-center gap-2">
                <UtensilsCrossed size={20} />
                Tipos de Menú Disponibles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {tiposMenuDisponibles.map(tipo => {
                  const estaSeleccionado = (config.tipos_menu || []).some(t => t.id === tipo.id);
                  return (
                    <label
                      key={tipo.id}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-[#246370] transition-colors"
                    >
                      <Checkbox
                        checked={estaSeleccionado}
                        onChange={() => toggleTipoMenu(tipo)}
                        className={clsx(
                          "group size-5 rounded border-2 bg-white dark:bg-gray-700",
                          "data-[checked]:bg-[#246370] data-[checked]:border-[#246370]"
                        )}
                      >
                        <svg className="stroke-white opacity-0 group-data-[checked]:opacity-100" viewBox="0 0 14 14" fill="none">
                          <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Checkbox>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {tipo.nombre}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Generar Turnos */}
            {!configuracionExistente && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={config.generar_turnos_inmediatamente}
                    onChange={(checked) => handleChange('generar_turnos_inmediatamente', checked)}
                    className={clsx(
                      "group size-5 rounded border-2 bg-white dark:bg-gray-700 flex-shrink-0 mt-0.5",
                      "data-[checked]:bg-[#246370] data-[checked]:border-[#246370]"
                    )}
                  >
                    <svg className="stroke-white opacity-0 group-data-[checked]:opacity-100" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Checkbox>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Generar turnos automáticamente al guardar
                    </span>
                    {config.generar_turnos_inmediatamente && (
                      <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                        <p className="text-xs text-yellow-800 dark:text-yellow-300">
                          <strong>⚠️ Advertencia:</strong> Los turnos se generarán automáticamente siguiendo la <strong>regla de prioridad por fecha de liquidación</strong>. 
                          El invitado que pagó primero obtendrá el primer turno. Si necesitas control manual del orden, desmarca esta opción.
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-[#2a9d8f] hover:bg-[#238276] text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : (configuracionExistente ? 'Actualizar' : 'Guardar y Continuar')}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ModalConfiguracionTurnos;
