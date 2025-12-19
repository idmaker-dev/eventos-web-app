import React from "react";
import infor from "../../assets/campanas/icono info blanco.svg";
import veficacion from "../../assets/campanas/verificacion.svg";
import foco from "../../assets/campanas/icono foco.svg";

export default function ModalInfoCampanas({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-casal/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        <div className="flex items-center gap-3 mb-4 bg-Acapulco p-6 rounded-t-2xl">
          <img src={infor} alt="Información" className="h-8 w-8" />
          <h2 className="text-xl font-bold text-white">
            Información de módulo
          </h2>
        </div>
        <div className="flex gap-6 p-6">
          <div className="w-24 flex justify-center">
            <div className="h-48 w-1.5 rounded-full bg-Acapulco">
            </div>
          </div>
          <div className="">
            <h3 className="text-lg font-semibold mb-1">
              ¿Qué es el módulo de Campañas?
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              El módulo de Campañas te permite automatizar mensajes y acciones
              según el comportamiento de tus asistentes dentro del evento.
            </p>
            <h3 className="text-lg font-semibold mb-1">¿Cómo funciona?</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Configura una acción (por ejemplo, finalizar selección de mesa) y
              define un mensaje automático que se enviará al grupo de personas
              que cumplan esa condición.
            </p>
            <h3 className="text-lg font-semibold mb-1">¿Para qué sirve?</h3>
            <ul className="mb-4 text-sm text-gray-700 space-y-1">
              <li className="flex items-center gap-2">
                <img src={veficacion} alt="Verificación" className="h-4 w-4" />
                importantes
              </li>
              <li className="flex items-center gap-2">
                <img src={veficacion} alt="Verificación" className="h-4 w-4" />
                 Enviar recordatorios y
                notificaciones
              </li>
              <li className="flex items-center gap-2">
                <img src={veficacion} alt="Verificación" className="h-4 w-4" />
                 Reducir atención
                manual
              </li>
              <li className="flex items-center gap-2">
                <img src={veficacion} alt="Verificación" className="h-4 w-4" />
                 Mantener una
                comunicación clara y oportuna
              </li>
            </ul>
            <div className="bg-Acapulco/50 text-casal rounded-full py-2 px-7 text-sm flex items-center gap-2 mb-4">
                <img src={foco} alt="Foco" className="h-7 w-7" />
              Las campañas se ejecutan automáticamente cuando se cumple la
              acción configurada.
            </div>
            <div>
                <button
              onClick={onClose}
              className="w-full bg-casal/80 hover:bg-casal text-white font-semibold rounded-full py-2 mt-2 transition"
            >
              Entendido
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
