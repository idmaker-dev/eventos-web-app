import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileSignature, ChevronDown, ChevronUp, Copy, Plus, Trash2, AlertCircle,
  FileText, CheckSquare, Edit3, Eye
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
  const [mostrarEditorPlantilla, setMostrarEditorPlantilla] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');

  // ==================== MODAL COPIAR ====================
  const [modalCopiar, setModalCopiar] = useState(false);
  const [eventosDisponibles, setEventosDisponibles] = useState([]);
  const [eventoCopiarId, setEventoCopiarId] = useState('');
  const [copiando, setCopiando] = useState(false);

  // ==================== CARGAR DATOS ====================
  const cargarDatos = useCallback(async () => {
    if (!eventoId) return;

    try {
      setLoading(true);
      
      // Cargar configuración existente del evento
      const configResponse = await contratoConfigService.obtenerConfiguracion(eventoId);
      
      if (configResponse && configResponse.tipo_contrato) {
        setTipoContrato(configResponse.tipo_contrato);

        // Cargar datos según el tipo
        if (configResponse.tipo_contrato === TIPO_CONTRATO.DOCUSIGN) {
          setTemplateId(configResponse.template_id || '');
          setMappings(configResponse.mappings || []);
          
          // Cargar catálogo de campos
          const catalogoResponse = await contratoConfigService.obtenerCatalogoCampos();
          if (catalogoResponse && catalogoResponse.catalogoPorCategoria) {
            const catalogoTransformado = {};
            Object.keys(catalogoResponse.catalogoPorCategoria).forEach(key => {
              catalogoTransformado[key] = catalogoResponse.catalogoPorCategoria[key].campos || [];
            });
            setCatalogoCampos(catalogoTransformado);
            setTotalCampos(catalogoResponse.totalCampos);
          }
        } else if (configResponse.tipo_contrato === TIPO_CONTRATO.INTERNO) {
          setPlantillaSeleccionada(configResponse.plantilla_id || '');
          setModoFirma(configResponse.modo_firma || MODO_FIRMA.SOLO_ACEPTAR);
        }
      } else {
        // Sin configuración, cargar catálogo por si acaso
        const catalogoResponse = await contratoConfigService.obtenerCatalogoCampos();
        if (catalogoResponse && catalogoResponse.catalogoPorCategoria) {
          const catalogoTransformado = {};
          Object.keys(catalogoResponse.catalogoPorCategoria).forEach(key => {
            catalogoTransformado[key] = catalogoResponse.catalogoPorCategoria[key].campos || [];
          });
          setCatalogoCampos(catalogoTransformado);
          setTotalCampos(catalogoResponse.totalCampos);
        }
      }

      // Si el tipo es INTERNO, cargar plantillas disponibles
      if (tipoContrato === TIPO_CONTRATO.INTERNO) {
        const plantillasResponse = await contratoConfigService.listarPlantillas({ activo: true });
        if (plantillasResponse && plantillasResponse.plantillas) {
          setPlantillas(plantillasResponse.plantillas);
        }
      }
      
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

  // ==================== FUNCIONES DOCUSIGN ====================
  const agregarMapping = () => {
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

    if (mappings.some(m => m.label_docusign === nuevoMapping.label_docusign)) {
      showError('Ya existe un mapping con ese label de DocuSign');
      return;
    }

    const mappingToAdd = {
      label_docusign: nuevoMapping.label_docusign.trim(),
      tipo: nuevoMapping.tipo,
      campo_planoria: nuevoMapping.tipo === 'campo_planoria' ? nuevoMapping.campo_planoria : null,
      valor_personalizado: nuevoMapping.tipo === 'valor_personalizado' ? nuevoMapping.valor_personalizado.trim() : null
    };

    setMappings([...mappings, mappingToAdd]);
    setNuevoMapping({
      label_docusign: '',
      tipo: 'campo_planoria',
      campo_planoria: '',
      valor_personalizado: ''
    });
    showSuccess('Mapping agregado correctamente');
  };

  const eliminarMapping = (index) => {
    setMappings(mappings.filter((_, i) => i !== index));
    showSuccess('Mapping eliminado');
  };

  const obtenerNombreCampo = (campo) => {
    for (const categoria in catalogoCampos) {
      const campoEncontrado = catalogoCampos[categoria].find(c => c.key === campo);
      if (campoEncontrado) return campoEncontrado.label;
    }
    return campo;
  };

  // ==================== FUNCIONES INTERNO ====================
  const cargarPlantillas = async () => {
    try {
      const response = await contratoConfigService.listarPlantillas({ activo: true });
      if (response && response.plantillas) {
        setPlantillas(response.plantillas);
      }
    } catch (error) {
      console.error('Error cargando plantillas:', error);
      showError('Error al cargar plantillas');
    }
  };

  const previsualizarPlantilla = async (plantillaId) => {
    try {
      const response = await contratoConfigService.previsualizarPlantilla(plantillaId);
      if (response && response.html) {
        setPreviewHTML(response.html);
      }
    } catch (error) {
      console.error('Error previsualizando plantilla:', error);
      showError('Error al generar vista previa');
    }
  };

  // ==================== GUARDAR CONFIGURACIÓN ====================
  const guardarConfiguracion = async () => {
    try {
      setGuardando(true);
      
      let payload = {
        tipo_contrato: tipoContrato,
      };

      // Validaciones y payload según el tipo
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

  // ==================== COPIAR CONFIGURACIÓN ====================
  const abrirModalCopiar = async () => {
    try {
      const response = await contratoConfigService.listarEventosConConfiguracion();
      if (response && response.length >= 0) {
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

  // ==================== UTILIDADES ====================
  const obtenerCategoriaColor = (categoria) => {
    const colores = {
      evento: 'bg-blue-100 text-blue-800',
      invitado: 'bg-green-100 text-green-800',
      tutor: 'bg-purple-100 text-purple-800',
      calculados: 'bg-orange-100 text-orange-800'
    };
    return colores[categoria] || 'bg-gray-100 text-gray-800';
  };

   // ==================== RENDER ====================
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
                Configura el sistema de contratos para tu evento
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

      {/* Selector de Tipo de Contrato */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tipo de Contrato</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* DOCUSIGN */}
          <label className={`
            relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all
            ${tipoContrato === TIPO_CONTRATO.DOCUSIGN 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
            }
          `}>
            <input
              type="radio"
              name="tipo_contrato"
              value={TIPO_CONTRATO.DOCUSIGN}
              checked={tipoContrato === TIPO_CONTRATO.DOCUSIGN}
              onChange={(e) => setTipoContrato(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center gap-3 mb-2">
              <FileSignature className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-gray-900 dark:text-white">DocuSign</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Firma electrónica certificada con validez jurídica internacional
            </p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              💰 Alto costo (~$0.40/firma)
            </div>
          </label>

          {/* INTERNO */}
          <label className={`
            relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all
            ${tipoContrato === TIPO_CONTRATO.INTERNO 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/30' 
              : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700'
            }
          `}>
            <input
              type="radio"
              name="tipo_contrato"
              value={TIPO_CONTRATO.INTERNO}
              checked={tipoContrato === TIPO_CONTRATO.INTERNO}
              onChange={(e) => setTipoContrato(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center gap-3 mb-2">
              <Edit3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-gray-900 dark:text-white">Plantilla HTML</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Firma digital en navegador con canvas. Ideal para eventos educativos
            </p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              💰 Bajo costo (~$0.001/firma)
            </div>
          </label>

          {/* SIN FIRMA DIGITAL */}
          <label className={`
            relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all
            ${tipoContrato === TIPO_CONTRATO.SIN_FIRMA_DIGITAL 
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30' 
              : 'border-gray-300 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700'
            }
          `}>
            <input
              type="radio"
              name="tipo_contrato"
              value={TIPO_CONTRATO.SIN_FIRMA_DIGITAL}
              checked={tipoContrato === TIPO_CONTRATO.SIN_FIRMA_DIGITAL}
              onChange={(e) => setTipoContrato(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-gray-900 dark:text-white">Sin Firma Digital</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Firma física/presencial al recoger boletos. Pago inmediato sin contrato digital
            </p>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              💰 Gratis
            </div>
          </label>
        </div>
      </div>

      {/* Contenido según el tipo seleccionado */}
      {renderContenidoPorTipo()}

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => navigate(`/admin/eventos/${eventoId}`)}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={guardarConfiguracion}
          disabled={guardando || !validarConfiguracion()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {guardando ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      {/* Modal Copiar Configuración */}
      {renderModalCopiar()}
    </div>
  );

  // ==================== RENDER HELPERS ====================
  function validarConfiguracion() {
    switch (tipoContrato) {
      case TIPO_CONTRATO.DOCUSIGN:
        return templateId.trim() && mappings.length > 0;
      case TIPO_CONTRATO.INTERNO:
        return plantillaSeleccionada;
      case TIPO_CONTRATO.SIN_FIRMA_DIGITAL:
        return true;
      default:
        return false;
    }
  }

  function renderContenidoPorTipo() {
    switch (tipoContrato) {
      case TIPO_CONTRATO.DOCUSIGN:
        return renderDocuSignConfig();
      case TIPO_CONTRATO.INTERNO:
        return renderInternoConfig();
      case TIPO_CONTRATO.SIN_FIRMA_DIGITAL:
        return renderSinFirmaConfig();
      default:
        return null;
    }
  }

  // Renderizado para DocuSign (código original simplificado)
  function renderDocuSignConfig() {
    return (
      <div className="space-y-6">
        {/* Información */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">¿Cómo funciona el sistema de mapeo?</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Configura tu template en DocuSign con los labels que necesites</li>
              <li>Ingresa el Template ID en este formulario</li>
              <li>Mapea cada label de DocuSign a un campo de Planoria o a un valor personalizado</li>
            </ol>
          </div>
        </div>

        {/* Template ID */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Template ID de DocuSign</h3>
          <input
            type="text"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            placeholder="f615e07b-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mappings - Versión simplificada, se puede expandir como el original */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mappings de Campos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {mappings.length} mappings configurados
          </p>
          {/* Aquí iría la lógica completa de mappings del componente original */}
        </div>
      </div>
    );
  }

  // Renderizado para INTERNO
  function renderInternoConfig() {
    return (
      <div className="space-y-6">
        {/* Información */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-800 dark:text-green-200">
            <p className="font-medium mb-1">Sistema de contratos internos</p>
            <p>Selecciona una plantilla HTML con variables dinámicas. Los invitados firmarán con canvas o simplemente aceptarán términos.</p>
          </div>
        </div>

        {/* Selector de Plantilla */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plantilla de Contrato</h3>
            <button
              onClick={() => setMostrarEditorPlantilla(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              Nueva Plantilla
            </button>
          </div>

          <select
            value={plantillaSeleccionada}
            onChange={(e) => setPlantillaSeleccionada(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 mb-4"
          >
            <option value="">Selecciona una plantilla...</option>
            {plantillas.map((plantilla) => (
              <option key={plantilla.id} value={plantilla.id}>
                {plantilla.nombre} {!plantilla.activo && '(Inactiva)'}
              </option>
            ))}
          </select>

          {plantillaSeleccionada && (
            <button
              onClick={() => previsualizarPlantilla(plantillaSeleccionada)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
            >
              <Eye className="h-4 w-4" />
              Vista Previa
            </button>
          )}
        </div>

        {/* Modo de Firma */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Modo de Firma</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <label className={`
              flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all
              ${modoFirma === MODO_FIRMA.SOLO_ACEPTAR 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30' 
                : 'border-gray-300 dark:border-gray-600'
              }
            `}>
              <input
                type="radio"
                name="modo_firma"
                value={MODO_FIRMA.SOLO_ACEPTAR}
                checked={modoFirma === MODO_FIRMA.SOLO_ACEPTAR}
                onChange={(e) => setModoFirma(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Solo Aceptar</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                El invitado solo marca un checkbox para aceptar los términos
              </p>
            </label>

            <label className={`
              flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all
              ${modoFirma === MODO_FIRMA.FIRMA_DIGITAL 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30' 
                : 'border-gray-300 dark:border-gray-600'
              }
            `}>
              <input
                type="radio"
                name="modo_firma"
                value={MODO_FIRMA.FIRMA_DIGITAL}
                checked={modoFirma === MODO_FIRMA.FIRMA_DIGITAL}
                onChange={(e) => setModoFirma(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-gray-900 dark:text-white">Firma con Canvas</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                El invitado firma en un canvas HTML5 (más formal)
              </p>
            </label>
          </div>
        </div>

        {/* Vista Previa HTML */}
        {previewHTML && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vista Previa del Contrato</h3>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900 max-h-96 overflow-y-auto">
              <iframe
                srcDoc={previewHTML}
                title="Vista Previa Contrato"
                className="w-full h-96 border-0"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Renderizado para SIN_FIRMA_DIGITAL
  function renderSinFirmaConfig() {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Sin Firma Digital (Firma Presencial)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Los invitados podrán proceder directamente al pago sin firmar un contrato digital.
                Se asume que la firma del contrato se realizará de forma física/presencial al momento de recoger los boletos.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Los invitados se registran normalmente</li>
                <li>No se solicita firma digital</li>
                <li>Pueden proceder inmediatamente al pago</li>
                <li>El contrato se firma físicamente al recoger boletos</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">Nota importante</p>
            <p className="mt-1">
              Asegúrate de tener contratos físicos listos para firma presencial y un proceso claro para su gestión.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Modal Copiar Configuración
  function renderModalCopiar() {
    if (!modalCopiar) return null;

    return (
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
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg"
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
    );
  }
};

export default ConfiguracionContrato;
