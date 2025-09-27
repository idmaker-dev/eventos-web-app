import React, { useState } from "react";
import {
  CircularProgressbar,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./Dashboard.css";

export default function Dashboard() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const primerDia = new Date(anio, mes, 1).getDay() || 7; // Ajuste para que lunes sea inicio
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  const cambiarMes = (offset) => {
    let nuevoMes = mes + offset;
    let nuevoAnio = anio;
    if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAnio--;
    } else if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAnio++;
    }
    setMes(nuevoMes);
    setAnio(nuevoAnio);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-titulo">Resumen general del evento</h1>

      {/* 🔹 Métricas + calendario */}
      <div className="dashboard-top-grid">
        {/* Métricas */}
        <div className="dashboard-metricas">
          <div className="dashboard-metrica">
            <CircularProgressbar
              value={75}
              text={`75%`}
              styles={buildStyles({
                pathColor: "#2ecc71",
                textColor: "#2ecc71",
                trailColor: "#e6f4ea",
                textSize: "16px",
                strokeLinecap: "round"
              })}
            />
            <h3>% de pagos completados</h3>
            <p>750 / 1000 asistentes</p>
          </div>

          <div className="dashboard-metrica">
            <CircularProgressbar
              value={60}
              text={`60%`}
              styles={buildStyles({
                pathColor: "#00bcd4",
                textColor: "#00bcd4",
                trailColor: "#e0f7fa",
                textSize: "16px",
                strokeLinecap: "round"
              })}
            />
            <h3>Asientos Asignados</h3>
            <p>600 / 1000 asistentes</p>
          </div>

          <div className="dashboard-metrica">
            <CircularProgressbar
              value={85}
              text={`85%`}
              styles={buildStyles({
                pathColor: "#27ae60",
                textColor: "#27ae60",
                trailColor: "#e8f5e9",
                textSize: "16px",
                strokeLinecap: "round"
              })}
            />
            <h3>Boletos emitidos</h3>
            <p>600 / 1000 asistentes</p>
          </div>
        </div>

        {/* Calendario */}
        <div className="dashboard-calendario">
          <div className="dashboard-calendario-header">
            <h2>{meses[mes]} {anio}</h2>
            <div>
              <button onClick={() => cambiarMes(-1)}>&lt;</button>
              <button onClick={() => cambiarMes(1)}>&gt;</button>
            </div>
          </div>
          <div className="dashboard-calendario-grid">
            {diasSemana.map((dia, i) => (
              <div key={i} className="dashboard-dia-semana">{dia}</div>
            ))}
            {Array(primerDia - 1).fill(null).map((_, i) => (
              <div key={"empty-" + i} className="dashboard-vacio"></div>
            ))}
            {Array.from({ length: diasEnMes }, (_, i) => {
              const dia = i + 1;
              const esHoy =
                dia === hoy.getDate() &&
                mes === hoy.getMonth() &&
                anio === hoy.getFullYear();
              return (
                <div
                  key={dia}
                  className={`dashboard-dia ${esHoy ? "hoy" : ""}`}
                >
                  {dia}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🔹 Acciones requeridas */}
      <div className="dashboard-acciones">
        <h2>Acciones requeridas</h2>
        <p className="dashboard-subtitulo">
          Una lista de tareas urgentes para que el admin actúe
        </p>
        <div className="dashboard-tabla">
          <div className="dashboard-fila">
            <div className="col-tipo"><span className="icon alerta">⚠</span> Pago Pendiente</div>
            <div className="col-desc">Hay 15 nuevos comprobantes para verificar</div>
            <div className="col-accion"><button className="dashboard-btn">Ir a Módulo de Pagos</button></div>
          </div>
          <div className="dashboard-fila">
            <div className="col-tipo"><span className="icon chat">💬</span> Chat</div>
            <div className="col-desc">3 conversaciones requieren intervención humana</div>
            <div className="col-accion"><button className="dashboard-btn">Ir a Módulo de Comunicación</button></div>
          </div>
          <div className="dashboard-fila">
            <div className="col-tipo"><span className="icon conflicto">🔄</span> Conflicto de asignación</div>
            <div className="col-desc">Nuevo conflicto de asignación de asientos</div>
            <div className="col-accion"><button className="dashboard-btn">Ir a Módulo de Asignaciones</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
