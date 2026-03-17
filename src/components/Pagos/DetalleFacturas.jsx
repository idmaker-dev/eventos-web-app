import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Calendar, DollarSign, FileText, CheckCircle2, Clock, AlertTriangle, Link, Ticket, Plus } from "lucide-react";
import EnvConfig from "../../utils/config";
import { useNotifications } from "../../contexts/NotificationContext";
import ModalAumentarBoletos from "./ModalAumentarBoletos";

const DetalleFacturas = ({ isOpen, onClose, deuda, onBoletosActualizados }) => {
  const { showSuccess, showError } = useNotifications();
  const [modalBoletosOpen, setModalBoletosOpen] = useState(false);

  if (!deuda) return null;
  
  // Verificar si el graduado no tiene deuda (no ha firmado contrato)
  const sinDeuda = !deuda.deuda_id;

  const copiarLinkPortalPagos = async () => {
    try {
      const linkPortalPagos = `${EnvConfig.BASE_URL}/PortalPagos/${deuda.invitado_id}`;
      
      await navigator.clipboard.writeText(linkPortalPagos);
      
      showSuccess(
        `Link del portal de pagos copiado al portapapeles`,
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Error al copiar el link:', error);
      showError('Error al copiar el link del portal de pagos');
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    fecha = fecha.includes("T") ? fecha.split("T")[0] : fecha;
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
        <Dialog.Panel className="mx-auto max-w-4xl w-full max-h-[90vh] bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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

          {/* Contenido con scroll */}
          <div className="flex-1 overflow-y-auto">
          {/* Resumen Financiero o Mensaje Sin Deuda */}
          {sinDeuda ? (
            // Vista para invitados sin deuda (no han firmado contrato)
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {deuda.estado.texto}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Este graduado aún no ha completado el proceso de firma de contrato. 
                Una vez que firme, se generarán automáticamente las facturas de pago.
              </p>
              
              {/* Información básica del invitado */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Información del Graduado
                </h4>
                <div className="grid grid-cols-2 gap-4 text-left mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nombre completo</p>
                    <p className="font-medium text-gray-900 dark:text-white">{deuda.asistente.nombre_completo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white truncate">{deuda.asistente.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="font-medium text-gray-900 dark:text-white">{deuda.asistente.telefono}</p>
                  </div>
                  {deuda.asistente.instituto && deuda.asistente.instituto !== "N/A" && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Instituto</p>
                      <p className="font-medium text-gray-900 dark:text-white">{deuda.asistente.instituto}</p>
                    </div>
                  )}
                  {deuda.asistente.licenciatura && deuda.asistente.licenciatura !== "N/A" && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Licenciatura</p>
                      <p className="font-medium text-gray-900 dark:text-white">{deuda.asistente.licenciatura}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Información Financiera Estimada
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad de boletos</p>
                      <p className="text-lg font-bold text-casal dark:text-Acapulco">{deuda.asistente.cantidad_boletos}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Monto total esperado</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${(deuda.financiero.monto_total || 0).toLocaleString("es-MX")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      💡 El plan de pagos se generará automáticamente al firmar el contrato
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Vista normal para invitados con deuda
            <>
              <div className="p-6 bg-gradient-to-br from-casal/5 to-casal/10 dark:from-casal/10 dark:to-casal/20">
            {/* Información de Boletos */}
            <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-casal/10 dark:bg-casal/20 rounded-lg p-2.5">
                    <Ticket className="w-5 h-5 text-casal dark:text-Acapulco" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Cantidad de boletos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {deuda.asistente.cantidad_boletos}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalBoletosOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-casal text-white rounded-lg hover:bg-casal/90 transition-colors font-medium text-sm shadow-sm"
                  title="Modificar cantidad de boletos"
                >
                  <Plus className="w-4 h-4" />
                  Modificar boletos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${(deuda.financiero.monto_total || 0).toLocaleString("es-MX")}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pagado</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${(deuda.financiero.monto_pagado || 0).toLocaleString("es-MX")}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pendiente</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${(deuda.financiero.monto_pendiente || 0).toLocaleString("es-MX")}
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
          <div className="p-6">
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
                                ${(factura.monto_total || 0).toLocaleString("es-MX")}
                              </p>
                              <p className="text-xs">
                                <span className="text-green-600 dark:text-green-400">
                                  Pagado: ${(factura.monto_pagado || 0).toLocaleString("es-MX")}
                                </span>
                                {(factura.monto_pendiente || 0) > 0 && (
                                  <>
                                    {" | "}
                                    <span className="text-red-600 dark:text-red-400">
                                      Pendiente: ${(factura.monto_pendiente || 0).toLocaleString("es-MX")}
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
            </>
          )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
            {!sinDeuda ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">Próximo vencimiento:</span>{" "}
                      {formatearFecha(deuda.fechas.proxima_fecha_vencimiento)}
                    </p>
                  </div>
                  <button
                    onClick={copiarLinkPortalPagos}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium text-sm"
                    title="Copiar link del portal de pagos"
                  >
                    <Link className="w-4 h-4" />
                    Copiar link portal
                  </button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium">Registrado el:</span>{" "}
                  {deuda.fechas?.creacion ? new Date(deuda.fechas.creacion).toLocaleDateString('es-MX', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-casal text-white rounded-lg hover:bg-casal/90 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </Dialog.Panel>
      </div>

      {/* Modal de Modificar Boletos */}
      <ModalAumentarBoletos
        isOpen={modalBoletosOpen}
        onClose={() => setModalBoletosOpen(false)}
        deuda={deuda}
        onBoletosActualizados={() => {
          setModalBoletosOpen(false);
          if (onBoletosActualizados) {
            onBoletosActualizados();
          }
        }}
      />
    </Dialog>
  );
};

export default DetalleFacturas;
