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
} from "lucide-react";
import lugarDashboardService from "../services/lugarDashboardService";
import { useAuth } from "../hooks/useAuth";
import DetalleEvento from "../components/Modales/DetalleEvento";
// import Logo from "";

/**
 * Home para usuarios con rol 'lugar'
 * Muestra resumen de eventos realizados en ese lugar + estadísticas básicas
 */
export default function HomeLugar() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);

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

  const loadData = async (lugarId, { refreshing = false } = {}) => {
    if (refreshing) setIsRefreshing(true);
    else setLoading(true);
    try {
      const res = await lugarDashboardService.getResumen(lugarId);
      console.log("Resumen cargado:", res);
      setData(res);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError("No se pudo cargar el resumen");
    } finally {
      if (refreshing) setIsRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return; // esperar usuario disponible
      const lugarId = user?.lugarId || user?.lugar_id || null;
      if (!mounted) return;
      await loadData(lugarId);
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleRefresh = async () => {
    if (isRefreshing || !user) return;
    const lugarId = user?.lugarId || user?.lugar_id || null;
    await loadData(lugarId, { refreshing: true });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      setIsLoggingOut(false);
    }
  };

  const handleExportToExcel = () => {
    if (!data) return;

    try {
      // Importar xlsx de forma dinámica
      import("xlsx")
        .then((XLSX) => {
          const workbook = XLSX.utils.book_new();

          // Formato de fecha de última actualización
          const fechaActualizacion = lastUpdated
            ? formatDate(lastUpdated.toISOString())
            : "No disponible";

          // Hoja 1: Resumen General (KPIs)
          const resumenData = [
            ["RESUMEN GENERAL - " + lugarNombre],
            ["Última actualización: " + fechaActualizacion],
            [""],
            ["Métrica", "Valor"],
            ["Eventos totales", totales.eventos],
            ["Alumnos", totales.asistentesAlumnos],
            ["Ocupación promedio", totales.ocupacionPromedio + "%"],
            [""],
            ["BOLETOS Y PAGOS"],
            [
              "Boletos apartados",
              totales.boletosApartados,
              "$" + totales.boletosApartadosDinero.toLocaleString(),
            ],
            [
              "Boletos pagados",
              totales.boletosPagados,
              "$" +
                totales.boletosPagadosDinero.toLocaleString() +
                " (" +
                totales.porcentajePagados +
                "%)",
            ],
            [
              "Abono realizado",
              "",
              "$" +
                totales.abonoRealizado.toLocaleString() +
                " (" +
                totales.porcentajeAbonado +
                "%)",
            ],
            [
              "Boletos por pagar",
              totales.boletosPorPagar,
              "$" +
                totales.boletosPorPagarDinero.toLocaleString() +
                " (" +
                (100 - totales.porcentajePagados) +
                "%)",
            ],
            [
              "Tasa de pago",
              totales.porcentajePagados + "%",
              totales.boletosPagados +
                " de " +
                totales.boletosApartados +
                " pagados",
            ],
          ];
          const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
          XLSX.utils.book_append_sheet(workbook, wsResumen, "Resumen");

          // Hoja 2: Próximos Eventos
          if (proximosEventos && proximosEventos.length > 0) {
            const proximosData = [
              ["PRÓXIMOS EVENTOS"],
              ["Última actualización: " + fechaActualizacion],
              [""],
              [
                "Fecha",
                "Nombre",
                "Tipo",
                "Alumnos",
                "Apartados",
                "Apartados $",
                "Pagados",
                "Pagados $",
                "Abonado $",
                "Por Pagar",
                "Por Pagar $",
                "% Pagado",
                "% Abonado",
              ],
            ];

            proximosEventos.forEach((ev) => {
              proximosData.push([
                formatDate(ev.evento.fecha_evento),
                ev.evento.nombre_evento,
                ev.evento.tipo,
                ev.asistentesAlumnos || "-",
                ev.boletosApartados,
                ev.boletosApartadosDinero,
                ev.boletosPagados,
                ev.boletosPagadosDinero,
                ev.abonoRealizado,
                ev.boletosPorPagar,
                ev.boletosPorPagarDinero,
                ev.porcentajePagados + "%",
                ev.porcentajeAbonado + "%",
              ]);
            });

            const wsProximos = XLSX.utils.aoa_to_sheet(proximosData);
            XLSX.utils.book_append_sheet(
              workbook,
              wsProximos,
              "Próximos Eventos"
            );
          }

          // Hoja 3: Eventos Recientes
          if (eventosRecientes && eventosRecientes.length > 0) {
            const recientesData = [
              ["EVENTOS RECIENTES"],
              ["Última actualización: " + fechaActualizacion],
              [""],
              [
                "Fecha",
                "Nombre",
                "Tipo",
                "Alumnos",
                "Con boletos",
                "Ocupación",
                "Apartados",
                "Apartados $",
                "Pagados",
                "Pagados $",
                "Abonado $",
                "Por Pagar",
                "Por Pagar $",
                "% Pagado",
                "% Abonado",
              ],
            ];

            eventosRecientes.forEach((ev) => {
              recientesData.push([
                formatDate(ev.evento.fecha_evento),
                ev.evento.nombre_evento,
                ev.evento.tipo,
                ev.asistentesAlumnos || "-",
                ev.asistentes,
                ev.ocupacion + "%",
                ev.boletosApartados,
                ev.boletosApartadosDinero,
                ev.boletosPagados,
                ev.boletosPagadosDinero,
                ev.abonoRealizado,
                ev.boletosPorPagar,
                ev.boletosPorPagarDinero,
                ev.porcentajePagados + "%",
                ev.porcentajeAbonado + "%",
              ]);
            });

            const wsRecientes = XLSX.utils.aoa_to_sheet(recientesData);
            XLSX.utils.book_append_sheet(
              workbook,
              wsRecientes,
              "Eventos Recientes"
            );
          }

          // Generar archivo
          const fecha = new Date().toISOString().split("T")[0];
          const nombreArchivo = `${lugarNombre.replace(
            /[^a-z0-9]/gi,
            "_"
          )}_${fecha}.xlsx`;
          XLSX.writeFile(workbook, nombreArchivo);
        })
        .catch((err) => {
          console.error("Error al cargar xlsx:", err);
          alert("Error al exportar. Por favor, intenta nuevamente.");
        });
    } catch (error) {
      console.error("Error en exportación:", error);
      alert("Error al exportar a Excel");
    }
  };

  const handleVerDetalle = (evento) => {
    setEventoSeleccionado(evento);
    setModalDetalleOpen(true);
  };

  const handleCloseDetalle = () => {
    setModalDetalleOpen(false);
    setEventoSeleccionado(null);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-gray-600 dark:text-gray-200">
        <InlineSpinner size="sm" /> Cargando resumen...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!data) {
    return <div className="p-8">Sin datos disponibles.</div>;
  }

  const {
    lugarNombre,
    totales,
    proximosEventos,
    eventosRecientes,
    topTiposEventos,
  } = data;

  return (
    <div className="min-h-screen bg-fondoVs">
      <div className="bg-casalds-700">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div>
              <img
                src="logop.png"
                alt="Logo Casal"
                className="h-10 sm:h-12 lg:h-16"
              />  
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
                Resumen de tu lugar
              </h1>
              <p className="text-sm sm:text-base text-gray-200">
                {lugarNombre}
              </p>
              <p className="text-xs text-gray-300">
                Última actualización:{" "}
                {lastUpdated ? formatDate(lastUpdated.toISOString()) : "—"}
              </p>
            </div>
          </div>
          <div className="flex justify-end sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={handleExportToExcel}
              disabled={!data || loading}
              title="Exportar a Excel"
              className="px-4 py-2 bg-casal/80 hover:bg-[#155059] text-white rounded-lg flex items-center gap-2 shadow disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              aria-busy={isRefreshing}
              className="w-10 h-10 bg-white dark:bg-gray-200 rounded-full flex items-center justify-center shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRefreshing ? (
                <InlineSpinner size="xs" />
              ) : (
                <RefreshCw className="text-gray-600 dark:text-gray-800" />
              )}
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
              className="acciones-distribucion w-10 h-10 bg-white dark:bg-gray-200 rounded-full flex items-center justify-center shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <InlineSpinner size="xs" />
              ) : (
                <LogOut className="text-gray-600 dark:text-gray-800" />
              )}
            </button>
          </div>
        </header>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-min mx-auto space-y-6 sm:space-y-8">
        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 sm:gap-5">
          <KpiCard
            icon={<Calendar className="w-6 h-6 sm:w-6 sm:h-6" />}
            label="Eventos totales"
            value={totales.eventos}
          />
          <KpiCard
            icon={<Users className="w-6 h-6 sm:w-6 sm:h-6" />}
            label="Alumnos"
            value={totales.asistentesAlumnos}
          />
          {/* <KpiCard icon={<Users className="w-6 h-6" />} label="Con boletos" value={totales.asistentes} /> */}
          <KpiCard
            icon={<TrendingUp className="w-6 h-6 sm:w-6 sm:h-6" />}
            label="Ocupación promedio"
            value={totales.ocupacionPromedio + "%"}
          />
          {/* <KpiCard icon={<BarChart2 className="w-6 h-6" />} label="Ingresos estimados" value={'$' + totales.ingresosEstimados.toLocaleString()} /> */}
        </section>

        {/* KPIs de Boletos */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          <KpiCard
            icon={<Users className="w-6 h-6" />}
            label="Boletos apartados"
            value={totales.boletosApartados.toLocaleString()}
            subtitle={"$" + totales.boletosApartadosDinero.toLocaleString()}
          />
          <KpiCard
            icon={<TrendingUp className="w-6 h-6" />}
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
            icon={<BarChart2 className="w-6 h-6" />}
            label="Abono realizado"
            value={"$" + totales.abonoRealizado.toLocaleString()}
            subtitle={totales.porcentajeAbonado + "% del total abonado"}
            highlight="info"
          />
          <KpiCard
            icon={<BarChart2 className="w-6 h-6" />}
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
            icon={<TrendingUp className="w-6 h-6" />}
            label="Tasa de pago"
            value={totales.porcentajePagados + "%"}
            subtitle={
              totales.boletosPagados +
              " de " +
              totales.boletosApartados +
              " pagados"
            }
          />
        </section>

        {/* Próximos eventos */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Próximos eventos
          </h2>
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
                <thead className="bg-casal dark:bg-[#23272e]">
                  <tr>
                    <Th>Fecha</Th>
                    <Th>Nombre</Th>
                    <Th>Tipo</Th>
                    <Th>Alumnos</Th>
                    {/* <Th>Con boletos</Th> */}
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
                      <td
                        colSpan={11}
                        className="p-4 text-center text-gray-500"
                      >
                        No hay eventos próximos
                      </td>
                    </tr>
                  )}
                  {proximosEventos.map((ev) => (
                    <tr
                      key={ev.evento.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#23272e] transition"
                    >
                      <Td>{formatDate(ev.evento.fecha_evento)}</Td>
                      <Td className="font-medium">{ev.evento.nombre_evento}</Td>
                      <Td>{ev.evento.tipo}</Td>
                      <Td>{ev.asistentesAlumnos || "-"}</Td>
                      {/* <Td>{ev.invitados}</Td> */}
                      <Td>
                        <div>{ev.boletosApartados}</div>
                        <div className="text-xs text-gray-500">
                          ${ev.boletosApartadosDinero.toLocaleString()}
                        </div>
                      </Td>
                      <Td>
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          {ev.boletosPagados}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${ev.boletosPagadosDinero.toLocaleString()}
                        </div>
                      </Td>
                      <Td>
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          ${ev.abonoRealizado.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Abono adicional
                        </div>
                      </Td>
                      <Td>
                        <div className="text-amber-600 dark:text-amber-400 font-medium">
                          {ev.boletosPorPagar}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${ev.boletosPorPagarDinero.toLocaleString()}
                        </div>
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ev.porcentajePagados >= 50
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          }`}
                        >
                          {ev.porcentajePagados}%
                        </span>
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ev.porcentajeAbonado >= 20
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {ev.porcentajeAbonado}%
                        </span>
                      </Td>
                      <Td>
                        <button
                          onClick={() => handleVerDetalle(ev)}
                          className="p-2 rounded-lg bg-[#246370] hover:bg-[#1d4f5a] dark:bg-[#2a9d8f] dark:hover:bg-[#238276] text-white transition-colors shadow-sm"
                          title="Ver detalles del evento"
                        >
                          <Eye size={16} />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Eventos recientes + Top tipos */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Eventos recientes
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-casal dark:bg-[#23272e]">
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
                      <td
                        colSpan={13}
                        className="p-4 text-center text-gray-500"
                      >
                        No hay eventos registrados
                      </td>
                    </tr>
                  )}
                  {eventosRecientes.map((ev) => (
                    <tr
                      key={ev.evento.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#23272e] transition"
                    >
                      <Td className="sticky left-0 bg-white dark:bg-[#1e1e1e] z-10 font-medium text-xs">
                        {formatDate(ev.evento.fecha_evento).split(" ")[0]}
                        <div className="text-xs text-gray-500 sm:hidden">
                          {ev.evento.tipo}
                        </div>
                      </Td>
                      <Td className="font-medium">{ev.evento.nombre_evento}</Td>
                      <Td>{ev.evento.tipo}</Td>
                      <Td>{ev.asistentesAlumnos || "-"}</Td>
                      <Td>{ev.asistentes}</Td>
                      <Td>{ev.ocupacion}%</Td>
                      <Td>
                        <div>{ev.boletosApartados}</div>
                        <div className="text-xs text-gray-500">
                          ${ev.boletosApartadosDinero.toLocaleString()}
                        </div>
                      </Td>
                      <Td>
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          {ev.boletosPagados}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${ev.boletosPagadosDinero.toLocaleString()}
                        </div>
                      </Td>
                      <Td>
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          ${ev.abonoRealizado.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Abono adicional
                        </div>
                      </Td>
                      <Td>
                        <div className="text-amber-600 dark:text-amber-400 font-medium">
                          {ev.boletosPorPagar}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${ev.boletosPorPagarDinero.toLocaleString()}
                        </div>
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ev.porcentajePagados >= 50
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          }`}
                        >
                          {ev.porcentajePagados}%
                        </span>
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ev.porcentajeAbonado >= 20
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {ev.porcentajeAbonado}%
                        </span>
                      </Td>
                      <Td>
                        <button
                          onClick={() => handleVerDetalle(ev)}
                          className="p-2 rounded-lg bg-[#246370] hover:bg-[#1d4f5a] dark:bg-[#2a9d8f] dark:hover:bg-[#238276] text-white transition-colors shadow-sm"
                          title="Ver detalles del evento"
                        >
                          <Eye size={16} />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Sección Top tipos de evento comentada a petición */}
          {false && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Top tipos de evento
              </h2>
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <ul className="space-y-3">
                  {topTiposEventos.map((t) => (
                    <li
                      key={t.tipo}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {t.tipo}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {t.cantidad} ({t.porcentaje}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modal de detalle de evento */}
      <DetalleEvento
        open={modalDetalleOpen}
        onClose={handleCloseDetalle}
        evento={eventoSeleccionado}
      />
    </div>
  );
}

// function KpiCard({ icon, label, value, subtitle, highlight }) {
//   const highlightColors = {
//     success: 'text-green-600 dark:text-green-400',
//     warning: 'text-amber-600 dark:text-amber-400',
//     danger: 'text-red-600 dark:text-red-400',
//     info: 'text-blue-600 dark:text-blue-400',
//   };

//   const iconColor = highlight ? highlightColors[highlight] : 'text-[#206a73]';

//   return (
//     <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-200 dark:border-gray-700 flex flex-col gap-2">
//       <div className={`flex items-center gap-3 ${iconColor}`}>{icon}<span className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span></div>
//       <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{value}</div>
//       {subtitle && (
//         <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
//       )}
//     </div>
//   );
// }

function KpiCard({ icon, label, value, subtitle, highlight }) {
  const highlightColors = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  const iconColor = highlight ? highlightColors[highlight] : "text-[#206a73]";

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className={`flex items-center gap-2 sm:gap-3 ${iconColor}`}>
        {icon}
        <span className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-tight">
          {label}
        </span>
      </div>
      <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-100 leading-tight">
        {value}
      </div>
      {subtitle && (
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-tight">
          {subtitle}
        </div>
      )}
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
