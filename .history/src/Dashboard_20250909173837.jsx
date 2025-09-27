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

  const primerDia = new Date(anio, mes, 1).getDay() || 7;
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

  const Metrica = ({ valor, titulo, subtitulo, gradienteId, color1, color2 }) => (
    <div className="dashboard-metrica">
      <CircularProgressbar
        value={valor}
        text={""}
        strokeWidth={10}
        styles={buildStyles({
          pathColor: `url(#${gradienteId})`,
          trailColor: "#e6e9f0",
          strokeLinecap: "round"
        })}
      />
      <div className="metric-text">
        <strong>{valor}%</strong>
        <span>de 100%</span>
      </div>
      <h3>{titulo}</h3>
      <p className="metric-subtext">{subtitulo}</p>

      {/* Gradiente */}
      <svg style={{ height: 0 }}>
        <defs>
          <linearGradient id={gradienteId} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-titulo">Resumen general del evento</h1>

      {/* 🔹 Métricas + calendario */}
      <div className="dashboard-top-grid">
        <h2 className="dashboard-subtitle">Métricas clave</h2>
        <div className="dashboard-metricas">
          <Metrica
            valor={75}
            titulo="% de pagos completados"
            subtitulo="750 / 1000 asistentes"
            gradienteId="gradPagos"
            color1="#0d3b66"
            color2="#2a9d8f"
          />
          <Metrica
            valor={60}
            titulo="Asientos Asignados"
            subtitulo="600 / 1000 asistentes"
            gradienteId="gradAsientos"
            color1="#0f4c75"
            color2="#00b7c2"
          />
          <Metrica
            valor={85}
            titulo="Boletos emitidos"
            subtitulo="600 / 1000 asistentes"
            gradienteId="gradBoletos"
            color1="#2a9d8f"
            color2="#0d3b66"
          />
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
