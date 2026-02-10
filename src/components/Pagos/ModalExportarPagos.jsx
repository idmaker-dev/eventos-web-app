import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Calendar, Download } from "lucide-react";

const ModalExportarPagos = ({ isOpen, onClose, onExportar }) => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split("T")[0];

  // Obtener fecha de hace 30 días
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);
  const fecha30DiasAtras = hace30Dias.toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fechaInicio || !fechaFin) {
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert("La fecha de inicio debe ser menor o igual a la fecha de fin");
      return;
    }

    setIsExporting(true);
    try {
      await onExportar(fechaInicio, fechaFin);
      onClose();
    } catch (error) {
      console.error("Error exportando pagos:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setFechaInicio("");
      setFechaFin("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-casal/10 dark:bg-casal/20 rounded-lg">
                <Download className="w-5 h-5 text-casal dark:text-[#72B7A4]" />
              </div>
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                Exportar Pagos
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Selecciona el rango de fechas para exportar los pagos realizados en este evento.
            </p>

            {/* Fecha Inicio */}
            <div className="mb-4">
              <label
                htmlFor="fecha-inicio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Fecha de inicio
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="fecha-inicio"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  max={hoy}
                  required
                  disabled={isExporting}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-casal dark:focus:ring-[#72B7A4] focus:border-transparent
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Fecha Fin */}
            <div className="mb-6">
              <label
                htmlFor="fecha-fin"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Fecha de fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  id="fecha-fin"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  max={hoy}
                  required
                  disabled={isExporting}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-casal dark:focus:ring-[#72B7A4] focus:border-transparent
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Botones de acceso rápido */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setFechaInicio(fecha30DiasAtras);
                  setFechaFin(hoy);
                }}
                disabled={isExporting}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                         rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Últimos 30 días
              </button>
              <button
                type="button"
                onClick={() => {
                  const primerDiaMes = new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1
                  ).toISOString().split("T")[0];
                  setFechaInicio(primerDiaMes);
                  setFechaFin(hoy);
                }}
                disabled={isExporting}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
                         rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Este mes
              </button>
            </div>

            {/* Footer - Botones de acción */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClose}
                disabled={isExporting}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600
                         text-gray-700 dark:text-gray-300 rounded-lg font-medium
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isExporting || !fechaInicio || !fechaFin}
                className="flex-1 px-4 py-2.5 bg-casal hover:bg-casal/90 dark:bg-[#72B7A4] dark:hover:bg-[#5fa08e]
                         text-white rounded-lg font-medium transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Exportando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Exportar CSV</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ModalExportarPagos;
