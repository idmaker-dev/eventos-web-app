import React from "react";
import "../styles/pages/Calendario.css";
import useCalendario from "../hooks/useCalendario";
import { TimelineProgress } from "../components/Calendario/Calendario";
import clsx from "clsx";
import { Button } from "@headlessui/react";
import Tareas from "../components/Calendario/Tareas";

const weddingTimeline = [
  {
    id: "1",
    title: "Seleccionar lugar de la ceremonia",
    status: "completed",
    date: "16 Marzo",
  },
  {
    id: "2",
    title: "Contratar fotógrafo",
    status: "completed",
    date: "22 Marzo",
  },
  {
    id: "3",
    title: "Prueba de menú",
    status: "completed",
    date: "5 Mayo",
  },
  {
    id: "4",
    title: "Enviar invitaciones",
    subtitle: "Programado - 20 Mayo",
    status: "in-progress",
    date: "15 Septiembre 2024",
  },
  {
    id: "5",
    title: "Prueba de vestido final",
    status: "scheduled",
    date: "15 Julio",
  },
  {
    id: "6",
    title: "Prueba de vestido final",
    status: "scheduled",
    date: "19 Julio",
  },
  {
    id: "7",
    title: "Prueba de vestido final",
    status: "scheduled",
    date: "25 Julio",
  },
  {
    id: "8",
    title: "Prueba de vestido final",
    status: "scheduled",
    date: "05 Agosto",
  },
  {
    id: "9",
    title: "¡Nuestra Boda!",
    status: "scheduled",
     date: "05 Noviembre 2025",
  },
];

export default function Calendario() {
  const { tab, setTab, tareas, completadas, total, progreso, save, toggleTarea } =
    useCalendario();

    const handleToggleTask = (id) => {
    if (typeof toggleTarea === "function") {
      toggleTarea(id);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-10 pt-2 space-y-8 px-4">
      <div className="justify-between flex  items-center border border-gray-200 px-4 py-2 rounded-full shadow-sm">
        <div className="flex gap-4">
          <Button
            className={
              tab === "Calendario"
                ? "bg-[#A3AD63] text-white px-3 py-1 rounded-full"
                : "bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"
            }
            onClick={() => setTab("Calendario")}
          >
            Calendario
          </Button>
          <Button
            className={
              tab === "Tareas"
                ? "bg-[#A3AD63] text-white px-3 py-1 rounded-full"
                : "bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"
            }
            onClick={() => setTab("Tareas")}
          >
            Tareas
          </Button>
        </div>
        <div>
          <button
            className="bg-[#A3AD63] text-white px-4 py-1 rounded-full hover:bg-[#8B9A4B]"
            onClick={save}
          >
            Guardar cambios
          </button>
        </div>
      </div>
      {tab === "Calendario" && (
        <>
          <div className="">
            <p className="text-[#7FB069] text-4xl font-semibold">
              Nuestro Calendario
            </p>
            <p className="text-gray-400">
              El camino hacia nuestro día perfecto
            </p>
          </div>
          <div className="">
            <TimelineProgress
              items={weddingTimeline}
              title="Progreso General"
            />
          </div>
        </>
      )}{" "}
      {tab === "Tareas" && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-4xl font-semibold text-[#7FB069]">
                Mis Tareas
              </p>
              <p className="text-gray-500">
                Gestiona tus tareas pendientes y completadas
              </p>
            </div>
          </div>
          <div className="">
            <Tareas items={weddingTimeline} title="Progreso General" />
          </div>
        </>
      )}
    </div>
  );
}
