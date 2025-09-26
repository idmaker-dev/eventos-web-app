import React from "react";
import "../styles/pages/Calendario.css";
import useCalendario from "../hooks/useCalendario";
import { TimelineProgress } from "../components/Calendario/Calendario";

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
  },
]


export default function Calendario() {
  const { tab, setTab, tareas, completadas, total, progreso, save } = useCalendario();

  return (
    <div className="bg-white min-h-screen pb-10 pt-2 space-y-8 px-4">
      <div className="justify-between flex  items-center border border-gray-200 px-4 py-2 rounded-full shadow-sm">
        <div className="flex gap-4">
          <button
            className={tab === "Calendario" ? "bg-[#A3AD63] text-white px-3 py-1 rounded-full" : "bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"}
            onClick={() => setTab("Calendario")}
          >
            Calendario
          </button>
          <button
            className={tab === "Tareas" ? "bg-[#A3AD63] text-white px-3 py-1 rounded-full" : "bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"}
            onClick={() => setTab("Tareas")}
          >
            Tareas
          </button>
        </div>
        <div>
          <button className="bg-[#A3AD63] text-white px-4 py-1 rounded-full hover:bg-[#8B9A4B]" onClick={save}>Guardar cambios</button>
        </div>
      </div>

      <div className="">
        <p className="text-[#7FB069] text-4xl font-semibold">Nuestro Calendario</p>
        <p className="text-gray-400">El camino hacia nuestro día perfecto</p>
      </div>

    
      <div className="">
        <TimelineProgress items={weddingTimeline} title="Progreso General" />
      </div>
    
    </div>
  );
}
