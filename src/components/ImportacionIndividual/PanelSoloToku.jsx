import React, { useState } from 'react';
import tokuImportService from '../../services/tokuImportService';

const PanelSoloToku = ({ alumno, escuela, onImportacionExitosa, onCancelar }) => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [boletos, setBoletos] = useState(alumno.analisis?.sugerencias?.boletos_calculados || '');
  const [estadoRegistro, setEstadoRegistro] = useState('pendiente_validacion');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount || 0);
  };

  const handleImportar = async () => {
    if (!nombreCompleto.trim()) {
      alert('Por favor, ingresa el nombre completo del alumno');
      return;
    }

    if (!boletos || parseInt(boletos) <= 0) {
      alert('Por favor, ingresa un número válido de boletos');
      return;
    }

    const config = {
      email: alumno.email,
      escuela: escuela,
      nombre_completo: nombreCompleto.trim(),
      boletos: parseInt(boletos),
      estado_registro: estadoRegistro,
      ...(observaciones && { observaciones }),
    };

    setLoading(true);
    try {
      const result = await tokuImportService.importStudent(config);
      if (result.success) {
        onImportacionExitosa(result.data);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error al importar:', error);
      alert('Error al importar alumno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-purple-300 rounded-lg p-6 shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-purple-700 flex items-center">
          <span className="mr-2">🔧</span>
          Importar desde Toku (Sin datos BASE)
        </h3>
        <p className="text-gray-600 mt-1">
          Este alumno existe solo en Toku. Completa los datos faltantes para importar.
        </p>
      </div>

      {/* Información de Toku */}
      <div className="bg-purple-50 rounded-lg p-4 mb-5 border border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-2">📊 Datos de Toku disponibles:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Email:</span>
            <span className="font-medium text-gray-900">{alumno.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Abonado en facturas:</span>
            <span className="font-medium text-green-700">{formatMoney(alumno.toku?.abonado_facturas || 0)}</span>
          </div>
          {alumno.toku?.monto_wallet > 0 && (
            <div className="flex justify-between bg-yellow-100 -mx-2 px-2 py-1 rounded">
              <span className="text-gray-700">💰 Monto en Wallet:</span>
              <span className="font-medium text-yellow-700">{formatMoney(alumno.toku.monto_wallet)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-purple-300">
            <span className="text-gray-700 font-semibold">Total abonado:</span>
            <span className="font-bold text-purple-900">{formatMoney(alumno.toku?.abonado_toku || 0)}</span>
          </div>
          {alumno.analisis?.sugerencias?.boletos_calculados && (
            <div className="flex justify-between mt-2 bg-blue-50 -mx-2 px-2 py-1 rounded">
              <span className="text-gray-700">💡 Boletos sugeridos:</span>
              <span className="font-medium text-blue-700">{alumno.analisis.sugerencias.boletos_calculados}</span>
            </div>
          )}
        </div>
      </div>

      {/* Formulario de datos faltantes */}
      <div className="space-y-4 mb-5">
        {/* Nombre completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👤 Nombre Completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            placeholder="Ingresa el nombre completo del alumno"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            No disponible en archivos BASE. Requerido para crear el registro.
          </p>
        </div>

        {/* Boletos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎫 Número de Boletos <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={boletos}
            onChange={(e) => setBoletos(e.target.value)}
            placeholder="Número de boletos"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          {alumno.analisis?.sugerencias?.nota && (
            <p className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded">
              💡 {alumno.analisis.sugerencias.nota}
            </p>
          )}
        </div>

        {/* Estado de registro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📋 Estado de Registro
          </label>
          <select
            value={estadoRegistro}
            onChange={(e) => setEstadoRegistro(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="pendiente_validacion">Pendiente de validación</option>
            <option value="pre_registro">Pre-registro</option>
            <option value="contrato_firmado">Contrato firmado</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Como no existe en BASE, se marcará para revisión posterior.
          </p>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 Observaciones (opcional)
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows="3"
            placeholder="Agrega información adicional (ej: 'Datos confirmados via email', 'Pago verificado manual')"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-5 border">
        <h4 className="font-semibold text-gray-900 mb-2">📋 Vista previa de importación:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Nombre:</span>
            <span className="font-medium text-gray-900">{nombreCompleto || '(sin especificar)'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Email:</span>
            <span className="font-medium text-gray-900">{alumno.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Boletos:</span>
            <span className="font-medium text-gray-900">{boletos || '(sin especificar)'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Monto abonado:</span>
            <span className="font-medium text-green-700">{formatMoney(alumno.toku?.abonado_toku || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Estado:</span>
            <span className="text-yellow-700 font-medium">{estadoRegistro.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">IDs Toku:</span>
            <span className="text-green-700 font-medium">✅ Incluidos</span>
          </div>
        </div>
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
          <p className="text-xs text-yellow-700">
            ⚠️ <strong>Registro creado solo desde Toku.</strong> Se marcará como REQUIERE_VALIDACION para revisión posterior.
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={handleImportar}
          disabled={loading || !nombreCompleto.trim() || !boletos}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Importando...
            </>
          ) : (
            <>✅ Importar desde Toku</>
          )}
        </button>
        <button
          onClick={onCancelar}
          disabled={loading}
          className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default PanelSoloToku;
