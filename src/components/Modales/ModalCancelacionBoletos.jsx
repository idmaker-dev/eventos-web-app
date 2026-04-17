import React, { useState, useMemo, useEffect } from "react";
import { X, Ticket, Calculator, Banknote, Landmark, User, AlertCircle, Loader2 } from "lucide-react";
import "../../styles/components/ModalCancelacionBoletos.css";
import eventService from "../../services/eventService";
import { useNotifications } from "../../contexts/NotificationContext";
import { useSelectedEvent } from "../../contexts/SelectedEventContext";

export default function ModalCancelacionBoletos({ 
  open, 
  onClose, 
  deuda, 
  onSuccess 
}) {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  // Form States
  const [cantidadCancelar, setCantidadCancelar] = useState(1);
  const [porcentajePenalizacion, setPorcentajePenalizacion] = useState(0);
  const [datosBancarios, setDatosBancarios] = useState({
    clabe: "",
    banco: "",
    titular: ""
  });

  const { eventoActual } = useSelectedEvent();
  const [cancelaciones, setCancelaciones] = useState([]);

  // Cargar historial y limpiar estados
  useEffect(() => {
    if (open) {
      // Limpiar estados cada vez que se abre
      setCantidadCancelar(1);
      setPorcentajePenalizacion(0);
      setDatosBancarios({ clabe: "", banco: "", titular: "" });
      
      if (deuda?.invitado_id) {
        const fetchCancelaciones = async () => {
          setFetchingData(true);
          try {
            const res = await eventService.getCancelacionesPorInvitado(deuda.invitado_id);
            if (res.success) {
              setCancelaciones(res.data);
            }
          } finally {
            setFetchingData(false);
          }
        };
        fetchCancelaciones();
      }
    } else {
      // Limpiar estados AL CERRAR para asegurar que la próxima vez sea transparente
      setCancelaciones([]);
      setCantidadCancelar(1);
      setPorcentajePenalizacion(0);
    }
  }, [open, deuda?.invitado_id]);

  // Base Data from Deuda
  const stats = useMemo(() => {
    if (!deuda || !open) return null;
    
    // Obtención segura de valores limpiando símbolos de moneda
    const cleanNumber = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      return parseFloat(String(val).replace(/[^0-9.-]+/g,"")) || 0;
    };

    const valorUnitario = cleanNumber(eventoActual?.costo);
    const montoTotal = cleanNumber(deuda.pago?.monto_total ?? deuda.financiero?.monto_total ?? deuda.detalle?.montoTotal);
    const montoPendiente = cleanNumber(deuda.pago?.monto_pendiente ?? deuda.financiero?.monto_pendiente);
    
    // El monto pagado es estrictamente la resta de total y pendiente
    const montoPagadoActual = Math.round((montoTotal - montoPendiente) * 100) / 100;

    // --- NUEVA LÓGICA OBLIGATORIA (Análisis por Factura) ---
    let totalPagadosDesdeFacturas = 0;

    (deuda.facturas || []).forEach(f => {
      const mf = cleanNumber(f.monto_total);
      const mp = cleanNumber(f.monto_pagado);

      // 1. Boletos por factura
      // 2. Boletos pagados (floor para solo contar boletos cubiertos al 100%)
      const boletosPagados = valorUnitario > 0 ? Math.floor(mp / valorUnitario) : 0;
      
      totalPagadosDesdeFacturas += boletosPagados;
    });

    // 3. Estado Final Real
    // El campo cantidad_boletos ya refleja las cancelaciones en el back-end
    const boletosTotalesActuales = parseInt(deuda.asistente?.cantidad_boletos ?? deuda.detalle?.boletosTotales) || 0;

    const boletosPagados = Math.min(totalPagadosDesdeFacturas, boletosTotalesActuales);
    const boletosApartados = Math.max(0, boletosTotalesActuales - boletosPagados);

    return {
      montoTotal,
      montoPagadoActual,
      valorUnitario,
      boletosPagados,
      boletosApartados,
      cantidadBoletosTotal: boletosTotalesActuales
    };
  }, [deuda, eventoActual, cancelaciones, open]);

  // Dynamic Calculations
  const calculo = useMemo(() => {
    if (!stats) return null;

    const n = Number(cantidadCancelar) || 0;
    const pPercent = Number(porcentajePenalizacion) || 0;

    // Lógica: Primero cancelamos los apartados (sin costo)
    const canApartados = Math.min(n, stats.boletosApartados);
    const canPagados = Math.max(0, n - canApartados);

    const montoBrutoPagados = canPagados * stats.valorUnitario;
    const montoPenalizacion = montoBrutoPagados * (pPercent / 100);
    const montoReembolsoNeto = montoBrutoPagados - montoPenalizacion;

    return {
      canApartados,
      canPagados,
      montoBrutoPagados,
      montoPenalizacion,
      montoReembolsoNeto
    };
  }, [stats, cantidadCancelar, porcentajePenalizacion]);

  // Validation
  const isValid = useMemo(() => {
    const n = Number(cantidadCancelar);
    return (
      n > 0 && 
      n <= (stats?.cantidadBoletosTotal || 0) &&
      datosBancarios.clabe.length >= 10 &&
      datosBancarios.banco.trim() !== "" &&
      datosBancarios.titular.trim() !== ""
    );
  }, [cantidadCancelar, stats, datosBancarios]);

  if (!open || !deuda) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    if (calculo.canPagados < 1) {
      showError("Para solicitar una cancelación debe haber al menos 1 boleto pagado. Para ajustar solo apartados, use el control de boletos estándar.");
      return;
    }

    setLoading(true);
    try {
      const response = await eventService.solicitarCancelacion({
        id_invitado: deuda.invitado_id, 
        id_evento: deuda.evento_id, 
        cantidad_cancelar: cantidadCancelar,
        porcentaje_penalizacion: porcentajePenalizacion,
        datos_bancarios: datosBancarios,
        detalles_calculo: {
          boletos_sin_costo: calculo.canApartados,
          boletos_con_penalizacion: calculo.canPagados,
          monto_penalizacion: calculo.montoPenalizacion,
          monto_reembolso_neto: calculo.montoReembolsoNeto,
          valor_unitario: stats.valorUnitario
        },
        responsable: localStorage.getItem("userName") || "Admin",
        nombre_asistente: deuda.detalle?.nombreAsistente || deuda.cliente?.nombre,
        nombre_evento: deuda.detalle?.nombreEvento || ""
      });

      if (response.success) {
        showSuccess(response.message || "Cancelación registrada");
        
        // --- CAMBIO CLAVE: Esperar a que los datos se actualicen antes de cerrar ---
        if (onSuccess) {
          await onSuccess();
        }
        
        onClose();
      } else {
        showError(response.error);
      }
    } catch (error) {
      showError("Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-cancel-overlay">
      <div className="modal-cancel-container animate-fade-in relative overflow-hidden">
        {/* Overlay de carga inicial */}
        {fetchingData && (
          <div className="absolute inset-0 z-50 bg-white/80 dark:bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-[#206a73] animate-spin mb-2" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Actualizando información...</p>
          </div>
        )}

        {/* Header */}
        <div className="modal-cancel-header">
          <h2 className="modal-cancel-title">
            <Ticket className="text-[#206a73]" /> Cancelar Boletos
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition" disabled={loading}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Relevant Info Panel */}
        <div className="modal-info-grid">
          <div className="info-card">
            <span className="info-label">🎟️ Boletos Apartados</span>
            <span className="info-value">{stats.boletosApartados}</span>
          </div>
          <div className="info-card">
            <span className="info-label">💰 Boletos Pagados</span>
            <span className="info-value">{stats.boletosPagados}</span>
          </div>
          <div className="info-card">
            <span className="info-label">💵 Monto Total Pagado</span>
            <span className="info-value">${stats.montoPagadoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="info-card">
            <span className="info-label">🏷️ Valor Unitario</span>
            <span className="info-value">${stats.valorUnitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-cancel-body">
          {/* Inputs Section */}
          <div className="form-section">
            <h3 className="section-title">Parámetros de Cancelación</h3>
            <div className="input-row">
              <div className="form-group">
                <label>Cantidad a cancelar</label>
                <input 
                  type="number" 
                  min="1" 
                  max={stats.cantidadBoletosTotal}
                  value={cantidadCancelar}
                  onChange={(e) => setCantidadCancelar(parseInt(e.target.value) || 0)}
                  className="modal-cancel-input"
                  required
                />
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
                    className="modal-cancel-input w-full"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advertencia de Boletos Pagados */}
          {calculo.canPagados < 1 && cantidadCancelar > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 mb-4">
              <AlertCircle size={18} className="text-red-600 shrink-0" />
              <p className="text-xs text-red-800 dark:text-red-200 leading-tight">
                <strong>Atención:</strong> La cantidad seleccionada solo cubre boletos <strong>apartados</strong>. Una devolución requiere cancelar al menos 1 boleto <strong>pagado</strong>.
              </p>
            </div>
          )}

          {/* Calculator Section */}
          <div className="calc-summary">
            <div className="flex items-center gap-2 mb-2 text-[#742a2a] font-bold text-sm">
              <Calculator size={16} /> Pre-visualización Dinámica
            </div>
            
            <p className="calc-text">
              Se cancelarán <strong>{calculo.canApartados}</strong> boletos sin costo (apartados) 
              {calculo.canPagados > 0 && (
                <> y <strong>{calculo.canPagados}</strong> boletos con penalización (pagados).</>
              )}
            </p>

            {calculo.canPagados > 0 && (
              <>
                <div className="calc-row">
                  <span>Subtotal pagados ({calculo.canPagados} x ${stats.valorUnitario.toFixed(2)})</span>
                  <span>${calculo.montoBrutoPagados.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="calc-row text-red-600">
                  <span>Penalización ({porcentajePenalizacion}%)</span>
                  <span>- ${calculo.montoPenalizacion.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            <div className="calc-row total">
              <span>Monto neto a reembolsar</span>
              <span>${calculo.montoReembolsoNeto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Bank Info Section */}
          <div className="form-section">
            <h3 className="section-title">Datos Destino de Reembolso</h3>
            <div className="form-group">
              <label className="flex items-center gap-2"><Landmark size={14}/> CLABE Interbancaria (18 dígitos)</label>
              <input 
                type="text" 
                maxLength="18"
                placeholder="000000000000000000"
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
                  placeholder="Ej: BBVA, Banamex..."
                  value={datosBancarios.banco}
                  onChange={(e) => setDatosBancarios({...datosBancarios, banco: e.target.value})}
                  className="modal-cancel-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="flex items-center gap-2"><User size={14}/> Nombre del Titular</label>
                <input 
                  type="text" 
                  placeholder=""
                  value={datosBancarios.titular}
                  onChange={(e) => setDatosBancarios({...datosBancarios, titular: e.target.value})}
                  className="modal-cancel-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
            <AlertCircle size={18} className="text-yellow-600 shrink-0" />
            <p className="text-[11px] text-yellow-800 dark:text-yellow-200 leading-tight">
              Esta acción reducirá la cantidad de boletos del graduado y generará una solicitud de reembolso pendiente. 
              <strong> La deuda no se verá reflejada como reducida en los tableros hasta que se confirme la devolución.</strong>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="modal-cancel-footer">
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-cancel-modal secondary"
            disabled={loading}
          >
            Cerrar
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={!isValid || loading || fetchingData}
            className="btn-cancel-modal primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Procesando...
              </>
            ) : (
              "Solicitar Cancelación"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
