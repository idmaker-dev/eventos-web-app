"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { ArrowLeft } from "lucide-react";

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

const obtenerEstadoLabel = (estado) => {
  const labels = {
    pagada: "Pagada",
    vencida: "Vencida",
    por_vencer: "Por vencer",
    futura: "Futura"
  };
  return labels[estado] || estado;
};

export function DetallesCuota({ isOpen, onClose, installment }) {
  // Si no hay installment, no mostrar nada
  if (!installment) {
    return null;
  }

  const estado = mapearEstado(installment);
  
  return (
    <Transition show={isOpen} as={Fragment}>
      {/* z-index más alto para que esté encima */}
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
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
                  onClick={onClose}
                  className="absolute left-4 top-7 text-gray-500 hover:text-casal  transition-colors hover:bg-casal/40 p-2 rounded-full"
                  aria-label="Cerrar"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                
                <div className="p-8 pt-8">
                  <DialogTitle className="text-xl ml-7 font-semibold text-casal mb-8">
                    Detalles de la cuota
                  </DialogTitle>
                  
                  <div className="border-b border-gray-300 mb-8"></div>
                  
                  <div className="space-y-4 pb-8">
                    <div className="flex justify-between gap-5 items-start">
                      <span className="text-sm text-gray-500 font-semibold">
                        Monto
                      </span>
                      <span className="text-sm text-gray-900 text-right">
                        ${installment.monto_pendiente?.toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between gap-5 items-center">
                      <span className="text-sm text-gray-500 font-semibold">
                        Fecha de vencimiento
                      </span>
                      <span className="text-sm text-gray-900">
                        {formatearFecha(installment.fecha_vencimiento)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-5 items-center">
                      <span className="text-sm text-gray-500 font-semibold">
                        Estado
                      </span>
                      <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
                        estado === "pagada" 
                          ? "bg-green-100 text-green-800"
                          : estado === "vencida" 
                          ? "bg-red-100 text-red-800"
                          : estado === "por_vencer"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {obtenerEstadoLabel(estado)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between gap-5 items-start">
                      <span className="text-sm text-gray-500 font-semibold">
                        Producto asociado
                      </span>
                      <span className="text-sm text-gray-900 text-right max-w-md">
                        {installment.producto_asociado}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}