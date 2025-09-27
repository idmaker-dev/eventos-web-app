import React, { useEffect, useState } from "react";
import { useSelectedEvent } from '../contexts/SelectedEventContext';

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/pages/Dashboard.css";
import { ChevronLeft } from "lucide-react";
import Chat from "../assets/recursos/CHAT.svg";
import Conflicto from "../assets/recursos/conflictoAsignación.svg";
import Pago from "../assets/recursos/EstadoPendiente.svg";

export default function Dashboard() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const primerDia = new Date(anio, mes, 1).getDay() || 7;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  // Hook de eventos compartido desde el contexto
  const { eventoActual, selectEvent, eventos } = useSelectedEvent();

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

  // seleccionar auto el primer evento si no hay ninguno seleccionado
  useEffect(() => {
    if (!eventoActual && eventos && eventos.length > 0) {
      const firstId = eventos[0].id || eventos[0]._id || null;
      if (firstId) selectEvent(firstId);
    }
  }, [eventoActual, eventos, selectEvent]);

  const Metrica = ({
    valor,
    titulo,
    subtitulo,
    gradienteId,
    color1,
    color2,
  }) => (
    <div className="dashboard-metrica">
      <p className="text-sm font-semibold mb-3 text-left">{titulo}</p>
      <div className="metric-circle">
        <div className="circle-wrapper">
          <CircularProgressbar
            value={valor}
            strokeWidth={9}
            styles={buildStyles({
              pathColor: `url(#${gradienteId})`,
              trailColor: "#246370",
              strokeLinecap: "round",
            })}
          />
          <div className="circle-text">
            <div className="circle-value text-4xl font-medium">{valor}%</div>
            <div className="circle-sub text-sm">de 100%</div>
          </div>
        </div>
      </div>
      <p className="metric-subtext text-right">{subtitulo}</p>

      <svg style={{ height: 0 }}>
        <defs>
          <linearGradient id={gradienteId} gradientTransform="rotate(90)">
            <stop offset="100%" stopColor={"#72B7A4"} />
            {/* <stop offset="100%" stopColor={color2} /> */}
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  function EventMetrics() {
    // Obtener número de asistentes del evento actual
    function resolveAsistentes(evt) {
      if (!evt) return 0;
      const v = evt.asistentes;
      const n = parseInt(v, 10);
      return !isNaN(n) ? n : 0;
    }

  const asistentes = resolveAsistentes(eventoActual);

    const pagosPagados = 200; 
    const asientosAsignadosStatic = 300; 
    const boletosEmitidos = 200; 
    
    const valorPagos = asistentes > 0 ? Math.round((pagosPagados / asistentes) * 100) : 0;
    const valorAsientos = asistentes > 0 ? Math.round((asientosAsignadosStatic / asistentes) * 100) : 0;
    const valorBoletos = asistentes > 0 ? Math.round((boletosEmitidos / asistentes) * 100) : 0;

    return (
      <>
        <Metrica
          valor={Math.min(100, valorPagos)}
          titulo="% de pagos completados"
          subtitulo={`${pagosPagados} / ${asistentes} asistentes`}
          gradienteId="gradPagos"
          color1="#0d3b66"
          color2="#2a9d8f"
        />
        <Metrica
          valor={Math.min(100, valorAsientos)}
          titulo="Asientos asignados"
          subtitulo={`${asientosAsignadosStatic} / ${asistentes} asistentes`}
          gradienteId="gradAsientos"
          color1="#0f4c75"
          color2="#00b7c2"
        />
        <Metrica
          valor={Math.min(100, valorBoletos)}
          titulo="Boletos emitidos"
          subtitulo={`${boletosEmitidos} / ${asistentes} asistentes`}
          gradienteId="gradBoletos"
          color1="#2a9d8f"
          color2="#0d3b66"
        />
      </>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-titulo">Resumen general del evento</h1>

      {/* Métricas + calendario */}
      <div className="dashboard-panel ">
        <div className="dashboard-panel-left bg-white dark:bg-[#1e1e1e] p-5 rounded-3xl">
          <h2 className="dashboard-subtitle font-semibold text-base">
            Métricas clave
          </h2>
          <div className="dashboard-metricas">
          {/* Métricas del evento actual */}
            <EventMetrics />
          </div>
        </div>

        {/* CALENDARIO */}
        <div className="dashboard-panel-right">
          <div className="dashboard-calendario-wrapper">
            <div className="dashboard-calendario">
              <div className="dashboard-calendario-header">
                <h2 className="text-sm font-semibold text-[#246370] dark:text-[#72b7a4]">
                  {meses[mes]} {anio}
                </h2>
                <div>
                  <button onClick={() => cambiarMes(-1)}>
                    <ChevronLeft className="w-6 h-6 text-gray-400" />
                  </button>
                  <button onClick={() => cambiarMes(1)}>
                    <ChevronLeft className="w-6 h-6 text-gray-400 rotate-180" />
                  </button>
                </div>
              </div>
              <div className="dashboard-calendario-grid">
                {diasSemana.map((dia, i) => (
                  <div key={i} className="dashboard-dia-semana">
                    {dia}
                  </div>
                ))}
                {Array(primerDia - 1)
                  .fill(null)
                  .map((_, i) => (
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
                      className={`dashboard-dia ${
                        esHoy ? "hoy text-center" : ""
                      }`}
                    >
                      <p className="">{dia}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones requeridas */}
      <div className="dashboard-acciones bg-white dark:bg-[#1e1e1e] p-5 rounded-3xl">
        <div className="mb-5 flex justify-between items-center">
          <div>
            <p className=" font-semibold text-base">Acciones requeridas</p>
            <p className="dashboard-subtitulo font-semibold">
              Una lista de tareas urgentes para que el admin actúe
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-gray-500 dark:text-gray-100 font-normal">
              Buscar:
            </label>
            <input type="text" className="acciones-buscar rounded-xl" />
          </div>
        </div>

       
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-[#1e1e1e] rounded-2xl shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">
                  Tipo
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">
                  Descripción
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b last:border-none hover:bg-gray-50 dark:hover:bg-[#23272e]">
                <td className="px-4 py-2 flex items-center gap-2">
                  <img src={Pago} alt="Pago Pendiente" className="w-5 h-5" />
                  Pago Pendiente
                </td>
                <td className="px-4 py-2">
                  Hay 15 nuevos comprobantes para verificar
                </td>
                <td className="px-4 py-2">
                  <button className="bg-[#D8E8EF] text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100 px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#4b92ac] dark:hover:bg-[#4b92ac] hover:text-white transition">
                    Ir a Módulo de Pagos
                  </button>
                </td>
              </tr>
              <tr className="border-b last:border-none hover:bg-gray-50 dark:hover:bg-[#23272e]">
                <td className="px-4 py-2 flex items-center gap-2">
                  <img src={Chat} alt="Chat" className="w-5 h-5" />
                  Chat
                </td>
                <td className="px-4 py-2">
                  3 conversaciones requieren intervención humana
                </td>
                <td className="px-4 py-2">
                  <button className="bg-[#D8E8EF] text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100 px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#4b92ac] dark:hover:bg-[#4b92ac] hover:text-white transition">
                    Ir a Módulo de Comunicación
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-[#23272e]">
                <td className="px-4 py-2 flex items-center gap-2">
                  <img
                    src={Conflicto}
                    alt="Conflicto de Asignación"
                    className="w-5 h-5"
                  />
                  Conflicto de asignación
                </td>
                <td className="px-4 py-2">
                  Nuevo conflicto de asignación de asientos
                </td>
                <td className="px-4 py-2">
                  <button className="bg-[#D8E8EF] text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100 px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#4b92ac] dark:hover:bg-[#4b92ac] hover:text-white transition">
                    Ir a Módulo de Asignaciones
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
