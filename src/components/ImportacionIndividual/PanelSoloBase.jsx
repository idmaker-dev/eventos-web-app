import React, { useState } from 'react';
import tokuImportService from '../../services/tokuImportService';

const PanelSoloBase = ({ alumno, escuela, onImportacionExitosa, onCancelar }) => {
  const [confirmado, setConfirmado] = useState(false);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount || 0);
  };

  const handleImportar = async () => {
    if (!confirmado) {
      alert('Por favor, confirma que deseas importar sin integración Toku');
      return;
    }

    const config = {
      email: alumno.email,
      escuela: escuela,
      ...(notas && { notas }),
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
    <div className="bg-white border-2 border-blue-300 rounded-lg p-6 shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-blue-700 flex items-center">
          <span className="mr-2">📁</span>
          Importar desde BASE (Sin integración Toku)
        </h3>
        <p className="text-gray-600 mt-1">
          Este alumno existe solo en archivos BASE. No tiene IDs de Toku.
        </p>
      </div>

      {/* Información del alumno BASE */}
      <div className="bg-blue-50 rounded-lg p-4 mb-5 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">📊 Datos del alumno:</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Nombre:</span>
            <span className="font-medium text-gray-900">{alumno.base?.nombre || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Email:</span>
            <span className="font-medium text-gray-900">{alumno.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Escuela:</span>
            <span className="font-medium text-gray-900">{alumno.escuela}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Boletos:</span>
            <span className="font-medium text-gray-900">{alumno.base?.boletos}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-blue-300">
            <span className="text-gray-700">Abonado:</span>
            <span className="font-medium text-green-700">{formatMoney(alumno.base?.total_pagado || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Pendiente:</span>
            <span className="font-medium text-red-700">{formatMoney(alumno.base?.pendiente || 0)}</span>
          </div>
        </div>
      </div>

      {/* Advertencia */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-5">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-semibold text-yellow-800">⚠️ Limitaciones de la importación</h4>
            <div className="mt-2 text-sm text-yellow-700 space-y-1">
              <p>• <strong>No se vinculará con Toku:</strong> El alumno no tendrá customer_id ni invoice_id</p>
              <p>• <strong>Pagos no sincronizados:</strong> Los webhooks de Toku no afectarán este registro</p>
              <p>• <strong>Gestión manual:</strong> Los pagos deberán registrarse manualmente</p>
            </div>
            <p className="mt-2 text-sm text-yellow-800 font-medium">
              💡 Solo importa así si estás seguro que este alumno no usará Toku o pagará por otros medios.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmación */}
      <div className="mb-5">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={confirmado}
            onChange={(e) => setConfirmado(e.target.checked)}
            className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div>
            <span className="text-gray-900 font-medium">
              Confirmo que deseo importar sin integración con Toku
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Entiendo que este registro no se sincronizará con la plataforma de pagos.
            </p>
          </div>
        </label>
      </div>

      {/* Notas adicionales */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📝 Notas adicionales (opcional)
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows="3"
          placeholder="Agrega información sobre por qué este alumno no tiene Toku (ej: 'Pago en efectivo', 'Becado', 'Transferencia directa')"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-5 border">
        <h4 className="font-semibold text-gray-900 mb-2">📋 Vista previa de importación:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Nombre:</span>
            <span className="font-medium text-gray-900">{alumno.base?.nombre || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Boletos:</span>
            <span className="font-medium text-gray-900">{alumno.base?.boletos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Monto abonado:</span>
            <span className="font-medium text-green-700">{formatMoney(alumno.base?.total_pagado || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">IDs Toku:</span>
            <span className="text-red-700 font-medium">❌ No incluidos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Estado:</span>
            <span className="text-blue-700 font-medium">ACTIVO</span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={handleImportar}
          disabled={loading || !confirmado}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center"
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
            <>✅ Importar sin Toku</>
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

export default PanelSoloBase;
