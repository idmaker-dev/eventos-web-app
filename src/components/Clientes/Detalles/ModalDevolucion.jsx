import React, { useState, Fragment } from "react";
import { Dialog, Transition, Button, Input } from "@headlessui/react";
import { AlertCircle } from "lucide-react";
import eventService from "../../../services/eventService";
import { useNotifications } from "../../../contexts/NotificationContext";

export default function ModalDevolucion({ isOpen, onClose, ticket, onRefresh }) {
  const [montoDevolucion, setMontoDevolucion] = useState("");
  const [cargando, setCargando] = useState(false);
  const { showError, showSuccess } = useNotifications();

  const handleAplicarDevolucion = async () => {
    try {
      if (
        !montoDevolucion ||
        isNaN(montoDevolucion) ||
        Number(montoDevolucion) <= 0
      ) {
        showError("Por favor ingresa un monto válido");
        return;
      }

      setCargando(true);
      const invitadoId = ticket?.cliente?.invitado_id || ticket?.invitado_id;

      if (!invitadoId) {
        showError("No se encontró el ID del graduado");
        return;
      }

      const res = await eventService.devolucion(
        invitadoId,
        Number(montoDevolucion),
        ticket?.id,
        "DEVOLUCIÓN DE PAGO",
        ticket?.cliente?.nombre
      );
      
      showSuccess(
        res?.message || "Se ha iniciado el proceso de devolución correctamente"
      );
      
      handleClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error al aplicar devolución:", error);
      showError(error?.data?.error || "Error al procesar la devolución");
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    setMontoDevolucion("");
    onClose();
  };

  if (!ticket) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {}} // No cerrar al hacer clic afuera
      >
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-casal dark:text-white flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-casal" />
                  Aplicar Devolución
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Por favor, ingresa el monto de la devolución para el
                    invitado{" "}
                    <span className="font-semibold text-casal">
                      {ticket.cliente.nombre}
                    </span>
                    .
                  </p>
                  <div className="mt-4">
                    <label
                      htmlFor="monto"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Monto de devolución
                    </label>
                    <Input
                      type="number"
                      id="monto"
                      name="monto"
                      autoFocus
                      value={montoDevolucion}
                      onChange={(e) => setMontoDevolucion(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-casal/50 focus:border-casal outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    disabled={cargando}
                    className="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none transition-colors disabled:opacity-50"
                    onClick={handleClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    disabled={cargando}
                    className="inline-flex justify-center rounded-lg border border-transparent bg-casal px-4 py-2 text-sm font-medium text-white hover:bg-casal/90 focus:outline-none transition-colors disabled:opacity-50"
                    onClick={handleAplicarDevolucion}
                  >
                    {cargando ? "Procesando..." : "Aplicar"}
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
