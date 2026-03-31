import React, { useState } from 'react';
import BuscadorAlumno from '../../components/ImportacionIndividual/BuscadorAlumno';
import AnalisisAlumno from '../../components/ImportacionIndividual/AnalisisAlumno';
import PanelDesajuste from '../../components/ImportacionIndividual/PanelDesajuste';
import PanelSoloToku from '../../components/ImportacionIndividual/PanelSoloToku';
import PanelSoloBase from '../../components/ImportacionIndividual/PanelSoloBase';

/**
 * Página: Importación Individual de Alumnos (BASE + Toku)
 * 
 * Permite importar manualmente casos que no se importan automáticamente:
 * - Desajustes (montos no cuadran)
 * - Solo Toku (están en Toku pero no en BASE)
 * - Solo BASE (están en BASE pero no en Toku)
 */
const ImportacionIndividualPage = () => {
  const [alumno, setAlumno] = useState(null);
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState('');

  /**
   * Callback cuando se encuentra un alumno
   */
  const handleAlumnoEncontrado = (datosAlumno, estadoAlumno, escuela) => {
    setAlumno(datosAlumno);
    setEstado(estadoAlumno);
    setEscuelaSeleccionada(escuela);
    setMensaje(null);
  };

  /**
   * Callback cuando NO se encuentra un alumno
   */
  const handleAlumnoNoEncontrado = (mensaje) => {
    setAlumno(null);
    setEstado(null);
    setMensaje({ tipo: 'warning', texto: mensaje });
  };

  /**
   * Callback cuando hay un error
   */
  const handleError = (error) => {
    setAlumno(null);
    setEstado(null);
    setMensaje({ tipo: 'error', texto: error });
  };

  /**
   * Callback después de importar exitosamente
   */
  const handleImportacionExitosa = (resultado) => {
    setMensaje({
      tipo: 'success',
      texto: `Alumno ${resultado.invitado.nombre} importado exitosamente`,
    });
    // Resetear después de 3 segundos
    setTimeout(() => {
      setAlumno(null);
      setEstado(null);
      setMensaje(null);
    }, 3000);
  };

  /**
   * Callback cuando se cancela la importación
   */
  const handleCancelar = () => {
    setAlumno(null);
    setEstado(null);
    setMensaje(null);
  };

  /**
   * Renderizar panel de decisiones según estado
   */
  const renderPanelDecision = () => {
    if (!alumno || !estado) return null;

    switch (estado) {
      case 'sincronizado':
        return (
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Alumno Sincronizado</h3>
                <p className="mt-2 text-sm text-green-700">
                  Este alumno ya cuadra perfectamente entre BASE y Toku. Puede importarse directamente
                  en la importación masiva automática.
                </p>
                <p className="mt-2 text-xs text-green-600 italic">
                  No requiere importación manual individual.
                </p>
              </div>
            </div>
          </div>
        );

      case 'desajuste':
        return (
          <PanelDesajuste
            alumno={alumno}
            escuela={escuelaSeleccionada}
            onImportacionExitosa={handleImportacionExitosa}
            onCancelar={handleCancelar}
          />
        );

      case 'solo_toku':
        return (
          <PanelSoloToku
            alumno={alumno}
            escuela={escuelaSeleccionada}
            onImportacionExitosa={handleImportacionExitosa}
            onCancelar={handleCancelar}
          />
        );

      case 'solo_base':
        return (
          <PanelSoloBase
            alumno={alumno}
            escuela={escuelaSeleccionada}
            onImportacionExitosa={handleImportacionExitosa}
            onCancelar={handleCancelar}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            🔍 Importación Individual de Alumnos
          </h1>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">
            Busca alumnos por email y escuela para revisar su estado de sincronización e importarlos
            manualmente con decisiones personalizadas.
          </p>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Casos para importación manual:</strong> Desajustes de montos, alumnos solo en
              Toku, o alumnos solo en BASE que requieren decisiones específicas.
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className={`mb-6 rounded-lg p-4 shadow-sm ${
            mensaje.tipo === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' :
            mensaje.tipo === 'warning' ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700' :
            'bg-red-100 border-l-4 border-red-500 text-red-700'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <BuscadorAlumno
            onAlumnoEncontrado={handleAlumnoEncontrado}
            onAlumnoNoEncontrado={handleAlumnoNoEncontrado}
            onError={handleError}
          />
        </div>

        {/* Análisis del Alumno */}
        {alumno && estado && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <AnalisisAlumno alumno={alumno} estado={estado} />
          </div>
        )}

        {/* Panel de Decisiones */}
        {alumno && estado && (
          <div className="mb-6">
            {renderPanelDecision()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportacionIndividualPage;
