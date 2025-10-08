import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import './DateTimePicker.css';
import { es } from "react-day-picker/locale";

const DateTimePicker = ({ value, onChange, placeholder = "Seleccionar fecha y hora" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [activeTab, setActiveTab] = useState('date'); // 'date' o 'time'
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const isInternalUpdate = useRef(false);

  // Inicializar con el valor existente si lo hay
  useEffect(() => {
    // Evitar actualizar si el cambio provino del propio componente
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          setSelectedTime(`${hours}:${minutes}`);
        }
      } catch (error) {
        console.warn('Error parsing date value:', error);
      }
    }
  }, [value]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formatear fecha para mostrar
  const formatDisplayDate = (date, time) => {
    if (!date) return '';
    
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    let timeStr = '';
    if (time) {
      timeStr = ` a las ${time} hrs`;
    }
    
    return `${day} de ${month} de ${year}${timeStr}`;
  };

  // Manejar selección de fecha
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (date && selectedTime) {
      updateValue(date, selectedTime);
    }
    // Cambiar a tab de hora después de seleccionar fecha
    if (date) {
      setActiveTab('time');
    }
  };

  // Actualizar valor final
  const updateValue = useCallback((date, time) => {
    if (!date || !time) return;
    
    const [hours, minutes] = time.split(':');
    
    // Crear fecha en hora local de México (sin conversión UTC)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Formato: YYYY-MM-DDTHH:mm:ss (ISO 8601 sin zona horaria)
    const localDateTimeString = `${year}-${month}-${day}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
    
    // Marcar que es una actualización interna para evitar el bucle
    isInternalUpdate.current = true;
    
    // Llamar onChange con el string de fecha local
    onChange(localDateTimeString);
  }, [onChange]);

  // Auto-confirmar cuando se selecciona fecha y hora
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      
      // Crear fecha en hora local de México (sin conversión UTC)
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      
      // Formato: YYYY-MM-DDTHH:mm:ss (ISO 8601 sin zona horaria)
      const localDateTimeString = `${year}-${month}-${day}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
      
      // Marcar que es una actualización interna para evitar el bucle
      isInternalUpdate.current = true;
      
      // Llamar onChange con el string de fecha local
      onChange(localDateTimeString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTime]);

  // Confirmar selección y cerrar
  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      updateValue(selectedDate, selectedTime);
      setIsOpen(false);
    }
  };

  // Limpiar selección
  const handleClear = () => {
    setSelectedDate(null);
    setSelectedTime('');
    onChange('');
    setIsOpen(false);
  };

  const displayValue = selectedDate && selectedTime ? 
    formatDisplayDate(selectedDate, selectedTime) : '';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input display */}
      <div
        ref={inputRef}
        onClick={() => setIsOpen(!isOpen)}
        className="mt-2 block w-full rounded-lg border border-2 bg-white/5 px-3 py-1.5 text-sm/6 dark:text-white text-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className={displayValue ? '' : 'text-gray-400 italic'}>
            {displayValue || placeholder}
          </span>
          <div className="flex items-center gap-1 text-gray-400">
            <Calendar size={16} />
            <Clock size={16} />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="datetime-picker-dropdown absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[9999] overflow-hidden min-w-[350px] max-w-[400px]">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setActiveTab('date')}
              className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${
                activeTab === 'date'
                  ? 'text-[#246370] bg-blue-50 dark:text-[#2a9d8f] dark:bg-blue-900/20 border-b-2 border-[#246370] dark:border-[#2a9d8f]'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Calendar size={16} className="inline mr-2" />
              Fecha
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('time')}
              className={`flex-1 px-4 py-3 text-sm font-medium text-center transition-colors ${
                activeTab === 'time'
                  ? 'text-[#246370] bg-blue-50 dark:text-[#2a9d8f] dark:bg-blue-900/20 border-b-2 border-[#246370] dark:border-[#2a9d8f]'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Clock size={16} className="inline mr-2" />
              Hora
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Información de selección actual */}
            {(selectedDate || selectedTime) && (
              <div className="mb-3 p-2 bg-[#246370]/10 dark:bg-[#2a9d8f]/20 border border-[#246370]/20 dark:border-[#2a9d8f]/30 rounded-lg text-xs">
                <div className="text-[#246370] dark:text-[#2a9d8f] font-medium">
                  {selectedDate && !selectedTime && "✅ Fecha seleccionada. Ahora selecciona la hora."}
                  {selectedDate && selectedTime && `✅ ${formatDisplayDate(selectedDate, selectedTime)}`}
                  {!selectedDate && selectedTime && "⏰ Hora seleccionada. Ahora selecciona la fecha."}
                </div>
              </div>
            )}

            {activeTab === 'date' && (
              <div className="datetime-picker dark:datetime-picker flex justify-center">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={es}
                  showOutsideDays
                  className="!m-0 !p-0"
                  classNames={{
                    nav: "rdp-nav",
                    nav_button: "rdp-nav_button",
                    nav_button_previous: "rdp-nav_button_previous",
                    nav_button_next: "rdp-nav_button_next",
                    caption_label: "rdp-caption_label",
                    table: "rdp-table",
                    head_cell: "rdp-head_cell", 
                    day: "rdp-day",
                    day_selected: "rdp-day_selected",
                    day_today: "rdp-day_today",
                    day_disabled: "rdp-day_disabled",
                    day_outside: "rdp-day_outside"
                  }}
                />
              </div>
            )}

            {activeTab === 'time' && (
              <div>
                <label className="block text-sm font-medium text-[#246370] dark:text-[#2a9d8f] mb-3">
                  Seleccionar hora
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Selector de horas */}
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hora</label>
                    <select
                      value={selectedTime.split(':')[0] || ''}
                      onChange={(e) => {
                        const minutes = selectedTime.split(':')[1] || '00';
                        setSelectedTime(`${e.target.value}:${minutes}`);
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-[#246370] focus:border-[#246370]"
                    >
                      <option value="">--</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Selector de minutos */}
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Minutos</label>
                    <select
                      value={selectedTime.split(':')[1] || ''}
                      onChange={(e) => {
                        const hours = selectedTime.split(':')[0] || '00';
                        setSelectedTime(`${hours}:${e.target.value}`);
                      }}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-[#246370] focus:border-[#246370]"
                    >
                      <option value="">--</option>
                      <option value="00">00</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                    </select>
                  </div>
                </div>
                
                {/* Vista previa de la hora */}
                {selectedTime && (
                  <div className="mt-4 p-3 bg-[#246370]/10 dark:bg-[#2a9d8f]/20 border border-[#246370]/20 dark:border-[#2a9d8f]/30 rounded-lg text-center">
                    <span className="text-[#246370] dark:text-[#2a9d8f] font-mono text-lg font-semibold">
                      {selectedTime} hrs
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Limpiar
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;