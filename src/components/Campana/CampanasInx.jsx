import {
  Button,
  Field,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react"; // Eliminé Label
import React, { useState } from "react";
import clsx from "clsx";
import { Ellipsis, Plus } from "lucide-react";
import CrearCamp from "./CrearCamp"; // Importa el modal
import Configuracion from "./Configuracion";
import { Tooltip } from "../ui/Tooltip";

export default function CampanasInx() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tareaDescripcion, setTareaDescripcion] = useState("");
  const [vistaActual, setVistaActual] = useState("lista");
  const [campanaActual, setCampanaActual] = useState(null);

  const campanas = [
    {
      id: 1,
      title: "Informe de evento",
    },
    {
      id: 2,
      title: "Metodos de pago ",
    },
    {
      id: 3,
      title: "Pagos autorizados",
    },
    {
      id: 4,
      title: "Pago completo realizado",
    },
    {
      id: 5,
      title: "Generacion de boletos",
    },
  ];

  const handleCrearCampana = () => {
    // if (tareaDescripcion.trim()) {
    //   setIsModalOpen(true);
    // } else {
    //   alert("Por favor, describe la tarea antes de crear");
    // }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = (nuevaCampana) => {
    console.log("Nueva campaña creada:", nuevaCampana);
    setCampanaActual(nuevaCampana);
    setVistaActual("configuracion");
    setTareaDescripcion("");
    setIsModalOpen(false);
  };

  const handleVolverALista = () => {
    setVistaActual("lista");
    setCampanaActual(null);
  };

  if (vistaActual === "configuracion") {
    return (
      <Configuracion campana={campanaActual} onVolver={handleVolverALista} />
    );
  }

  return (
    <div className="border rounded-3xl p-2 md:p-6">
      <div className="flex flex-col justify-center items-center">
        <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-gray-400 mb-6">
          <span className="italic">Trabaja de forma inteligente</span>
          <p className="text-2xl sm:text-3xl md:text-4xl text-casal font-bold">
            con flujo de IA
          </p>
        </div>

        <div className="w-full md:w-4/5 lg:w-2/5 mx-auto">
          <div className="group">
            <div className="w-full px-4 relative">
              <Field>
                <div className="relative">
                  <Input
                    value={tareaDescripcion}
                    onChange={(e) => setTareaDescripcion(e.target.value)}
                    placeholder="Describe la tarea para comenzar"
                    className={clsx(
                      "block w-full rounded-full border shadow-2xl bg-white dark:bg-[#1a1a1a] px-5 py-1.5 pr-24 text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 placeholder-gray-400",
                      "focus:outline-none focus:ring-2 focus:ring-casal focus:border-transparent",
                      "transition-all duration-200"
                    )}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCrearCampana();
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <Tooltip content="Crear nueva campaña">
                      <Button
                        onClick={handleCrearCampana}
                        className="bg-casal hover:bg-casal/90 font-semibold rounded-full px-4 sm:px-6 md:px-8 py-2 text-white transition-colors duration-200 text-sm sm:text-base"
                      >
                        Crear
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </Field>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {campanas.map((campana) => (
            <div
              key={campana.id}
              className="border rounded-2xl p-4 items-center bg-fondoVs dark:bg-[#1a1a1a] relative h-48 flex flex-col justify-between"
            >
              <div className="absolute top-0 right-2 mt-1">
                <Menu as="div" className="relative inline-block text-left">
                  <MenuButton className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Ellipsis className="h-5 w-5 text-gray-500" />
                  </MenuButton>
                  <MenuItems className="absolute right-0 mt-2 w-32 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-2xl focus:outline-none z-10">
                    <div className="py-1">
                      <MenuItem>
                        {({ active }) => (
                          <button
                            className={clsx(
                              active
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300",
                              "block w-full text-left px-4 py-2 text-sm"
                            )}
                          >
                            Editar
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            className={clsx(
                              active
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300",
                              "block w-full text-left px-4 py-2 text-sm"
                            )}
                          >
                            Eliminar
                          </button>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button
                            className={clsx(
                              active
                                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-300",
                              "block w-full text-left px-4 py-2 text-sm"
                            )}
                          >
                            Desactivar
                          </button>
                        )}
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              </div>
              <div className="mt-2 text-left w-full">
                <h3 className="text-2xl font-normal text-casal dark:text-gray-400 mb-2 line-clamp-4">
                  {campana.title}
                </h3>
              </div>
              <div className="w-full">
                <p className="text-casal dark:text-gray-400 font-bold">
                  Pregunta frecuente
                </p>
              </div>
            </div>
          ))}
          <Tooltip content="Crear nueva campaña">
            <div
              onClick={handleCrearCampana}
              className="border rounded-2xl p-4 items-center bg-fondoVs dark:bg-[#1a1a1a] relative h-48 flex justify-center cursor-pointer hover:bg-casalds-600 hover:text-white text-gray-400 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex justify-center items-center">
                <Plus className="h-20 w-20" />
              </div>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Modal para crear campaña */}
      <CrearCamp
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        tareaInicial={tareaDescripcion}
      />
    </div>
  );
}
