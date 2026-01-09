import React, { Fragment } from "react";
import { Dialog, Transition, Button } from "@headlessui/react";
import { X, FileText } from "lucide-react";
import clsx from "clsx";

export default function ModalComprobantes({ isOpen, onClose, ticket }) {
  if (!ticket) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-casal dark:text-white flex items-center justify-between"
                >
                  {/* <span>Detalle de Pagos y Comprobantes</span> */}
                  <span>Comprobantes de Pago</span>
                  <Button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </Button>
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Listado detallado de todas las transacciones realizadas por{" "}
                    <span className="font-semibold text-casal">
                      {ticket.cliente.nombre}
                    </span>
                    .
                  </p>

                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-casal text-white">
                        <tr>
                          <th className="py-3 px-4 text-left">Fecha</th>
                          <th className="py-3 px-4 text-left">Monto</th>
                          <th className="py-3 px-4 text-left">Método</th>
                          <th className="py-3 px-4 text-left">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {ticket.pago.transacciones.length > 0 ? (
                          ticket.pago.transacciones.map((tx, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <td className="py-3 px-4 dark:text-gray-300">
                                {tx.fecha}
                              </td>
                              <td className="py-3 px-4 font-semibold dark:text-white text-casal">
                                {tx.monto}
                              </td>
                              <td className="py-3 px-4 dark:text-gray-300">
                                <span className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  {tx.método}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={clsx(
                                    "px-2 py-1 rounded-full text-xs font-bold",
                                    tx.estado === "Pagado"
                                      ? "bg-green-100 text-green-700"
                                      : tx.estado === "Proceso"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-600"
                                  )}
                                >
                                  {tx.estado}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-8 text-center text-gray-500"
                            >
                              No se encontraron transacciones.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={onClose}
                    className="px-6 py-2 bg-casal text-white rounded-lg hover:bg-casal/90 transition-colors font-medium"
                  >
                    Cerrar
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
