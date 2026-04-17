import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import "../../styles/components/ModalCancelacionBoletos.css";
import eventService from "../../services/eventService";
import { useNotifications } from "../../contexts/NotificationContext";

export default function ModalConfirmarDevolucion({ open, onClose, cancelacion, onSuccess }) {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);

  if (!open || !cancelacion) return null;

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      const response = await eventService.procesarDevolucion(cancelacion.id, {
        responsable: localStorage.getItem("userName") || "Admin",
      });

      if (response.success) {
        showSuccess(response.message || "Devolución confirmada con éxito");
        if (onSuccess) await onSuccess();
        onClose();
      } else {
        showError(response.error || "No se pudo confirmar la devolución");
      }
    } catch (error) {
      showError("Error al procesar la confirmación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-cancel-overlay backdrop-blur-sm">
      <div className="modal-cancel-container animate-fade-in shadow-2xl relative overflow-hidden max-w-md">
        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 border-b border-emerald-100 dark:border-emerald-800 flex justify-between items-center">
          <h2 className="modal-cancel-title text-emerald-700 dark:text-emerald-400 flex items-center gap-2 m-0 text-lg">
            <CheckCircle className="text-emerald-500" size={24} /> Confirmar Devolución
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-full dark:hover:bg-gray-800 transition" disabled={loading}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-white dark:bg-[#1e1e1e]">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${Number(cancelacion.detalles_calculo?.monto_reembolso_neto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
              ¿Procesar esta devolución?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Se va a confirmar la devolución para <strong>{cancelacion.nombre_asistente}</strong> por <strong>{cancelacion.cantidad_cancelar}</strong> boletos cancelados.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="shrink-0 text-yellow-500" size={20} />
            <div>
              <p className="font-bold mb-1">Importante</p>
              <p>Al confirmar, este monto se restará automáticamente de las facturas (de más reciente a más antigua) del estudiante. Esta acción no se puede deshacer y registrará los boletos como procesados.</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={loading}
          >
            Atrás
          </button>
          <button 
            type="button" 
            onClick={handleConfirmar}
            disabled={loading}
            className="px-6 py-2 font-bold text-white bg-emerald-600 rounded-lg shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center justify-center min-w-[140px]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
