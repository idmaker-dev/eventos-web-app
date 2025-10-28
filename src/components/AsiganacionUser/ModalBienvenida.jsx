import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import confirmacion from "../../assets/recursos/confirmacionAsientos.svg";
import { X, MapPin, Users, Clock } from "lucide-react";
import React from "react";

export default function ModalBienvenida({ 
  open, 
  close, 
  usuario = { nombre: "María González" },
  evento = { nombre: "Graduación PREPA TEC", fecha: "23 de Mayo 2026", lugar: "Auditorio Principal" }
}) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        close();
      }}
      as="div"
      className="relative z-50 focus:outline-none"
    >
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 backdrop-blur-sm transition-all duration-300"
          aria-hidden="true"
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-2xl transform rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 max-h-[90vh] overflow-y-auto"
          >
            <div className="relative bg-gradient-to-r from-casal to-casal/80 p-4">
              <button
                onClick={close}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Logo y título */}
              <DialogTitle className="flex flex-col sm:flex-row items-center gap-4 mb-2 pr-12">
                <div className="relative">
                  <img
                    src="/logop.png"
                    alt="Logo P"
                    className="object-contain  w-16 h-16"
                  />
                 
                </div>
                
                <div className="text-white/90 text-sm font-medium">
                  <h1 className="text-2xl font-bold">
                    ¡Bienvenid@, {usuario.nombre}!
                  </h1>
                  <p className="text-white/90 text-sm font-medium">
                    Selección de Mesa - {evento.nombre}
                  </p>
                </div>
              </DialogTitle>

              {/* Información del evento */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/70" />
                    <span className="text-sm font-medium">{evento.fecha}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/70" />
                    <span className="text-sm font-medium">{evento.lugar}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/70" />
                    <span className="text-sm font-medium">Selección Personal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="px-8 py-6">
              {/* Ilustración */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={confirmacion}
                    alt="Bienvenida"
                    className="w-60 h-44 object-contain mx-auto"
                  />
                  {/* Decoración alrededor de la imagen */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-pulse opacity-80"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-blue-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '0.5s'}}></div>
                </div>
              </div>

              {/* Texto descriptivo */}
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  ¡Hora de elegir tu mesa perfecta...! 
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left">
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-3">
                    Te damos la bienvenida a nuestro sistema de asignación de mesas. 
                    Aquí podrás:
                  </p>
                  
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-casal rounded-full"></span>
                      Ver el plano completo del salón
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-casal rounded-full"></span>
                      Seleccionar la mesa que prefieras
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-casal rounded-full"></span>
                      Especificar tus restricciones alimentarias
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-casal rounded-full"></span>
                      Confirmar tu asignación al instante
                    </li>
                  </ul>
                </div>

                {/* Tip adicional */}
                <div className="bg-casal/5 dark:bg-casal/30 border border-casal/20 dark:border-casal/700 rounded-lg p-3">
                  <p className="text-casal dark:text-casal text-sm">
                    <strong>Tip:</strong> Las mesas en con asientos color gris tienen espacio disponible para ti. <br /> 
                    ¡Haz clic en la que más te guste!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-8 py-2 flex justify-end gap-3">
              <Button
                onClick={close}
                className="px-6 py-3 bg-gradient-to-r from-casal to-casal/80 hover:from-casal/90 hover:to-casal text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-casal/50 focus:ring-offset-2"
              >
                ¡Comenzar a explorar! 
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}