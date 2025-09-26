import { useState } from "react";
import { TAREAS_DATA } from "../utils/constants";

export default function useCalendario() {
  const [tab, setTab] = useState("Calendario");

  const tareas = TAREAS_DATA;
  const completadas = tareas.filter((t) => t.estado === "completado").length;
  const total = tareas.length;
  const progreso = Math.round((completadas / total) * 100);

  return {
    tab,
    setTab,
    tareas,
    completadas,
    total,
    progreso,
  };
}
