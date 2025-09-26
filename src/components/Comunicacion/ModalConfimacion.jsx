import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,

} from "@headlessui/react";
import { ChevronDown, CircleX } from "lucide-react";
import Confirmacion from "../../assets/recursos/REGISTRO_COMPLETADO.svg";
import clsx from "clsx";

export default function Eventos({ open, onClose }) {

  const handleClose = () => {
   
    onClose();
  };
  return (
    <Dialog
      as="div"
      className="relative z-50 focus:outline-none"
        open={open}
      onClose={onClose}
    >
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-[#2a9d8f]/20  transition-opacity"
          aria-hidden="true"
        />
        <div className="bg-black/20 fixed inset-0 backdrop-blur-sm ">
          <div className="flex min-h-full items-center justify-center p-4">
              <DialogPanel
                transition
                className="w-full max-w-md space-y-9 rounded-xl bg-white dark:bg-[#1a1a1a] p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
              >
                <div className="flex justify-end">
                  <button
                    className="text-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={handleClose}
                    aria-label="Close"
                  >
                    <CircleX size={28} />
                  </button>
                </div>
                <div className="flex justify-center mb-4">
                  <img
                    className="w-40"
                    src={Confirmacion}
                    alt="Evento creado"
                  />
                </div>
                <DialogTitle className="text-3xl font-semibold text-center text-[#246370] dark:text-[#2a9d8f]">
                  ¡Cuestionario creado <br /> correctamente!
                </DialogTitle>
                <div className="mt-4 flex justify-center text-center">
                  <p className="text-base text-gray-800 font-semibold dark:text-gray-300">
                    ¡Listo! Has completado tu cuestionario. <br />
                    Ahora puedes compartirlo con tus asistentes <br />
                    para que se registren y realicen su pago
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button
                    className="inline-flex my-5 items-center justify-center gap-2 rounded-md bg-[#72B7A4] hover:bg-casal px-6 py-1.5 text-xl font-semibold text-white shadow-inner shadow-white/10"
                    onClick={handleClose}
                  >
                    Compartir registro <br /> del cuestionario
                  </Button>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium text-center">
                    Accede al panel de administración para completar la
                    información y <br /> habilitar funciones como boletos,
                    asientos y recordatorios.
                  </p>
                </div>
              </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
