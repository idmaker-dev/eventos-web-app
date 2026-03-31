import React, { useState } from 'react';
import tokuImportService from '../../services/tokuImportService';

const PanelDesajuste = ({ alumno, escuela, onImportacionExitosa, onCancelar }) => {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState('base'); // base, toku, manual
  const [montoManual, setMontoManual] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount || 0);
  };

  const getMontoFinal = () => {
    if (opcionSeleccionada === 'manual') {
      return parseFloat(montoManual) || 0;
    } else if (opcionSeleccionada === 'base') {
      return alumno.base?.total_pagado || 0;
    } else if (opcionSeleccionada === 'toku') {
      return alumno.toku?.abonado_toku || 0;
    }
    return 0;
  };

  const handleImportar = async () => {
    if (opcionSeleccionada === 'manual' && (!montoManual || parseFloat(montoManual) < 0)) {
      alert('Por favor, ingresa un monto válido');
      return;
    }

    const config = {
      email: alumno.email,
      escuela: escuela,
      monto_usar: opcionSeleccionada,
      ...(opcionSeleccionada === 'manual' && { monto_manual: parseFloat(montoManual) }),
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
    <div className="bg-white border-2 border-red-300 rounded-lg p-6 shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-red-700 flex items-center">
          <span className="mr-2">⚠️</span>
          Resolver Desajuste de Montos
        </h3>
        <p className="text-gray-600 mt-1">
          Diferencia detectada entre BASE y Toku. Elige qué monto utilizar para importar este alumno.
        </p>
      </div>

      {/* Opciones de resolución */}
      <div className="space-y-3 mb-5">
        {/* Opción BASE */}
        <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
          opcionSeleccionada === 'base' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
        }`}>
          <input
            type="radio"
            name="resolucion"
            value="base"
            checked={opcionSeleccionada === 'base'}
            onChange={(e) => setOpcionSeleccionada(e.target.value)}
            className="mt-1 mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">📁 Usar datos de BASE</span>
              <span className="text-lg font-bold text-blue-600">
                {formatMoney(alumno.base?.total_pagado || 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Considera BASE como fuente de verdad. Los datos originales siempre tienen prioridad.
            </p>
          </div>
        </label>

        {/* Opción TOKU */}
        <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
          opcionSeleccionada === 'toku' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300'
        }`}>
          <input
            type="radio"
            name="resolucion"
            value="toku"
            checked={opcionSeleccionada === 'toku'}
            onChange={(e) => setOpcionSeleccionada(e.target.value)}
            className="mt-1 mr-3"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">🔧 Usar datos de Toku</span>
              <span className="text-lg font-bold text-purple-600">
                {formatMoney(alumno.toku?.abonado_toku || 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Usa los pagos registrados en Toku{alumno.toku?.monto_wallet > 0 ? ' (incluye wallet)' : ''}.
            </p>
            {alumno.toku?.monto_wallet > 0 && (
              <p className="text-xs text-yellow-700 mt-1 bg-yellow-50 px-2 py-1 rounded">
                💰 Incluye {formatMoney(alumno.toku.monto_wallet)} en wallet
              </p>
            )}
          </div>
        </label>

        {/* Opción MANUAL */}
        <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
          opcionSeleccionada === 'manual' ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-300'
        }`}>
          <input
            type="radio"
            name="resolucion"
            value="manual"
            checked={opcionSeleccionada === 'manual'}
            onChange={(e) => setOpcionSeleccionada(e.target.value)}
            className="mt-1 mr-3"
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-2">✏️ Especificar monto manualmente</div>
            {opcionSeleccionada === 'manual' && (
              <div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={montoManual}
                  onChange={(e) => setMontoManual(e.target.value)}
                  placeholder="Ingresa el monto correcto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Úsalo si ambos montos están incorrectos o tienes información adicional.
                </p>
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Observaciones */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📝 Observaciones (opcional)
        </label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows="3"
          placeholder="Agrega notas sobre esta decisión (ej: 'Confirmado con pagos del banco', 'Diferencia por pago no registrado')"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Preview de la resolución */}
      <div className="bg-gray-50 rounded-lg p-4 mb-5 border">
        <h4 className="font-semibold text-gray-900 mb-2">📋 Vista previa de importación:</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Monto que se importará:</span>
            <span className="font-bold text-gray-900">{formatMoney(getMontoFinal())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Nombre:</span>
            <span className="font-medium text-gray-900">{alumno.base?.nombre || alumno.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Boletos:</span>
            <span className="font-medium text-gray-900">{alumno.base?.boletos || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Estado:</span>
            <span className="text-yellow-700 font-medium">REQUIERE_VALIDACION</span>
          </div>
        </div>
        {opcionSeleccionada === 'manual' && (
          <p className="text-xs text-yellow-700 mt-2 bg-yellow-50 px-2 py-1 rounded">
            ⚠️ Importación con monto manual requiere validación posterior
          </p>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={handleImportar}
          disabled={loading || (opcionSeleccionada === 'manual' && !montoManual)}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center"
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
            <>✅ Importar Ahora</>
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

export default PanelDesajuste;
