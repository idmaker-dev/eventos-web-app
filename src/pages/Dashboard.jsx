import React, { useEffect, useState, useCallback } from "react";
import { useSelectedEvent } from "../contexts/SelectedEventContext";
import { useSignalRDashboard } from "../hooks/useSignalR";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/pages/Dashboard.css";
import { ChevronLeft } from "lucide-react";
import Chat from "../assets/recursos/CHAT.svg";
import Conflicto from "../assets/recursos/conflictoAsignación.svg";
import Pago from "../assets/recursos/EstadoPendiente.svg";
import CrearCuestionarioPages from "../components/Comunicacion/CrearCuestionarioPages";

export default function Dashboard() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [showCuestionario, setShowCuestionario] = useState(false);

  // Hook de eventos compartido desde el contexto
  const { eventoActual, selectEvent, eventos, cargarEventos } =
    useSelectedEvent();

  // Función para cargar estadísticas del dashboard
  const cargarEstadisticas = useCallback(async () => {
    if (!eventoActual?.id) return;

    setIsLoadingStats(true);
    try {
      const eventService = (await import("../services/eventService")).default;
      const resultado = await eventService.getDashboardStats(eventoActual.id);

      if (resultado.success) {
        setDashboardStats(resultado.data);
        console.log("📊 Estadísticas del dashboard cargadas:", resultado.data);
      } else {
        console.error("❌ Error al cargar estadísticas:", resultado.error);
      }
    } catch (error) {
      console.error("❌ Error inesperado al cargar estadísticas:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, [eventoActual?.id]);

  // Callback para manejar actualizaciones del dashboard desde SignalR
  const handleDashboardUpdate = useCallback(
    (data) => {
      console.log("🔄 Dashboard recibió notificación de actualización:", data);
      setUltimaActualizacion(new Date().toISOString());

      // Recargar estadísticas del dashboard
      cargarEstadisticas();

      // Recargar eventos si es necesario
      if (cargarEventos) {
        console.log("📊 Recargando eventos desde SignalR...");
        cargarEventos();
      }
    },
    [cargarEstadisticas, cargarEventos],
  );

  // Usar el hook de SignalR para dashboard
  const { ultimaActualizacion: signalRUltimaActualizacion } =
    useSignalRDashboard(handleDashboardUpdate);

  // Cargar estadísticas cuando cambia el evento actual
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

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
    subtitulo2,
    gradienteId,
    color1,
    color2,
  }) => (
    <div className="dashboard-metrica max-w-7xl">
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
      {subtitulo2 && (
        <p className="metric-subtext text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
          {subtitulo2}
        </p>
      )}

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

  const LineMetric = ({ titulo, valor, minimo, maximo }) => {
    const minVal = Number(minimo) || 0;
    const maxVal = Number(maximo) || (minVal + 1);
    const currentVal = Number(valor) || 0;

    const minPos = 25; // %
    const maxPos = 90; // %
    
    let currentPos;
    if (currentVal <= minVal) {
      currentPos = minVal > 0 ? (currentVal / minVal) * minPos : 0;
    } else {
      const range = maxVal - minVal;
      currentPos = minPos + ((currentVal - minVal) / range) * (maxPos - minPos);
    }
    currentPos = Math.max(5, Math.min(95, currentPos));

    const porcentaje = maxVal > 0 ? Math.round((currentVal / maxVal) * 100) : 0;

    return (
      <div className="dashboard-metrica-horizontal">
        <p className="text-sm font-semibold mb-6 text-left">{titulo}</p>
        <div className="line-metric-container">
          <div className="line-base"></div>
          
          <div className="line-marker min" style={{ left: `${minPos}%` }}>
            <span className="marker-label">Min: {minVal}</span>
            <div className="marker-tick"></div>
          </div>

          <div className="line-marker max" style={{ left: `${maxPos}%` }}>
            <span className="marker-label">Max: {maxVal}</span>
            <div className="marker-tick"></div>
          </div>

          <div 
            className={`line-indicator-point ${currentVal < minVal ? 'below-min' : ''}`}
            style={{ left: `${currentPos}%` }}
          >
            <div className="indicator-tooltip">
              {currentVal} ({porcentaje}%)
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BarMetric = ({ titulo, total, firmados, sinFirmar }) => {
    const porcentajeFirmados = total > 0 ? Math.round((firmados / total) * 100) : 0;
    const porcentajeSinFirmar = total > 0 ? Math.round((sinFirmar / total) * 100) : 0;

    return (
      <div className="dashboard-metrica-horizontal">
        <p className="text-sm font-semibold mb-4 text-left">{titulo}</p>
        <div className="bar-metric-wrapper">
          <div className="bar-metric-container">
            <div 
              className="bar-segment signed" 
              style={{ width: `${porcentajeFirmados}%` }}
            >
              {porcentajeFirmados >= 15 ? (
                <span className="segment-label">{firmados} ({porcentajeFirmados}%)</span>
              ) : (
                <div className="segment-tooltip">
                  Firmados: {firmados} ({porcentajeFirmados}%)
                </div>
              )}
            </div>
            <div 
              className="bar-segment unsigned" 
              style={{ width: `${porcentajeSinFirmar}%` }}
            >
              {porcentajeSinFirmar >= 15 ? (
                <span className="segment-label">{sinFirmar} ({porcentajeSinFirmar}%)</span>
              ) : (
                <div className="segment-tooltip">
                  Sin firmar: {sinFirmar} ({porcentajeSinFirmar}%)
                </div>
              )}
            </div>
          </div>
          <div className="bar-footer">
            <span className="total-label">Total registrados: {total}</span>
            <div className="flex gap-4">
              <span className="legend-item"><i className="dot signed"></i> Firmados</span>
              <span className="legend-item"><i className="dot unsigned"></i> Sin firmar</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  function EventMetrics() {
    // Obtener capacidad máxima del evento
    const capacidadMaxima = dashboardStats?.evento?.capacidad_maxima || 0;

    // Datos de pagos desde el API
    const porcentajePagos =
      dashboardStats?.pagos?.porcentaje_pagos_completados || 0;
    const deudasPagadas =
      dashboardStats?.pagos?.deudas_completamente_pagadas || 0;
    const totalDeudas = dashboardStats?.pagos?.total_deudas || 0;
    const montoPagado = dashboardStats?.pagos?.monto_total_pagado || 0;
    const montoTotal = dashboardStats?.pagos?.monto_total_adeudado || 0;

    // Datos de boletos desde el API
    const boletosEmitidos = dashboardStats?.boletos?.boletos_emitidos || 0;
    const porcentajeBoletos =
      dashboardStats?.boletos?.porcentaje_ocupacion || 0;
    // const capacidadMaxima = dashboardStats?.evento?.capacidad_maxima || 0;

    // Asientos asignados (pendiente - valor estático por ahora)
    const asientosAsignadosStatic = 0; // Pendiente de implementar
    const porcentajeAsientos =
      capacidadMaxima > 0
        ? Math.round((asientosAsignadosStatic / capacidadMaxima) * 100)
        : 0;
    
    const invitadosRegistrados = dashboardStats?.boletos?.invitados_registrados || 0;

    const invitadosSinFirmar = dashboardStats?.boletos?.invitados_sin_firmar || 0;
    const invitadosFirmados = dashboardStats?.boletos?.invitados_con_firma || 0;
    const invitadoConPago = dashboardStats?.boletos?.invitados_con_pago || 0;

    const porcentajeInvitadosFirmados = invitadosRegistrados > 0 ? Math.round((invitadosFirmados / invitadosRegistrados) * 100) : 0;
    const porcentajeInvitadosSinFirmar = invitadosRegistrados > 0 ? Math.round((invitadosSinFirmar / invitadosRegistrados) * 100) : 0;
    const porcentajeInvitadoConPago = invitadosFirmados > 0 ? Math.round((invitadoConPago / invitadosFirmados) * 100) : 0;

    // Formatear dinero
    const formatMoney = (amount) => {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
      }).format(amount);
    };

    return (
      <>
        {/* <Metrica
          valor={Math.round(porcentajePagos)}
          titulo="% de pagos completados"
          subtitulo={`${deudasPagadas} / ${totalDeudas} pagos`}
          subtitulo2={`${formatMoney(montoPagado)} / ${formatMoney(
            montoTotal,
          )}`}
          gradienteId="gradPagos"
          color1="#0d3b66"
          color2="#2a9d8f"
        /> */}
        <Metrica
          valor={Math.round(porcentajeInvitadoConPago)}
          titulo="Graduados pagados (%)"
          subtitulo={`${invitadoConPago} / ${invitadosFirmados} graduados`}
          gradienteId="gradPagos"
          color1="#0d3b66"
          color2="#2a9d8f"
        />

        <Metrica
          valor={Math.round(porcentajeAsientos)}
          titulo="Asientos asignados"
          subtitulo={`${asientosAsignadosStatic} / ${capacidadMaxima} asientos`}
          gradienteId="gradAsientos"
          color1="#0f4c75"
          color2="#00b7c2"
        />

        <LineMetric 
          titulo="Boletos emitidos"
          valor={boletosEmitidos}
          minimo={dashboardStats?.evento?.cantidad_minima_asistentes || 0}
          maximo={capacidadMaxima}
        />

        <BarMetric 
          titulo="Graduados"
          total={invitadosRegistrados}
          firmados={invitadosFirmados}
          sinFirmar={invitadosSinFirmar}
        />

        {/* 
        <Metrica
          valor={Math.round(porcentajeBoletos)}
          titulo="Boletos emitidos"
          subtitulo={`${boletosEmitidos} / ${capacidadMaxima} graduados`}
          gradienteId="gradBoletos"
          color1="#2a9d8f"
          color2="#0d3b66"
        />

        <Metrica
          valor={Math.round(porcentajeInvitadosSinFirmar)}
          titulo="Graduados registrados"
          subtitulo={`${invitadosSinFirmar} / ${invitadosRegistrados} graduados`}
          gradienteId="gradBoletos"
          color1="#2a9d8f"
          color2="#0d3b66"
        />

        <Metrica
          valor={Math.round(porcentajeInvitadosFirmados)}
          titulo="Graduados con contrato firmado"
          subtitulo={`${invitadosFirmados} / ${invitadosRegistrados} graduados`}
          gradienteId="gradBoletos"
          color1="#2a9d8f"
          color2="#0d3b66"
        /> 
        */}
      </>
    );
  }

  return (
    <div>
      {showCuestionario ? (
        <CrearCuestionarioPages onClose={() => setShowCuestionario(false)} />
      ) : (
        <div className="dashboard-container">
          {/* <div className="flex justify-between items-center mb-4"> */}
          <h1 className="dashboard-titulo">Resumen general del evento</h1>
          {/* Información de última actualización */}
          {(ultimaActualizacion || signalRUltimaActualizacion) && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📊 Dashboard actualizado automáticamente:{" "}
                {new Date(
                  signalRUltimaActualizacion || ultimaActualizacion,
                ).toLocaleString()}
              </p>
            </div>
          )}

          {/* Métricas + calendario */}
          <div className="dashboard-panel ">
            <div className="dashboard-panel-left bg-white dark:bg-[#1e1e1e] p-5 rounded-3xl">
              <h2 className="dashboard-subtitle font-semibold text-base">
                Métricas clave
              </h2>
              {isLoadingStats ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246370] dark:border-[#72b7a4]"></div>
                </div>
              ) : (
                <div className="dashboard-metricas">
                  {/* Métricas del evento actual */}
                  <EventMetrics />
                </div>
              )}
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

                  {/* Leyenda del calendario */}
                  <div className="flex gap-3 mb-2 text-xs justify-center flex-wrap">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-[#22c55e]"></div>
                      <span className="text-gray-600 dark:text-gray-300">
                        Evento
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-[#fbbf24]"></div>
                      <span className="text-gray-600 dark:text-gray-300">
                        Fechas de pago
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-[#808080]"></div>
                      <span className="text-gray-600 dark:text-gray-300">
                        Hoy
                      </span>
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
                        <div
                          key={"empty-" + i}
                          className="dashboard-vacio"
                        ></div>
                      ))}
                    {Array.from({ length: diasEnMes }, (_, i) => {
                      const dia = i + 1;
                      const esHoy =
                        dia === hoy.getDate() &&
                        mes === hoy.getMonth() &&
                        anio === hoy.getFullYear();

                      // Función auxiliar para comparar fechas en formato YYYY-MM-DD sin conversión de zona horaria
                      const esMismoDia = (fechaCalendario, fechaString) => {
                        if (!fechaString) return false;

                        // Si es un string en formato YYYY-MM-DD, comparar directamente sin crear Date
                        if (
                          typeof fechaString === "string" &&
                          fechaString.match(/^\d{4}-\d{2}-\d{2}/)
                        ) {
                          const [year, month, day] = fechaString
                            .split("T")[0]
                            .split("-")
                            .map(Number);
                          return (
                            fechaCalendario.getFullYear() === year &&
                            fechaCalendario.getMonth() === month - 1 && // mes es 0-indexed
                            fechaCalendario.getDate() === day
                          );
                        }

                        // Si es un Date object o string con hora, usar conversión normal
                        const d = new Date(fechaString);
                        return (
                          fechaCalendario.getDate() === d.getDate() &&
                          fechaCalendario.getMonth() === d.getMonth() &&
                          fechaCalendario.getFullYear() === d.getFullYear()
                        );
                      };

                      // Crear fecha actual del día del loop
                      const fechaActual = new Date(anio, mes, dia);

                      // Verificar si es la fecha del evento (verde)
                      const esFechaEvento =
                        eventoActual?.fecha_evento &&
                        esMismoDia(fechaActual, eventoActual.fecha_evento);

                      // Verificar si es una fecha de pago (amarillo)
                      const esFechaPago = eventoActual?.fechas?.some((fecha) =>
                        esMismoDia(fechaActual, fecha),
                      );

                      // Determinar la clase CSS
                      let claseEspecial = "";
                      if (esFechaEvento) {
                        claseEspecial = "fecha-evento"; // Verde
                      } else if (esFechaPago) {
                        claseEspecial = "fecha-pago"; // Amarillo
                      }

                      return (
                        <div
                          key={dia}
                          className={`dashboard-dia ${
                            esHoy ? "hoy text-center" : ""
                          } ${claseEspecial}`}
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
                      <img
                        src={Pago}
                        alt="Pago Pendiente"
                        className="w-5 h-5"
                      />
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
      )}
    </div>
  );
}
