import React, { useEffect, useState } from "react";
import InlineSpinner from "../components/ui/InlineSpinner";
import {
  BarChart2,
  Calendar,
  Users,
  TrendingUp,
  LogOut,
  RefreshCw,
  Download,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useAuth } from "../hooks/useAuth";
import DashboardGeneralService from "../services/DashboardGeneralService";
import { useSelectedEvent } from "../contexts/SelectedEventContext";

export default function DashboardGeneral() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const { eventos, eventoActual } = useSelectedEvent();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filtrarPorEvento, setFiltrarPorEvento] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-01-01`;
  });
  const [fechaFin, setFechaFin] = useState(() => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  });
  const [localEventoId, setLocalEventoId] = useState("");
  const [collapsed, setCollapsed] = useState({
    global: false,
    finanzas: false,
    visualizacion: false,
    tablas: false,
  });

  const toggleCollapse = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return (
        d.toLocaleDateString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " " +
        d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return iso;
    }
  };

  const loadData = async ({ refreshing = false } = {}) => {
    if (refreshing) setIsRefreshing(true);
    else setLoading(true);
    try {
      const params = {
        fechaInicio,
        fechaFin,
        eventoId: filtrarPorEvento ? localEventoId : null
      };

      if (filtrarPorEvento && !localEventoId) {
        throw new Error("Seleccione un evento para filtrar.");
      }

      const res = await DashboardGeneralService.getResumen(params);
      setData(res);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e.message || "No se pudo cargar el resumen");
    } finally {
      if (refreshing) setIsRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    // Debounce ligero para que si haces scroll muy rápido en la fecha, no se trabe la petición.
    const timerId = setTimeout(async () => {
      if (!mounted) return;
      if (filtrarPorEvento && !localEventoId) {
        // Clear data or show error if no event selected
        setError("Seleccione un evento para ver su información.");
        setLoading(false);
        setData(null);
        return;
      }
      // Usar refreshing si ya tenemos datos previos evitará que el input type="date" pierda el foco
      await loadData({ refreshing: data !== null });
    }, 300);
    
    return () => {
      mounted = false;
      clearTimeout(timerId);
    };
  }, [localEventoId, filtrarPorEvento, fechaInicio, fechaFin]);

  // Sincronizar localEventoId con el eventoActual del contexto solo si aún no hay uno seleccionado
  useEffect(() => {
    if (eventoActual?.id && !localEventoId && filtrarPorEvento) {
      setLocalEventoId(eventoActual.id);
    }
  }, [eventoActual, filtrarPorEvento, localEventoId]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    await loadData({ refreshing: true });
  };

  const handleResetFilters = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    
    // Restablecer al 1 de enero y fecha actual
    setFechaInicio(`${d.getFullYear()}-01-01`);
    setFechaFin(`${d.getFullYear()}-${month}-${day}`);
    
    // Desmarcar filtro por evento
    setFiltrarPorEvento(false);
    setLocalEventoId("");
  };

  // const handleLogout = async () => {
  //   if (isLoggingOut) return;
  //   setIsLoggingOut(true);
  //   try {
  //     await logout();
  //   } catch (e) {
  //     setIsLoggingOut(false);
  //   }
  // };

  const handleExportToExcel = () => {
    if (!data) return;

    try {
      import("exceljs")
        .then(async (ExcelJS) => {
          const workbook = new ExcelJS.Workbook();
          
          const fechaActualizacion = lastUpdated
            ? formatDate(lastUpdated.toISOString())
            : "No disponible";

          // --- CONFIGURACIÓN DE ESTILOS ---
          const headerFill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1A4A54' } // Teal oscuro de la web
          };
          const headerFont = {
            name: 'Arial',
            family: 4,
            size: 11,
            bold: true,
            color: { argb: 'FFFFFFFF' }
          };
          const centeredAlignment = { horizontal: 'center', vertical: 'middle' };

          // 1. HOJA: RESUMEN GLOBAL
          const shResumen = workbook.addWorksheet("Resumen Global");
          shResumen.getColumn(1).width = 30;
          shResumen.getColumn(2).width = 20;
          shResumen.getColumn(3).width = 40;

          shResumen.addRow(["RESUMEN GENERAL - " + (data?.lugarNombre || "Dashboard")]).font = { bold: true, size: 14 };
          shResumen.addRow(["Última actualización: " + fechaActualizacion]).font = { italic: true };
          shResumen.addRow([]);

          // Headers manuales para el resumen
          const resHeaderRow = shResumen.addRow(["Métrica", "Valor", "Monto/Referencia"]);
          resHeaderRow.eachCell(cell => {
            cell.fill = headerFill;
            cell.font = headerFont;
            cell.alignment = centeredAlignment;
          });

          const totalRow = (label, val, ref) => {
            const row = shResumen.addRow([label, val, ref]);
            row.getCell(1).font = { bold: true };
            return row;
          };

          totalRow("Eventos totales", data.totales.eventos, "");
          totalRow("Total de Alumnos", data.totales.asistentesAlumnos, "");
          totalRow("Ocupación promedio", data.totales.ocupacionPromedio + "%", "");
          shResumen.addRow([]);
          
          const finHeader = shResumen.addRow(["FINANZAS Y BOLETOS", "", ""]);
          finHeader.getCell(1).font = { bold: true, color: { argb: 'FF1A4A54' } };
          
          totalRow("Boletos apartados", data.totales.boletosApartados, data.totales.boletosApartadosDinero);
          totalRow("Boletos pagados", data.totales.boletosPagados, data.totales.boletosPagadosDinero);
          totalRow("Abono realizado", data.totales.abonoRealizado, data.totales.porcentajeAbonado + "%");
          totalRow("Boletos por pagar", data.totales.boletosPorPagar, data.totales.boletosPorPagarDinero);
          totalRow("Tasa de pago", data.totales.porcentajePagados + "%", "");

          // Formatear celdas de dinero
          [8, 9, 10, 11].forEach(index => {
            shResumen.getRow(index).getCell(3).numFmt = '"$"#,##0.00';
          });

          // 2. HOJA: PRÓXIMOS EVENTOS
          if (data.proximosEventos?.length > 0) {
            const shProximos = workbook.addWorksheet("Próximos Eventos");
            const columns = [
              { header: "Fecha", key: "fecha", width: 15 },
              { header: "Nombre del Evento", key: "nombre", width: 45 },
              { header: "Tipo", key: "tipo", width: 15 },
              { header: "Alumnos", key: "alumnos", width: 12 },
              { header: "Apartados", key: "apartados", width: 12 },
              { header: "Monto Apartado", key: "apartadoDinero", width: 18 },
              { header: "Pagados", key: "pagados", width: 12 },
              { header: "Monto Pagado", key: "pagadoDinero", width: 18 },
              { header: "Abono adicional", key: "abono", width: 18 },
              { header: "Por Pagar", key: "restante", width: 12 },
              { header: "Por Pagar ($)", key: "restanteDinero", width: 18 },
              { header: "% Pago", key: "pPagado", width: 12 },
              { header: "% Abono", key: "pAbonado", width: 12 }
            ];
            shProximos.columns = columns;

            // Estilo al Header
            shProximos.getRow(1).eachCell(cell => {
              cell.fill = headerFill;
              cell.font = headerFont;
              cell.alignment = centeredAlignment;
            });

            data.proximosEventos.forEach(ev => {
              const row = shProximos.addRow({
                fecha: formatDate(ev.evento?.fecha_evento || ev.fecha).split(" ").slice(0, 3).join(" "),
                nombre: ev.evento?.nombre_evento || ev.nombre,
                tipo: ev.evento?.tipo || ev.tipo,
                alumnos: ev.asistentesAlumnos || 0,
                apartados: ev.boletosApartados,
                apartadoDinero: ev.boletosApartadosDinero,
                pagados: ev.boletosPagados,
                pagadoDinero: ev.boletosPagadosDinero,
                abono: ev.abonoRealizado,
                restante: ev.boletosPorPagar,
                restanteDinero: ev.boletosPorPagarDinero,
                pPagado: ev.porcentajePagados + "%",
                pAbonado: ev.porcentajeAbonado + "%"
              });
              
              // Formatos numéricos
              ["F", "H", "I", "K"].forEach(col => {
                row.getCell(col).numFmt = '"$"#,##0.00';
              });
            });
          }

          // 3. HOJA: EVENTOS RECIENTES
          if (data.eventosRecientes?.length > 0) {
            const shRecientes = workbook.addWorksheet("Eventos Recientes");
            const columns = [
              { header: "Fecha", key: "fecha", width: 15 },
              { header: "Nombre del Evento", key: "nombre", width: 45 },
              { header: "Tipo", key: "tipo", width: 15 },
              { header: "Alumnos", key: "alumnos", width: 12 },
              { header: "Con Boletos", key: "tBoletos", width: 15 },
              { header: "Ocupación %", key: "ocupacion", width: 15 },
              { header: "Apartados", key: "apartados", width: 12 },
              { header: "Monto Apartado", key: "apartadoDinero", width: 18 },
              { header: "Pagados", key: "pagados", width: 12 },
              { header: "Monto Pagado", key: "pagadoDinero", width: 18 },
              { header: "Abono adicional", key: "abono", width: 18 },
              { header: "Por Pagar", key: "restante", width: 12 },
              { header: "Por Pagar ($)", key: "restanteDinero", width: 18 },
              { header: "% Pago", key: "pPagado", width: 12 },
              { header: "% Abono", key: "pAbonado", width: 12 }
            ];
            shRecientes.columns = columns;

            shRecientes.getRow(1).eachCell(cell => {
              cell.fill = headerFill;
              cell.font = headerFont;
              cell.alignment = centeredAlignment;
            });

            data.eventosRecientes.forEach(ev => {
              const row = shRecientes.addRow({
                fecha: formatDate(ev.evento?.fecha_evento || ev.fecha).split(" ").slice(0, 3).join(" "),
                nombre: ev.evento?.nombre_evento || ev.nombre,
                tipo: ev.evento?.tipo || ev.tipo,
                alumnos: ev.asistentesAlumnos || 0,
                tBoletos: ev.asistentes,
                ocupacion: ev.ocupacion + "%",
                apartados: ev.boletosApartados,
                apartadoDinero: ev.boletosApartadosDinero,
                pagados: ev.boletosPagados,
                pagadoDinero: ev.boletosPagadosDinero,
                abono: ev.abonoRealizado,
                restante: ev.boletosPorPagar,
                restanteDinero: ev.boletosPorPagarDinero,
                pPagado: ev.porcentajePagados + "%",
                pAbonado: ev.porcentajeAbonado + "%"
              });
              
              ["H", "J", "K", "M"].forEach(col => {
                row.getCell(col).numFmt = '"$"#,##0.00';
              });
            });
          }

          // Descarga del archivo
          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          const fecha = new Date().toISOString().split("T")[0];
          anchor.download = `Reporte_General_${fecha}.xlsx`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        })
        .catch((err) => {
          console.error("Error al cargar exceljs:", err);
          alert("Error al exportar. Por favor, intenta de nuevo.");
        });
    } catch (error) {
      console.error("Error en exportación:", error);
      alert("Error al intentar exportar a Excel");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#121212] flex flex-col items-center justify-center p-8 text-[#246370] dark:text-[#72b7a4]">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#246370] dark:border-[#72b7a4]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 bg-[#246370] dark:bg-[#72b7a4] rounded-full animate-ping opacity-75"></div>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium animate-pulse tracking-wide text-gray-700 dark:text-gray-300">
          Cargando tu dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#121212]">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl shadow-lg font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-3">
          <BarChart2 className="w-6 h-6" />
          {error}
        </div>
      </div>
    );
  }

  if (!data || !data.totales) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#121212] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1e1e1e] p-8 rounded-2xl shadow border border-gray-100 dark:border-gray-800 text-center space-y-3">
          <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="text-lg font-medium">No hay datos disponibles.</p>
          <p className="text-sm">Intenta recargar la página más tarde.</p>
        </div>
      </div>
    );
  }

  const { totales, proximosEventos, eventosRecientes } = data;
  const selectedEventName = filtrarPorEvento 
    ? eventos?.find(ev => (ev.id || ev._id) === localEventoId)?.nombre_evento || "Seleccionado"
    : null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#121212]">
      {/* HEADER ELEGANTE */}
      <div className="bg-gradient-to-r from-[#1a4a54] to-[#246370] shadow-md border-b border-[#246370]/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <header className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-5 sm:px-10 max-w-[1700px] mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white drop-shadow-sm flex items-center gap-3">
                {filtrarPorEvento ? "Resumen de Evento" : "Dashboard General"}
                
                {/* {data && !filtrarPorEvento && (
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-sm border border-white/20">
                    {data.lugarNombre || "Tu Lugar"}
                  </span>
                )} */}
                {data && filtrarPorEvento && (
                  <span className="text-sm bg-indigo-500/80 px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-sm border border-indigo-400/30">
                    {selectedEventName}
                  </span>
                )}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-[#a2ced6]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isRefreshing ? "bg-amber-400" : "bg-green-400"} animate-pulse`}></span>
                  <p>
                    {isRefreshing ? (
                      <span className="text-amber-100 font-medium">Actualizando tableros...</span>
                    ) : (
                      <>
                        Última actualización:{" "}
                        {lastUpdated ? formatDate(lastUpdated.toISOString()) : "—"}
                      </>
                    )}
                  </p>
                </div>
                

              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end items-center gap-4">
            {/* GRUPO DE FILTROS */}
            <div className="flex flex-wrap items-center gap-3 bg-black/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-inner">
              <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-2 transition-all border border-white/10 group">
                <label htmlFor="toggle-evento" className="cursor-pointer select-none text-white font-medium flex items-center gap-2.5 text-xs sm:text-sm">
                  <input 
                    type="checkbox" 
                    id="toggle-evento"
                    checked={filtrarPorEvento}
                    onChange={(e) => setFiltrarPorEvento(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-white/10 border-white/20 cursor-pointer transition-all"
                  />
                  <span className="group-hover:text-indigo-300 transition-colors">Filtrar por evento</span>
                </label>
              </div>

              {filtrarPorEvento && (
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10 animate-in zoom-in-95 duration-200">
                  <select
                    value={localEventoId}
                    onChange={(e) => setLocalEventoId(e.target.value)}
                    className="bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[220px] appearance-none"
                  >
                    <option value="" className="text-gray-800">Seleccionar evento...</option>
                    {eventos && eventos.map((ev) => (
                      <option key={ev.id || ev._id} value={ev.id || ev._id} className="text-gray-800">
                        {ev.nombre_evento || ev.instituto || "Evento sin nombre"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-white/40" />
                </div>
              )}

              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                <Calendar size={14} className="text-[#a2ced6]" />
                <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
                  />
                  <span className="text-[#a2ced6]/50 text-[10px] uppercase font-bold">a</span>
                  <input 
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
                  />
                </div>
              </div>
              
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#a2ced6]/80 hover:text-white px-2 py-1.5 transition-colors font-medium border border-transparent hover:border-white/10 rounded-md bg-white/0 hover:bg-white/5 active:scale-95"
                title="Restablecer fechas y evento"
              >
                Limpiar
              </button>
            </div>

            {/* GRUPO DE ACCIONES */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportToExcel}
                disabled={!data || loading}
                title="Exportar a Excel"
                className="h-11 px-5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 backdrop-blur-sm rounded-xl flex items-center gap-2.5 shadow-sm border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm active:scale-95"
              >
                <Download size={18} />
                <span className="hidden md:inline">Exportar</span>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                title="Actualizar datos"
                className="w-11 h-11 bg-white hover:bg-gray-50 text-[#246370] rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isRefreshing ? (
                  <InlineSpinner size="xs" />
                ) : (
                  <RefreshCw size={20} />
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* SPINNER FLOTANTE VISIBLE */}
      {isRefreshing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-gray-100 dark:border-gray-800 animate-in zoom-in-90 fade-in duration-200">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#246370] dark:border-[#72b7a4]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 bg-[#246370] dark:bg-[#72b7a4] rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            <span className="text-gray-700 dark:text-gray-200 font-bold text-sm tracking-wide">Actualizando datos...</span>
          </div>
        </div>
      )}

      <div className={`p-4 sm:p-6 lg:p-10 max-w-[1700px] w-full mx-auto space-y-12 transition-all duration-300 ${isRefreshing ? 'opacity-40 pointer-events-none blur-[2px] scale-[0.99]' : 'opacity-100 scale-100'}`}>
        
        {/* SECTOR 1: KPIs GENERALES */}
        <section className="space-y-4">
          <div 
            onClick={() => toggleCollapse('global')}
            className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 cursor-pointer group hover:border-[#246370] transition-colors"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Resumen Global
            </h2>
            <div className="text-gray-400 group-hover:text-[#246370]">
              {collapsed.global ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>
          </div>
          
          {!collapsed.global && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-fadeIn">
              <KpiCard
                icon={<Calendar />}
                label="Eventos totales"
                value={totales.eventos}
              />
              <KpiCard
                icon={<Users />}
                label="Total de Alumnos"
                value={totales.asistentesAlumnos}
              />
              <KpiCard
                icon={<TrendingUp />}
                label="Ocupación promedio"
                value={totales.ocupacionPromedio + "%"}
              />
            </div>
          )}
        </section>

        {/* SECTOR 2: KPIs FINANCIEROS Y BOLETOS */}
        <section className="space-y-4">
          <div 
            onClick={() => toggleCollapse('finanzas')}
            className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 cursor-pointer group hover:border-indigo-500 transition-colors"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Finanzas y Boletos
            </h2>
            <div className="text-gray-400 group-hover:text-indigo-500">
              {collapsed.finanzas ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>
          </div>
          
          {!collapsed.finanzas && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6 animate-fadeIn">
              <KpiCard
                icon={<Users />}
                label="Boletos apartados"
                value={totales.boletosApartados.toLocaleString()}
                subtitle={"$" + totales.boletosApartadosDinero.toLocaleString()}
              />
              <KpiCard
                icon={<TrendingUp />}
                label="Boletos pagados"
                value={totales.boletosPagados.toLocaleString()}
                subtitle={
                  "$" +
                  totales.boletosPagadosDinero.toLocaleString() +
                  " (" +
                  totales.porcentajePagados +
                  "%)"
                }
                highlight="success"
              />
              <KpiCard
                icon={<BarChart2 />}
                label="Abono realizado"
                value={"$" + totales.abonoRealizado.toLocaleString()}
                subtitle={totales.porcentajeAbonado + "% del total abonado"}
                highlight="info"
              />
              <KpiCard
                icon={<BarChart2 />}
                label="Boletos por pagar"
                value={totales.boletosPorPagar.toLocaleString()}
                subtitle={
                  "$" +
                  totales.boletosPorPagarDinero.toLocaleString() +
                  " (" +
                  (100 - totales.porcentajePagados) +
                  "%)"
                }
                highlight="warning"
              />
              <KpiCard
                icon={<TrendingUp />}
                label="Tasa de pago"
                value={totales.porcentajePagados + "%"}
                subtitle={
                  totales.boletosPagados +
                  " de " +
                  totales.boletosApartados +
                  " pagados"
                }
              />
            </div>
          )}
        </section>

        {/* SECTOR 3: GRÁFICOS VISUALES */}
        <section className="space-y-4">
          <div 
            onClick={() => toggleCollapse('visualizacion')}
            className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 cursor-pointer group hover:border-emerald-500 transition-colors"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Visualización de Datos
            </h2>
            <div className="text-gray-400 group-hover:text-emerald-500">
              {collapsed.visualizacion ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>
          </div>
          
          {!collapsed.visualizacion && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 animate-fadeIn">
              
              {/* Gráficas Circulares (Del Evento) */}
              <div className="lg:col-span-4 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-6 shadow-sm relative overflow-hidden text-[#246370] dark:text-[#72b7a4]">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <BarChart2 className="w-24 h-24" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide text-sm text-[#246370] dark:text-[#72b7a4]">
                  {filtrarPorEvento ? "Cumplimiento de Cobranza del Evento" : "Cumplimiento de Cobranza Global"}
                </h3>
                
                <div className="flex-1 flex items-center justify-center gap-8">
                  <div className="w-32 sm:w-40 xl:w-48 flex flex-col items-center gap-3">
                    <CircularProgressbar
                      value={totales.porcentajePagados}
                      text={`${totales.porcentajePagados}%`}
                      styles={buildStyles({
                        pathColor: `url(#gradientSuccess)`,
                        textColor: "currentColor",
                        trailColor: "rgba(167, 243, 208, 0.2)",
                        strokeLinecap: "round",
                      })}
                      className="drop-shadow-sm text-gray-800 dark:text-gray-100 font-bold"
                    />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full text-center">
                      Boletos Pagados
                    </span>
                  </div>
                  
                  <div className="w-32 sm:w-40 xl:w-48 flex flex-col items-center gap-3">
                    <CircularProgressbar
                      value={totales.porcentajeAbonado}
                      text={`${totales.porcentajeAbonado}%`}
                      styles={buildStyles({
                        pathColor: `url(#gradientInfo)`,
                        textColor: "currentColor",
                        trailColor: "rgba(191, 219, 254, 0.2)",
                        strokeLinecap: "round",
                      })}
                      className="drop-shadow-sm text-gray-800 dark:text-gray-100 font-bold"
                    />
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full text-center">
                      Abonos Adicionales
                    </span>
                  </div>
                </div>
              </div>

              {/* Distribución de Boletos (Del Evento) */}
              <div className="lg:col-span-4 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-6 shadow-sm">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide text-sm text-[#246370] dark:text-[#72b7a4]">
                  Distribución de Boletos
                </h3>
                <div className="flex-1 flex flex-col justify-center gap-6">
                  
                  {/* Total Apartados */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Total Apartados</span>
                      <span className="text-gray-800 dark:text-gray-200 font-bold">{totales.boletosApartados.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden flex">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  {/* Pagados */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Pagados Completamente</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {totales.boletosPagados.toLocaleString()} 
                        <span className="text-xs text-gray-400 ml-1">({totales.porcentajePagados}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${totales.porcentajePagados || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Por pagar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Restante por Pagar</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {totales.boletosPorPagar.toLocaleString()}
                        <span className="text-xs text-gray-400 ml-1">({totales.boletosApartados ? Math.round((totales.boletosPorPagar/totales.boletosApartados)*100) : 0}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                      {totales.boletosApartados > 0 && (
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.round((totales.boletosPorPagar/totales.boletosApartados)*100)}%` }}
                        ></div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Análisis de Ingresos */}
              <div className="lg:col-span-4 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-6 shadow-sm">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide text-sm text-[#246370] dark:text-[#72b7a4]">
                  {filtrarPorEvento ? "Análisis de Ingresos del Evento" : "Análisis de Ingresos Estimados"}
                </h3>
                <div className="flex-1 flex flex-col justify-center gap-6">
                  
                  {/* Ingreso Total Estimado */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Monto Prometido Total</span>
                      <span className="text-gray-800 dark:text-gray-200 font-bold">${totales.boletosApartadosDinero.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#246370]/20 dark:bg-[#72b7a4]/20 rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#246370] dark:bg-[#72b7a4] rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  {/* Ingreso Cobrado */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Monto Cobrado (Pagados)</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        ${totales.boletosPagadosDinero.toLocaleString()}
                        <span className="text-xs text-gray-400 ml-1">({totales.boletosApartadosDinero ? Math.round((totales.boletosPagadosDinero/totales.boletosApartadosDinero)*100) : 0}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                      {totales.boletosApartadosDinero > 0 && (
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.round((totales.boletosPagadosDinero/totales.boletosApartadosDinero)*100)}%` }}
                        ></div>
                      )}
                    </div>
                  </div>

                  {/* Ingreso Restante / Abonos */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Total en Abonos Extra</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        ${totales.abonoRealizado.toLocaleString()}
                        <span className="text-xs text-gray-400 ml-1">({totales.boletosApartadosDinero ? Math.round((totales.abonoRealizado/totales.boletosApartadosDinero)*100) : 0}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                      {totales.boletosApartadosDinero > 0 && (
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.round((totales.abonoRealizado/totales.boletosApartadosDinero)*100)}%` }}
                        ></div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
        </section>

        {/* SECCIÓN DE TABLAS (Próximos y Recientes) */}
        <section className="space-y-6">
          <div 
            onClick={() => toggleCollapse('tablas')}
            className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 cursor-pointer group hover:border-[#2a9d8f] transition-colors"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              Tablas de Eventos
            </h2>
            <div className="text-gray-400 group-hover:text-[#2a9d8f]">
              {collapsed.tablas ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>
          </div>

          {!collapsed.tablas && (
            <div className="space-y-10 animate-fadeIn">
              {/* Próximos eventos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Calendar size={18} className="text-[#246370]" />
                  Próximos eventos
                </h3>
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
                      <thead className="bg-[#1a4a54] dark:bg-[#23272e]">
                        <tr>
                          <Th>Fecha</Th>
                          <Th>Nombre</Th>
                          <Th>Tipo</Th>
                          <Th>Alumnos</Th>
                          <Th>Apartados</Th>
                          <Th>Pagados</Th>
                          <Th>Abonado</Th>
                          <Th>Por Pagar</Th>
                          <Th>% Pagado</Th>
                          <Th>% Abonado</Th>
                          <Th>Acciones</Th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-100 dark:divide-gray-800">
                        {proximosEventos.length === 0 && (
                          <tr>
                            <td colSpan={11} className="p-4 text-center text-gray-500">
                              No hay eventos próximos
                            </td>
                          </tr>
                        )}
                        {proximosEventos.map((ev) => (
                          <tr key={ev.evento?.id || ev.id} className="hover:bg-gray-50 dark:hover:bg-[#23272e] transition">
                            <Td className="text-xs">
                              {formatDate(ev.evento?.fecha_evento || ev.fecha).split(" ").slice(0, 3).join(" ")}
                            </Td>
                            <Td className="font-medium whitespace-normal min-w-[150px]">{ev.evento?.nombre_evento || ev.nombre}</Td>
                            <Td>{ev.evento?.tipo || ev.tipo}</Td>
                            <Td>{ev.asistentesAlumnos || "-"}</Td>
                            <Td>
                              <div>{ev.boletosApartados}</div>
                              <div className="text-xs text-gray-500">${ev.boletosApartadosDinero.toLocaleString()}</div>
                            </Td>
                            <Td>
                              <div className="text-green-600 dark:text-green-400 font-medium">{ev.boletosPagados}</div>
                              <div className="text-xs text-gray-500">${ev.boletosPagadosDinero.toLocaleString()}</div>
                            </Td>
                            <Td>
                              <div className="text-blue-600 dark:text-blue-400 font-medium">${ev.abonoRealizado.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">Abono adicional</div>
                            </Td>
                            <Td>
                              <div className="text-amber-600 dark:text-amber-400 font-medium">{ev.boletosPorPagar}</div>
                              <div className="text-xs text-gray-500">${ev.boletosPorPagarDinero.toLocaleString()}</div>
                            </Td>
                            <Td>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ev.porcentajePagados >= 50 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"}`}>
                                {ev.porcentajePagados}%
                              </span>
                            </Td>
                            <Td>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ev.porcentajeAbonado >= 20 ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                                {ev.porcentajeAbonado}%
                              </span>
                            </Td>
                            <Td>
                              <button onClick={() => handleVerDetalle(ev)} className="p-2 rounded-lg bg-[#246370] hover:bg-[#1d4f5a] dark:bg-[#2a9d8f] dark:hover:bg-[#238276] text-white transition-colors shadow-sm" title="Ver detalles del evento">
                                <Eye size={16} />
                              </button>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Eventos recientes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <RefreshCw size={18} className="text-indigo-500" />
                  Eventos recientes
                </h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-[#1a4a54] dark:bg-[#23272e]">
                      <tr>
                        <Th>Fecha</Th>
                        <Th>Nombre</Th>
                        <Th>Tipo</Th>
                        <Th>Alumnos</Th>
                        <Th>Con boletos</Th>
                        <Th>Ocupación</Th>
                        <Th>Apartados</Th>
                        <Th>Pagados</Th>
                        <Th>Abonado</Th>
                        <Th>Por Pagar</Th>
                        <Th>% Pagado</Th>
                        <Th>% Abonado</Th>
                        <Th>Acciones</Th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-100 dark:divide-gray-800">
                      {eventosRecientes.length === 0 && (
                        <tr>
                          <td colSpan={13} className="p-4 text-center text-gray-500">
                            No hay eventos registrados
                          </td>
                        </tr>
                      )}
                      {eventosRecientes.map((ev) => (
                        <tr key={ev.evento?.id || ev.id} className="hover:bg-gray-50 dark:hover:bg-[#23272e] transition">
                          <Td className="font-medium text-xs">
                             {/* Mostramos la fecha completa format: DD/MM/YYYY */}
                            {formatDate(ev.evento?.fecha_evento || ev.fecha).split(" ").slice(0, 3).join(" ")}
                          </Td>
                          <Td className="font-medium whitespace-normal min-w-[150px]">{ev.evento?.nombre_evento || ev.nombre}</Td>
                          <Td>{ev.evento?.tipo || ev.tipo}</Td>
                          <Td>{ev.asistentesAlumnos || "-"}</Td>
                          <Td>{ev.asistentes}</Td>
                          <Td>{ev.ocupacion}%</Td>
                          <Td>
                            <div>{ev.boletosApartados}</div>
                            <div className="text-xs text-gray-500">${ev.boletosApartadosDinero.toLocaleString()}</div>
                          </Td>
                          <Td>
                            <div className="text-green-600 dark:text-green-400 font-medium">{ev.boletosPagados}</div>
                            <div className="text-xs text-gray-500">${ev.boletosPagadosDinero.toLocaleString()}</div>
                          </Td>
                          <Td>
                            <div className="text-blue-600 dark:text-blue-400 font-medium">${ev.abonoRealizado.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Abono adicional</div>
                          </Td>
                          <Td>
                            <div className="text-amber-600 dark:text-amber-400 font-medium">{ev.boletosPorPagar}</div>
                            <div className="text-xs text-gray-500">${ev.boletosPorPagarDinero.toLocaleString()}</div>
                          </Td>
                          <Td>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ev.porcentajePagados >= 50 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"}`}>
                              {ev.porcentajePagados}%
                            </span>
                          </Td>
                          <Td>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ev.porcentajeAbonado >= 20 ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                              {ev.porcentajeAbonado}%
                            </span>
                          </Td>
                          <Td>
                            <button onClick={() => handleVerDetalle(ev)} className="p-2 rounded-lg bg-[#246370] hover:bg-[#1d4f5a] dark:bg-[#2a9d8f] dark:hover:bg-[#238276] text-white transition-colors shadow-sm" title="Ver detalles del evento">
                              <Eye size={16} />
                            </button>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Definición de gradientes SVG para gráficas */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradientSuccess" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="gradientInfo" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Componente KpiCard con diseño premium y glassmorphism en iconos
function KpiCard({ icon, label, value, subtitle, highlight }) {
  const highlightThemes = {
    success: {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "group-hover:border-emerald-200 dark:group-hover:border-emerald-800",
      gradient: "from-emerald-500/5 to-transparent",
    },
    warning: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "group-hover:border-amber-200 dark:group-hover:border-amber-800",
      gradient: "from-amber-500/5 to-transparent",
    },
    danger: {
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "group-hover:border-rose-200 dark:group-hover:border-rose-800",
      gradient: "from-rose-500/5 to-transparent",
    },
    info: {
      text: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "group-hover:border-indigo-200 dark:group-hover:border-indigo-800",
      gradient: "from-indigo-500/5 to-transparent",
    },
  };

  const defaultTheme = {
    text: "text-[#246370] dark:text-[#72b7a4]",
    bg: "bg-[#246370]/10 dark:bg-[#72b7a4]/10",
    border: "group-hover:border-[#246370]/30 dark:group-hover:border-[#72b7a4]/30",
    gradient: "from-[#246370]/5 to-transparent",
  };

  const theme = highlight ? highlightThemes[highlight] : defaultTheme;

  return (
    <div className={`bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group ${theme.border}`}>
      {/* Decorative gradient corner */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${theme.gradient} rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>
      
      <div className="flex items-center gap-3 relative z-10">
        <div className={`p-3 rounded-xl ${theme.bg}`}>
          {React.cloneElement(icon, { className: `w-6 h-6 ${theme.text}` })}
        </div>
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </span>
      </div>
      
      <div className="mt-1 relative z-10">
        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
          {value}
        </div>
        {subtitle && (
          <div className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1.5">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2 text-left text-xs font-semibold text-white dark:text-gray-400 uppercase tracking-wide">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td
      className={`px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-200 ${className}`}
    >
      {children}
    </td>
  );
}