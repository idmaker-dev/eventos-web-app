import { Input } from "@headlessui/react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";
import CrearCuestionarioPages from "../components/Comunicacion/CrearCuestionarioPages";
import React from "react";

export default function Comunicacion() {
  return (
    <div className="p-6 bg-white dark:bg-fodoBlack rounded-3xl shadow-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-0">
            Módulo de comunicación
          </h1>
          <p className="text-gray-500 dark:text-gray-200">
            Configuración de conversaciones y del Bot de preguntas Frecuentes
            (FAQ).
          </p>
        </div>
        <div>
          <Input
            type="text"
            placeholder="Buscar..."
            className={clsx(
              "mt-3 block w-full md:w-60 rounded-3xl border bg-white/5 px-3 py-1.5 text-sm/6 text-white",
              "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25"
            )}
          />
        </div>
      </div>

      {/* Tabs */}
      <div>
        <TabGroup>
          <TabList className="flex gap-4">
            <Tab
              className={({ selected }) =>
                clsx(
                  "rounded-full px-3 py-1 text-sm/6 font-semibold",
                  "focus:outline-none transition",
                  selected
                    ? "bg-casal text-white shadow dark:bg-casal"
                    : "hover:bg-white/15 text-grey dark:text-gray-600 bg-porcelain"
                )
              }
            >
              Configurar respuestas
            </Tab>
            <Tab
              className={({ selected }) =>
                clsx(
                  "rounded-full text-sm/6 font-semibold flex  items-center ",
                  "focus:outline-none transition",
                  selected
                    ? "bg-casal text-white shadow dark:bg-casal"
                    : "hover:bg-white/15 text-grey dark:text-gray-600 bg-porcelain"
                )
              }
            >
              <p className="px-3 py-1">Monitor de chats</p>
              <div className="flex justify-center items-center me-1 w-6 h-6 text-xs font-medium bg-towerGray text-white rounded-full">
                3
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                clsx(
                  "rounded-full px-3 py-1 text-sm/6 font-semibold",
                  "focus:outline-none transition",
                  selected
                    ? "bg-casal text-white shadow dark:bg-casal"
                    : "hover:bg-black/15 text-grey dark:text-gray-600 bg-porcelain"
                )
              }
            >
              Enlace cuestionario
            </Tab>
          </TabList>

          {/* Panels */}
          <TabPanels className="mt-6">
            {/* Panel 1 */}
            <TabPanel className={clsx("rounded-xl border-2")}>
              <div className="p-6 h-[80vh] bg-white dark:bg-fodoBlack rounded-3xl shadow-md flex flex-col items-center justify-center text-center">
                {/* Ícono decorativo */}
                <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-porcelain dark:bg-gray-800 shadow-inner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-casal dark:text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                {/* Mensaje principal */}
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Página en construcción
                </h2>

                {/* Mensaje secundario */}
                <p className="text-gray-500 dark:text-gray-300 max-w-md mb-6">
                  Estamos trabajando para habilitar esta sección muy pronto.
                  Mientras tanto, puedes navegar a otras pestañas del módulo de
                  comunicación.
                </p>

                {/* Botón de acción */}
                <button className="px-5 py-2.5 rounded-full bg-casal text-white font-medium shadow hover:bg-casal/90 transition">
                  Ir al inicio
                </button>
              </div>
            </TabPanel>

            {/* Panel 2 */}
            <TabPanel className={clsx("rounded-xl border-2")}>
              <div className="p-6 h-[80vh] bg-white dark:bg-fodoBlack rounded-3xl shadow-md flex flex-col items-center justify-center text-center">
                <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-porcelain dark:bg-gray-800 shadow-inner">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-casal dark:text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  Monitor de chats en construcción
                </h2>
                <p className="text-gray-500 dark:text-gray-300 max-w-md mb-6">
                  Muy pronto podrás visualizar y gestionar los chats activos en
                  tiempo real desde aquí.
                </p>
              </div>
            </TabPanel>

            {/* Panel 3 */}
            <TabPanel className={clsx("rounded-xl border-2")}>
              <CrearCuestionarioPages />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
