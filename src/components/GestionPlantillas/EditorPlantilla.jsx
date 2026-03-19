import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './EditorPlantilla.css';
import {
  FileText, Save, Eye, ArrowLeft, Info, Code, Loader2,
  Upload, File, Check, X
} from 'lucide-react';
import contratoConfigService from '../../services/contratoConfigService';
import { useNotifications } from '../../contexts/NotificationContext';

const MODO_FIRMA = {
  SOLO_ACEPTAR: 'SOLO_ACEPTAR',
  FIRMA_DIGITAL: 'FIRMA_DIGITAL',
};

const MODO_CREACION = {
  WORD: 'WORD',           // Subir archivo Word
  VISUAL: 'VISUAL',       // Editor Quill
  HTML: 'HTML',           // Código HTML manual
};

const EditorPlantilla = () => {
  const navigate = useNavigate();
  const { plantillaId } = useParams();
  const { showSuccess, showError } = useNotifications();
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [contenido, setContenido] = useState(''); // Contenido del editor Quill
  const [cssTemplate, setCssTemplate] = useState('');
  const [modoFirma, setModoFirma] = useState(MODO_FIRMA.SOLO_ACEPTAR);
  const [activo, setActivo] = useState(true);
  const [esPredeterminada, setEsPredeterminada] = useState(false);

  // Estados de UI
  const [modoCreacion, setModoCreacion] = useState(MODO_CREACION.WORD); // Iniciar en modo Word
  const [mostrarVariables, setMostrarVariables] = useState(true);
  const [htmlManual, setHtmlManual] = useState(''); // Para modo avanzado
  const [previewHTML, setPreviewHTML] = useState('');
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [catalogoVariables, setCatalogoVariables] = useState(null);

  // Estados para upload de Word
  const [archivoWord, setArchivoWord] = useState(null);
  const [subiendoWord, setSubiendoWord] = useState(false);
  const [progresoUpload, setProgresoUpload] = useState(0);
  const [htmlConvertido, setHtmlConvertido] = useState('');
  const [estadisticasWord, setEstadisticasWord] = useState(null);
  const [warningsWord, setWarningsWord] = useState([]);

  const esEdicion = Boolean(plantillaId);

  // Configuración del editor Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link',
    'color', 'background'
  ];

  useEffect(() => {
    cargarCatalogoVariables();
    if (esEdicion) {
      cargarPlantilla();
    } else {
      // Template inicial simple para nuevas plantillas
      setContenido(`
<h1>CONTRATO DE EVENTO</h1>

<h2>Información del Evento</h2>
<p><strong>Evento:</strong> {{evento.nombre}}</p>
<p><strong>Fecha:</strong> {{evento.fecha}} a las {{evento.hora}}</p>
<p><strong>Lugar:</strong> {{evento.lugar}}</p>

<h2>Datos del Participante</h2>
<p><strong>Nombre completo:</strong> {{invitado.nombre_completo}}</p>
<p><strong>Correo electrónico:</strong> {{invitado.correo}}</p>
<p><strong>Teléfono:</strong> {{invitado.telefono}}</p>

<h2>Detalles del Pago</h2>
<p><strong>Costo por boleto:</strong> {{evento.costo}}</p>
<p><strong>Cantidad de boletos:</strong> {{invitado.cantidad_boletos}}</p>
<p><strong>Total a pagar:</strong> {{deuda.monto_total}}</p>

<h2>Términos y Condiciones</h2>
<p>Al firmar este documento, el participante acepta los términos y condiciones del evento.</p>

<p style="margin-top: 40px;">_________________________________</p>
<p><strong>Firma del participante</strong></p>
<p>Fecha: {{fecha_actual}}</p>
      `.trim());

      setCssTemplate(`/* Estilos del contrato */
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    line-height: 1.6;
    color: #333;
}

h1 {
    color: #2563eb;
    border-bottom: 3px solid #2563eb;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

h2 {
    color: #1e40af;
    margin-top: 30px;
    border-left: 4px solid #2563eb;
    padding-left: 10px;
}

p {
    margin: 8px 0;
}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantillaId, esEdicion]);

  const cargarCatalogoVariables = async () => {
    try {
      const catalogo = await contratoConfigService.obtenerCatalogoVariables();
      setCatalogoVariables(catalogo);
    } catch (error) {
      console.error('Error cargando catálogo:', error);
      showError('Error al cargar el catálogo de variables');
      // Establecer null para que muestre mensaje de error en lugar del spinner infinito
      setCatalogoVariables({});
    }
  };

  const cargarPlantilla = async () => {
    try {
      setLoading(true);
      const plantilla = await contratoConfigService.obtenerPlantilla(plantillaId);
      
      setNombre(plantilla.nombre);
      setDescripcion(plantilla.descripcion || '');
      setContenido(plantilla.html_template);
      setHtmlManual(plantilla.html_template);
      setCssTemplate(plantilla.css_template || '');
      setModoFirma(plantilla.modo_firma);
      setActivo(plantilla.activo);
      setEsPredeterminada(plantilla.es_predeterminada);
    } catch (error) {
      console.error('Error cargando plantilla:', error);
      showError('Error al cargar la plantilla');
    } finally {
      setLoading(false);
    }
  };

  const insertarVariable = (variableKey) => {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    
    if (range) {
      // Insertar la variable en la posición del cursor
      const variableTexto = `{{${variableKey}}}`;
      editor.insertText(range.index, variableTexto, 'bold', true);
      
      // Mover el cursor después de la variable insertada
      editor.setSelection(range.index + variableTexto.length);
    } else {
      // Si no hay selección, insertar al final
      const length = editor.getLength();
      const variableTexto = ` {{${variableKey}}} `;
      editor.insertText(length, variableTexto, 'bold', true);
    }
    
    // Enfocar el editor
    editor.focus();
  };

  const generarPreview = async () => {
    // El preview solo está disponible para plantillas HTML y Visual
    if (modoCreacion === MODO_CREACION.WORD) {
      showError('La vista previa no está disponible para plantillas Word. Descarga el documento para visualizarlo.');
      return;
    }

    const htmlTemplate = modoCreacion === MODO_CREACION.HTML ? htmlManual : contenido;
    
    if (!htmlTemplate || !htmlTemplate.trim()) {
      showError('Debes agregar contenido antes de previsualizar');
      return;
    }

    try {
      setCargandoPreview(true);
      
      // Datos de ejemplo para el preview
      const datosEjemplo = {
        invitado: {
          nombre_completo: "Juan Pérez García",
          nombre: "Juan",
          apellido_paterno: "Pérez",
          apellido_materno: "García",
          correo: "juan.perez@ejemplo.com",
          telefono: "5512345678",
          cantidad_boletos: 2,
        },
        evento: {
          nombre: "ITAM VERANO 26",
          fecha: "15/06/2026",
          hora: "20:00 hrs",
          lugar: "Salón Imperial",
          direccion: "Av. Universidad 123, CDMX",
          costo: "$500.00",
          institucion: "ITAM",
        },
        tutor: {
          nombre_completo: "María López",
          telefono: "5587654321",
        },
        deuda: {
          monto_total: "$1,000.00",
          fecha_limite: "10/06/2026",
        },
        fecha_actual: new Date().toLocaleDateString('es-MX'),
      };

      // Procesar el HTML reemplazando variables
      let htmlProcesado = htmlTemplate;
      
      // Función recursiva para obtener valores anidados
      const obtenerValor = (obj, path) => {
        return path.split('.').reduce((acc, parte) => acc && acc[parte], obj);
      };

      // Reemplazar todas las variables {{categoria.variable}}
      const regex = /\{\{([^}]+)\}\}/g;
      htmlProcesado = htmlProcesado.replace(regex, (match, variablePath) => {
        const valor = obtenerValor(datosEjemplo, variablePath.trim());
        return valor !== undefined ? valor : match;
      });

      // Combinar HTML con CSS
      const htmlCompleto = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
    ${cssTemplate}
    </style>
</head>
<body>
${htmlProcesado}
</body>
</html>`;

      setPreviewHTML(htmlCompleto);
      setMostrarPreview(true);
    } catch (error) {
      console.error('Error generando preview:', error);
      showError('Error al generar la vista previa');
    } finally {
      setCargandoPreview(false);
    }
  };

  const guardarPlantilla = async () => {
    // Validaciones
    if (!nombre.trim()) {
      showError('Debes especificar un nombre para la plantilla');
      return;
    }

    // Validar según el modo
    if (modoCreacion === MODO_CREACION.WORD) {
      // Modo Word: verificar que haya archivo subido
      if (!archivoWord || !estadisticasWord?.archivoUrl) {
        showError('Debes subir un archivo Word (.docx)');
        return;
      }
    } else {
      // Modo HTML o VISUAL: verificar que haya contenido
      const htmlTemplate = modoCreacion === MODO_CREACION.HTML ? htmlManual : contenido;
      if (!htmlTemplate || !htmlTemplate.trim()) {
        showError('Debes agregar contenido');
        return;
      }
    }

    try {
      setGuardando(true);

      let plantillaData;

      if (modoCreacion === MODO_CREACION.WORD) {
        // Plantilla Word
        plantillaData = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          word_template_url: estadisticasWord.archivoUrl,
          word_blob_path: estadisticasWord.blobPath,
          variables_usadas: estadisticasWord.variablesEncontradas || [],
          modo_firma: modoFirma,
          activo,
          es_predeterminada: esPredeterminada,
        };
      } else {
        // Plantilla HTML (legacy)
        const htmlTemplate = modoCreacion === MODO_CREACION.HTML ? htmlManual : contenido;
        plantillaData = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          html_template: htmlTemplate,
          css_template: cssTemplate,
          modo_firma: modoFirma,
          activo,
          es_predeterminada: esPredeterminada,
        };
      }

      if (esEdicion) {
        await contratoConfigService.actualizarPlantilla(plantillaId, plantillaData);
        showSuccess('Plantilla actualizada exitosamente');
      } else {
        await contratoConfigService.crearPlantilla(plantillaData);
        showSuccess('Plantilla creada exitosamente');
      }

      navigate('/admin/plantillas');
    } catch (error) {
      console.error('Error guardando plantilla:', error);
      showError(error.message || 'Error al guardar la plantilla');
    } finally {
      setGuardando(false);
    }
  };

  // ==================== FUNCIONES PARA UPLOAD DE WORD ====================

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      procesarArchivoWord(file);
    }
  };

  const procesarArchivoWord = async (file) => {
    try {
      setSubiendoWord(true);
      setProgresoUpload(0);
      setArchivoWord(file);

      const resultado = await contratoConfigService.validarPlantillaWord(
        file,
        (progreso) => setProgresoUpload(progreso)
      );

      // NO convertimos a HTML, guardamos la info de la plantilla Word
      setHtmlConvertido(null);
      setContenido(null); // NO hay contenido HTML
      setEstadisticasWord({
        totalVariables: resultado.totalVariables,
        variablesEncontradas: resultado.variablesEncontradas,
        archivoUrl: resultado.archivoUrl,
        blobPath: resultado.blobPath,
        plantillaId: resultado.plantillaId,
      });
      setWarningsWord([]);

      // Extraer nombre sugerido del archivo
      if (!nombre) {
        const nombreSugerido = file.name
          .replace('.docx', '')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        setNombre(nombreSugerido);
      }

      showSuccess(`Plantilla Word validada: ${resultado.totalVariables} variables encontradas`);

    } catch (error) {
      console.error('Error al procesar archivo Word:', error);
      showError(error.message || 'Error al procesar el archivo Word');
      setArchivoWord(null);
    } finally {
      setSubiendoWord(false);
      setProgresoUpload(0);
    }
  };

  const limpiarArchivoWord = () => {
    setArchivoWord(null);
    setHtmlConvertido('');
    setEstadisticasWord(null);
    setWarningsWord([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            <button
              onClick={() => navigate('/admin/plantillas')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {esEdicion ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </h1>
              <p className="text-gray-500 dark:text-gray-300 mt-1">
                Editor visual de plantillas con variables dinámicas  
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Preview solo disponible para plantillas HTML y Visual */}
            {modoCreacion !== MODO_CREACION.WORD && (
              <button
                onClick={generarPreview}
                disabled={cargandoPreview}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400"
              >
                {cargandoPreview ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
                Preview
              </button>
            )}
            <button
              onClick={guardarPlantilla}
              disabled={guardando}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {guardando ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* Información de uso */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-2">Tres formas de crear tu plantilla:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
            <li><strong>Subir Word</strong> (Recomendado): Mantiene 100% del formato original. Usa variables con llaves simples: {'{nombreVariable}'}</li>
            <li><strong>Editor Visual</strong>: Escribe y formatea directamente en el navegador con variables {'{'}{'{'} dobles {'}'}{'}'}</li>
            <li><strong>Código HTML</strong>: Para usuarios avanzados que quieran control total del código</li>
          </ul>
          <p className="text-xs mt-2 italic">
            💡 Con plantillas Word, diseña en tu computadora con tablas, imágenes y formato complejo, 
            luego inserta variables usando llaves simples.
          </p>
        </div>
      </div>

      {/* Tabs de modo de creación */}
      {!esEdicion && (
        <div className="mb-6">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setModoCreacion(MODO_CREACION.WORD)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                modoCreacion === MODO_CREACION.WORD
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Upload className="h-4 w-4" />
              Subir Word
            </button>
            <button
              onClick={() => setModoCreacion(MODO_CREACION.VISUAL)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                modoCreacion === MODO_CREACION.VISUAL
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              Editor Visual
            </button>
            <button
              onClick={() => setModoCreacion(MODO_CREACION.HTML)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                modoCreacion === MODO_CREACION.HTML
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Code className="h-4 w-4" />
              Código HTML
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Panel principal de edición */}
        <div className={`${mostrarVariables ? 'col-span-9' : 'col-span-12'} space-y-6`}>
          {/* Información básica */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información de la Plantilla</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la plantilla *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Contrato de Evento - Plantilla Estándar"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe el propósito de esta plantilla..."
                  rows={2}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modo de firma
                </label>
                <select
                  value={modoFirma}
                  onChange={(e) => setModoFirma(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={MODO_FIRMA.SOLO_ACEPTAR}>Solo aceptar términos</option>
                  <option value={MODO_FIRMA.FIRMA_DIGITAL}>Firma digital (canvas)</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Plantilla activa</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={esPredeterminada}
                    onChange={(e) => setEsPredeterminada(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Predeterminada</span>
                </label>
              </div>
            </div>
          </div>

          {/* Editor de contenido - Según modo seleccionado */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {modoCreacion === MODO_CREACION.WORD ? (
                  <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : modoCreacion === MODO_CREACION.VISUAL ? (
                  <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Code className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modoCreacion === MODO_CREACION.WORD && 'Subir Archivo Word'}
                  {modoCreacion === MODO_CREACION.VISUAL && 'Contenido del Contrato *'}
                  {modoCreacion === MODO_CREACION.HTML && 'Código HTML *'}
                </h3>
              </div>
            </div>
            
            {/* Modo WORD: Upload de archivo */}
            {modoCreacion === MODO_CREACION.WORD && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {!archivoWord && !htmlConvertido ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                  >
                    <Upload className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Arrastra y suelta tu archivo Word aquí
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Solo archivos .docx (Word 2007 o superior)
                    </p>
                  </div>
                ) : subiendoWord ? (
                  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 p-8">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Validando plantilla Word...
                      </h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progresoUpload}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{progresoUpload}%</p>
                    </div>
                  </div>
                ) : archivoWord && estadisticasWord ? (
                  <>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-green-800 dark:text-green-200">
                                <File className="h-4 w-4 inline mr-1" />
                                {archivoWord?.name}
                              </p>
                              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                ✅ Plantilla validada · {estadisticasWord?.totalVariables || 0} variables encontradas
                              </p>
                            </div>
                            <button
                              onClick={limpiarArchivoWord}
                              className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                            >
                              <X className="h-4 w-4 text-green-700 dark:text-green-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {warningsWord.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                          ⚠️ Algunas advertencias de conversión:
                        </p>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-300 ml-4 list-disc">
                          {warningsWord.slice(0, 3).map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                          {warningsWord.length > 3 && (
                            <li>...y {warningsWord.length - 3} más</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 p-6 mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        📋 Variables encontradas en el documento ({estadisticasWord?.totalVariables || 0})
                      </h4>
                      
                      {estadisticasWord?.variablesEncontradas && estadisticasWord.variablesEncontradas.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {estadisticasWord.variablesEncontradas.map((variable, idx) => (
                            <div 
                              key={idx}
                              className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs font-mono text-blue-800 dark:text-blue-200"
                            >
                              {'{' + variable + '}'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No se encontraron variables en el documento. Asegúrate de usar el formato: {'{nombreVariable}'}
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        <strong>💡 Tip:</strong> El documento Word se mantendrá con su formato original. 
                        Las variables entre llaves simples {'{nombreVariable}'} serán reemplazadas automáticamente 
                        al generar los contratos.
                      </p>
                    </div>
                  </>
                ) : null}
              </>
            )}

            {/* Modo VISUAL: Editor Quill */}
            {modoCreacion === MODO_CREACION.VISUAL && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={contenido}
                    onChange={setContenido}
                    modules={modules}
                    formats={formats}
                    placeholder="Escribe el contenido del contrato aquí... Puedes copiar y pegar desde Word."
                    className="quill-editor"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  💡 <strong>Tip:</strong> Usa los botones del panel derecho para insertar variables como <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{invitado.nombre}}'}</code>
                </p>
              </>
            )}

            {/* Modo HTML: Código manual */}
            {modoCreacion === MODO_CREACION.HTML && (
              <>
                <textarea
                  value={htmlManual}
                  onChange={(e) => setHtmlManual(e.target.value)}
                  placeholder="Código HTML del contrato..."
                  rows={20}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  ⚠️ <strong>Modo avanzado:</strong> Estás editando HTML directamente. Usa variables con formato <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{categoria.variable}}'}</code>
                </p>
              </>
            )}
          </div>

          {/* Editor CSS */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estilos CSS (opcional)</h3>
            </div>
            
            <textarea
              value={cssTemplate}
              onChange={(e) => setCssTemplate(e.target.value)}
              placeholder="/* Estilos personalizados para el contrato */&#10;body { font-family: Arial, sans-serif; }"
              rows={8}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Estos estilos se aplicarán al documento final del contrato
            </p>
          </div>
        </div>

        {/* Panel de variables */}
        <div className={`${mostrarVariables ? 'col-span-3' : 'col-span-0 hidden'} transition-all`}>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Variables Disponibles</h3>
                <button
                  onClick={() => setMostrarVariables(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {modoCreacion === MODO_CREACION.WORD ? (
                  <>📋 <strong>Clic para copiar</strong> - Pégalas en tu Word con llaves simples: {'{nombreVariable}'}</>
                ) : modoCreacion === MODO_CREACION.VISUAL ? (
                  <>✏️ <strong>Clic para insertar</strong> en el cursor</>
                ) : (
                  <>📝 <strong>Clic para copiar</strong> - Pégalas en tu código HTML</>
                )}
              </p>
            </div>

            <div className="p-4 max-h-[600px] overflow-y-auto">
              {catalogoVariables ? (
                Object.entries(catalogoVariables).length > 0 ? (
                  Object.entries(catalogoVariables).map(([categoria, datos]) => (
                    <div key={categoria} className="mb-4 last:mb-0">
                      <h4 className="text-xs font-semibold uppercase mb-2 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {datos.label}
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(datos.variables).map(([variableKey, variableInfo]) => {
                          // Determinar formato de variable según el modo
                          const formatoVariable = modoCreacion === MODO_CREACION.WORD 
                            ? `{${variableKey}}` 
                            : `{{${variableKey}}}`;
                          
                          return (
                            <button
                              key={variableKey}
                              onClick={() => {
                                if (modoCreacion === MODO_CREACION.WORD) {
                                  // En modo Word, copiar al portapapeles
                                  navigator.clipboard.writeText(`{${variableKey}}`);
                                  showSuccess(`Variable {${variableKey}} copiada al portapapeles`);
                                } else if (modoCreacion === MODO_CREACION.VISUAL) {
                                  insertarVariable(variableKey);
                                } else {
                                  // En modo HTML, copiar al portapapeles
                                  navigator.clipboard.writeText(`{{${variableKey}}}`);
                                  showSuccess(`Variable {{${variableKey}}} copiada al portapapeles`);
                                }
                              }}
                              className="w-full text-left text-xs p-2 hover:bg-white dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">
                                {variableInfo.label}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 font-mono text-[10px]">
                                {formatoVariable}
                              </div>
                              {variableInfo.ejemplo && (
                                <div className="text-gray-400 dark:text-gray-500 mt-0.5 italic">
                                  Ej: {variableInfo.ejemplo}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No se pudieron cargar las variables
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                  <p className="text-xs text-gray-500 mt-2">Cargando variables...</p>
                </div>
              )}
            </div>
          </div>

          {!mostrarVariables && (
            <button
              onClick={() => setMostrarVariables(true)}
              className="fixed right-6 top-24 p-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Modal de Preview */}
      {mostrarPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vista Previa del Contrato</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Datos de ejemplo para visualización
                </p>
              </div>
              <button
                onClick={() => setMostrarPreview(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-600 dark:text-gray-300">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-inner">
                <iframe
                  srcDoc={previewHTML}
                  className="w-full h-[600px] border-0"
                  title="Vista previa del contrato"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setMostrarPreview(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPlantilla;
