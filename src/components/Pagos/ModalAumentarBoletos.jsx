import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Ticket, AlertCircle, Plus, Minus, Info } from "lucide-react";
import eventService from "../../services/eventService";
import { useNotifications } from "../../contexts/NotificationContext";
import { useSelectedEvent } from "../../contexts/SelectedEventContext";

const ModalAumentarBoletos = ({ isOpen, onClose, deuda, onBoletosActualizados }) => {
  const { showSuccess, showError } = useNotifications();
  const { eventoActual } = useSelectedEvent();
  const [nuevaCantidad, setNuevaCantidad] = useState(deuda?.asistente?.cantidad_boletos || 0);
  const [opcionProrrateo, setOpcionProrrateo] = useState("crear_nuevas");
  const [loading, setLoading] = useState(false);

  if (!deuda) return null;

  const cantidadActual = deuda.asistente.cantidad_boletos;
  const diferencia = nuevaCantidad - cantidadActual;
  const esDisminucion = diferencia < 0;
  const precioPorBoleto = eventoActual?.costo || 0;
  const costoAdicional = diferencia > 0 ? precioPorBoleto * diferencia : 0;
  const montoReduccion = diferencia < 0 ? precioPorBoleto * Math.abs(diferencia) : 0;

  const handleIncrement = () => {
    setNuevaCantidad((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (nuevaCantidad > 0) {
      setNuevaCantidad((prev) => prev - 1);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0) {
      setNuevaCantidad(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nuevaCantidad === cantidadActual) {
      showError("La nueva cantidad debe ser diferente a la actual");
      return;
    }

    setLoading(true);

    try {
      // Para disminución, siempre usar "eliminar_completas"
      const opcionFinal = esDisminucion ? "eliminar_completas" : opcionProrrateo;
      
      const resultado = await eventService.updateInvitadoBoletos(
        deuda.invitado_id,
        nuevaCantidad,
        opcionFinal
      );

      if (resultado.success) {
        const mensaje = esDisminucion
          ? `Boletos actualizados correctamente. Se eliminaron ${Math.abs(diferencia)} boleto(s)`
          : `Boletos actualizados correctamente. Se agregaron ${diferencia} boleto(s)`;
        
        showSuccess(mensaje, { duration: 5000 });
        
        // Llamar al callback para actualizar la vista
        if (onBoletosActualizados) {
          onBoletosActualizados();
        }
      } else {
        showError(resultado.error || "Error al actualizar los boletos");
      }
    } catch (error) {
      console.error("Error al actualizar boletos:", error);
      showError("Error al actualizar los boletos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-casal/10 dark:bg-casal/20 rounded-lg p-2.5">
                <Ticket className="w-6 h-6 text-casal dark:text-Acapulco" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                  {esDisminucion ? "Disminuir Boletos" : "Aumentar Boletos"}
                </Dialog.Title>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {deuda.asistente.nombre_completo}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Info actual */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">
                      Información actual
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Boletos actuales: <span className="font-semibold">{cantidadActual}</span>
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Precio por boleto: <span className="font-semibold">${precioPorBoleto.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Selector de cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Nueva cantidad de boletos
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={nuevaCantidad <= 0}
                    className="p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  <input
                    type="number"
                    value={nuevaCantidad}
                    onChange={handleInputChange}
                    min={0}
                    className="w-24 text-center text-2xl font-bold py-3 px-4 border-2 border-casal/30 dark:border-casal/50 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-casal"
                  />
                  
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="p-2 rounded-lg border-2 border-casal/30 dark:border-casal/50 bg-casal hover:bg-casal/90 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>

                  {diferencia !== 0 && (
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`text-sm font-medium ${
                        diferencia > 0 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {diferencia > 0 ? "+" : ""}{diferencia} boleto{Math.abs(diferencia) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Opción de prorrateo - Solo para aumento */}
              {!esDisminucion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Gestión de facturas
                  </label>
                  <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="prorrateo"
                      value="crear_nuevas"
                      checked={opcionProrrateo === "crear_nuevas"}
                      onChange={(e) => setOpcionProrrateo(e.target.value)}
                      className="mt-1 w-4 h-4 text-casal focus:ring-casal"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Crear nuevas facturas
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Se crearán facturas adicionales solo para los boletos nuevos
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="prorrateo"
                      value="aumentar_existentes"
                      checked={opcionProrrateo === "aumentar_existentes"}
                      onChange={(e) => setOpcionProrrateo(e.target.value)}
                      className="mt-1 w-4 h-4 text-casal focus:ring-casal"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Prorratear en facturas existentes
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        El costo adicional se distribuirá en las facturas pendientes
                      </p>
                    </div>
                  </label>
                  </div>
                </div>
              )}

              {/* Resumen del cambio */}
              {diferencia !== 0 && (
                <div className={`bg-gradient-to-br border rounded-lg p-4 ${
                  esDisminucion
                    ? "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border-red-300 dark:border-red-700"
                    : "from-casal/5 to-casal/10 dark:from-casal/10 dark:to-casal/20 border-casal/30 dark:border-casal/50"
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      esDisminucion
                        ? "text-red-600 dark:text-red-400"
                        : "text-casal dark:text-Acapulco"
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Resumen del cambio
                      </p>
                      <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {esDisminucion ? (
                          <>
                            <p>• Se eliminarán <span className="font-semibold">{Math.abs(diferencia)}</span> boleto{Math.abs(diferencia) !== 1 ? "s" : ""}</p>
                            <p>• Reducción de monto: <span className="font-semibold">${montoReduccion.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                            <p>• Nuevo total: <span className="font-semibold">${(deuda.financiero.monto_total - montoReduccion).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-2">⚠️ Se eliminarán facturas completas automáticamente</p>
                          </>
                        ) : (
                          <>
                            <p>• Se agregarán <span className="font-semibold">{diferencia}</span> boleto{diferencia !== 1 ? "s" : ""}</p>
                            <p>• Costo adicional: <span className="font-semibold">${costoAdicional.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                            <p>• Nuevo total: <span className="font-semibold">${(deuda.financiero.monto_total + costoAdicional).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || diferencia === 0}
                className="px-5 py-2.5 bg-casal text-white rounded-lg hover:bg-casal/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    {esDisminucion ? (
                      <>
                        <Minus className="w-4 h-4" />
                        Disminuir boletos
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Aumentar boletos
                      </>
                    )}
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

export default ModalAumentarBoletos;
