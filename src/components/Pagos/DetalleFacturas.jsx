import React from "react";
import { Dialog } from "@headlessui/react";
import { X, Calendar, DollarSign, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const DetalleFacturas = ({ isOpen, onClose, deuda }) => {
  if (!deuda) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  const getEstadoBadge = (factura) => {
    const { badge } = factura;
    const colores = {
      green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    };

    const iconos = {
      green: <CheckCircle2 className="w-4 h-4" />,
      yellow: <Clock className="w-4 h-4" />,
      red: <AlertTriangle className="w-4 h-4" />,
      gray: <Clock className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colores[badge.color] || colores.gray}`}>
        {iconos[badge.color] || iconos.gray}
        {badge.texto}
      </span>
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">
                Detalle de Facturas
              </Dialog.Title>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {deuda.asistente.nombre_completo}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Resumen Financiero */}
          <div className="p-6 bg-gradient-to-br from-casal/5 to-casal/10 dark:from-casal/10 dark:to-casal/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${deuda.financiero.monto_total.toLocaleString("es-MX")}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pagado</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${deuda.financiero.monto_pagado.toLocaleString("es-MX")}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pendiente</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${deuda.financiero.monto_pendiente.toLocaleString("es-MX")}
                </p>
              </div>
            </div>

            {/* Progreso */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progreso de pago
                </p>
                <span className={`text-sm font-semibold`} style={{ color: deuda.progreso.color }}>
                  {deuda.progreso.porcentaje}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${deuda.progreso.porcentaje}%`,
                    backgroundColor: deuda.progreso.color
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {deuda.progreso.estado_visual}
              </p>
            </div>
          </div>

          {/* Lista de Facturas */}
          <div className="p-6 max-h-[400px] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Facturas ({deuda.facturas.length})
            </h3>
            
            <div className="space-y-3">
              {deuda.facturas.map((factura, index) => (
                <div
                  key={factura.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-casal/10 dark:bg-casal/20 rounded-lg p-2.5">
                        <FileText className="w-5 h-5 text-casal dark:text-casal" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Factura #{factura.numero}
                          </h4>
                          {getEstadoBadge(factura)}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {factura.descripcion}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Vencimiento</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {formatearFecha(factura.fecha_vencimiento)}
                              </p>
                              {factura.dias_para_vencimiento !== undefined && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {factura.dias_para_vencimiento > 0 
                                    ? `En ${factura.dias_para_vencimiento} días`
                                    : factura.vencida 
                                      ? "Vencida" 
                                      : "Hoy"}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Montos</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                ${factura.monto_total.toLocaleString("es-MX")}
                              </p>
                              <p className="text-xs">
                                <span className="text-green-600 dark:text-green-400">
                                  Pagado: ${factura.monto_pagado.toLocaleString("es-MX")}
                                </span>
                                {factura.monto_pendiente > 0 && (
                                  <>
                                    {" | "}
                                    <span className="text-red-600 dark:text-red-400">
                                      Pendiente: ${factura.monto_pendiente.toLocaleString("es-MX")}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">Próximo vencimiento:</span>{" "}
                {formatearFecha(deuda.fechas.proxima_fecha_vencimiento)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-casal text-white rounded-lg hover:bg-casal/90 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DetalleFacturas;
