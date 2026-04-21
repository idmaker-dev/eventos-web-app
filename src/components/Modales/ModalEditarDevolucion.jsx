import React, { useState, useMemo, useEffect } from "react";
import { X, Ticket, Calculator, Banknote, Landmark, User, AlertCircle, Loader2, Info } from "lucide-react";
import "../../styles/components/ModalCancelacionBoletos.css";
import eventService from "../../services/eventService";
import { useNotifications } from "../../contexts/NotificationContext";

export default function ModalEditarDevolucion({ open, onClose, cancelacion, onSuccess }) {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  // Graduate Stock and Debt State
  const [invitado, setInvitado] = useState(null);
  const [deuda, setDeuda] = useState(null);
  
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

      // Fetch current graduate stock and debt
      const loadGuestData = async () => {
        try {
          const [resGuest, resDebt] = await Promise.all([
            eventService.getInvitadoById(cancelacion.id_invitado),
            eventService.getDeudasByInvitado(cancelacion.id_invitado)
          ]);
          
          if (resGuest.success) setInvitado(resGuest.data);
          
          if (resDebt.success && resDebt.data) {
            // La API devuelve { deudas: [...], total: N } — extraemos el array correcto
            const listaDeudas = resDebt.data.deudas ?? (Array.isArray(resDebt.data) ? resDebt.data : [resDebt.data]);
            const deudaEvento = listaDeudas.find(d => d.id_evento === cancelacion.id_evento) || listaDeudas[0];
            setDeuda(deudaEvento);
          }
        } catch (err) {
          console.error("Error loading edit data:", err);
        } finally {
          setFetchingData(false);
        }
      };
      loadGuestData();
    }
  }, [open, cancelacion]);

  // Stats: MISMA lógica que ModalCancelacionBoletos, adaptado para edición.
  // cantidadBoletosTotal = stock actual del graduado + boletos en la cancelación actual.
  const stats = useMemo(() => {
    if (!invitado || !cancelacion) return null;

    const cleanNumber = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      return parseFloat(String(val).replace(/[^0-9.-]+/g, "")) || 0;
    };

    // valorUnitario: viene del snapshot. Si no hay, fallback a 0.
    const valorUnitario = cleanNumber(cancelacion.detalles_calculo?.valor_unitario);
    if (valorUnitario <= 0) return null; // Sin precio no hay cálculo posible

    // Pool total: boletos actuales del graduado + los que están en esta cancelación
    const canGraduado = Number(invitado.cantidad_boletos || invitado.catidadPedido || 0);
    const canEnCancelacion = Number(cancelacion.cantidad_cancelar || 0);
    const cantidadBoletosTotal = canGraduado + canEnCancelacion;

    // --- Análisis por factura (idéntico a ModalCancelacionBoletos) ---
    let totalBoletosPagados = 0;
    let totalBoletosAbonados = 0;

    if (deuda?.facturas?.length > 0) {
      deuda.facturas.forEach(f => {
        const mp = cleanNumber(f.monto_pagado);
        if (valorUnitario > 0) {
          // Unidades enteras pagadas al 100%
          const pagadosAlCien = Math.floor(mp / valorUnitario);
          totalBoletosPagados += pagadosAlCien;
          // Si hay remanente de pago, es un abonado
          const remanentePago = mp % valorUnitario;
          if (remanentePago > 0.01) {
            totalBoletosAbonados += 1;
          }
        }
      });
    } else {
      // Fallback: usar snapshot si la deuda no cargó
      totalBoletosPagados = Number(cancelacion.detalles_calculo?.boletos_pagados || 0);
      totalBoletosAbonados = Number(cancelacion.detalles_calculo?.boletos_abonados || 0);
    }

    const boletosPagados  = Math.min(totalBoletosPagados, cantidadBoletosTotal);
    const boletosAbonados = Math.min(totalBoletosAbonados, cantidadBoletosTotal - boletosPagados);
    const boletosApartados = Math.max(0, cantidadBoletosTotal - boletosPagados - boletosAbonados);


    return {
      valorUnitario,
      boletosPagados,
      boletosAbonados,
      boletosApartados,
      cantidadBoletosTotal,
      // Para el calculo de monto involucrado de abonados usamos las facturas
      facturas: deuda?.facturas || []
    };
  }, [invitado, deuda, cancelacion]);

  // calculo: MISMA lógica que ModalCancelacionBoletos
  const calculo = useMemo(() => {
    if (!stats) return null;

    const n = Number(cantidadCancelar) || 0;
    const pPercent = Number(porcentajePenalizacion) || 0;

    // Prioridad: Apartados > Abonados > Pagados
    const canApartados = Math.min(n, stats.boletosApartados);
    let remanente = n - canApartados;
    const canAbonados = Math.min(remanente, stats.boletosAbonados);
    remanente -= canAbonados;
    const canPagados = Math.min(remanente, stats.boletosPagados);

    const boletosConPenalizacion = canAbonados + canPagados;

    // Monto involucrado: recorrer facturas en orden de prioridad (idéntico a ModalCancelacionBoletos)
    // Cálculo de montos (Prioridad: Apartados > Abonados > Pagados)
    let montoPagadoInvolucrado = 0;
    if (n > 0) {
      // 1. Descomponer todas las facturas en boletos individuales con su monto pagado real
      const todosLosBoletos = [];
      const facturasAProcesar = stats.facturas || [];

      if (facturasAProcesar.length > 0) {
        facturasAProcesar.forEach(f => {
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
      } else {
        // Fallback: usar snapshot si no hay facturas cargadas
        const snapMontoBruto = Number(cancelacion.detalles_calculo?.monto_reembolso_bruto || 0);
        const snapPagados    = Number(cancelacion.detalles_calculo?.boletos_pagados || 0);
        const montoAbonado   = Math.max(0, snapMontoBruto - snapPagados * stats.valorUnitario);
        
        // Crear boletos ficticios según snapshot para poder cancelar proporcionalmente
        for(let i=0; i<stats.boletosPagados; i++) todosLosBoletos.push({ monto: stats.valorUnitario, prioridad: 3, numFactura: 0 });
        if (stats.boletosAbonados > 0) todosLosBoletos.push({ monto: montoAbonado, prioridad: 2, numFactura: 0 });
        for(let i=0; i<stats.boletosApartados; i++) todosLosBoletos.push({ monto: 0, prioridad: 1, numFactura: 0 });
      }

      // 1. Filtrar los boletos reales del invitado (Prioridad: Pagado > Abonado > Apartado)
      // Esto asegura que si hay boletos "fantasma" en las facturas, no se tomen en cuenta
      todosLosBoletos.sort((a, b) => b.prioridad - a.prioridad || b.numFactura - a.numFactura);
      const boletosRealesDelInvitado = todosLosBoletos.slice(0, stats.cantidadBoletosTotal);

      // 2. Ordenar para procedimiento de cancelación (Prioridad: Apartado > Abonado > Pagado)
      boletosRealesDelInvitado.sort((a, b) => a.prioridad - b.prioridad || b.numFactura - a.numFactura);

      // 3. Tomar los primeros n boletos del subconjunto real
      const boletosElegidos = boletosRealesDelInvitado.slice(0, n);
      montoPagadoInvolucrado = boletosElegidos.reduce((sum, b) => sum + b.monto, 0);
    }

    const montoPenalizacion  = (boletosConPenalizacion * stats.valorUnitario) * (pPercent / 100);
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
  }, [stats, cantidadCancelar, porcentajePenalizacion, cancelacion]);


  const isValid = useMemo(() => {
    if (!stats || !calculo) return false;
    const n = Number(cantidadCancelar);
    const requiresBankInfo = (calculo?.boletosConPenalizacion || 0) > 0;

    return (
      n >= 1 &&
      n <= stats.cantidadBoletosTotal && 
      (!requiresBankInfo || (
        datosBancarios.clabe.length >= 10 &&
        datosBancarios.banco.trim() !== "" &&
        datosBancarios.titular.trim() !== ""
      ))
    );
  }, [cantidadCancelar, stats, calculo, datosBancarios]);


  if (!open || !cancelacion) return null;

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
    };

    console.log("DEBUG: Payload EditarDevalucion:", payload);

    try {
      const response = await eventService.editarCancelacion(cancelacion.id, payload);

      if (response.success) {
        showSuccess(response.message || "Cambios guardados con éxito");
        if (onSuccess) {
           setTimeout(() => onSuccess(), 800);
        }
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
                 ${(stats?.valorUnitario || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-cancel-body p-6">
          <div className="form-section">
            <h3 className="section-title">Ajustar Cantidad</h3>
            <div className="input-row">
              <div className="form-group">
                <label>Boletos a cancelar (Máx {stats?.cantidadBoletosTotal || 0})</label>
                <div className="flex items-center gap-2">
                    <button 
                       type="button"
                       disabled={cantidadCancelar <= 1}
                       onClick={() => setCantidadCancelar(prev => Math.max(1, prev - 1))}
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
                       disabled={stats && cantidadCancelar >= stats.cantidadBoletosTotal}
                       onClick={() => setCantidadCancelar(prev => prev + 1)}
                       className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        +
                    </button>
                </div>
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
                      className="modal-cancel-input w-full focus:ring-indigo-500"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calculator Visual Area */}
          <div className="calc-summary bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
              <Calculator size={16} /> Recálculo de Devolución
            </div>
            
            <div className="calc-row">
              <span className="text-gray-500">Boletos Apartados (Sin costo)</span>
              <span className="font-medium">{calculo?.canApartados ?? 0}</span>
            </div>
            <div className="calc-row">
              <span className="text-indigo-600 font-medium italic">Boletos Abonados</span>
              <span className="font-bold text-indigo-600">{calculo?.canAbonados ?? 0}</span>
            </div>
            <div className="calc-row">
              <span className="text-indigo-600 font-medium">Boletos Pagados (Reembolsables)</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400">{calculo?.canPagados ?? 0}</span>
            </div>
            <div className="calc-row pt-1 border-t border-indigo-100/30 mt-1">
              <span className="text-[11px] text-gray-500">Monto ya abonado/pagado involucrado</span>
              <span className="text-[11px] font-bold text-gray-700">${(calculo?.montoPagadoInvolucrado ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="calc-row text-red-600">
              <span>Penalización ({porcentajePenalizacion}% s/ costo total)</span>
              <span>- ${(calculo?.montoPenalizacion ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="calc-row total text-indigo-800 dark:text-indigo-300 pt-2 mt-2 border-t border-indigo-100">
              <span className="font-black">Neto a Devolver</span>
              <span className="text-xl font-black">${(calculo?.montoReembolsoNeto ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Bank Account Information - Only if there is a refund */}
          {calculo?.boletosConPenalizacion > 0 && (
            <div className="form-section pt-4 animate-fade-in">
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
          )}

          <div className="form-section pt-2">
             <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100">
                <Info size={16} className="text-blue-500" />
                <p className="text-[10px] text-blue-700 dark:text-blue-300">
                   El límite máximo ({stats?.cantidadBoletosTotal || 0}) considera los boletos restantes y los que se están editando en esta solicitud.
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
