import React, { useState, useEffect } from "react";
import { useAutomatizaciones } from "../../hooks/useAutomatizaciones";
import { useHistorialAutomatizaciones } from "../../hooks/useHistorialAutomatizaciones";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button, Dialog, DialogPanel } from "@headlessui/react";

export default function HistorialEjecuciones() {
  const { automatizaciones, loading: loadingAutos } = useAutomatizaciones();
  const { historial, loading: loadingHistorial, obtenerHistorial } = useHistorialAutomatizaciones();

  const [automatizacionSeleccionada, setAutomatizacionSeleccionada] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: "",
    fecha_desde: "",
    fecha_hasta: "",
    limit: 20,
    offset: 0,
  });
  const [detalleModal, setDetalleModal] = useState(null);

  // Cargar historial cuando cambia la automatización seleccionada
  useEffect(() => {
    if (automatizacionSeleccionada) {
      obtenerHistorial(automatizacionSeleccionada, filtros);
    }
  }, [automatizacionSeleccionada, filtros, obtenerHistorial]);

  const handleFiltroChange = (key, value) => {
    setFiltros((prev) => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset offset cuando cambian filtros
    }));
  };

  const handlePaginaAnterior = () => {
    setFiltros((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  };

  const handlePaginaSiguiente = () => {
    setFiltros((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      exitoso: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      parcial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estilos[estado] || "bg-gray-100 text-gray-800"}`}>
        {estado.toUpperCase()}
      </span>
    );
  };

  if (loadingAutos) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500 dark:text-gray-400">
          Cargando automatizaciones...
        </div>
      </div>
    );
  }

  if (!automatizacionSeleccionada) {
    return (
      <div className="border rounded-3xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Selecciona una Automatización
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Elige una automatización para ver su historial de ejecuciones
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automatizaciones.map((auto) => (
            <button
              key={auto.id}
              onClick={() => setAutomatizacionSeleccionada(auto.id)}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-casal dark:hover:border-casal transition-colors text-left"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {auto.nombre}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Tipo: {auto.tipo}</p>
                <p>Estado: {auto.activa ? "✅ Activa" : "❌ Inactiva"}</p>
                {auto.estadisticas && (
                  <p className="text-xs mt-2">
                    Ejecuciones: {auto.estadisticas.total_ejecuciones || 0}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const autoActual = automatizaciones.find((a) => a.id === automatizacionSeleccionada);

  return (
    <div className="border rounded-3xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setAutomatizacionSeleccionada(null)}
            className="flex items-center gap-2 text-casal hover:text-casal/80"
          >
            <ChevronLeft className="w-5 h-5" />
            Volver
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Historial: {autoActual?.nombre}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total de ejecuciones: {autoActual?.estadisticas?.total_ejecuciones || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            value={filtros.estado}
            onChange={(e) => handleFiltroChange("estado", e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todos</option>
            <option value="exitoso">Exitoso</option>
            <option value="parcial">Parcial</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={filtros.fecha_desde}
            onChange={(e) => handleFiltroChange("fecha_desde", e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={filtros.fecha_hasta}
            onChange={(e) => handleFiltroChange("fecha_hasta", e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {(filtros.estado || filtros.fecha_desde || filtros.fecha_hasta) && (
          <div className="flex items-end">
            <Button
              onClick={() => setFiltros({ estado: "", fecha_desde: "", fecha_hasta: "", limit: 20, offset: 0 })}
              className="px-4 py-2 text-sm text-casal hover:text-casal/80"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Tabla de historial */}
      {loadingHistorial ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-gray-500 dark:text-gray-400">Cargando historial...</div>
        </div>
      ) : historial.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No hay registros de ejecución para esta automatización
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Fecha/Hora
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Estado
                  </th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Destinatarios
                  </th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Exitosos
                  </th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Fallidos
                  </th>
                  <th className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {historial.map((registro) => (
                  <tr
                    key={registro.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-3 text-sm text-gray-900 dark:text-gray-300">
                      {formatearFecha(registro.fecha_ejecucion)}
                    </td>
                    <td className="p-3">{getEstadoBadge(registro.estado)}</td>
                    <td className="p-3 text-center text-gray-900 dark:text-gray-300">
                      {registro.destinatarios_procesados}
                    </td>
                    <td className="p-3 text-center text-green-600 dark:text-green-400 font-semibold">
                      {registro.exitosos}
                    </td>
                    <td className="p-3 text-center text-red-600 dark:text-red-400 font-semibold">
                      {registro.fallidos}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        onClick={() => setDetalleModal(registro)}
                        className="text-casal hover:text-casal/80 flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {filtros.offset + 1} - {Math.min(filtros.offset + filtros.limit, filtros.offset + historial.length)}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handlePaginaAnterior}
                disabled={filtros.offset === 0}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={handlePaginaSiguiente}
                disabled={historial.length < filtros.limit}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modal de Detalles */}
      <Dialog
        open={!!detalleModal}
        onClose={() => setDetalleModal(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Detalles de Ejecución
            </h3>

            {detalleModal && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fecha</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatearFecha(detalleModal.fecha_ejecucion)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                    {getEstadoBadge(detalleModal.estado)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de disparador</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {detalleModal.disparador_tipo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de evento</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {detalleModal.evento_tipo || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Lista de destinatarios */}
                {detalleModal.detalles?.destinatarios && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Destinatarios ({detalleModal.detalles.destinatarios.length})
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {detalleModal.detalles.destinatarios.map((dest, idx) => (
                        <div
                          key={idx}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {dest.nombre}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {dest.telefono} {dest.email && `• ${dest.email}`}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${dest.exitoso ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {dest.exitoso ? "✓ Éxito" : "✗ Error"}
                            </span>
                          </div>
                          {dest.acciones && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              Acciones: {dest.acciones.map((a) => a.tipo).join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errores */}
                {detalleModal.errores && detalleModal.errores.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                      Errores ({detalleModal.errores.length})
                    </h4>
                    <div className="space-y-2">
                      {detalleModal.errores.map((error, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                        >
                          <p className="text-sm text-red-800 dark:text-red-300">
                            {typeof error === "string" ? error : error.error || JSON.stringify(error)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setDetalleModal(null)}
                    className="px-6 py-2 bg-casal text-white rounded-lg hover:bg-casal/90"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
