import React from "react";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";

export default function Configuracion({ isOpen, setIsOpen }) {
  const close = () => {
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={close}
    >
      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div
          className="absolute inset-0 bg-black/30 transition-opacity"
          aria-hidden="true"
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
          >
            <DialogTitle as="h3" className="text-xl font-bold text-gray-900">
              Configuracion
            </DialogTitle>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Nombre del Evento
                    </label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500 sm:text-sm"
                        placeholder="Ingresa el nombre del evento"
                    />
                </div>
                <div>   
                    <label className="block text-sm font-medium text-gray-700">
                        Fecha del Evento
                    </label>
                    <input
                        type="date"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lime-500 focus:ring-lime-500 sm:text-sm"
                    />
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-5">
              <Button
                className="inline-flex items-center gap-2 rounded-md bg-lime-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-lime-500 data-open:bg-lime-600"
                onClick={close}
              >
                Aceptar
              </Button>
              <Button
                className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                onClick={close}
              >
                Cancelar
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
