import React, { useState, useEffect, useCallback } from "react";
import { useSelectedEvent } from "../contexts/SelectedEventContext";
import eventService from "../services/eventService";
import { useNotifications } from "../contexts/NotificationContext";
import { AlertCircle, ChevronDown, ChevronUp, Search, RefreshCw } from "lucide-react";
import "../styles/pages/Pagos.css";

export default function ConciliacionPagos() {
  const { eventos, cargarEventos } = useSelectedEvent();
  const { showError } = useNotifications();

  const [eventoSeleccionado, setEventoSeleccionado] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [duplicados, setDuplicados] = useState([]);
  const [hasBuscado, setHasBuscado] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  // Cargar eventos si no están disponibles
  useEffect(() => {
    if (!eventos || eventos.length === 0) {
      setLoadingEventos(true);
      if (cargarEventos) {
        cargarEventos().finally(() => setLoadingEventos(false));
      }
    }
  }, []);

  const buscarDuplicados = useCallback(async () => {
    if (!eventoSeleccionado) {
      showError("Por favor selecciona un evento primero");
      return;
    }

    setLoading(true);
    setHasBuscado(false);
    setDuplicados([]);
    setExpandedRow(null);

    try {
      const resultado = await eventService.verificarPagosDuplicados(eventoSeleccionado);
      if (resultado.success) {
        const data = resultado.data?.data || [];
        console.log("DATOS", data);
        setDuplicados(data);
        setHasBuscado(true);
      } else {
        showError(resultado.error || "Error al verificar pagos duplicados");
      }
    } catch (error) {
      showError("Error inesperado al consultar duplicados");
    } finally {
      setLoading(false);
    }
  }, [eventoSeleccionado, showError]);

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const getEstadoBadge = (estado) => {
    const map = {
      PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PARCIAL: "bg-orange-100 text-orange-800 border-orange-200",
      COMPLETO: "bg-green-100 text-green-800 border-green-200",
      PAGADA: "bg-green-100 text-green-800 border-green-200",
    };
    const cls = map[estado] || "bg-gray-100 text-gray-700 border-gray-200";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${cls}`}>
        {estado}
      </span>
    );
  };

  const nombreEvento = eventos?.find((e) => e.id === eventoSeleccionado)?.nombre || "";

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-6 md:p-8 w-full shadow-sm">
      {/* Header */}
      <div className="mb-6 border-b border-gray-100 dark:border-gray-800 pb-5">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-1">
          <AlertCircle className="w-6 h-6 text-[#246370] dark:text-[#72B7A4]" />
          Conciliación de Pagos Duplicados
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Selecciona un evento y ejecuta la verificación para detectar registros duplicados generados por notificaciones repetidas de Toku.
        </p>
      </div>

      {/* Selector de evento + botón */}
      <div className="bg-gray-50 dark:bg-[#252525] rounded-2xl p-5 mb-6 border border-gray-100 dark:border-gray-700">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Evento a verificar
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            {loadingEventos ? (
              <div className="flex items-center gap-2 h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] text-gray-400 text-sm">
                <div className="animate-spin w-4 h-4 border-2 border-[#246370] border-t-transparent rounded-full"></div>
                Cargando eventos...
              </div>
            ) : (
              <select
                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#246370]/40 focus:border-[#246370] transition-all appearance-none cursor-pointer"
                value={eventoSeleccionado}
                onChange={(e) => {
                  setEventoSeleccionado(e.target.value);
                  setHasBuscado(false);
                  setDuplicados([]);
                }}
              >
                <option value="">-- Seleccionar evento --</option>
                {(eventos || []).map((evento) => (
                  <option key={evento.id} value={evento.id}>
                    {evento.nombre || evento.nombre_evento || evento.id}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={buscarDuplicados}
            disabled={!eventoSeleccionado || loading}
            className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-[#246370] hover:bg-[#1a4f5a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? "Verificando..." : "Verificar pagos"}
          </button>
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-gray-700 border-t-[#246370] dark:border-t-[#72B7A4]"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 font-medium">Analizando pagos del evento…</p>
            <p className="text-sm text-gray-400 mt-1">
              Revisando deudas y cruzando con logs de Toku
            </p>
          </div>
        </div>
      )}

      {/* Sin resultados / estado inicial */}
      {!loading && !hasBuscado && (
        <div className="text-center py-14 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500 dark:text-gray-400">Selecciona un evento y presiona <strong>"Verificar pagos"</strong></p>
          <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">Se revisarán todas las deudas del evento en busca de pagos duplicados</p>
        </div>
      )}

      {/* Sin duplicados */}
      {!loading && hasBuscado && duplicados.length === 0 && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-2xl p-10 text-center">
          <div className="inline-flex items-center justify-center w-18 h-18 rounded-full bg-green-100 dark:bg-green-800/30 mb-4 p-5">
            <svg className="w-9 h-9 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">
            ¡Sin duplicados detectados!
          </h3>
          <p className="text-sm text-green-600 dark:text-green-500 max-w-md mx-auto">
            {/* Se analizaron todas las deudas del evento <strong>"{nombreEvento}"</strong> y no se encontraron pagos duplicados en la base de datos. */}
            Se analizaron todas las deudas del evento y no se encontraron pagos duplicados en la base de datos.
          </p>
        </div>
      )}

      {/* Tabla de resultados */}
      {!loading && hasBuscado && duplicados.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
                Resultados: <span className="text-red-500">{duplicados.length} invitado{duplicados.length !== 1 ? "s" : ""} con pagos duplicados</span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {/* Evento: <span className="font-medium text-gray-700 dark:text-gray-200">{nombreEvento}</span> */}
              </p>
            </div>
            <button
              onClick={buscarDuplicados}
              className="flex items-center gap-1.5 text-sm text-[#246370] hover:text-[#1a4f5a] dark:text-[#72B7A4] font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#222] border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold text-gray-500 dark:text-gray-400">Con Logs</th>
                    <th className="p-4 font-semibold text-gray-500 dark:text-gray-400">Invitado</th>
                    <th className="p-4 font-semibold text-gray-500 dark:text-gray-400">Contacto</th>
                    <th className="p-4 font-semibold text-gray-500 dark:text-gray-400">Deuda</th>
                    <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 text-center">IDs duplicados</th>
                    <th className="p-4 font-semibold text-gray-500 dark:text-gray-400 text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {duplicados.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`cursor-pointer transition-colors ${
                          expandedRow === item.id
                            ? "bg-red-50/40 dark:bg-red-900/5"
                            : "hover:bg-gray-50/80 dark:hover:bg-[#252525]"
                        }`}
                        onClick={() => toggleRow(item.id)}
                      >
                        <td className="p-4">
                          {item.webhookLogs.length > 0 ? "✅" : "❌"}
                        </td>
                        {/* Invitado */}
                        <td className="p-4">
                          <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                            {item.invitado.nombre_completo}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 font-mono">
                            {item.invitado.id}
                          </div>
                        </td>

                        {/* Contacto */}
                        <td className="p-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate max-w-[180px]">{item.invitado.correo}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {item.invitado.numero}
                          </div>
                        </td>

                        {/* Deuda */}
                        <td className="p-4">
                          <div className="mb-1.5">{getEstadoBadge(item.deuda.estado)}</div>
                          <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            Total: <span className="font-mono">${parseFloat(item.deuda.monto_total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-xs text-red-500 font-medium">
                            Pendiente: <span className="font-mono">${parseFloat(item.deuda.monto_pendiente).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 font-mono">
                            Deuda ID: {item.id}
                          </div>
                        </td>

                        {/* IDs duplicados */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-base flex items-center justify-center shadow-sm">
                              {item.pagos_duplicados_db.length}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">registros</span>
                          </div>
                        </td>

                        {/* Botón expandir */}
                        <td className="p-4 text-center">
                          <button
                            className={`p-2.5 rounded-full transition-all ${
                              expandedRow === item.id
                                ? "bg-[#246370] text-white shadow-md"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                            }`}
                          >
                            {expandedRow === item.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Fila expandible con logs */}
                      {expandedRow === item.id && (
                        <tr className="bg-gray-50/60 dark:bg-[#161616] border-t border-gray-100 dark:border-gray-800">
                          <td colSpan="5" className="p-0">
                            <div className="p-5 md:p-7 border-l-4 border-[#246370] dark:border-[#72B7A4]">
                              {/* Resumen de pagos en DB */}
                              <div className="mb-6">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                                  Pagos duplicados en base de datos ({item.pagos_realizados?.length || 0} registros)
                                </h4>
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e]">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-gray-50 dark:bg-[#252525] border-b border-gray-100 dark:border-gray-700">
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID Pago</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Método</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                      {(item.pagos_realizados || []).map((pago, idx) => {
                                        const isDup = item.pagos_duplicados_db.includes(pago.id_pago);
                                        return (
                                          <tr key={idx} className={isDup ? "bg-red-50/50 dark:bg-red-900/5" : ""}>
                                            <td className="px-4 py-2.5 text-gray-500">{idx + 1}</td>
                                            <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">
                                              <span className={isDup ? "text-red-600 dark:text-red-400 font-semibold" : ""}>
                                                {pago.id_pago}
                                              </span>
                                              {isDup && (
                                                <span className="ml-2 text-[9px] bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                                                  dup
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono font-semibold text-gray-800 dark:text-gray-200">
                                              ${parseFloat(pago.monto_pagado).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{pago.fecha_pago}</td>
                                            <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{pago.metodo_pago}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Logs de Webhooks */}
                              <div>
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 rounded-full bg-[#246370]"></span>
                                  Evidencia en webhookLogs de Toku ({item.webhookLogs?.length || 0} registros)
                                </h4>

                                {item.webhookLogs?.length > 0 ? (
                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {item.webhookLogs.map((log, idx) => (
                                      <div
                                        key={log.id || idx}
                                        className="bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#246370]/50 dark:hover:border-[#72B7A4]/50 transition-colors overflow-hidden shadow-sm"
                                      >
                                        {/* Log header */}
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-[#252525] flex flex-wrap items-center justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded px-2 py-0.5 font-bold uppercase tracking-wider">
                                              Log #{idx + 1}
                                            </span>
                                            <span className={`text-[10px] rounded px-2 py-0.5 font-bold uppercase tracking-wider ${log.procesado ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400" : "bg-gray-100 text-gray-500"}`}>
                                              {log.procesado ? "Procesado" : "No procesado"}
                                            </span>
                                          </div>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(log.timestamp_recibido).toLocaleString("es-MX")}
                                          </span>
                                        </div>

                                        {/* Log body */}
                                        <div className="p-4 space-y-3">
                                          <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                              <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Transaction ID</span>
                                              <span className="font-mono text-[#246370] dark:text-[#72B7A4] font-semibold break-all">{log.payload?.transaction?.id}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block mb-0.5">Monto procesado</span>
                                              <span className="font-mono font-bold text-green-600 dark:text-green-400 text-base">
                                                ${parseFloat(log.payload?.transaction?.amount || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                                              </span>
                                            </div>
                                          </div>

                                          {/* JSON payload */}
                                          <div>
                                            <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block mb-1.5">Payload completo</span>
                                            <div className="bg-[#f8f9fa] dark:bg-[#111] rounded-lg p-3 overflow-x-auto max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-800">
                                              <pre className="text-[11px] text-gray-600 dark:text-gray-400 font-mono m-0 leading-relaxed whitespace-pre-wrap">
                                                {JSON.stringify(log.payload || log, null, 2)}
                                              </pre>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-4 text-sm">
                                    <div className="flex items-start gap-3 text-yellow-800 dark:text-yellow-300">
                                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-semibold mb-1">Duplicados detectados en DB, pero sin evidencia en logs</p>
                                        <p className="opacity-80 text-xs">
                                          Hay registros con el mismo <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">id_pago</code> en la base de datos, pero la consulta de webhookLogs no arrojó múltiples webhooks para las mismas transacciones. Puede ser una inconsistencia diferente.
                                        </p>
                                        <div className="mt-3 bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-yellow-200/50 text-xs font-mono space-y-1">
                                          {item.pagos_duplicados_db.map((pid, i) => (
                                            <div key={i} className="text-yellow-900 dark:text-yellow-200">• {pid}</div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
