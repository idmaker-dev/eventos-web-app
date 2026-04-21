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
    let totalBoletosPagados = 0;
    let totalBoletosAbonados = 0;

    (deuda.facturas || []).forEach(f => {
      const mf = cleanNumber(f.monto_factura ?? f.monto_total);
      const mp = cleanNumber(f.monto_pagado);

      if (valorUnitario > 0) {
        // Unidades enteras pagadas al 100%
        const pagadosAlCien = Math.floor(mp / valorUnitario);
        totalBoletosPagados += pagadosAlCien;

        // Si hay remanente de pago pero no llega al siguiente entero, es un abonado
        const remanentePago = mp % valorUnitario;
        if (remanentePago > 0.01) { // Pequeño margen para errores de flotante
          totalBoletosAbonados += 1;
        }
      }
    });

    const boletosTotalesActuales = parseInt(deuda.asistente?.cantidad_boletos ?? deuda.detalle?.boletosTotales) || 0;

    const boletosPagados = Math.min(totalBoletosPagados, boletosTotalesActuales);
    const boletosAbonados = Math.min(totalBoletosAbonados, boletosTotalesActuales - boletosPagados);
    const boletosApartados = Math.max(0, boletosTotalesActuales - boletosPagados - boletosAbonados);

    return {
      montoTotal,
      montoPagadoActual,
      valorUnitario,
      boletosPagados,
      boletosAbonados,
      boletosApartados,
      cantidadBoletosTotal: boletosTotalesActuales
    };
  }, [deuda, eventoActual, cancelaciones, open]);

  // Dynamic Calculations
  const calculo = useMemo(() => {
    if (!stats) return null;

    const n = Number(cantidadCancelar) || 0;
    const pPercent = Number(porcentajePenalizacion) || 0;

    // LIFO (Last In First Out)
    // 1. Primero cancelamos los apartados (sin costo/penalización)
    const canApartados = Math.min(n, stats.boletosApartados);
    let remanente = n - canApartados;

    // 2. Luego los abonados (tienen penalización sobre el precio total)
    const canAbonados = Math.min(remanente, stats.boletosAbonados);
    remanente -= canAbonados;

    // 3. Por último los pagados (tienen penalización sobre el precio total)
    const canPagados = Math.min(remanente, stats.boletosPagados);

    // Los Abonados y Pagados entran en la bolsa de penalización
    const boletosConPenalizacion = canAbonados + canPagados;

    // Cálculo de montos (Prioridad: Apartados > Abonados > Pagados)
    let montoPagadoInvolucrado = 0;
    if (n > 0) {
      // 1. Descomponer todas las facturas en boletos individuales con su monto pagado real
      const todosLosBoletos = [];
      (deuda.facturas || []).forEach(f => {
        const mp = parseFloat(String(f.monto_pagado || 0).replace(/[^0-9.-]+/g,"")) || 0;
        const mt = parseFloat(String(f.monto_factura ?? f.monto_total ?? 0).replace(/[^0-9.-]+/g,"")) || 0;
        
        // Determinar cuántos boletos representa esta factura
        const numBoletosEnFactura = stats.valorUnitario > 0 ? Math.max(1, Math.round(mt / stats.valorUnitario)) : 1;
        
        const pagadosCount = stats.valorUnitario > 0 ? Math.floor(mp / stats.valorUnitario) : 0;
        const remanentePago = stats.valorUnitario > 0 ? (mp % stats.valorUnitario) : 0;
        const hasAbonado = remanentePago > 0.01;

        for (let i = 0; i < numBoletosEnFactura; i++) {
          let montoBoleto = 0;
          let tipoPriority = 1; // Apartado

          if (i < pagadosCount) {
            montoBoleto = stats.valorUnitario;
            tipoPriority = 3; // Pagado
          } else if (i === pagadosCount && hasAbonado) {
            montoBoleto = remanentePago;
            tipoPriority = 2; // Abonado
          } else {
            montoBoleto = 0;
            tipoPriority = 1; // Apartado
          }

          todosLosBoletos.push({
            monto: montoBoleto,
            prioridad: tipoPriority,
            numFactura: f.numero_factura || 0
          });
        }
      });

      // 1. Filtrar los boletos reales del invitado (Prioridad: Pagado > Abonado > Apartado)
      // Esto asegura que si hay boletos "fantasma" en las facturas, no se tomen en cuenta
      todosLosBoletos.sort((a, b) => b.prioridad - a.prioridad || b.numFactura - a.numFactura);
      const boletosRealesDelInvitado = todosLosBoletos.slice(0, stats.cantidadBoletosTotal);

      // 2. Ordenar para procedimiento de cancelación (Prioridad: Apartado > Abonado > Pagado)
      boletosRealesDelInvitado.sort((a, b) => a.prioridad - b.prioridad || b.numFactura - a.numFactura);

      // 3. Tomar los primeros n boletos a cancelar del conjunto real
      const boletosElegidos = boletosRealesDelInvitado.slice(0, n);
      montoPagadoInvolucrado = boletosElegidos.reduce((sum, b) => sum + b.monto, 0);
    }

    // Penalización sobre el COSTO DEL BOLETO (según req del usuario)
    const montoBrutoParaPenalizacion = boletosConPenalizacion * stats.valorUnitario;
    const montoPenalizacion = montoBrutoParaPenalizacion * (pPercent / 100);
    
    // El reembolso real es lo que el usuario PAGÓ menos la penalización aplicada
    const montoReembolsoNeto = Math.max(0, montoPagadoInvolucrado - montoPenalizacion);

    return {
      canApartados,
      canAbonados,
      canPagados,
      boletosConPenalizacion,
      montoPagadoInvolucrado,
      montoPenalizacion,
      montoReembolsoNeto
    };
  }, [stats, cantidadCancelar, porcentajePenalizacion]);

  // Validation
  const isValid = useMemo(() => {
    const n = Number(cantidadCancelar);
    const requiresBankInfo = (calculo?.boletosConPenalizacion || 0) > 0;

    return (
      n > 0 && 
      n <= (stats?.cantidadBoletosTotal || 0) &&
      (!requiresBankInfo || (
        datosBancarios.clabe.length >= 10 &&
        datosBancarios.banco.trim() !== "" &&
        datosBancarios.titular.trim() !== ""
      ))
    );
  }, [cantidadCancelar, stats, datosBancarios, calculo]);


  if (!open || !deuda) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    // Limpiar datos si no hay reembolso real al momento de guardar
    const isApartadosOnly = (calculo?.boletosConPenalizacion || 0) === 0;
    const finalPenalizacion = isApartadosOnly ? 0 : porcentajePenalizacion;
    const finalDatosBancarios = isApartadosOnly 
      ? { clabe: "", banco: "", titular: "" } 
      : datosBancarios;

    const payload = {
      id_invitado: deuda.invitado_id, 
      id_evento: deuda.evento_id, 
      cantidad_cancelar: cantidadCancelar,
      porcentaje_penalizacion: finalPenalizacion,
      datos_bancarios: finalDatosBancarios,
      detalles_calculo: {
        boletos_apartados: calculo.canApartados,
        boletos_abonados: calculo.canAbonados,
        boletos_pagados: calculo.canPagados,
        boletos_con_penalizacion: calculo.boletosConPenalizacion,
        monto_reembolso_bruto: calculo.montoPagadoInvolucrado,
        monto_penalizacion: isApartadosOnly ? 0 : calculo.montoPenalizacion,
        monto_reembolso_neto: isApartadosOnly ? 0 : calculo.montoReembolsoNeto,
        valor_unitario: stats.valorUnitario
      },
      responsable: localStorage.getItem("userName") || "Admin",
      nombre_asistente: deuda.detalle?.nombreAsistente || deuda.cliente?.nombre,
      nombre_evento: deuda.detalle?.nombreEvento || ""
    };

    console.log("DEBUG: Payload SolicitarCancelacion:", payload);

    try {
      const response = await eventService.solicitarCancelacion(payload);

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
            <span className="info-label">🎟️ Apartados</span>
            <span className="info-value">{stats.boletosApartados}</span>
          </div>
          <div className="info-card">
            <span className="info-label">🌓 Abonados</span>
            <span className="info-value">{stats.boletosAbonados}</span>
          </div>
          <div className="info-card">
            <span className="info-label">💰 Pagados</span>
            <span className="info-value">{stats.boletosPagados}</span>
          </div>
          <div className="info-card">
            <span className="info-label">💵 Monto Total Ya Pagado</span>
            <span className="info-value text-[#206a73]">${stats.montoPagadoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
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
              {calculo?.boletosConPenalizacion > 0 && (
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
              )}
            </div>
          </div>


          {/* Calculator Section */}
          <div className="calc-summary">
            <div className="flex items-center gap-2 mb-2 text-[#742a2a] font-bold text-sm">
              <Calculator size={16} /> Pre-visualización Dinámica
            </div>
            
            <p className="calc-text">
              Se cancelarán <strong>{calculo.canApartados}</strong> boletos sin pago (apartados) 
              {calculo.boletosConPenalizacion > 0 && (
                <> y <strong>{calculo.boletosConPenalizacion}</strong> boletos con penalización ({calculo.canAbonados} abonados y {calculo.canPagados} pagados).</>
              )}
            </p>

            {calculo.boletosConPenalizacion > 0 && (
              <>
                <div className="calc-row">
                  <span>Monto ya abonado/pagado involucrado</span>
                  <span>${calculo.montoPagadoInvolucrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="calc-row text-red-600">
                  <span>Penalización ({porcentajePenalizacion}% s/ costo total {calculo.boletosConPenalizacion} boletos)</span>
                  <span>- ${calculo.montoPenalizacion.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            <div className="calc-row total">
              <span>Monto neto a reembolsar</span>
              <span>${calculo.montoReembolsoNeto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Bank Info Section - Only if there is a refund */}
          {calculo?.boletosConPenalizacion > 0 && (
            <div className="form-section animate-fade-in">
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
          )}

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
