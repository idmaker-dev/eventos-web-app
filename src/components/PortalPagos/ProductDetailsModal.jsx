"use client";
import { useState, useEffect } from "react";
import { DetallesCuota } from "./DetallesCuota.jsx";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { X } from "lucide-react";

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return "";
  const [year, month, day] = fechaISO.split("-");
  return `${day}/${month}/${year}`;
};

const mapearEstado = (cuota) => {
  if (cuota.vencida) return "vencida";
  if (cuota.estado === "PAGADA") return "pagada";
  if (cuota.dias_para_vencimiento <= 7 && cuota.dias_para_vencimiento > 0) {
    return "por_vencer";
  }
  return "futura";
};

export function ProductDetailsModal({ isOpen, onClose, producto }) {
  const [showDetallesCuota, setShowDetallesCuota] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    if (isOpen && !showDetallesCuota) {
      setShowProductModal(true);
    } else if (!isOpen) {
      setShowProductModal(false);
    }
  }, [isOpen, showDetallesCuota]);

  const openDetallesCuota = (installment) => {
    setSelectedInstallment(installment);
    setShowProductModal(false);
    setTimeout(() => {
      setShowDetallesCuota(true); 
    }, 150);
  };

  const handleDetallesCuotaClose = () => {
    setShowDetallesCuota(false);
    setSelectedInstallment(null);
    setTimeout(() => {
      setShowProductModal(true);
    }, 150);
  };

  const handleProductModalClose = () => {
    setShowProductModal(false);
    onClose();
  };

  // Si no hay producto, no renderizar nada
  if (!producto) {
    return null;
  }

  // Calcular deuda vencida (suma de cuotas vencidas)
  const calcularDeudaVencida = () => {
    if (!producto.cuotas || producto.cuotas.length === 0) {
      return 0;
    }
    
    return producto.cuotas
      .filter(cuota => cuota.vencida === true)
      .reduce((total, cuota) => total + (cuota.monto_pendiente || 0), 0);
  };

  const deudaVencida = calcularDeudaVencida();

  return (
    <div>
      <Transition show={showProductModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleProductModalClose}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-screen items-start justify-end">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="relative w-full min-h-screen max-w-lg bg-white">
                  <button
                    onClick={handleProductModalClose}
                    className="absolute right-2 top-7 text-gray-500 hover:text-gray-600 transition-colors hover:bg-gray-100 p-2 rounded-full"
                    aria-label="Cerrar"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  
                  <div className="p-8 pt-8">
                    <DialogTitle className="text-xl font-semibold text-casal mb-8">
                      {producto.nombre}
                    </DialogTitle>
                    
                    <div className="border-b border-gray-300 mb-8"></div>
                    
                    <div className="space-y-4 pb-8">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-500 font-semibold">
                          Product ID
                        </span>
                        <span className="text-sm text-gray-900 text-right max-w-md">
                          {producto.id_producto}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-semibold">
                          Deuda
                        </span>
                        <span className={`text-sm font-medium ${deudaVencida > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          ${deudaVencida.toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-semibold">
                          Boletos Solicitados
                        </span>
                        <span className="text-sm text-gray-900">
                          {producto.boletos_solicitados}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-6">
                        Cuotas asociadas
                      </h3>
                      <div className="border-b border-gray-300 mb-8"></div>
                      
                      <div className="grid grid-cols-3 px-3 gap-4 mb-4">
                        <div className="text-sm font-semibold text-gray-600">Monto</div>
                        <div className="text-sm font-semibold text-gray-600">Vencimiento</div>
                        <div className="text-sm font-semibold text-gray-600">Estado</div>
                      </div>
                      
                      <div className="space-y-3">
                        {producto.cuotas?.map((cuota, index) => {
                          const estado = mapearEstado(cuota);
                          return (
                          <div key={cuota.id_cuota || index}>
                            <div
                              onClick={() => openDetallesCuota(cuota)}
                              className="grid grid-cols-3 gap-4 py-3 px-3 bg-slate-50 rounded-lg hover:bg-casal/25 transition-colors cursor-pointer"
                            >
                              <div className="text-sm text-gray-900 font-medium">
                                ${cuota.monto_pendiente?.toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatearFecha(cuota.fecha_vencimiento)}
                              </div>
                              <div>
                                {estado === "pagada" ? (
                                  <span className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                    Pagada
                                  </span>
                                ) : estado === "vencida" ? (
                                  <span className="inline-flex items-center rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                    Vencida
                                  </span>
                                ) : estado === "por_vencer" ? (
                                  <span className="inline-flex items-center rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                    Por vencer
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                    Futura
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
      <DetallesCuota
        isOpen={showDetallesCuota}
        onClose={handleDetallesCuotaClose}
        installment={selectedInstallment}
      />
    </div>
  );
}