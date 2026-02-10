import React, { useState, useEffect, useCallback } from "react";
import "../styles/pages/Pagos.css";
import EstadoPendiente from "../assets/recursos/EstadoPendiente.svg";
import EstadoAprobado from "../assets/recursos/EstadoAprobado.svg";
import EstadoParcial from "../assets/recursos/EstadoParcial.svg";
import DetalleFacturas from "../components/Pagos/DetalleFacturas";
import ModalExportarPagos from "../components/Pagos/ModalExportarPagos";
import eventService from "../services/eventService";
import { useSelectedEvent } from "../contexts/SelectedEventContext";
import { useSignalRPagos } from "../hooks/useSignalRPagos";
import { useNotifications } from "../contexts/NotificationContext";

export default function Pagos({ darkMode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExportarOpen, setModalExportarOpen] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState(null);
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { eventoActual } = useSelectedEvent();
  const { showSuccess, showError } = useNotifications();

  // Función para cargar deudas del evento
  const cargarDeudas = useCallback(async () => {
    console.log('🔄 [cargarDeudas] Iniciando carga...');
    console.log('🔄 [cargarDeudas] Evento actual ID:', eventoActual?.id);
    
    if (!eventoActual?.id) {
      console.warn('⚠️ [cargarDeudas] No hay evento seleccionado');
      setLoading(false);
      return null;
    }

    setLoading(true);
    console.log('🔄 [cargarDeudas] Llamando a API con evento:', eventoActual.id);
    const resultado = await eventService.getEventDebts(eventoActual.id);
    
    if (resultado.success) {
      console.log('✅ [cargarDeudas] Deudas recibidas:', resultado.data.deudas?.length || 0);
      console.log('✅ [cargarDeudas] Datos:', resultado.data.deudas);
      const deudasNuevas = resultado.data.deudas || [];
      setDeudas(deudasNuevas);
      setLoading(false);
      console.log('🔄 [cargarDeudas] Carga completada');
      return deudasNuevas;
    } else {
      console.error("❌ [cargarDeudas] Error al cargar deudas:", resultado.error);
      setLoading(false);
      return null;
    }
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

  // Función para manejar la exportación de pagos
  const handleExportar = async (fechaInicio, fechaFin) => {
    try {
      if (!eventoActual?.id) {
        showError("No hay evento seleccionado");
        return;
      }

      console.log("📊 Exportando pagos:", {
        evento: eventoActual.id,
        fechaInicio,
        fechaFin,
      });

      const resultado = await eventService.exportPaymentsByDateRange(
        eventoActual.id,
        fechaInicio,
        fechaFin
      );

      if (resultado.success) {
        // Crear un blob con los datos del CSV
        const blob = resultado.data;
        
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        
        // Generar nombre del archivo (soportar nombre_evento y nombre)
        const nombreEvento = (eventoActual.nombre_evento || eventoActual.nombre || eventoActual.id || 'evento')
          .replace(/[^a-z0-9]/gi, "_");
        link.download = `pagos_${nombreEvento}_${fechaInicio}_${fechaFin}.csv`;
        
        // Disparar la descarga
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showSuccess("Archivo CSV descargado exitosamente", { duration: 3000 });
      } else {
        showError(resultado.error || "Error al exportar pagos");
      }
    } catch (error) {
      console.error("Error exportando pagos:", error);
      showError("Error al exportar pagos");
    }
  };

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
          <button 
            className="btn-csv"
            onClick={() => setModalExportarOpen(true)}
          >
            Exportar en CSV
          </button>
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
        onBoletosActualizados={async () => {
          // Recargar las deudas cuando se actualicen los boletos
          console.log('🔄 [Pagos] Recargando deudas después de actualizar boletos...');
          const deudasActualizadas = await cargarDeudas();
          
          // Si hay deudas actualizadas y había una deuda seleccionada, actualizar el detalle
          if (deudasActualizadas && selectedDeuda) {
            console.log('🔄 [Pagos] Buscando deuda actualizada con ID:', selectedDeuda.deuda_id);
            const deudaActualizada = deudasActualizadas.find(
              d => d.deuda_id === selectedDeuda.deuda_id
            );
            
            if (deudaActualizada) {
              console.log('✅ [Pagos] Deuda actualizada encontrada, refrescando detalle');
              setSelectedDeuda(deudaActualizada);
            } else {
              console.warn('⚠️ [Pagos] No se encontró la deuda actualizada');
            }
          }
        }}
      />

      {/* Modal de Exportar Pagos */}
      <ModalExportarPagos
        isOpen={modalExportarOpen}
        onClose={() => setModalExportarOpen(false)}
        onExportar={handleExportar}
      />
    </div>
  );
}
