import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileSignature, ChevronDown, ChevronUp, Copy, Plus, Trash2, AlertCircle,
  FileText, CheckSquare, Eye, Loader2
} from 'lucide-react';
import contratoConfigService from '../../services/contratoConfigService';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSelectedEvent } from '../../contexts/SelectedEventContext';

// Tipos de contrato disponibles
const TIPO_CONTRATO = {
  DOCUSIGN: 'DOCUSIGN',
  INTERNO: 'INTERNO',
  SIN_FIRMA_DIGITAL: 'SIN_FIRMA_DIGITAL',
};

const MODO_FIRMA = {
  SOLO_ACEPTAR: 'SOLO_ACEPTAR',
  FIRMA_DIGITAL: 'FIRMA_DIGITAL',
};

const ConfiguracionContrato = () => {
  const { eventoId: eventoIdFromUrl } = useParams();
  const { eventoActual } = useSelectedEvent();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  const eventoId = eventoActual?.id || eventoIdFromUrl;

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  // Tipo de contrato seleccionado
  const [tipoContrato, setTipoContrato] = useState(TIPO_CONTRATO.DOCUSIGN);

  // ==================== DOCUSIGN ====================
  const [templateId, setTemplateId] = useState('');
  const [mappings, setMappings] = useState([]);
  const [catalogoCampos, setCatalogoCampos] = useState({});
  const [catalogoVisible, setCatalogoVisible] = useState(true);
  const [totalCampos, setTotalCampos] = useState(0);
  const [nuevoMapping, setNuevoMapping] = useState({
    label_docusign: '',
    tipo: 'campo_planoria',
    campo_planoria: '',
    valor_personalizado: ''
  });

  // ==================== INTERNO ====================
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [modoFirma, setModoFirma] = useState(MODO_FIRMA.SOLO_ACEPTAR);
  const [previewHTML, setPreviewHTML] = useState('');
  const [cargandoPreview, setCargandoPreview] = useState(false);

  // ==================== MODAL COPIAR ====================
  const [modalCopiar, setModalCopiar] = useState(false);
  const [eventosDisponibles, setEventosDisponibles] = useState([]);
  const [eventoCopiarId, setEventoCopiarId] = useState('');
  const [copiando, setCopiando] = useState(false);

  // ==================== CARGAR DATOS ====================
  const cargarDatos = useCallback(async () => {
    if (!eventoId) {
      console.warn('No hay evento seleccionado');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Cargando configuración para evento:', eventoId);
      
      // Cargar configuración existente del evento
      const configResponse = await contratoConfigService.obtenerConfiguracion(eventoId);
      
      // Determinar tipo de contrato configurado
      if (configResponse && configResponse.tipo_contrato) {
        setTipoContrato(configResponse.tipo_contrato);
        console.log('✅ Tipo de contrato detectado:', configResponse.tipo_contrato);

        // Cargar datos según el tipo
        if (configResponse.tipo_contrato === TIPO_CONTRATO.DOCUSIGN) {
          setTemplateId(configResponse.template_id || '');
          setMappings(configResponse.mappings || []);
          console.log('✅ Configuración DocuSign cargada:', { 
            template_id: configResponse.template_id, 
            mappings_count: configResponse.mappings?.length || 0
          });
        } else if (configResponse.tipo_contrato === TIPO_CONTRATO.INTERNO) {
          setPlantillaSeleccionada(configResponse.plantilla_id || '');
          setModoFirma(configResponse.modo_firma || MODO_FIRMA.SOLO_ACEPTAR);
          console.log('✅ Configuración INTERNO cargada:', {
            plantilla_id: configResponse.plantilla_id,
            modo_firma: configResponse.modo_firma
          });
        }
        // SIN_FIRMA_DIGITAL no requiere configuración adicional
      } else {
        // Sin configuración previa, limpiar estados
        setTemplateId('');
        setMappings([]);
        setPlantillaSeleccionada('');
        setModoFirma(MODO_FIRMA.SOLO_ACEPTAR);
        console.log('ℹ️ No hay configuración para este evento (modo default: DOCUSIGN)');
      }

      // Cargar catálogo de campos (siempre, por si se necesita)
      const catalogoResponse = await contratoConfigService.obtenerCatalogoCampos();
      if (catalogoResponse && catalogoResponse.catalogoPorCategoria) {
        const catalogoTransformado = {};
        Object.keys(catalogoResponse.catalogoPorCategoria).forEach(key => {
          catalogoTransformado[key] = catalogoResponse.catalogoPorCategoria[key].campos || [];
        });
        setCatalogoCampos(catalogoTransformado);
        setTotalCampos(catalogoResponse.totalCampos);
      }

      // Cargar plantillas disponibles si el tipo es INTERNO
      if (configResponse?.tipo_contrato === TIPO_CONTRATO.INTERNO || tipoContrato === TIPO_CONTRATO.INTERNO) {
        try {
          const plantillasResponse = await contratoConfigService.listarPlantillas({ activo: true });
          if (plantillasResponse && plantillasResponse.plantillas) {
            setPlantillas(plantillasResponse.plantillas);
            console.log('✅ Plantillas cargadas:', plantillasResponse.plantillas.length);
          }
        } catch (error) {
          console.error('Error cargando plantillas:', error);
        }
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
  }, [eventoId, tipoContrato, showError]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ==================== FUNCIONES PARA TIPO INTERNO ====================
  const previsualizarPlantilla = async () => {
    if (!plantillaSeleccionada) {
      showError('Debes seleccionar una plantilla');
      return;
    }

    try {
      setCargandoPreview(true);
      // Datos de ejemplo para previsualizar
      const datosEjemplo = {
        invitado: {
          nombre: "Juan Pérez",
          email: "juan@example.com",
          telefono: "+34123456789"
        },
        evento: {
          nombre: "Boda María y Carlos",
          fecha: "25 de diciembre de 2024",
          hora: "18:00"
        }
      };

      const response = await contratoConfigService.previsualizarPlantilla(
        plantillaSeleccionada,
        datosEjemplo
      );

      if (response && response.html) {
        setPreviewHTML(response.html);
        showSuccess('Vista previa generada');
      }
    } catch (error) {
      console.error('Error generando preview:', error);
      showError('Error al generar la vista previa');
    } finally {
      setCargandoPreview(false);
    }
  };

  // ==================== FUNCIONES PARA TIPO DOCUSIGN ====================
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
    try {
      setGuardando(true);
      
      let payload = { tipo_contrato: tipoContrato };

      // Validaciones y payload según el tipo de contrato
      switch (tipoContrato) {
        case TIPO_CONTRATO.DOCUSIGN:
          if (!templateId.trim()) {
            showError('Debes especificar el Template ID de DocuSign');
            return;
          }
          if (mappings.length === 0) {
            showError('Debes agregar al menos un mapping');
            return;
          }
          payload.template_id = templateId.trim();
          payload.mappings = mappings;
          break;

        case TIPO_CONTRATO.INTERNO:
          if (!plantillaSeleccionada) {
            showError('Debes seleccionar una plantilla');
            return;
          }
          payload.plantilla_id = plantillaSeleccionada;
          payload.modo_firma = modoFirma;
          break;

        case TIPO_CONTRATO.SIN_FIRMA_DIGITAL:
          // No requiere configuración adicional
          break;

        default:
          showError('Tipo de contrato no válido');
          return;
      }

      const response = await contratoConfigService.guardarConfiguracion(eventoId, payload);
      
      if (response) {
        showSuccess('Configuración guardada exitosamente');
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
      {tipoContrato === TIPO_CONTRATO.DOCUSIGN && (
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
      )}

      {tipoContrato === TIPO_CONTRATO.INTERNO && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-800 dark:text-green-200">
            <p className="font-medium mb-1">¿Cómo funcionan las plantillas internas?</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Selecciona una plantilla HTML o Word previamente creada</li>
              <li>Las variables en la plantilla se reemplazarán automáticamente con datos del invitado</li>
              <li>Elige el modo de firma: solo aceptar términos o firma digital</li>
              <li>Los contratos se generarán automáticamente al momento de la confirmación</li>
            </ol>
          </div>
        </div>
      )}

      {tipoContrato === TIPO_CONTRATO.SIN_FIRMA_DIGITAL && (
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-800 dark:text-gray-200">
            <p className="font-medium mb-1">Modo sin firma digital</p>
            <p>En este modo, los invitados solo aceptarán términos y condiciones sin firma electrónica. Gratis y sin configuración adicional.</p>
          </div>
        </div>
      )}

      {/* Selector de Tipo de Contrato */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selecciona el tipo de contrato</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* DocuSign */}
          <div
            onClick={() => setTipoContrato(TIPO_CONTRATO.DOCUSIGN)}
            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
              tipoContrato === TIPO_CONTRATO.DOCUSIGN
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={tipoContrato === TIPO_CONTRATO.DOCUSIGN}
                onChange={() => setTipoContrato(TIPO_CONTRATO.DOCUSIGN)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileSignature className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">DocuSign</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Integración completa con DocuSign para firma digital profesional
                </p>
                <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
                  Costo por uso
                </span>
              </div>
            </div>
          </div>

          {/* INTERNO */}
          <div
            onClick={() => setTipoContrato(TIPO_CONTRATO.INTERNO)}
            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
              tipoContrato === TIPO_CONTRATO.INTERNO
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={tipoContrato === TIPO_CONTRATO.INTERNO}
                onChange={() => setTipoContrato(TIPO_CONTRATO.INTERNO)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Plantilla Interna</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Genera contratos con plantillas personalizadas (HTML o Word)
                </p>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded">
                  Sin costo adicional
                </span>
              </div>
            </div>
          </div>

          {/* SIN_FIRMA_DIGITAL */}
          <div
            onClick={() => setTipoContrato(TIPO_CONTRATO.SIN_FIRMA_DIGITAL)}
            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
              tipoContrato === TIPO_CONTRATO.SIN_FIRMA_DIGITAL
                ? 'border-gray-500 bg-gray-50 dark:bg-gray-700'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={tipoContrato === TIPO_CONTRATO.SIN_FIRMA_DIGITAL}
                onChange={() => setTipoContrato(TIPO_CONTRATO.SIN_FIRMA_DIGITAL)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sin Firma Digital</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Solo aceptación de términos y condiciones
                </p>
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded">
                  Gratis
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido según tipo seleccionado */}
      {tipoContrato === TIPO_CONTRATO.DOCUSIGN && (
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
      )}

      {/* Sección TIPO INTERNO */}
      {tipoContrato === TIPO_CONTRATO.INTERNO && (
        <div className="space-y-6">
          {/* Selector de Plantilla */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">1. Seleccionar Plantilla</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plantilla de contrato *
                </label>
                <select
                  value={plantillaSeleccionada}
                  onChange={(e) => setPlantillaSeleccionada(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecciona una plantilla...</option>
                  {plantillas.map((plantilla) => (
                    <option key={plantilla.id} value={plantilla.id}>
                      {plantilla.nombre} - v{plantilla.metadata?.version || 1} {plantilla.tipo_plantilla === 'word' ? '(Word)' : '(HTML)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Las plantillas se crean y gestionan desde el panel de plantillas
                </p>
              </div>

              {/* Modo de Firma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modo de firma *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setModoFirma(MODO_FIRMA.SOLO_ACEPTAR)}
                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                      modoFirma === MODO_FIRMA.SOLO_ACEPTAR
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={modoFirma === MODO_FIRMA.SOLO_ACEPTAR}
                        onChange={() => setModoFirma(MODO_FIRMA.SOLO_ACEPTAR)}
                      />
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">Solo Aceptar</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Checkbox de aceptación</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setModoFirma(MODO_FIRMA.FIRMA_DIGITAL)}
                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                      modoFirma === MODO_FIRMA.FIRMA_DIGITAL
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={modoFirma === MODO_FIRMA.FIRMA_DIGITAL}
                        onChange={() => setModoFirma(MODO_FIRMA.FIRMA_DIGITAL)}
                      />
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">Firma Digital</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Canvas para firmar</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Preview - Solo para plantillas HTML */}
              {plantillaSeleccionada && (() => {
                const plantilla = plantillas.find(p => p.id === plantillaSeleccionada);
                const esPlantillaWord = plantilla?.tipo_plantilla === 'word' || !!plantilla?.word_template_url;
                
                if (esPlantillaWord) {
                  return (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        ℹ️ <strong>Plantilla Word seleccionada:</strong> La vista previa no está disponible para plantillas Word. 
                        Los contratos se generarán en formato .docx manteniendo todo el formato original.
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div>
                    <button
                      onClick={previsualizarPlantilla}
                      disabled={cargandoPreview}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                      {cargandoPreview ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Ver Vista Previa
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Vista Previa */}
          {previewHTML && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vista Previa del Contrato</h3>
              <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <iframe
                  srcDoc={previewHTML}
                  className="w-full h-96 border-0"
                  title="Vista previa del contrato"
                />
              </div>
            </div>
          )}

          {/* Botón Guardar */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(`/admin/eventos/${eventoId}`)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardarConfiguracion}
              disabled={guardando || !plantillaSeleccionada}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      )}

      {/* Sección SIN FIRMA DIGITAL */}
      {tipoContrato === TIPO_CONTRATO.SIN_FIRMA_DIGITAL && (
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <CheckSquare className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sin Firma Digital
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
                Este modo solo requiere que los invitados acepten los términos y condiciones mediante un checkbox.
                No se genera ningún documento de contrato.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-lg mx-auto">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Nota:</strong> Los términos y condiciones se deben configurar en la sección de "Ajustes del Evento".
                  Los invitados verán un checkbox de aceptación durante el proceso de confirmación.
                </p>
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(`/admin/eventos/${eventoId}`)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardarConfiguracion}
              disabled={guardando}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {guardando ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      )}

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
