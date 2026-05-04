import React, { useState, useEffect, useCallback } from "react";
import "../styles/pages/Pagos.css";
import EstadoPendiente from "../assets/recursos/EstadoPendiente.svg";
import EstadoAprobado from "../assets/recursos/EstadoAprobado.svg";
import EstadoParcial from "../assets/recursos/EstadoParcial.svg";
import DetalleFacturas from "../components/Pagos/DetalleFacturas";
import ModalExportarPagos from "../components/Pagos/ModalExportarPagos";
import ModalCancelacionBoletos from "../components/Modales/ModalCancelacionBoletos";
import eventService from "../services/eventService";
import { useSelectedEvent } from "../contexts/SelectedEventContext";
import { useSignalRPagos } from "../hooks/useSignalRPagos";
import { useNotifications } from "../contexts/NotificationContext";
import { Trash2, TicketX } from "lucide-react";
import ConfirmDialog from "../components/Modales/ConfirmDialog";

export default function Pagos({ darkMode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExportarOpen, setModalExportarOpen] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState(null);
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFirma, setFilterFirma] = useState("todos"); // "todos", "firmado", "no_firmado"
  const { eventoActual } = useSelectedEvent();
  const { showSuccess, showError } = useNotifications();

  // Estados para eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invitadoToDelete, setInvitadoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para cancelación
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [deudaToCancel, setDeudaToCancel] = useState(null);

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
      
      const deudasRecibidas = resultado.data.deudas || [];
      
      // Deduplicar deudas basándose en una clave única (invitado_id + deuda_id)
      // Esto previene duplicados si la API devuelve el mismo registro varias veces
      const deudasDeduplicadas = [];
      const keysVistas = new Set();
      
      deudasRecibidas.forEach(deuda => {
        // Generar una clave única para identificar este registro específico
        const uniqueKey = `${deuda.invitado_id}-${deuda.deuda_id || 'no-deuda'}`;
        
        if (!keysVistas.has(uniqueKey)) {
          keysVistas.add(uniqueKey);
          deudasDeduplicadas.push(deuda);
        } else {
          console.warn(`⚠️ [cargarDeudas] Duplicado detectado y omitido: ${uniqueKey}`);
        }
      });

      console.log('✅ [cargarDeudas] Deudas después de deduplicar:', deudasDeduplicadas.length);
      setDeudas(deudasDeduplicadas);
      setLoading(false);
      console.log('🔄 [cargarDeudas] Carga completada');
      return deudasDeduplicadas;
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
      `Pago completado: ${data.asistente?.nombre || 'Graduado'}`,
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

  // Estado para descarga del reporte Excel
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Función para descargar el reporte Excel de pagos por alumno
  const handleDescargarReporte = async () => {
    if (!eventoActual?.id) {
      showError("No hay evento seleccionado");
      return;
    }
    setIsGeneratingReport(true);
    try {
      const resultado = await eventService.descargarReportePagosAlumnos(eventoActual.id);
      if (resultado.success) {
        const url = window.URL.createObjectURL(resultado.data);
        const link = document.createElement("a");
        link.href = url;
        const nombreEvento = (eventoActual.nombre_evento || eventoActual.nombre || eventoActual.id || "evento")
          .replace(/[^a-z0-9áéíóúüñ ]/gi, "_");
        const fecha = new Date().toISOString().split("T")[0];
        link.download = `reporte_pagos_${nombreEvento}_${fecha}.xlsx`.replace(/\s+/g, "_");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showSuccess("Reporte Excel descargado exitosamente", { duration: 3000 });
      } else {
        showError(resultado.error || "Error al generar el reporte");
      }
    } catch (error) {
      console.error("Error descargando reporte:", error);
      showError("Error al generar el reporte");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Función para eliminar un alumno
  const handleEliminarAlumno = async () => {
    if (!invitadoToDelete) return;

    try {
      setIsDeleting(true);
      const resultado = await eventService.deleteInvitadoAlumnos(invitadoToDelete.invitado_id);

      if (resultado.success) {
        showSuccess(resultado.message || "Graduado eliminado correctamente");
        setIsDeleteModalOpen(false);
        setInvitadoToDelete(null);
        // Recargar la lista
        cargarDeudas();
      } else {
        showError(resultado.error || "No se pudo eliminar al graduado");
      }
    } catch (error) {
      console.error("Error en handleEliminarAlumno:", error);
      showError("Ocurrió un error inesperado al eliminar");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrar deudas por búsqueda y firma de contrato con useMemo para mayor estabilidad
  const deudasFiltradas = React.useMemo(() => {
    console.log('🔍 [Pagos] Ejecutando filtrado...');
    return deudas.filter((deuda) => {
      const matchesSearch = (deuda.asistente?.nombre_completo || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      // Lógica de filtro de firma
      let matchesFirma = true;
      if (filterFirma === "firmado") {
        matchesFirma = deuda.asistente?.contrato_firmado === "Si";
      } else if (filterFirma === "no_firmado") {
        matchesFirma = deuda.asistente?.contrato_firmado === "No";
      }
      
      return matchesSearch && matchesFirma;
    });
  }, [deudas, searchTerm, filterFirma]);

  const getEstado = (estado) => {
    // Manejar estados de invitados sin deuda
    if (estado === "Sin contrato" || estado === "Pendiente de firma" || estado === "Cuestionario pendiente") {
      return (
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <span className="text-gray-800 dark:text-gray-200 font-medium">{estado}</span>
        </span>
      );
    }
    
    // Estados de deudas existentes
    if (estado === "Pendiente")
      return (
        <span className="flex items-center gap-2">
          <img src={EstadoPendiente} alt="Estado Pendiente" className="w-4 h-4" /> <span className="text-gray-800 dark:text-gray-200 font-medium">Pendiente</span>
        </span>
      );
    if (estado === "Aprobado")
      return (
        <span className="flex items-center gap-2">
          <img src={EstadoAprobado} alt="Estado Aprobado" className="w-4 h-4" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Aprobado</span> 
        </span>
      );
    if (estado === "Parcial")
      return (
        <span className="flex items-center gap-2">
          <img src={EstadoParcial} alt="Estado Parcial" className="w-4 h-4" />
          <span className="text-gray-800 dark:text-gray-200 font-medium">Parcial</span>
        </span>
      );
    
    // Estado por defecto
    return (
      <span className="flex items-center gap-2">
        <span className="text-gray-800 dark:text-gray-200 font-medium">{estado}</span>
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
            Seguimiento de pagos de graduados mediante{" "}
            <span className="text-[#246370] dark:text-[#72B7A4] font-semibold">tabla de pagos</span>
          </p>
        </div>

        <div className="pagos-actions">
          <div className="buscar-wrapper">
            <input 
              type="text" 
              placeholder="Buscar graduado" 
              className="buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filtro-firma-wrapper">
            <select 
              className="filtro-firma"
              value={filterFirma}
              onChange={(e) => setFilterFirma(e.target.value)}
            >
              <option value="todos">Todos los contratos</option>
              <option value="firmado">Contratos firmados</option>
              <option value="no_firmado">Sin firmar</option>
            </select>
          </div>

          <button 
            className="btn-csv"
            onClick={() => setModalExportarOpen(true)}
          >
            Exportar en CSV
          </button>

          <button
            className="btn-reporte-excel"
            onClick={handleDescargarReporte}
            disabled={isGeneratingReport}
            title="Descargar reporte completo por alumno en Excel"
          >
            {isGeneratingReport ? "Generando..." : "Reporte por Alumno"}
          </button>
        </div>
      </div>

      <div className="pagos-tabla">
        <div className="pagos-encabezados dark:text-gray-200">
          <div>Graduado</div>
          <div>Progreso</div>
          <div>Firma de contrato</div>
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
            // Usar una clave única que incluya invitado_id y deuda_id para evitar conflictos de keys
            const rowKey = `row-${deuda.invitado_id}-${deuda.deuda_id || 'pend'}`;
            
            return (
              <div 
                key={rowKey} 
                className="pagos-fila rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => abrirModal(deuda)}
              >
                <div className="col flex items-center" data-label="Graduado">
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

                <div className="col flex items-center" data-label="Firma de contrato">
                  {deuda.asistente.contrato_firmado}
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
                    disabled={!deuda.deuda_id}
                    title={!deuda.deuda_id ? "Este graduado aún no tiene facturas (contrato no firmado)" : "Ver facturas"}
                  >
                    {deuda.deuda_id ? "Ver facturas" : "Sin facturas"}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInvitadoToDelete(deuda);
                      setIsDeleteModalOpen(true);
                    }}
                    className="btn-accion btn-eliminar"
                    title="Eliminar graduado"
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeudaToCancel(deuda);
                      setIsCancelModalOpen(true);
                    }}
                    className="btn-accion btn-cancelar"
                    title="Cancelar boletos"
                  >
                    <TicketX size={18} color="#f97316" />
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

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDialog
        open={isDeleteModalOpen}
        title="Eliminar Graduado"
        message={
          <>
            ¿Estás seguro de que deseas eliminar a <strong>{invitadoToDelete?.asistente?.nombre_completo}</strong>? 
            <br />
            Esta acción <strong>no se puede deshacer</strong> y se eliminarán permanentemente todos sus datos asociados.
          </>
        }
        confirmLabel="Eliminar permanentemente"
        cancelLabel="Cancelar"
        variant="danger"
        loading={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setInvitadoToDelete(null);
          }
        }}
        onConfirm={handleEliminarAlumno}
      />

      {/* Modal de Cancelación de Boletos */}
      <ModalCancelacionBoletos
        open={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setDeudaToCancel(null);
        }}
        deuda={deudaToCancel}
        onSuccess={cargarDeudas}
      />
    </div>
  );
}
