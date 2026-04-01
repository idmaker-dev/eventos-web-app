import React, { useState } from 'react';
import tokuImportService from '../../services/tokuImportService';

const BuscadorAlumno = ({ onAlumnoEncontrado, onAlumnoNoEncontrado, onError }) => {
  const [email, setEmail] = useState('');
  const [escuela, setEscuela] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();

    if (!email || !escuela) {
      onError('Por favor completa el email y el nombre de la escuela');
      return;
    }

    setLoading(true);

    try {
      const result = await tokuImportService.analyzeStudent(email, escuela);

      if (result.success) {
        const { encontrado, alumno, estado, analisis } = result.data;

        if (encontrado) {
          onAlumnoEncontrado({ ...alumno, analisis }, estado, escuela);
        } else {
          onAlumnoNoEncontrado(
            `No se encontró el alumno con email ${email} en la escuela ${escuela}`
          );
        }
      } else {
        onError(result.error || 'Error al buscar alumno');
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      onError('Error al buscar alumno. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleBuscar} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email del Alumno
          </label>
          <input
            type="email"
            id="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
            required
          />
        </div>

        {/* Escuela */}
        <div>
          <label htmlFor="escuela" className="block text-sm font-medium text-gray-700 mb-1">
            Escuela
          </label>
          <input
            type="text"
            id="escuela"
            placeholder="Ej: CENTRO 26, LFM 26, DEL VALLE 26"
            value={escuela}
            onChange={(e) => setEscuela(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Ingresa el nombre exacto de la escuela
          </p>
        </div>
      </div>

      {/* Botón Buscar */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-3 rounded-lg font-medium text-white shadow-md transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Buscando...
            </span>
          ) : (
            '🔍 Buscar y Analizar'
          )}
        </button>
      </div>
    </form>
  );
};

export default BuscadorAlumno;
