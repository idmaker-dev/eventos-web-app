import React, { useState } from "react";
import CampanasInx from "../components/Campana/CampanasInx.jsx";
import CompClientes from "../components/Clientes/CompClientes.jsx";
import clsx from "clsx";
import { Button } from "@headlessui/react";

export default function Campanas() {
  const [modulo, setModulo] = useState("campana"); // "campana" o "tickets"

  return (
    <div className="p-3 md:p-6 bg-white dark:bg-fodoBlack rounded-3xl shadow-md min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        {modulo === "campana" ? (
          <div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Módulo de Campaña
            </h1>
            <p className="text-gray-500 dark:text-gray-200">
              Automatiza y personaliza las respuestas de atención al cliente.
            </p>
          </div>
        ) : (
          <div className="md:w-9/12">
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Módulo de Clientes
            </h1>
            <p className="text-gray-500 dark:text-gray-200 line-clamp-5 sm:line-clamp-5 md:line-clamp-3">
              Gestiona solicitudes personalizadas de los asistentes. Cada
              solicitud genera un ticket que es atendido por un asesor  humano,
              ideal para casos como cambios de boletos, actualizaciones de
              información o aclaraciones de pago.
            </p>
          </div>
        )}

        <div className=" sm:max-w-72 flex justify-center md:justify-end mt-4 md:mt-0 gap-2">
          <Button
            onClick={() => setModulo("campana")}
            className={clsx(
              "rounded-full px-3 py-1 text-sm/6 font-semibold focus:outline-none transition",
              modulo === "campana"
                ? "bg-casal text-white shadow dark:bg-casal"
                : "hover:bg-white/15 text-grey dark:text-gray-600 bg-porcelain"
            )}
          >
            Flujo de campaña
          </Button>
          <Button
            onClick={() => setModulo("tickets")}
            className={clsx(
              "rounded-full px-3 py-1 text-sm/6 font-semibold focus:outline-none transition",
              modulo === "tickets"
                ? "bg-casal text-white shadow dark:bg-casal"
                : "hover:bg-white/15 text-grey dark:text-gray-600 bg-porcelain"
            )}
          >
            Monitor de ticket
          </Button>
        </div>
      </div>
      <div className="mt-3">
        {modulo === "campana" && <CampanasInx />}
        {modulo === "tickets" && <CompClientes />}
      </div>
    </div>
  );
}
