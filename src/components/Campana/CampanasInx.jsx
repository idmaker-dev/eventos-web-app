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
import Asiento from "../../assets/campanas/icono asiento.svg";
import Boleto from "../../assets/campanas/icono boleto.svg";
import Pregunta from "../../assets/campanas/icono mensaje.svg";
import Calendario from "../../assets/campanas/icono calendario.svg";
import infVerd from "../../assets/campanas/icono info verde.svg";

export default function CampanasInx() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tareaDescripcion, setTareaDescripcion] = useState("");
  const [vistaActual, setVistaActual] = useState("lista");
  const [campanaActual, setCampanaActual] = useState(null);

  const [campanas, setCampanas] = useState([
    {
      id: 1,
      accion: 1,
      title: "Finalización de selección de mesa",
      grupo: "Grupo finalización de mesa",
      stutus: "Activo",
      dataTime: "Hace 2 horas",
    },
    {
      id: 2,
      accion: 2,
      title: "Finalización de pagos de boletos",
      grupo: "Grupo finalización de pago de boletos",
      stutus: "Activo",
      dataTime: "Hace 7 días",
    },
    {
      id: 3,
      accion: 3,
      title: "Enviar invitaciones a asistentes",
      grupo: "Grupo usuarios al concluir el registro",
      stutus: "Desacticvada",
      dataTime: "Hace 3 días",
    },
    {
      id: 4,
      accion: 4,
      title: "Recordatorio de fechas de pago",
      grupo: "Grupo usuarios de pagos pendientes",
      stutus: "Activo",
      dataTime: "Hace 6 minutos",
    },
 ]);

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
    setCampanaActual(nuevaCampana);
    setVistaActual("configuracion");
    setTareaDescripcion("");
    setIsModalOpen(false);
  };

  const handleVolverALista = () => {
    setVistaActual("lista");
    setCampanaActual(null);
  };

  const handleDuplicar = (campana) => {
    const nuevaCampana = {
      ...campana,
      id: Date.now(),
      title: campana.title + " (Copia)",
      stutus: "Activo",
      dataTime: "Ahora",
    };
    setCampanas([nuevaCampana, ...campanas]);
  };

  const handleDesactivar = (campanaId) => {
    setCampanas(
      campanas.map((c) =>
        c.id === campanaId ? { ...c, stutus: "Desactivada" } : c
      )
    );
  };

  if (vistaActual === "configuracion") {
    return (
      <Configuracion campana={campanaActual} onVolver={handleVolverALista} />
    );
  }

  return (
    <div className="border h-full rounded-3xl p-2 md:p-6">
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
                    placeholder="Describe una acción para comenzar"
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
        <div className="text-left max-w-6xl mx-auto w-full mt-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-2">
            Plantillas de flujos predeterminadas
          </p>
        </div>
        <div className="max-w-6xl mx-auto mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {campanas.map((campana) => (
            <div
              key={campana.id}
              className="border rounded-2xl p-4 items-center bg-fondoVs dark:bg-[#1a1a1a] relative  flex flex-col justify-between"
            >
              <div className="grid grid-cols-2 w-full">
                <div>
                  {campana.accion === 1 && (
                    <div className="h-10 w-10 bg-casal rounded-lg flex items-center justify-center">
                      <img
                        src={Asiento}
                        alt="Icono Asiento"
                        className="h-6 w-6"
                      />
                    </div>
                  )}
                  {campana.accion === 2 && (
                    <div className="h-10 w-10 bg-blue-400 rounded-lg flex items-center justify-center">
                      <img
                        src={Boleto}
                        alt="Icono Boleto"
                        className="h-6 w-6"
                      />
                    </div>
                  )}
                  {campana.accion === 3 && (
                    <div className="h-10 w-10 bg-Acapulco rounded-lg flex items-center justify-center">
                      <img
                        src={Pregunta}
                        alt="Icono Pregunta"
                        className="h-6 w-6"
                      />
                    </div>
                  )}
                  {campana.accion === 4 && (
                    <div className="h-10 w-10 bg-yellow-300 rounded-lg flex items-center justify-center">
                      <img
                        src={Calendario}
                        alt="Icono Calendario"
                        className="h-6 w-6"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Menu as="div" className="relative inline-block text-left">
                    <MenuButton className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                      <Ellipsis className="h-7 w-7 text-casal" />
                    </MenuButton>
                    <MenuItems className="absolute right-0 mt-2 w-32 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-2xl focus:outline-none z-10">
                      <div className="py-1">
                        <MenuItem>
                          {({ active }) => (
                            <Button
                              className={clsx(
                                active
                                  ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white"
                                  : "text-gray-500 dark:text-gray-300",
                                "block w-full text-left px-4 py-2 text-sm"
                              )}
                            >
                              Editar
                            </Button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <Button
                              className={clsx(
                                active
                                  ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white"
                                  : "text-gray-500 dark:text-gray-300",
                                "block w-full text-left px-4 py-2 text-sm"
                              )}
                              onClick={() => handleDuplicar(campana)}
                            >
                              Duplicar
                            </Button>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }) => (
                            <Button
                              className={clsx(
                                active
                                  ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white"
                                  : "text-gray-500 dark:text-gray-300",
                                "block w-full text-left px-4 py-2 text-sm"
                              )}
                               onClick={() => handleDesactivar(campana.id)}
                            >
                              Desactivar
                            </Button>
                          )}
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Menu>
                </div>
              </div>

              <div className="mt-2 text-left w-full">
                <h3 className="text-2xl font-normal text-casal dark:text-gray-400 mb-2 line-clamp-4">
                  {campana.title}
                </h3>
              </div>
              <div className="mt-2 text-left w-full text-casal text-sm">
                <p className="font-bold">Aplicado a:</p>
                <p className=" ">{campana.grupo}</p>
              </div>
              <div className="mt-1 text-left flex gap-1 w-full text-casal text-sm">
                <p className="font-bold"> Estado:</p>
                <p className=" ">{campana.stutus}</p>
                {campana.stutus === "Activo" ? (
                  <div className="h-4 w-4 bg-Acapulco rounded-full mt-1"></div>
                ) : (
                  <div className="h-4 w-4 bg-red-400 rounded-full mt-1"></div>
                )}
              </div>
              <div className="mt-1 text-left flex gap-1 w-full text-casal text-sm">
                <p className="font-bold"> Última ejecución:</p>
                <p className=" ">{campana.dataTime}</p>
               
              </div>
            </div>
          ))}
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
