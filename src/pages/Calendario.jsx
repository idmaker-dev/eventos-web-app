import React from "react";
import "../styles/pages/Calendario.css";
import useCalendario from "../hooks/useCalendario";

export default function Calendario() {
  const { tab, setTab, tareas, completadas, total, progreso } = useCalendario();

  return (
    <div className="calendario-container">
      <div className="tabs">
        <button
          className={tab === "Calendario" ? "active" : ""}
          onClick={() => setTab("Calendario")}
        >
          Calendario
        </button>
        <button
          className={tab === "Tareas" ? "active" : ""}
          onClick={() => setTab("Tareas")}
        >
          Tareas
        </button>
        <button className="guardar-btn">Guardar cambios</button>
      </div>

      <div className="calendario-header">
        <h2>Nuestro Calendario</h2>
        <p>El camino hacia nuestro día perfecto</p>
      </div>

      <div className="contenido">
        
        <div className="timeline-horizontal">
          {tareas.map((tarea, index) => (
            <div key={tarea.id} className={`timeline-step ${tarea.estado}`}>
              <div className="circle"></div>
              <div className="info">
                <strong>{tarea.nombre}</strong>
                <p>
                  {tarea.estado === "completado"
                    ? `Completado - ${tarea.fecha}`
                    : tarea.estado === "en-progreso"
                    ? `En progreso - ${tarea.fecha}`
                    : tarea.fecha
                    ? `Programado - ${tarea.fecha}`
                    : ""}
                </p>
              </div>
              {index < tareas.length - 1 && <div className="line" />}
            </div>
          ))}
        </div>
        <div className="progreso">
          <h3>Progreso General</h3>
          <div className="circle-progress">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${progreso}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">
                {progreso}%
              </text>
            </svg>
          </div>
          <ul className="detalles">
            <li className="completadas">✔ {completadas} tareas completadas</li>
            <li className="pendientes">◻ {total - completadas} tareas pendientes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
