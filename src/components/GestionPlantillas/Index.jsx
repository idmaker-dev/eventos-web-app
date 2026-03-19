import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Edit, Trash2, Eye, Copy, CheckCircle, XCircle, Loader2 
} from 'lucide-react';
import contratoConfigService from '../../services/contratoConfigService';
import { useNotifications } from '../../contexts/NotificationContext';

const GestionPlantillas = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();

  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    cargarPlantillas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarPlantillas = async () => {
    try {
      setLoading(true);
      const response = await contratoConfigService.listarPlantillas({});
      if (response && response.plantillas) {
        setPlantillas(response.plantillas);
      }
    } catch (error) {
      console.error('Error cargando plantillas:', error);
      showError('Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaPlantilla = () => {
    navigate('/admin/plantillas/nueva');
  };

  const handleEditarPlantilla = (plantillaId) => {
    navigate(`/admin/plantillas/editar/${plantillaId}`);
  };

  const handleDuplicarPlantilla = async (plantilla) => {
    try {
      const plantillaDuplicada = {
        nombre: `${plantilla.nombre} (Copia)`,
        descripcion: plantilla.descripcion,
        html_template: plantilla.html_template,
        css_template: plantilla.css_template,
        modo_firma: plantilla.modo_firma,
        activo: true,
        es_predeterminada: false,
      };

      await contratoConfigService.crearPlantilla(plantillaDuplicada);
      showSuccess('Plantilla duplicada exitosamente');
      cargarPlantillas();
    } catch (error) {
      console.error('Error duplicando plantilla:', error);
      showError('Error al duplicar la plantilla');
    }
  };

  const handleEliminarPlantilla = async (plantillaId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      return;
    }

    try {
      setEliminando(plantillaId);
      await contratoConfigService.eliminarPlantilla(plantillaId);
      showSuccess('Plantilla eliminada exitosamente');
      cargarPlantillas();
    } catch (error) {
      console.error('Error eliminando plantilla:', error);
      showError('Error al eliminar la plantilla');
    } finally {
      setEliminando(null);
    }
  };

  const handleVerPreview = (plantillaId) => {
    navigate(`/admin/plantillas/preview/${plantillaId}`);
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
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestión de Plantillas de Contratos
              </h1>
              <p className="text-gray-500 dark:text-gray-300 mt-1">
                Crea y administra plantillas HTML para contratos internos
              </p>
            </div>
          </div>
          <button
            onClick={handleNuevaPlantilla}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nueva Plantilla
          </button>
        </div>
      </div>

      {/* Lista de plantillas */}
      {plantillas.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay plantillas creadas
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Comienza creando tu primera plantilla de contrato
          </p>
          <button
            onClick={handleNuevaPlantilla}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Crear primera plantilla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantillas.map((plantilla) => (
            <div
              key={plantilla.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              {/* Header de la card */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {plantilla.nombre}
                    </h3>
                    {plantilla.es_predeterminada && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  {plantilla.descripcion && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {plantilla.descripcion}
                    </p>
                  )}
                </div>
                {plantilla.activo ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-1 mb-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Versión:</span>
                  <span className="font-medium">v{plantilla.metadata?.version || 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Modo de firma:</span>
                  <span className="font-medium">
                    {plantilla.modo_firma === 'SOLO_ACEPTAR' ? 'Solo aceptar' : 'Firma digital'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Variables:</span>
                  <span className="font-medium">{plantilla.variables_usadas?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Creada:</span>
                  <span className="font-medium">
                    {new Date(plantilla.metadata?.fecha_creacion || plantilla.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => handleVerPreview(plantilla.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title="Ver preview"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                <button
                  onClick={() => handleEditarPlantilla(plantilla.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDuplicarPlantilla(plantilla)}
                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Duplicar"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEliminarPlantilla(plantilla.id)}
                  disabled={eliminando === plantilla.id}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                  title="Eliminar"
                >
                  {eliminando === plantilla.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestionPlantillas;
