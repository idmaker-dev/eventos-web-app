"use client";

import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { Flame, X } from "lucide-react";
import { ProductDetailsModal } from "./ProductDetailsModal.jsx";
import { Tooltip } from "../ui/Tooltip.jsx";

const Pago = {
  id: "1",
  date: "02/02/2026",
  amount: 1950.0,
  paymentDate: "26/09/2025",
  paymentMethod: "Transferencia",
  cuenta: "1234567890123456",
  installments: [
    {
      amount: 1950.0,
      dueDate: "02/02/2026",
      name: "Graduacion PREPA IBERO 26 Santiago Mendez Lopez",
    },
  ],
};

const maskAccountNumber = (accountNumber, visibleDigits = 4) => {
  if (!accountNumber || accountNumber.length <= visibleDigits) {
    return accountNumber;
  }

  const lastDigits = accountNumber.slice(-visibleDigits);
  const maskLength = accountNumber.length - visibleDigits;
  const mask = "*".repeat(maskLength);

  return mask + lastDigits;
};

const truncateText = (text, maxLength = 30) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export function DetallesPagoModal({ isOpen, onClose }) {
  const [showProductModal, setShowProductModal] = useState(false);

  const openProductModal = () => {
    setShowProductModal(true);
    onClose();
  };

  const handleProductModalClose = () => {
    setShowProductModal(false);
  };

  return (
    <div>
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    className="absolute right-2 top-7 text-gray-500 hover:text-gray-600 transition-colors hover:bg-gray-100 p-2 rounded-full"
                    aria-label="Cerrar"
                  >
                    <X className="h-6 w-6" />
                  </button>

                  <div className="p-8 pt-8 grid grid-cols-1 content-between h-full">
                    <div>
                      <DialogTitle className="text-xl font-semibold text-casal mb-8">
                        Detalles del pago
                      </DialogTitle>

                      <div className="border-b border-gray-300 mb-8"></div>

                      <div className="space-y-4 pb-8">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-gray-500 font-semibold">
                            Monto
                          </span>
                          <span className="text-sm text-gray-900 text-right max-w-md">
                            $
                            {Pago.amount.toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 font-semibold">
                            Fecha de pago
                          </span>
                          <span className="text-sm text-gray-900">
                            {Pago.paymentDate}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 font-semibold">
                            Medio de pago
                          </span>
                          <span className="text-sm text-gray-900 flex items-center gap-2">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-red-500/10">
                              <Flame className="h-3.5 w-3.5 text-red-500" />
                            </div>
                            {Pago.paymentMethod}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 font-semibold">
                            Cuenta
                          </span>
                          <span className="text-sm text-gray-900 flex items-center gap-2 font-mono">
                            {maskAccountNumber(Pago.cuenta, 4)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-6">
                          Cuotas pagadas
                        </h3>
                        <div className="border-b border-gray-300 mb-8"></div>

                        <div className="grid grid-cols-3 px-3 gap-4 mb-4">
                          <div className="text-sm font-semibold text-gray-600">
                            Monto
                          </div>
                          <div className="text-sm font-semibold text-gray-600">
                            Vencimiento
                          </div>
                          <div className="text-sm font-semibold text-gray-600">
                            Producto
                          </div>
                        </div>

                        <div className="space-y-3">
                          {Pago.installments.map((installment, index) => (
                            <div key={index}>
                              <div className="grid grid-cols-3 gap-4 py-3 px-3 bg-slate-50 rounded-lg hover:bg-casal/10 transition-colors cursor-pointer">
                                <div className="text-sm text-gray-900 font-medium">
                                  $
                                  {installment.amount.toLocaleString("es-MX", {
                                    minimumFractionDigits: 2,
                                  })}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {installment.dueDate}
                                </div>
                                <div>
                                  <Button
                                    onClick={openProductModal}
                                    className="text-sm text-casal underline hover:text-casal/80 transition-colors text-left"
                                  >
                                    {truncateText(installment.name, 18)}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-16 flex justify-center">
                      <Button className="px-9 bg-casal text-white py-2 rounded-lg hover:bg-casal/80">
                        Descargar comprobante
                      </Button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ProductDetailsModal
        isOpen={showProductModal}
        onClose={handleProductModalClose}
      />
    </div>
  );
}
