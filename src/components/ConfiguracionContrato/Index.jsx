import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileSignature, ChevronDown, ChevronUp, Copy, Plus, Trash2, AlertCircle } from 'lucide-react';
import contratoConfigService from '../../services/contratoConfigService';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSelectedEvent } from '../../contexts/SelectedEventContext';

const ConfiguracionContrato = () => {
  const { eventoId: eventoIdFromUrl } = useParams();
  const { eventoActual } = useSelectedEvent();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  // Usar el evento del contexto si está disponible, sino usar el de la URL
  const eventoId = eventoActual?.id || eventoIdFromUrl;

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [mappings, setMappings] = useState([]);
  
  // Catálogo de campos
  const [catalogoCampos, setCatalogoCampos] = useState({});
  const [catalogoVisible, setCatalogoVisible] = useState(true);
  const [totalCampos, setTotalCampos] = useState(0);

  // Modal de copiar configuración
  const [modalCopiar, setModalCopiar] = useState(false);
  const [eventosDisponibles, setEventosDisponibles] = useState([]);
  const [eventoCopiarId, setEventoCopiarId] = useState('');
  const [copiando, setCopiando] = useState(false);

  // Nuevo mapping en progreso
  const [nuevoMapping, setNuevoMapping] = useState({
    label_docusign: '',
    tipo: 'campo_planoria',
    campo_planoria: '',
    valor_personalizado: ''
  });

  const cargarDatos = useCallback(async () => {
    if (!eventoId) {
      console.warn('No hay evento seleccionado');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Cargando configuración para evento:', eventoId);
      
      // Cargar configuración existente
      const configResponse = await contratoConfigService.obtenerConfiguracion(eventoId);
      
      // El service ya procesa response.data, entonces configResponse tiene la estructura directa
      // { template_id, mappings, configurado, fecha_configuracion }
      if (configResponse && (configResponse.template_id || configResponse.mappings)) {
        setTemplateId(configResponse.template_id || '');
        setMappings(configResponse.mappings || []);
        console.log('✅ Configuración cargada:', { 
          template_id: configResponse.template_id, 
          mappings_count: configResponse.mappings?.length || 0
        });
      } else {
        // Si no hay configuración, limpiar los estados
        setTemplateId('');
        setMappings([]);
        console.log('ℹ️ No hay configuración para este evento');
      }

      // Cargar catálogo de campos
      const catalogoResponse = await contratoConfigService.obtenerCatalogoCampos();
      
      // El service devuelve directamente { catalogoPorCategoria, totalCampos }
      if (catalogoResponse && catalogoResponse.catalogoPorCategoria) {
        const catalogo = catalogoResponse.catalogoPorCategoria;
        // Transformar a formato más simple { evento: [...campos], invitado: [...campos] }
        const catalogoTransformado = {};
        Object.keys(catalogo).forEach(key => {
          catalogoTransformado[key] = catalogo[key].campos || [];
        });
        setCatalogoCampos(catalogoTransformado);
        setTotalCampos(catalogoResponse.totalCampos);
      }
      
      // Resetear formulario de nuevo mapping
      setNuevoMapping({
        label_docusign: '',
        tipo: 'campo_planoria',
        campo_planoria: '',
        valor_personalizado: ''
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
      showError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }, [eventoId, showError]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const agregarMapping = () => {
    // Validaciones
    if (!nuevoMapping.label_docusign.trim()) {
      showError('Debes especificar el label de DocuSign');
      return;
    }

    if (nuevoMapping.tipo === 'campo_planoria' && !nuevoMapping.campo_planoria) {
      showError('Debes seleccionar un campo de Planoria');
      return;
    }

    if (nuevoMapping.tipo === 'valor_personalizado' && !nuevoMapping.valor_personalizado.trim()) {
      showError('Debes especificar un valor personalizado');
      return;
    }

    // Verificar que no exista ya ese label
    if (mappings.some(m => m.label_docusign === nuevoMapping.label_docusign)) {
      showError('Ya existe un mapping con ese label de DocuSign');
      return;
    }

    // Agregar el mapping
    const mappingToAdd = {
      label_docusign: nuevoMapping.label_docusign.trim(),
      tipo: nuevoMapping.tipo,
      campo_planoria: nuevoMapping.tipo === 'campo_planoria' ? nuevoMapping.campo_planoria : null,
      valor_personalizado: nuevoMapping.tipo === 'valor_personalizado' ? nuevoMapping.valor_personalizado.trim() : null
    };

    setMappings([...mappings, mappingToAdd]);

    // Reset form
    setNuevoMapping({
      label_docusign: '',
      tipo: 'campo_planoria',
      campo_planoria: '',
      valor_personalizado: ''
    });

    showSuccess('Mapping agregado correctamente');
  };

  const eliminarMapping = (index) => {
    const nuevosMappings = mappings.filter((_, i) => i !== index);
    setMappings(nuevosMappings);
    showSuccess('Mapping eliminado');
  };

  const guardarConfiguracion = async () => {
    // Validaciones
    if (!templateId.trim()) {
      showError('Debes especificar el Template ID de DocuSign');
      return;
    }

    if (mappings.length === 0) {
      showError('Debes agregar al menos un mapping');
      return;
    }

    try {
      setGuardando(true);
      
      const payload = {
        template_id: templateId.trim(),
        mappings: mappings
      };

      const response = await contratoConfigService.guardarConfiguracion(eventoId, payload);
      
      if (response) {
        showSuccess('Configuración guardada exitosamente');
        // Recargar datos para confirmar
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      showError('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalCopiar = async () => {
    try {
      const response = await contratoConfigService.listarEventosConConfiguracion();
      if (response && response.length >= 0) {
        // Filtrar el evento actual
        const eventosFiltrados = response.filter(e => e.id !== eventoId);
        setEventosDisponibles(eventosFiltrados);
        setModalCopiar(true);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
      showError('Error al cargar eventos disponibles');
    }
  };

  const copiarConfiguracion = async () => {
    if (!eventoCopiarId) {
      showError('Debes seleccionar un evento');
      return;
    }

    try {
      setCopiando(true);
      const response = await contratoConfigService.copiarConfiguracion(eventoId, eventoCopiarId);
      
      if (response) {
        showSuccess('Configuración copiada exitosamente');
        setModalCopiar(false);
        setEventoCopiarId('');
        await cargarDatos();
      }
    } catch (error) {
      console.error('Error copiando configuración:', error);
      showError('Error al copiar la configuración');
    } finally {
      setCopiando(false);
    }
  };

  const obtenerNombreCampo = (campo) => {
    // Buscar en el catálogo para obtener el nombre legible
    for (const categoria in catalogoCampos) {
      const campoEncontrado = catalogoCampos[categoria].find(c => c.key === campo);
      if (campoEncontrado) {
        return campoEncontrado.label;
      }
    }
    return campo;
  };

  const obtenerCategoriaColor = (categoria) => {
    const colores = {
      evento: 'bg-blue-100 text-blue-800',
      invitado: 'bg-green-100 text-green-800',
      tutor: 'bg-purple-100 text-purple-800',
      calculados: 'bg-orange-100 text-orange-800'
    };
    return colores[categoria] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 bg-white dark:bg-fodoBlack rounded-3xl shadow-md min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSignature className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración de Contratos</h1>
              <p className="text-gray-500 dark:text-gray-300 mt-1">
                Configura el mapeo de campos para la generación de contratos con DocuSign
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin/eventos/${eventoId}`)}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Información */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-1">¿Cómo funciona el sistema de mapeo?</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Configura tu template en DocuSign con los labels que necesites</li>
            <li>Ingresa el Template ID en este formulario</li>
            <li>Mapea cada label de DocuSign a un campo de Planoria o a un valor personalizado</li>
            <li>Solo los campos mapeados serán enviados a DocuSign</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Catálogo de campos (Sidebar) */}
        <div className={`${catalogoVisible ? 'col-span-3' : 'col-span-1'} transition-all`}>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-6">
            <div 
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setCatalogoVisible(!catalogoVisible)}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {catalogoVisible ? 'Catálogo de Campos' : 'Catálogo'}
              </h3>
              {catalogoVisible ? (
                <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>

            {catalogoVisible && (
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {totalCampos} campos disponibles
                </p>

                {Object.entries(catalogoCampos).map(([categoria, campos]) => (
                  <div key={categoria} className="mb-4 last:mb-0">
                    <h4 className={`text-xs font-semibold uppercase mb-2 px-2 py-1 rounded ${obtenerCategoriaColor(categoria)}`}>
                      {categoria} ({campos?.length || 0})
                    </h4>
                    <div className="space-y-1">
                      {(campos || []).map((campo) => (
                        <div 
                          key={campo.key}
                          className="text-xs p-2 hover:bg-white dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                          onClick={() => {
                            if (nuevoMapping.tipo === 'campo_planoria') {
                              setNuevoMapping({ ...nuevoMapping, campo_planoria: campo.key });
                            }
                          }}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{campo.label}</div>
                          <div className="text-gray-500 dark:text-gray-400 break-all">{campo.key}</div>
                          {campo.descripcion && (
                            <div className="text-gray-400 dark:text-gray-500 mt-1">{campo.descripcion}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuración principal */}
        <div className={`${catalogoVisible ? 'col-span-9' : 'col-span-11'} space-y-6`}>
          {/* Template ID */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">1. Template ID de DocuSign</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template ID *
              </label>
              <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="f615e07b-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Obtén este ID desde tu cuenta de DocuSign en la configuración del template
              </p>
            </div>
          </div>

          {/* Mappings existentes */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2. Mappings de Campos</h3>
              <button
                onClick={abrirModalCopiar}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copiar de otro evento
              </button>
            </div>

            {mappings.length > 0 ? (
              <div className="space-y-2 mb-6">
                {mappings.map((mapping, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {mapping.label_docusign}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">→</span>
                        {mapping.tipo === 'campo_planoria' ? (
                          <span className="text-sm text-blue-600 dark:text-blue-400">
                            {obtenerNombreCampo(mapping.campo_planoria)}
                          </span>
                        ) : (
                          <span className="text-sm text-green-600 dark:text-green-400">
                            "{mapping.valor_personalizado}"
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {mapping.tipo === 'campo_planoria' ? (
                          <span>Campo dinámico: {mapping.campo_planoria}</span>
                        ) : (
                          <span>Valor estático</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarMapping(index)}
                      className="ml-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 mb-6">
                <p className="text-sm">No hay mappings configurados</p>
                <p className="text-xs mt-1">Agrega tu primer mapping usando el formulario de abajo</p>
              </div>
            )}

            {/* Formulario para agregar nuevo mapping */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Agregar nuevo mapping</h4>
              <div className="grid grid-cols-12 gap-3">
                {/* Label DocuSign */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Label en DocuSign *
                  </label>
                  <input
                    type="text"
                    value={nuevoMapping.label_docusign}
                    onChange={(e) => setNuevoMapping({ ...nuevoMapping, label_docusign: e.target.value })}
                    placeholder="nombre_cliente"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tipo */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={nuevoMapping.tipo}
                    onChange={(e) => setNuevoMapping({ 
                      ...nuevoMapping, 
                      tipo: e.target.value,
                      campo_planoria: '',
                      valor_personalizado: ''
                    })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="campo_planoria">Campo de Planoria</option>
                    <option value="valor_personalizado">Valor personalizado</option>
                  </select>
                </div>

                {/* Campo o Valor según el tipo */}
                <div className="col-span-4">
                  {nuevoMapping.tipo === 'campo_planoria' ? (
                    <>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Campo de Planoria *
                      </label>
                      <select
                        value={nuevoMapping.campo_planoria}
                        onChange={(e) => setNuevoMapping({ ...nuevoMapping, campo_planoria: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecciona un campo...</option>
                        {Object.entries(catalogoCampos).map(([categoria, campos]) => (
                          <optgroup key={categoria} label={categoria.toUpperCase()}>
                            {(campos || []).map((campo) => (
                              <option key={campo.key} value={campo.key}>
                                {campo.label}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Valor personalizado *
                      </label>
                      <input
                        type="text"
                        value={nuevoMapping.valor_personalizado}
                        onChange={(e) => setNuevoMapping({ ...nuevoMapping, valor_personalizado: e.target.value })}
                        placeholder="Ej: Generación 2026"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </>
                  )}
                </div>

                {/* Botón agregar */}
                <div className="col-span-2 flex items-end">
                  <button
                    onClick={agregarMapping}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(`/admin/eventos/${eventoId}`)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardarConfiguracion}
              disabled={guardando || !templateId.trim() || mappings.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Copiar Configuración */}
      {modalCopiar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Copiar Configuración</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Selecciona un evento para copiar su configuración de contratos
              </p>
            </div>

            <div className="p-6">
              {eventosDisponibles.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Evento origen
                  </label>
                  <select
                    value={eventoCopiarId}
                    onChange={(e) => setEventoCopiarId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona un evento...</option>
                    {eventosDisponibles.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nombre_evento}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No hay otros eventos con configuración disponible</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => {
                  setModalCopiar(false);
                  setEventoCopiarId('');
                }}
                disabled={copiando}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={copiarConfiguracion}
                disabled={copiando || !eventoCopiarId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {copiando ? 'Copiando...' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionContrato;
