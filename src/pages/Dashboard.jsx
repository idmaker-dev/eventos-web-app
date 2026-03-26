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
    <div className="dashboard-metrica">
      {/* 1. TOP: Título */}
      <div className="metric-header">
        <p className="metric-title">{titulo}</p>
      </div>
      
      {/* 2. MIDDLE: Gráfica Centrada */}
      <div className="metric-chart">
        <div className="metric-circle">
          <div className="circle-wrapper scale-110">
            <CircularProgressbar
              value={valor}
              strokeWidth={10}
              styles={buildStyles({
                pathColor: `url(#${gradienteId})`,
                trailColor: "rgba(36, 99, 112, 0.08)",
                strokeLinecap: "round",
              })}
            />
            <div className="circle-text">
              <div className="circle-value text-3xl font-bold text-[#246370] dark:text-[#72b7a4]">
                <span className="metric-highlight">{valor}</span><span className="metric-highlight">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM: Textos Informativos */}
      <div className="metric-footer border-t border-gray-100 dark:border-gray-800">
        <div className="metric-subtext text-right">
          {subtitulo}
        </div>
        {subtitulo2 && (
          <div className="metric-subtext text-right">
            {subtitulo2}
          </div>
        )}
      </div>

      {/* Definición de Gradiente SVG - Invisible pero necesario */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id={gradienteId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
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
      <div className="dashboard-metrica">
        {/* 1. TOP: Título */}
        <div className="metric-header">
          <p className="metric-title">{titulo}</p>
        </div>
        
        {/* 2. MIDDLE: Gráfica Centrada */}
        <div className="metric-chart">
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

        {/* 3. BOTTOM: Filler vacío para alinear todo horizontalmente visualmente */}
        <div className="metric-footer"></div>
      </div>
    );
  };

  const BarMetric = ({ titulo, total, firmados, sinFirmar }) => {
    const porcentajeFirmados = total > 0 ? Math.round((firmados / total) * 100) : 0;
    const porcentajeSinFirmar = total > 0 ? Math.round((sinFirmar / total) * 100) : 0;

    return (
      <div className="dashboard-metrica">
        {/* 1. TOP: Título */}
        <div className="metric-header">
          <p className="metric-title">{titulo}</p>
        </div>
        
        {/* 2. MIDDLE: Gráfica Centrada */}
        <div className="metric-chart w-full">
          <div className="bar-metric-wrapper w-full">
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
          </div>
        </div>

        {/* 3. BOTTOM: Textos Informativos */}
        <div className="metric-footer bar-footer">
          <div className="flex justify-center gap-6 w-full mb-1">
            <span className="legend-item"><i className="dot signed"></i> Firmados</span>
            <span className="legend-item"><i className="dot unsigned"></i> Sin firmar</span>
          </div>
          <span className="total-label text-center block w-full mt-1">Total registrados: {total}</span>
        </div>
      </div>
    );
  };

  function EventMetrics() {
    // Obtener capacidad máxima del evento
    const capacidadMaxima = dashboardStats?.evento?.capacidad_maxima || 0;

    // Datos de boletos desde el API
    const boletosEmitidos = dashboardStats?.boletos?.boletos_emitidos || 0;
    
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

    const porcentajeInvitadoConPago = invitadosFirmados > 0 ? Math.round((invitadoConPago / invitadosFirmados) * 100) : 0;

    // Datos de graficas_nuevas
    const graficasNuevas = dashboardStats?.pagos?.graficas_nuevas || {};
    
    // Gráfica 1: Pagos Completos
    const cantidadPagosCompletos = graficasNuevas.cantida_pagos_completos || 0;
    const boletosPagosCompletos = graficasNuevas.boletos_pagos_completos || 0;
    const boletosEmitidosTotal = dashboardStats?.boletos?.boletos_emitidos || 0;
    const porcentajeBoletosPagosCompletos = boletosEmitidosTotal > 0 ? Math.round((boletosPagosCompletos / boletosEmitidosTotal) * 100) : 0;
    const recaudacionTotalEstimada = graficasNuevas.deuda_completa_evento || 0;
    const porcentajeRecaudacionCompleta = recaudacionTotalEstimada > 0 ? ((cantidadPagosCompletos / recaudacionTotalEstimada) * 100).toFixed(2) : 0;

    // Gráfica 2: Abonos
    const pagoAbonado = graficasNuevas.pago_abonado || 0;
    const porcentajePagoAbonadoTotal = graficasNuevas.porcentaje_pago_abonado || 0;
    const boletosPagosAbonados = graficasNuevas.boletos_pagos_abonados || 0;
    const porcentajeBoletosAbonados = boletosEmitidosTotal > 0 ? Math.round((boletosPagosAbonados / boletosEmitidosTotal) * 100) : 0;
    const graduadosSinAbonos = graficasNuevas.graduados_sin_abonos || 0;

    // Formatear dinero y números
    const formatNumber = (num) => new Intl.NumberFormat("es-MX").format(num);
    const formatMoney = (amount) => {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return (
      <>
        <Metrica
          valor={Math.round(porcentajeInvitadoConPago)}
          titulo="Graduados sin adeudos"
          subtitulo={
            <>
              <span className="metric-highlight">{formatNumber(invitadoConPago)}</span> de <span className="metric-highlight">{formatNumber(invitadosFirmados)}</span> graduados
            </>
          }
          subtitulo2={
            <div className="flex flex-col gap-1 items-center">
              <span>
                <span className="metric-highlight">{formatMoney(cantidadPagosCompletos)}</span> (<span className="metric-highlight">{porcentajeRecaudacionCompleta}<span className="metric-highlight">%</span></span>)
                {/* <span className="metric-highlight">{formatMoney(cantidadPagosCompletos)}</span> de <span className="metric-highlight">{formatMoney(recaudacionTotalEstimada)}</span> (<span className="metric-highlight">{porcentajeRecaudacionCompleta}<span className="metric-highlight">%</span></span>) */}
              </span>
              <span>
                <span className="metric-highlight">{formatNumber(boletosPagosCompletos)}</span> boletos (<span className="metric-highlight">{porcentajeBoletosPagosCompletos}<span className="metric-highlight">%</span></span>)
                {/* <span className="metric-highlight">{formatNumber(boletosPagosCompletos)}</span> de <span className="metric-highlight">{formatNumber(boletosEmitidosTotal)}</span> boletos (<span className="metric-highlight">{porcentajeBoletosPagosCompletos}<span className="metric-highlight">%</span></span>) */}
              </span>
            </div>
          }
          gradienteId="gradPagos"
          color1="#246370"
          color2="#72B7A4"
        />

        <Metrica
          valor={Math.round(porcentajePagoAbonadoTotal)}
          titulo="Abonos realizados"
          subtitulo={
            <>
              <span className="metric-highlight">{formatNumber(graduadosSinAbonos)}</span> graduados sin abonos
            </>
          }
          subtitulo2={
            <div className="flex flex-col gap-1 items-center">
              <span>
                <span className="metric-highlight">{formatMoney(pagoAbonado)}</span> (<span className="metric-highlight">{Math.round(porcentajePagoAbonadoTotal)}<span className="metric-highlight">%</span></span>)
              </span>
              <span>
                <span className="metric-highlight">{formatNumber(Math.round(boletosPagosAbonados))}</span> boletos (<span className="metric-highlight">{porcentajeBoletosAbonados}<span className="metric-highlight">%</span></span>)
              </span>
            </div>
          }
          gradienteId="gradAbonos"
          color1="#246370"
          color2="#72B7A4"
        />

        <Metrica
          valor={Math.round(porcentajeAsientos)}
          titulo="Asientos asignados"
          subtitulo={
            <>
              <span className="metric-highlight">{formatNumber(asientosAsignadosStatic)}</span> de <span className="metric-highlight">{formatNumber(capacidadMaxima)}</span> asientos
            </>
          }
          gradienteId="gradAsientos"
          color1="#246370"
          color2="#72B7A4"
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
          <div className="dashboard-card">
            <div className="mb-5 flex justify-between items-center">
              <div>
                <h2 className="dashboard-subtitle font-semibold text-base">Acciones requeridas</h2>
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
