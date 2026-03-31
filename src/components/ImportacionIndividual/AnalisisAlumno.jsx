import React from 'react';

const AnalisisAlumno = ({ alumno, estado }) => {
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount || 0);
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'sincronizado':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">✅ Sincronizado</span>;
      case 'desajuste':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">⚠️ Desajuste</span>;
      case 'solo_base':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">📄 Solo BASE</span>;
      case 'solo_toku':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">🔧 Solo Toku</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">❓ Desconocido</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {alumno.nombre || alumno.email}
          </h3>
          <p className="text-gray-600">
            {alumno.email} • {alumno.escuela}
          </p>
        </div>
        {getEstadoBadge(estado)}
      </div>

      {/* Comparación BASE vs Toku */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BASE */}
        {alumno.base && (
          <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">📁</span> Datos BASE
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Nombre:</span>
                <span className="font-medium text-gray-900">{alumno.base.nombre || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Boletos:</span>
                <span className="font-medium text-gray-900">{alumno.base.boletos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Abonado:</span>
                <span className="font-medium text-green-700">{formatMoney(alumno.base.total_pagado)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Pendiente:</span>
                <span className="font-medium text-red-700">{formatMoney(alumno.base.pendiente)}</span>
              </div>
            </div>
          </div>
        )}

        {!alumno.base && (
          <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-1">📁 Sin datos BASE</p>
              <p className="text-sm">Alumno no existe en archivos BASE</p>
            </div>
          </div>
        )}

        {/* TOKU */}
        {alumno.toku && (
          <div className="bg-purple-50 rounded-lg p-5 border-2 border-purple-200">
            <h4 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
              <span className="mr-2">🔧</span> Datos Toku
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">Customer ID:</span>
                <span className="font-mono text-gray-600 truncate ml-2" title={alumno.toku.customer_id}>
                  {alumno.toku.customer_id?.substring(0, 20)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Facturas:</span>
                <span className="font-medium text-green-700">{formatMoney(alumno.toku.abonado_facturas)}</span>
              </div>
              {alumno.toku.monto_wallet > 0 && (
                <div className="flex justify-between bg-yellow-100 -mx-2 px-2 py-1 rounded">
                  <span className="text-gray-700">💰 Wallet:</span>
                  <span className="font-medium text-yellow-700">{formatMoney(alumno.toku.monto_wallet)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-purple-300">
                <span className="text-gray-700 font-semibold">Total Toku:</span>
                <span className="font-bold text-purple-900">{formatMoney(alumno.toku.abonado_toku)}</span>
              </div>
            </div>
          </div>
        )}

        {!alumno.toku && (
          <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-1">🔧 Sin datos Toku</p>
              <p className="text-sm">Alumno no existe en plataforma Toku</p>
            </div>
          </div>
        )}
      </div>

      {/* Análisis y Sugerencias */}
      {alumno.analisis && (
        <div className="bg-gray-50 rounded-lg p-5 mt-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">📊 Análisis</h4>
          
          {alumno.analisis.diferencia > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Diferencia detectada:</span>
                <span className={`font-bold text-lg ${
                  alumno.analisis.tipo_desajuste === 'base_mayor' ? 'text-blue-600' : 'text-purple-600'
                }`}>
                  {formatMoney(alumno.analisis.diferencia)}
                </span>
              </div>
              {alumno.analisis.tipo_desajuste && (
                <p className="text-sm text-gray-600 mt-1">
                  {alumno.analisis.tipo_desajuste === 'base_mayor' 
                    ? '📈 BASE tiene más pagos registrados que Toku' 
                    : '📉 Toku tiene más pagos registrados que BASE'}
                </p>
              )}
            </div>
          )}

          {alumno.analisis.sugerencias && (
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm font-medium text-gray-700 mb-2">💡 Sugerencias:</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Monto recomendado:</strong> {formatMoney(alumno.analisis.sugerencias.monto_recomendado)}</p>
                <p><strong>Fuente:</strong> {alumno.analisis.sugerencias.fuente_recomendada?.toUpperCase()}</p>
                <p><strong>Boletos calculados:</strong> {alumno.analisis.sugerencias.boletos_calculados}</p>
                {alumno.analisis.sugerencias.nota && (
                  <p className="text-yellow-700 italic mt-2">📝 {alumno.analisis.sugerencias.nota}</p>
                )}
                {alumno.analisis.sugerencias.nota_wallet && (
                  <p className="text-yellow-700 italic">💰 {alumno.analisis.sugerencias.nota_wallet}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalisisAlumno;
