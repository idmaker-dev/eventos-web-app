import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import contratoConfigService from '../../services/contratoConfigService';
import eventService from '../../services/eventService';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSelectedEvent } from '../../contexts/SelectedEventContext';

const ConfiguracionContrato = () => {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { eventoActual } = useSelectedEvent();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [tabActiva, setTabActiva] = useState('institucion');
  
  // Estados para eventos disponibles para copiar
  const [eventosDisponibles, setEventosDisponibles] = useState([]);
  const [mostrarModalCopiar, setMostrarModalCopiar] = useState(false);

  // Helper: Calcular esquema de pagos basado en fechas del evento
  const calcularEsquemaPagos = useCallback((fechasEvento, costoEvento) => {
    if (!fechasEvento || !Array.isArray(fechasEvento) || fechasEvento.length === 0) {
      return [];
    }

    const numFechas = fechasEvento.length;
    const costo = parseFloat(costoEvento) || 0;
    
    // Regla: Primera fecha = costo de 1 boleto, resto dividido equitativamente
    const primerPago = costo;
    const porcentajePrimerPago = 100; // Primer pago representa el costo completo de 1 boleto
    
    // El resto se divide entre las fechas restantes (si hay más de 1 fecha)
    const porcentajeRestante = numFechas > 1 ? 100 / (numFechas - 1) : 0;
    
    return fechasEvento.map((fecha, index) => {
      const esLaPrimera = index === 0;
      const porcentaje = esLaPrimera ? porcentajePrimerPago : porcentajeRestante;
      const monto = esLaPrimera ? primerPago : (costo * porcentajeRestante / 100);
      
      return {
        numero: index + 1,
        fecha: fecha || '',
        fecha_texto: fecha ? new Date(fecha).toLocaleDateString('es-MX', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) : '',
        porcentaje: Math.round(porcentaje * 100) / 100,
        monto_descripcion: `$${monto.toFixed(2)} MXN (${porcentaje.toFixed(1)}%)`,
        concepto: esLaPrimera ? 'Apartado inicial (1 boleto)' : `Pago ${index + 1} de ${numFechas}`
      };
    });
  }, []);

  // Estado de la configuración
  const [configuracion, setConfiguracion] = useState({
    institucion: {
      nombre_completo: '',
      generacion: '',
      carrera: '',
      contacto_email: ''
    },
    evento_detalle: {
      fecha_inicio_texto: '',
      fecha_fin_texto: '',
      lugar_completo: '',
      tipo_evento: 'Graduación'
    },
    boletaje: {
      precio_texto: '',
      descripcion_boleto: '',
      incluye: ['', '', ''],
      requisitos_acceso: ['', '']
    },
    esquema_pagos: [
      { numero: 1, fecha: '', fecha_texto: '', porcentaje: 0, monto_descripcion: '', concepto: '' },
      { numero: 2, fecha: '', fecha_texto: '', porcentaje: 0, monto_descripcion: '', concepto: '' },
      { numero: 3, fecha: '', fecha_texto: '', porcentaje: 0, monto_descripcion: '', concepto: '' },
      { numero: 4, fecha: '', fecha_texto: '', porcentaje: 0, monto_descripcion: '', concepto: '' },
      { numero: 5, fecha: '', fecha_texto: '', porcentaje: 0, monto_descripcion: '', concepto: '' }
    ],
    fecha_limite_liquidacion: '',
    fecha_limite_texto: '',
    clausulas: [
      { numero: '', titulo: '', contenido: '' },
      { numero: '', titulo: '', contenido: '' },
      { numero: '', titulo: '', contenido: '' }
    ],
    terminos_adicionales: {
      politica_reembolso: '',
      politica_cancelacion: '',
      restricciones: ['', '', '']
    }
  });

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      
      // Usar evento del contexto si está disponible, sino cargarlo
      let eventoData = eventoActual;
      if (!eventoData || eventoData.id !== eventoId) {
        eventoData = await eventService.getEvent(eventoId);
      }
      setEvento(eventoData);

      // Cargar configuración existente si la hay
      let configExistente = null;
      try {
        const configData = await contratoConfigService.obtenerConfiguracion(eventoId);
        if (configData.configurado) {
          configExistente = configData;
          setConfiguracion(configData);
        }
      } catch (error) {
        // Si no existe configuración, precargar con datos del evento
        console.log('No hay configuración previa, precargando con datos del evento');
      }

      // Si no hay configuración existente, precargar datos del evento
      if (!configExistente && eventoData) {
        const esquemaPagosCalculado = calcularEsquemaPagos(
          eventoData.fechas || [], 
          eventoData.costo || 0
        );

        setConfiguracion(prev => ({
          ...prev,
          institucion: {
            nombre_completo: eventoData.instituto || '',
            generacion: new Date().getFullYear().toString() || '',
            carrera: eventoData.licenciatura || '',
            contacto_email: ''
          },
          evento_detalle: {
            ...prev.evento_detalle,
            fecha_inicio_texto: eventoData.fecha_evento ? 
              new Date(eventoData.fecha_evento).toLocaleDateString('es-MX', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              }) : '',
            lugar_completo: eventoData.lugar_nombre || ''
          },
          boletaje: {
            ...prev.boletaje,
            precio_texto: eventoData.costo ? 
              `$${eventoData.costo.toFixed(2)} MXN por persona` : ''
          },
          esquema_pagos: esquemaPagosCalculado.length > 0 ? 
            esquemaPagosCalculado : prev.esquema_pagos,
          fecha_limite_liquidacion: eventoData.fechas && eventoData.fechas.length > 0 ?
            eventoData.fechas[eventoData.fechas.length - 1] : ''
        }));
      }

      // Cargar eventos disponibles para copiar
      const eventosConConfig = await contratoConfigService.listarEventosConConfiguracion();
      setEventosDisponibles(eventosConConfig.filter(e => e.id !== eventoId));

    } catch (error) {
      console.error('Error al cargar datos:', error);
      addNotification('Error al cargar datos del evento', 'error');
    } finally {
      setLoading(false);
    }
  }, [eventoId, eventoActual, addNotification, calcularEsquemaPagos]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      await contratoConfigService.guardarConfiguracion(eventoId, configuracion);
      addNotification('Configuración guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      addNotification('Error al guardar configuración', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleCopiarConfiguracion = async (eventoOrigenId) => {
    try {
      setGuardando(true);
      const configCopiada = await contratoConfigService.copiarConfiguracion(eventoId, eventoOrigenId);
      setConfiguracion(configCopiada);
      setMostrarModalCopiar(false);
      addNotification('Configuración copiada exitosamente', 'success');
    } catch (error) {
      console.error('Error al copiar configuración:', error);
      addNotification('Error al copiar configuración', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleRecalcularPagos = () => {
    if (!evento || !evento.fechas || evento.fechas.length === 0) {
      addNotification('No hay fechas configuradas en el evento', 'warning');
      return;
    }

    const nuevoEsquema = calcularEsquemaPagos(evento.fechas, evento.costo || 0);
    setConfiguracion(prev => ({
      ...prev,
      esquema_pagos: nuevoEsquema,
      fecha_limite_liquidacion: evento.fechas[evento.fechas.length - 1]
    }));
    addNotification('Esquema de pagos recalculado', 'success');
  };

  const actualizarCampo = (seccion, campo, valor, index = null) => {
    setConfiguracion(prev => {
      const nueva = { ...prev };
      
      if (index !== null && Array.isArray(nueva[seccion][campo])) {
        nueva[seccion][campo][index] = valor;
      } else if (index !== null) {
        nueva[seccion][index] = { ...nueva[seccion][index], [campo]: valor };
      } else {
        nueva[seccion][campo] = valor;
      }
      
      return nueva;
    });
  };

  const agregarClausula = () => {
    setConfiguracion(prev => ({
      ...prev,
      clausulas: [...prev.clausulas, { numero: '', titulo: '', contenido: '' }]
    }));
  };

  const eliminarClausula = (index) => {
    setConfiguracion(prev => ({
      ...prev,
      clausulas: prev.clausulas.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/eventos')}
                className="text-blue-600 hover:text-blue-800 flex items-center mb-2"
              >
                ← Volver a eventos
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Configuración de Contrato
              </h1>
              <p className="text-gray-600 mt-1">{evento?.nombre_evento}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModalCopiar(true)}
                disabled={guardando || eventosDisponibles.length === 0}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📋 Copiar de otro evento
              </button>
              
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {guardando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>💾 Guardar configuración</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'institucion', nombre: '🏫 Institución', icono: '🏫' },
                { id: 'evento_detalle', nombre: '📅 Detalles del Evento', icono: '📅' },
                { id: 'boletaje', nombre: '🎫 Boletaje', icono: '🎫' },
                { id: 'pagos', nombre: '💰 Esquema de Pagos', icono: '💰' },
                { id: 'clausulas', nombre: '📄 Cláusulas', icono: '📄' },
                { id: 'terminos', nombre: '⚖️ Términos', icono: '⚖️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  className={`
                    px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap
                    ${tabActiva === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.nombre}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          
          {/* Tab: Institución */}
          {tabActiva === 'institucion' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información Institucional</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo de la institución *
                </label>
                <input
                  type="text"
                  value={configuracion.institucion.nombre_completo}
                  onChange={(e) => actualizarCampo('institucion', 'nombre_completo', e.target.value)}
                  placeholder="ANÁHUAC NORTE ECONOMÍA Y NEGOCIOS"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generación *
                  </label>
                  <input
                    type="text"
                    value={configuracion.institucion.generacion}
                    onChange={(e) => actualizarCampo('institucion', 'generacion', e.target.value)}
                    placeholder="2026"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrera/Programa
                  </label>
                  <input
                    type="text"
                    value={configuracion.institucion.carrera}
                    onChange={(e) => actualizarCampo('institucion', 'carrera', e.target.value)}
                    placeholder="Economía y Negocios"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo de contacto *
                </label>
                <input
                  type="email"
                  value={configuracion.institucion.contacto_email}
                  onChange={(e) => actualizarCampo('institucion', 'contacto_email', e.target.value)}
                  placeholder="contacto@ejemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Tab: Detalles del Evento */}
          {tabActiva === 'evento_detalle' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles del Evento para Contrato</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de evento
                </label>
                <select
                  value={configuracion.evento_detalle.tipo_evento}
                  onChange={(e) => actualizarCampo('evento_detalle', 'tipo_evento', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Graduación">Graduación</option>
                  <option value="Boda">Boda</option>
                  <option value="XV Años">XV Años</option>
                  <option value="Evento Corporativo">Evento Corporativo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de inicio (texto completo) *
                  </label>
                  <input
                    type="text"
                    value={configuracion.evento_detalle.fecha_inicio_texto}
                    onChange={(e) => actualizarCampo('evento_detalle', 'fecha_inicio_texto', e.target.value)}
                    placeholder="6 JUNIO a las 8:00 pm"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de fin (texto completo)
                  </label>
                  <input
                    type="text"
                    value={configuracion.evento_detalle.fecha_fin_texto}
                    onChange={(e) => actualizarCampo('evento_detalle', 'fecha_fin_texto', e.target.value)}
                    placeholder="7 JUNIO a las 5:00 am"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar completo del evento *
                </label>
                <input
                  type="text"
                  value={configuracion.evento_detalle.lugar_completo}
                  onChange={(e) => actualizarCampo('evento_detalle', 'lugar_completo', e.target.value)}
                  placeholder="CENTRO BANAMEX - SALA D"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Tab: Boletaje */}
          {tabActiva === 'boletaje' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Información de Boletaje</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio por boleto (texto completo) *
                </label>
                <input
                  type="text"
                  value={configuracion.boletaje.precio_texto}
                  onChange={(e) => actualizarCampo('boletaje', 'precio_texto', e.target.value)}
                  placeholder="$2,080 M.N. por cada boleto de comensal (incluyendo IVA)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del boleto
                </label>
                <input
                  type="text"
                  value={configuracion.boletaje.descripcion_boleto}
                  onChange={(e) => actualizarCampo('boletaje', 'descripcion_boleto', e.target.value)}
                  placeholder="boletos (cena y lugar en mesa)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Qué incluye el boleto? (hasta 3 items)
                </label>
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    type="text"
                    value={configuracion.boletaje.incluye[index]}
                    onChange={(e) => actualizarCampo('boletaje', 'incluye', e.target.value, index)}
                    placeholder={`Item ${index + 1}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos de acceso (hasta 2)
                </label>
                {[0, 1].map((index) => (
                  <input
                    key={index}
                    type="text"
                    value={configuracion.boletaje.requisitos_acceso[index]}
                    onChange={(e) => actualizarCampo('boletaje', 'requisitos_acceso', e.target.value, index)}
                    placeholder={`Requisito ${index + 1}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tab: Esquema de Pagos */}
          {tabActiva === 'pagos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Esquema de Pagos Detallado</h2>
                {evento && evento.fechas && evento.fechas.length > 0 && (
                  <button
                    onClick={handleRecalcularPagos}
                    disabled={guardando}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    🔄 Recalcular pagos
                  </button>
                )}
              </div>
              
              {/* Info sobre cálculo automático */}
              {evento && evento.fechas && evento.fechas.length > 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">
                        Esquema de pagos precalculado
                      </p>
                      <p className="text-sm text-blue-700">
                        Se detectaron <strong>{evento.fechas.length} fechas de pago</strong> para este evento.
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        <strong>Regla aplicada:</strong> Primera fecha = ${evento.costo} MXN (costo de 1 boleto), 
                        resto dividido equitativamente entre {evento.fechas.length - 1} fecha(s) restante(s).
                      </p>
                      <p className="text-sm text-blue-600 mt-2 italic">
                        Puedes ajustar los valores manualmente si lo necesitas.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-yellow-900 mb-1">
                        No hay fechas de pago configuradas
                      </p>
                      <p className="text-sm text-yellow-700">
                        Este evento no tiene fechas de pago definidas. 
                        Deberás configurar manualmente el esquema de pagos o 
                        actualizar el evento con las fechas correspondientes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
                            {configuracion.esquema_pagos.map((pago, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Pago {pago.numero}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                      <input
                        type="date"
                        value={pago.fecha}
                        onChange={(e) => actualizarCampo('esquema_pagos', 'fecha', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha (texto)</label>
                      <input
                        type="text"
                        value={pago.fecha_texto}
                        onChange={(e) => actualizarCampo('esquema_pagos', 'fecha_texto', e.target.value, index)}
                        placeholder="JUEVES 11 DE DICIEMBRE DE 2025"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje (%)</label>
                      <input
                        type="number"
                        value={pago.porcentaje}
                        onChange={(e) => actualizarCampo('esquema_pagos', 'porcentaje', parseInt(e.target.value) || 0, index)}
                        placeholder="25"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del monto</label>
                      <input
                        type="text"
                        value={pago.monto_descripcion}
                        onChange={(e) => actualizarCampo('esquema_pagos', 'monto_descripcion', e.target.value, index)}
                        placeholder="dos mil ochenta pesos 00/100 M.N."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                      <input
                        type="text"
                        value={pago.concepto}
                        onChange={(e) => actualizarCampo('esquema_pagos', 'concepto', e.target.value, index)}
                        placeholder="Primer pago - costo de un boleto"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Fecha límite de liquidación</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
                    <input
                      type="date"
                      value={configuracion.fecha_limite_liquidacion}
                      onChange={(e) => setConfiguracion(prev => ({ ...prev, fecha_limite_liquidacion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto completo</label>
                    <input
                      type="text"
                      value={configuracion.fecha_limite_texto}
                      onChange={(e) => setConfiguracion(prev => ({ ...prev, fecha_limite_texto: e.target.value }))}
                      placeholder="LUNES 20 DE ABRIL DE 2026 será el último día..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Cláusulas */}
          {tabActiva === 'clausulas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Cláusulas del Contrato</h2>
                <button
                  onClick={agregarClausula}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Agregar cláusula
                </button>
              </div>
              
              {configuracion.clausulas.map((clausula, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Cláusula {index + 1}</h3>
                    {configuracion.clausulas.length > 1 && (
                      <button
                        onClick={() => eliminarClausula(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                      <input
                        type="text"
                        value={clausula.numero}
                        onChange={(e) => actualizarCampo('clausulas', 'numero', e.target.value, index)}
                        placeholder="PRIMERO, SEGUNDO, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                      <input
                        type="text"
                        value={clausula.titulo}
                        onChange={(e) => actualizarCampo('clausulas', 'titulo', e.target.value, index)}
                        placeholder="Organización del evento"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                      <textarea
                        value={clausula.contenido}
                        onChange={(e) => actualizarCampo('clausulas', 'contenido', e.target.value, index)}
                        placeholder="Texto completo de la cláusula..."
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Términos Adicionales */}
          {tabActiva === 'terminos' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Términos y Condiciones Adicionales</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Política de reembolso
                </label>
                <textarea
                  value={configuracion.terminos_adicionales.politica_reembolso}
                  onChange={(e) => actualizarCampo('terminos_adicionales', 'politica_reembolso', e.target.value)}
                  placeholder="No se realizarán reembolsos después de..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Política de cancelación
                </label>
                <textarea
                  value={configuracion.terminos_adicionales.politica_cancelacion}
                  onChange={(e) => actualizarCampo('terminos_adicionales', 'politica_cancelacion', e.target.value)}
                  placeholder="Cancelaciones con 30 días de anticipación..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restricciones (hasta 3)
                </label>
                {[0, 1, 2].map((index) => (
                  <input
                    key={index}
                    type="text"
                    value={configuracion.terminos_adicionales.restricciones[index]}
                    onChange={(e) => actualizarCampo('terminos_adicionales', 'restricciones', e.target.value, index)}
                    placeholder={`Restricción ${index + 1}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal para copiar configuración */}
        {mostrarModalCopiar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Copiar configuración de otro evento
              </h2>
              
              {eventosDisponibles.length === 0 ? (
                <p className="text-gray-600">
                  No hay eventos con configuración de contrato disponibles para copiar.
                </p>
              ) : (
                <div className="space-y-3">
                  {eventosDisponibles.map((evento) => (
                    <div
                      key={evento.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleCopiarConfiguracion(evento.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{evento.nombre_evento}</h3>
                          <p className="text-sm text-gray-600">
                            {evento.tipo_evento} • Configurado el {new Date(evento.fecha_configuracion).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          Copiar →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setMostrarModalCopiar(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionContrato;
