import React, { useState } from "react";
import clsx from "clsx";
import "../styles/pages/Home.css";
import MasterPage from "../components/layout/MasterPage";
import { CircleChart } from "../components/ui/CircleChart";
import { Outlet } from "react-router-dom";
import { Button } from "@headlessui/react";
import Logo from "../assets/recursos/logoTentativo2.svg";
import Configuracion from "../components/Modales/Configuracion";
import {
  Circle,
  CircleArrowDown,
  CircleArrowUp,
  Dot,
  MoveRight,
  Search,
  Settings,
  Tags,
} from "lucide-react";

export default function Home() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const open = () => {
    // Lógica para abrir la configuración
    setIsOpen(true);
  }
  const Minimizar = () => {
    setIsMinimized(!isMinimized);
  };
  return (
    <div className="">
      <div className={clsx("bg-fondoGris home-container",
        isMinimized ? "md:max-h-screen pb-10" : "min-h-screen pb-5"
      )}>
        {/* APARTADO DE LA IMAGEN*/}
        <section className={clsx(
          "relative w-full md:w-[95%] mx-auto  rounded-b-3xl overflow-hidden shadow-lg text-center",
          isMinimized ? "h-56 md:h-52" : "h-96 md:h-[32rem]"
        )}>
          <div className="absolute inset-0 bg-black/40 rounded-b-3xl z-1"></div>
          <div className="flex justify-between px-5 absolute top-2 w-full">
            <Button className="bg-white px-2 rounded-full shadow-2xl text-3xl font-bold">
              <img src={Logo} alt="Menu" className="w-24 h-8" />
            </Button>
            <Button onClick={open} className="text-white p-0.5 bg-transparent border-4 border-white rounded-full shadow-2xl">
              <Settings className="w-6 h-6" />
            </Button>
          </div>
          <div className="absolute bottom-2 flex justify-center w-full z-1">
            <div className="text-center text-white">
              <div>
                <h3 className="font-semibold text-2xl">Boda de</h3>
                <h1 className="font-bold text-7xl minion-medium-italic">
                  Ana & Juan
                </h1>
                <p className="font-medium text-2xl">15 de septiembre, 2025</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end px-5 absolute bottom-2 w-full">
            <Button className="text-white rounded-full shadow-2xl">
              {
                isMinimized ? (
                  <CircleArrowDown onClick={Minimizar} className="w-8 h-8 md:w-10 md:h-10" />
                ) : (
                  <CircleArrowUp  onClick={Minimizar} className="w-8 h-8 md:w-10 md:h-10" />
                )
              }
            </Button>
          </div>
          <img
            src="/boda.jpg"
            alt="Boda"
            className="w-full h-full object-cover rounded-b-3xl bg-no-repeat bg-center"
          />
        </section>
        <section className="w-full md:w-[90%] mx-auto items-center justify-center ">
          <div className="text-center mt-4 text-gray-400">
            <p className="text-xs font-light">Resumen general del evento</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-0 lg:gap-4 mt-10 mb-6 w-full lg:w-[95%] mx-auto">
            <div className="px-6 py-2">
              <p className="text-center text-7xl font-bold text-[#C1B2A3]">
                127
              </p>
              <p className="text-center text-gray-800 text-2xl font-medium">
                Días para nuestra boda
              </p>
              <div className="w-[90%] mx-auto">
                <div className="progress">
                  <div className="progress-bar" style={{ width: "60%" }}></div>
                </div>
              </div>
              <p className="text-center font-medium text-gray-500">
                Progreso de la boda
              </p>
            </div>
            <div className="px-6 md:py-2 flex justify-center border-t-2 py-6 border-gray-200 md:border-b-2 md:border-l-2 md:border-t-0 lg:border-t-0 lg:border-b-0 lg:border-l-0">
              <div>
                <p className="text-xl font-bold text-gray-900 mb-4">
                  Próximas Tareas
                </p>
                <ul className="space-y-4 mb-4">
                  <li className="flex gap-4 ">
                    <div className="flex pt-2 justify-center">
                      <div className="bg-[#DECB97] rounded-full w-4 h-4" />
                    </div>
                    <div>
                      <p>Prueba de menú</p>
                      <p className="text-gray-500 text-sm">En 3 días</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex pt-2 justify-center">
                      <div className="bg-[#D6764D] rounded-full w-4 h-4" />
                    </div>
                    <div>
                      <p>Reunión con fotógrafo</p>
                      <p className="text-gray-500 text-sm">En 1 semana</p>
                    </div>
                  </li>
                </ul>
                <button className="cursor-pointer hover:underline ml-8 text-yellow-500">
                  <span className="flex items-center justify-center">
                    Ver todas las tareas
                    <MoveRight className="w-4 h-6 ml-3" />
                  </span>
                </button>
              </div>
            </div>
            <div className="px-6 md:py-2 flex justify-center border-t-2 py-6 border-gray-200 md:border-t-2 md:border-r-2 md:border-b-0 lg:border-t-0 lg:border-b-0 lg:border-l-0 lg:border-r-0">
              <div>
                <p className="text-xl font-bold text-gray-900 mb-">Graduados</p>
                <div className="contenido">
                  <ul className="space-y-3 mt-6">
                    <li className="flex gap-2">
                      <div className="flex pt-1 justify-center">
                        <div className="bg-[#A3AD63] rounded-full w-4 h-4" />
                      </div>
                      <p>85 Confirmados</p>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex pt-1 justify-center">
                        <div className="bg-[#D9A659] rounded-full w-4 h-4" />
                      </div>
                      <p>35 Pendientes</p>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex pt-1 justify-center">
                        <div className="bg-[#D6764D] rounded-full w-4 h-4" />
                      </div>
                      <p>11 Rechazados</p>
                    </li>
                  </ul>

                  <CircleChart
                    confirmados={85}
                    pendientes={35}
                    rechazados={11}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 md:py-2 flex justify-center border-t-2 py-6 border-gray-200 md:border-t-0">
              <div className="">
                <p className="text-xl font-bold text-gray-900 mb-4">
                  Etiquetas
                </p>
                <ul className="space-y-3 mt-6">
                  <li className="flex gap-2">
                    <Tags className="w-5 h-5 text-[#956E3C] " />
                    <p>Fotógrafo</p>
                  </li>
                  <li className="flex gap-2">
                    <Tags className="w-5 h-5 text-[#6C757D] " />
                    Catering
                  </li>
                  <li className="flex gap-2">
                    <Tags className="w-5 h-5 text-[#DECB97] " />
                    Florista
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sección extra */}
      <section className="max-w-7xl mx-auto mt-14 mb-5 px-5 max-h-full bg-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4  ">
          <div className="">
            <p className="text-gray-900 text-4xl font-semibold">Secciones de tu Boda</p>
            <p className="text-gray-400">Gestiona y controla cada detalle para tu boda perfecta</p>
          </div>
          <div className="search-box w-full md:w-1/3 flex lg:w-auto items-center border border-gray-300 rounded-full overflow-hidden">
            <input type="text" placeholder="Boda de Ana y Juan" />
            <button className="search-btn">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </section>
      <MasterPage>
        <Outlet />
      </MasterPage>
      <Configuracion isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}
