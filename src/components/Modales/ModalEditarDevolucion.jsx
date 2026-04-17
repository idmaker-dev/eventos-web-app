import React, { useState, useMemo, useEffect } from "react";
import { X, Ticket, Calculator, Banknote, Landmark, User, AlertCircle, Loader2, Info } from "lucide-react";
import "../../styles/components/ModalCancelacionBoletos.css";
import eventService from "../../services/eventService";
import { useNotifications } from "../../contexts/NotificationContext";

export default function ModalEditarDevolucion({ open, onClose, cancelacion, onSuccess }) {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  // Graduate Stock State
  const [invitado, setInvitado] = useState(null);
  
  // Form States
  const [cantidadCancelar, setCantidadCancelar] = useState(1);
  const [porcentajePenalizacion, setPorcentajePenalizacion] = useState(0);
  const [datosBancarios, setDatosBancarios] = useState({ clabe: "", banco: "", titular: "" });

  useEffect(() => {
    if (open && cancelacion) {
      setFetchingData(true);
      setCantidadCancelar(cancelacion.cantidad_cancelar || 1);
      setPorcentajePenalizacion(cancelacion.porcentaje_penalizacion || 0);
      if (cancelacion.datos_bancarios) {
        setDatosBancarios({
          clabe: cancelacion.datos_bancarios.clabe || "",
          banco: cancelacion.datos_bancarios.banco || "",
          titular: cancelacion.datos_bancarios.titular || ""
        });
      }

      // Fetch current graduate stock
      const loadGuest = async () => {
        try {
          const res = await eventService.getInvitadoById(cancelacion.id_invitado);
          if (res.success) {
            setInvitado(res.data);
          }
        } finally {
          setFetchingData(false);
        }
      };
      loadGuest();
    }
  }, [open, cancelacion]);

  // Original parameters breakdown
  const original = useMemo(() => {
    if (!cancelacion) return null;
    return {
      A: cancelacion.detalles_calculo?.boletos_sin_costo || 0,
      P: cancelacion.detalles_calculo?.boletos_con_penalizacion || 0,
      total: cancelacion.cantidad_cancelar || 0,
      valorUnitario: cancelacion.detalles_calculo?.valor_unitario || 0
    };
  }, [cancelacion]);

  // Derived Limits and Calculations
  const stock = useMemo(() => {
    if (!invitado || !original) return null;
    const canGraduado = Number(invitado.cantidad_boletos || invitado.catidadPedido || 0);
    return {
       actual: canGraduado,
       totalOriginal: canGraduado + original.total,
       precioActual: original.valorUnitario // Usamos el pactado originalmente por defecto
    };
  }, [invitado, original]);

  const calculo = useMemo(() => {
    if (!original) return null;
    
    const n = Number(cantidadCancelar) || 0;
    
    // Regla: Mantener apartados originales fijos, el resto son pagados
    const canApartados = original.A;
    const canPagados = Math.max(0, n - canApartados);

    const montoBrutoPagados = canPagados * original.valorUnitario;
    const montoPenalizacion = montoBrutoPagados * (Number(porcentajePenalizacion) / 100);
    const montoReembolsoNeto = montoBrutoPagados - montoPenalizacion;

    return {
      canApartados,
      canPagados,
      montoBrutoPagados,
      montoPenalizacion,
      montoReembolsoNeto
    };
  }, [original, cantidadCancelar, porcentajePenalizacion]);

  const isValid = useMemo(() => {
    if (!stock || !calculo) return false;
    const n = Number(cantidadCancelar);
    return (
      n >= (original.A + 1) && // Mínimo 1 pagado
      n <= stock.totalOriginal && // Límite máximo (solicitud + stock graduado)
      datosBancarios.clabe.length >= 10 &&
      datosBancarios.banco.trim() !== "" &&
      datosBancarios.titular.trim() !== ""
    );
  }, [cantidadCancelar, stock, calculo, original, datosBancarios]);

  if (!open || !cancelacion) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    if (calculo.canPagados < 1) {
       showError("La cancelación debe mantener al menos 1 boleto pagado.");
       return;
    }

    setLoading(true);
    try {
      const response = await eventService.editarCancelacion(cancelacion.id, {
        cantidad_cancelar: cantidadCancelar,
        porcentaje_penalizacion: porcentajePenalizacion,
        datos_bancarios: datosBancarios,
        detalles_calculo: {
          boletos_sin_costo: calculo.canApartados,
          boletos_con_penalizacion: calculo.canPagados,
          monto_penalizacion: calculo.montoPenalizacion,
          monto_reembolso_neto: calculo.montoReembolsoNeto,
          valor_unitario: original.valorUnitario
        },
        responsable: localStorage.getItem("userName") || "Admin",
      });

      if (response.success) {
        showSuccess(response.message || "Cambios guardados con éxito");
        if (onSuccess) await onSuccess();
        onClose();
      } else {
        showError(response.error);
      }
    } catch (error) {
      showError("Error al procesar la actualización");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-cancel-overlay">
      <div className="modal-cancel-container animate-fade-in shadow-xl relative overflow-hidden">
        {fetchingData && (
          <div className="absolute inset-0 z-50 bg-white/70 dark:bg-black/40 flex flex-col items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        )}

        <div className="modal-cancel-header bg-indigo-50 dark:bg-indigo-900/40">
          <h2 className="modal-cancel-title text-indigo-700 dark:text-indigo-400">
            <Ticket className="text-indigo-600" /> Editar Devolución
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-full transition" disabled={loading}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Graduate Stock Info Panel */}
        <div className="p-4 bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
           <div className="flex flex-col p-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100">
              <span className="text-[10px] uppercase font-bold text-indigo-500">Boletos del Graduado</span>
              <span className="text-xl font-black text-indigo-700 dark:text-indigo-400">
                {invitado ? (invitado.cantidad_boletos || invitado.catidadPedido || 0) : "-"}
              </span>
           </div>
           <div className="flex flex-col p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400">Precio Boleto</span>
              <span className="text-xl font-black text-gray-700 dark:text-gray-300">
                 ${original.valorUnitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-cancel-body p-6">
          <div className="form-section">
            <h3 className="section-title">Ajustar Cantidad</h3>
            <div className="input-row">
              <div className="form-group">
                <label>Boletos a cancelar (Mín {(original.A + 1)} - Máx {stock?.totalOriginal})</label>
                <div className="flex items-center gap-2">
                    <button 
                       type="button"
                       disabled={cantidadCancelar <= (original.A + 1)}
                       onClick={() => setCantidadCancelar(prev => prev - 1)}
                       className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        -
                    </button>
                    <input 
                      type="number" 
                      value={cantidadCancelar}
                      readOnly
                      className="modal-cancel-input text-center w-20 font-bold text-lg"
                    />
                    <button 
                       type="button"
                       disabled={stock && cantidadCancelar >= stock.totalOriginal}
                       onClick={() => setCantidadCancelar(prev => prev + 1)}
                       className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        +
                    </button>
                </div>
              </div>
              <div className="form-group">
                <label>% Penalización</label>
                <div className="relative">
                   <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={porcentajePenalizacion}
                    onChange={(e) => setPorcentajePenalizacion(parseFloat(e.target.value) || 0)}
                    className="modal-cancel-input w-full focus:ring-indigo-500"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Visual Area */}
          <div className="calc-summary bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
              <Calculator size={16} /> Recálculo de Devolución
            </div>
            
            <div className="calc-row">
              <span className="text-gray-500">Boletos Apartados (Sin costo)</span>
              <span className="font-medium">{calculo.canApartados}</span>
            </div>
            <div className="calc-row">
              <span className="text-indigo-600 font-medium">Boletos Pagados (Reembolsables)</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400">{calculo.canPagados}</span>
            </div>
            <div className="calc-row text-red-600">
              <span>Penalización ({porcentajePenalizacion}%)</span>
              <span>- ${calculo.montoPenalizacion.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="calc-row total text-indigo-800 dark:text-indigo-300 pt-2 mt-2 border-t border-indigo-100">
              <span className="font-black">Neto a Devolver</span>
              <span className="text-xl font-black">${calculo.montoReembolsoNeto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="form-section pt-4">
            <h3 className="section-title">Actualizar Cuenta Destino</h3>
            <div className="form-group">
              <label className="flex items-center gap-2"><Landmark size={14}/> CLABE Interbancaria</label>
              <input 
                type="text" 
                maxLength="18"
                value={datosBancarios.clabe}
                onChange={(e) => setDatosBancarios({...datosBancarios, clabe: e.target.value.replace(/\D/g, '')})}
                className="modal-cancel-input"
                required
              />
            </div>
            <div className="input-row">
              <div className="form-group">
                <label className="flex items-center gap-2"><Landmark size={14}/> Banco</label>
                <input 
                  type="text" 
                  value={datosBancarios.banco}
                  onChange={(e) => setDatosBancarios({...datosBancarios, banco: e.target.value})}
                  className="modal-cancel-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="flex items-center gap-2"><User size={14}/> Titular</label>
                <input 
                  type="text" 
                  value={datosBancarios.titular}
                  onChange={(e) => setDatosBancarios({...datosBancarios, titular: e.target.value})}
                  className="modal-cancel-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section pt-2">
             <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100">
                <Info size={16} className="text-blue-500" />
                <p className="text-[10px] text-blue-700 dark:text-blue-300">
                   El límite máximo ({stock?.totalOriginal}) considera los {invitado ? (invitado.cantidad_boletos || invitado.catidadPedido || 0) : "-"} boletos que aún conserva el graduado.
                </p>
             </div>
          </div>
        </form>

        <div className="modal-cancel-footer bg-gray-50 dark:bg-transparent border-t border-gray-100 dark:border-gray-800">
          <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition" disabled={loading}>
            Cerrar
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="px-6 py-2 font-bold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-emerald-600 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
