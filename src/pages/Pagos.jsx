import React, { useState, useEffect, useCallback } from "react";
import "../styles/pages/Pagos.css";
import EstadoPendiente from "../assets/recursos/EstadoPendiente.svg";
import EstadoAprobado from "../assets/recursos/EstadoAprobado.svg";
import EstadoParcial from "../assets/recursos/EstadoParcial.svg";
import DetalleFacturas from "../components/Pagos/DetalleFacturas";
import eventService from "../services/eventService";
import { useSelectedEvent } from "../contexts/SelectedEventContext";
import { useSignalRPagos } from "../hooks/useSignalRPagos";
import { useNotifications } from "../contexts/NotificationContext";

export default function Pagos({ darkMode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState(null);
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { eventoActual } = useSelectedEvent();
  const { showSuccess } = useNotifications();

  // Función para cargar deudas del evento
  const cargarDeudas = useCallback(async () => {
    console.log('🔄 [cargarDeudas] Iniciando carga...');
    console.log('🔄 [cargarDeudas] Evento actual ID:', eventoActual?.id);
    
    if (!eventoActual?.id) {
      console.warn('⚠️ [cargarDeudas] No hay evento seleccionado');
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('🔄 [cargarDeudas] Llamando a API con evento:', eventoActual.id);
    const resultado = await eventService.getEventDebts(eventoActual.id);
    
    if (resultado.success) {
      console.log('✅ [cargarDeudas] Deudas recibidas:', resultado.data.deudas?.length || 0);
      console.log('✅ [cargarDeudas] Datos:', resultado.data.deudas);
      setDeudas(resultado.data.deudas || []);
    } else {
      console.error("❌ [cargarDeudas] Error al cargar deudas:", resultado.error);
    }
    setLoading(false);
    console.log('🔄 [cargarDeudas] Carga completada');
  }, [eventoActual?.id]);

  // Callback para cuando se complete un pago
  const handlePagoCompletado = useCallback((data) => {
    console.log('💰 [Pagos] Pago completado recibido:', data);
    console.log('💰 [Pagos] Evento ID actual:', eventoActual?.id);
    console.log('💰 [Pagos] Ejecutando cargarDeudas...');
    
    // Mostrar notificación
    showSuccess(
      `Pago completado: ${data.asistente?.nombre || 'Asistente'}`,
      { duration: 5000 }
    );

    // Recargar las deudas
    cargarDeudas();
  }, [showSuccess, cargarDeudas, eventoActual?.id]);

  // Hook de SignalR para pagos
  useSignalRPagos(handlePagoCompletado);

  // Cargar deudas del evento al montar o cambiar evento
  useEffect(() => {
    cargarDeudas();
  }, [cargarDeudas]);

  // Filtrar deudas por búsqueda
  const deudasFiltradas = deudas.filter((deuda) =>
    deuda.asistente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstado = (estado) => {
    if (estado === "Pendiente")
      return (
        <span className="flex items-center gap-2">
          <img src={EstadoPendiente} alt="Estado Pendiente" className="w-4 h-4" /> <span className="text-gray-800 dark:text-gray-200 font-medium">Pendiente</span>
          {/* <AlertCircle size={16} /> Pendiente */}
        </span>
      );
    if (estado === "Aprobado")
      return (
        <span className="flex items-center gap-2">
          <img src={EstadoAprobado} alt="Estado Aprobado" className="w-4 h-4" />
          {/* <CheckCircle size={16} />*/} <span className="text-gray-800 dark:text-gray-200 font-medium">Aprobado</span> 
        </span>
      );
    if (estado === "Parcial")
      return (
        <span className="flex items-center gap-2">
          <img src={EstadoParcial} alt="Estado Parcial" className="w-4 h-4" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Parcial</span>
          {/* 
          <XCircle size={16} /> Parcial */}
        </span>
      );
  };

  const getBarraColor = (progreso) => {
    if (!progreso || !progreso.color) return "#6fcf97";
    return progreso.color;
  };

  const abrirModal = (deuda) => {
    setSelectedDeuda(deuda);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-casal mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando deudas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pagos-container bg-white dark:bg-[#1e1e1e] rounded-3xl ${darkMode ? "dark" : ""}`}>
      <div className="pagos-header">
        <div className="pagos-info">
          <h2 className="pagos-titulo">Módulo de pagos</h2>
          <p className="pagos-subtitulo">
            Seguimiento de pagos de asistentes mediante{" "}
            <span className="text-[#246370] dark:text-[#72B7A4] font-semibold">tabla de pagos</span>
          </p>
        </div>

        <div className="pagos-actions">
          <div className="buscar-wrapper">
            <input 
              type="text" 
              placeholder="Buscar asistente" 
              className="buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-csv">Exportar en CSV</button>
        </div>
      </div>

      <div className="pagos-tabla">
        <div className="pagos-encabezados dark:text-gray-200">
          <div>Asistente</div>
          <div>Progreso</div>
          <div>Total pagado</div>
          <div>Estado</div>
          <div>Acción</div>
        </div>

        {deudasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "No se encontraron resultados" : "No hay deudas registradas"}
            </p>
          </div>
        ) : (
          deudasFiltradas.map((deuda) => {
            const porcentaje = deuda.progreso.porcentaje;
            return (
              <div 
                key={deuda.deuda_id} 
                className="pagos-fila rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => abrirModal(deuda)}
              >
                <div className="col flex items-center" data-label="Asistente">
                  <span className="nombre">{deuda.asistente.nombre_completo}</span>
                </div>

                <div className="col flex items-center" data-label="Progreso">
                  <div className="barra-progreso w-4/5">
                    <div
                      className="barra-fill"
                      style={{
                        width: `${porcentaje}%`,
                        background: getBarraColor(deuda.progreso),
                      }}
                    ></div>
                  </div>
                </div>

                <div className="col flex items-center" data-label="Total pagado">
                  {deuda.financiero.total_pagado}
                </div>

                <div className="col flex items-center" data-label="Estado">
                  {getEstado(deuda.estado.texto)}
                </div>

                <div className="col flex items-center" data-label="Acción">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModal(deuda);
                    }}
                    className="btn-accion btn-historial"
                  >
                    Ver facturas
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Detalle de Facturas */}
      <DetalleFacturas
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDeuda(null);
        }}
        deuda={selectedDeuda}
      />
    </div>
  );
}
