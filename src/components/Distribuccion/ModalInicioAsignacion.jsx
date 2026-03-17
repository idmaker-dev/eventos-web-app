import React, { useState, useEffect } from "react";
import { X, Monitor, Paintbrush, RotateCw, Loader2, Calendar, Users, Download } from "lucide-react";
import ModalConfiguracionTurnos from "../Turnos/ModalConfiguracionTurnos";
import ModalOrdenManualTurnos from "../Turnos/ModalOrdenManualTurnos";
import turnosService from "../../services/turnosService";
import { useNotifications } from "../../contexts/NotificationContext";

export default function ModalInicioAsignacion({
  isOpen,
  onClose,
  direccionEvento,
  configuraciones = [],
  tieneLayoutAsignado = false,
  layoutActual = null,
  isLoading = false,
  onIniciar,
  eventoId = null, // Nuevo prop para turnos
}) {
  const { showSuccess, showError } = useNotifications();
  const [seleccion, setSeleccion] = useState(null);
  const [configuracionSeleccionada, setConfiguracionSeleccionada] = useState(null);
  
  // Estado para turnos
  const [showConfiguracionTurnos, setShowConfiguracionTurnos] = useState(false);
  const [showOrdenManualTurnos, setShowOrdenManualTurnos] = useState(false);
  const [configuracionTurnos, setConfiguracionTurnos] = useState(null);
  const [loadingTurnos, setLoadingTurnos] = useState(false);

  /**
   * Cargar configuración de turnos si existe
   */
  const cargarConfiguracionTurnos = React.useCallback(async () => {
    if (!eventoId) return;
    
    setLoadingTurnos(true);
    try {
      const response = await turnosService.obtenerConfiguracion(eventoId);
      if (response.success && response.data) {
        setConfiguracionTurnos(response.data);
      } else {
        setConfiguracionTurnos(null);
      }
    } catch (error) {
      console.error('Error al cargar configuración de turnos:', error);
      setConfiguracionTurnos(null);
    } finally {
      setLoadingTurnos(false);
    }
  }, [eventoId]);

  useEffect(() => {
    if (isOpen && eventoId && tieneLayoutAsignado) {
      cargarConfiguracionTurnos();
    }
  }, [isOpen, eventoId, tieneLayoutAsignado, cargarConfiguracionTurnos]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSeleccion(null);
    setConfiguracionSeleccionada(null);
    onClose();
  };

  const tieneConfiguraciones = configuraciones.length > 0;
  const tieneConfiguracionTurnos = configuracionTurnos !== null && configuracionTurnos?.estado !== 'ELIMINADO';
  
  console.log("🎭 ModalInicioAsignacion - configuraciones recibidas:", configuraciones);
  console.log("📊 tieneConfiguraciones:", tieneConfiguraciones, "length:", configuraciones.length);
  console.log("🎟️ Configuración de turnos:", configuracionTurnos);

  /**
   * Generar turnos manualmente (cuando ya existe configuración)
   * Ahora abre el modal de orden manual
   */
  const handleGenerarTurnos = async () => {
    if (!eventoId) {
      showError("Error: No se encontró el ID del evento");
      return;
    }

    // Abrir modal de orden manual en lugar de generar directamente
    setShowOrdenManualTurnos(true);
  };

  /**
   * Descargar Excel con relación de turnos
   */
  const handleDescargarExcel = async () => {
    if (!eventoId) {
      showError("Error: No se encontró el ID del evento");
      return;
    }

    setLoadingTurnos(true);
    try {
      const result = await turnosService.descargarExcelTurnos(eventoId);
      if (result.success) {
        showSuccess("Excel descargado exitosamente");
      } else {
        showError(result.error || "Error al descargar Excel");
      }
    } catch (error) {
      showError("Error inesperado al descargar Excel");
    } finally {
      setLoadingTurnos(false);
    }
  };

  const handleContinuar = () => {
    // Usuario recurrente - tiene layout asignado
    if (tieneLayoutAsignado) {
      if (seleccion === "monitor") {
        onIniciar({
          modo: "monitor",
        });
      } else if (seleccion === "personalizar") {
        onIniciar({
          modo: "personalizar",
        });
      } else if (seleccion === "reseleccionar") {
        // Resetear y mostrar opciones de selección
        setSeleccion(null);
        setConfiguracionSeleccionada(null);
        // Cambiar el flujo a modo primera vez
        return;
      } else if (seleccion === "configurar-turnos") {
        setShowConfiguracionTurnos(true);
      } else if (seleccion === "monitorear-selecciones") {
        onIniciar({
          modo: "monitorear-selecciones",
        });
      }
    } 
    // Primera vez - seleccionar configuración
    else {
      if (configuracionSeleccionada) {
        onIniciar({
          modo: "seleccionar",
          configuracionId: configuracionSeleccionada.id,
        });
      }
    }
  };

  const handleConfiguracionTurnosClose = async (saved) => {
    setShowConfiguracionTurnos(false);
    if (saved) {
      // Recargar configuración de turnos
      await cargarConfiguracionTurnos();
      showSuccess('Configuración de turnos actualizada');
    }
  };

  const handleOrdenManualTurnosClose = async (turnosGenerados) => {
    setShowOrdenManualTurnos(false);
    if (turnosGenerados) {
      // Recargar configuración de turnos
      await cargarConfiguracionTurnos();
    }
  };

  const puedeEjecutar = () => {
    if (tieneLayoutAsignado) {
      return !!seleccion;
    } else {
      return !!configuracionSeleccionada;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Configurar Módulo de Asignación
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Lugar del evento
            </h3>
            <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {direccionEvento}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-casal" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando...</p>
            </div>
          ) : tieneLayoutAsignado ? (
            /* Usuario recurrente - Ya tiene layout */
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <h4 className="text-green-800 dark:text-green-300 font-semibold mb-2">
                  ✅ Layout ya configurado
                </h4>
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Este evento ya tiene un layout asignado: <strong>{layoutActual?.configuracion_lugar_base_nombre || "Layout personalizado"}</strong>
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  ¿Qué deseas hacer?
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => setSeleccion("monitor")}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                      seleccion === "monitor"
                        ? "border-casal bg-casal/10"
                        : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="w-8 h-8 text-casal" />
                      <div>
                        <h5 className="font-semibold text-gray-800 dark:text-white">
                          Ver Asignaciones (Monitor)
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Monitorear asignaciones en tiempo real (solo lectura)
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSeleccion("personalizar")}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                      seleccion === "personalizar"
                        ? "border-casal bg-casal/10"
                        : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Paintbrush className="w-8 h-8 text-casal" />
                      <div>
                        <h5 className="font-semibold text-gray-800 dark:text-white">
                          Personalizar Layout
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Editar y personalizar el diseño del salón
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSeleccion("reseleccionar")}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                      seleccion === "reseleccionar"
                        ? "border-casal bg-casal/10"
                        : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RotateCw className="w-8 h-8 text-casal" />
                      <div>
                        <h5 className="font-semibold text-gray-800 dark:text-white">
                          Seleccionar Otro Layout
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cambiar a una configuración diferente
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Separador */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      Sistema de Turnos
                    </h4>
                    {loadingTurnos ? (
                      <div className="text-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-casal" />
                        <p className="mt-2 text-xs text-gray-500">Cargando...</p>
                      </div>
                    ) : tieneConfiguracionTurnos ? (
                      // Ya existe configuración de turnos
                      <>
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-3">
                          <p className="text-blue-600 dark:text-blue-400 text-sm">
                            ✓ Sistema de turnos configurado
                          </p>
                        </div>
                        
                        <button
                          onClick={() => setSeleccion("monitorear-selecciones")}
                          className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                            seleccion === "monitorear-selecciones"
                              ? "border-casal bg-casal/10"
                              : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-casal" />
                            <div>
                              <h5 className="font-semibold text-gray-800 dark:text-white">
                                Monitorear Selecciones
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Ver el proceso de selección de mesas por turnos
                              </p>
                            </div>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => setSeleccion("configurar-turnos")}
                          className={`w-full mt-2 p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                            seleccion === "configurar-turnos"
                              ? "border-casal bg-casal/10"
                              : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-casal" />
                            <div>
                              <h5 className="font-semibold text-gray-800 dark:text-white">
                                Reconfigurar Sistema de Turnos
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Modificar configuración de turnos y períodos de selección
                              </p>
                            </div>
                          </div>
                        </button>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                          <button
                            onClick={handleGenerarTurnos}
                            disabled={loadingTurnos}
                            className="w-full p-3 border-2 border-[#246370] text-[#246370] dark:border-[#2a9d8f] dark:text-[#2a9d8f] rounded-lg text-sm hover:bg-[#246370]/10 dark:hover:bg-[#2a9d8f]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                          >
                            {loadingTurnos ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Procesando...
                              </>
                            ) : (
                              <>
                                <RotateCw className="w-4 h-4" />
                                Generar Turnos Ahora
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={handleDescargarExcel}
                            disabled={loadingTurnos}
                            className="w-full p-3 bg-[#246370] text-white dark:bg-[#2a9d8f] rounded-lg text-sm hover:bg-[#1e4d58] dark:hover:bg-[#238276] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                          >
                            {loadingTurnos ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Descargando...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Descargar Excel de Turnos
                              </>
                            )}
                          </button>
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                            Elige entre generación automática o manual
                          </p>
                        </div>
                      </>
                    ) : (
                      // No hay configuración de turnos
                      <>
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-3">
                          <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                            Sistema de turnos no configurado
                          </p>
                        </div>
                        
                        <button
                          onClick={() => setSeleccion("configurar-turnos")}
                          className={`w-full p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                            seleccion === "configurar-turnos"
                              ? "border-casal bg-casal/10"
                              : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-casal" />
                            <div>
                              <h5 className="font-semibold text-gray-800 dark:text-white">
                                Configurar Proceso de Selección
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Configurar turnos para que los graduados seleccionen sus mesas
                              </p>
                            </div>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : !tieneConfiguraciones ? (
            /* Sin configuraciones - Redirigir a crear */
            <div className="text-center space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">
                  No hay configuraciones disponibles
                </h4>
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  Este lugar aún no tiene configuraciones de layout guardadas. 
                  Debes crear una desde el módulo de "Lugares" antes de asignarla a un evento.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Cerrar
              </button>
            </div>
          ) : (
            /* Primera vez - Seleccionar configuración */
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">
                  Primera vez - Selecciona una configuración
                </h4>
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  Selecciona una de las configuraciones disponibles del lugar para asignarla a este evento.
                </p>
              </div>

              <div>
                <h5 className="font-semibold mb-3 text-gray-800 dark:text-white">
                  Configuraciones disponibles:
                </h5>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {configuraciones.map((config) => (
                    <button
                      key={config.id}
                      onClick={() => setConfiguracionSeleccionada(config)}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                        configuracionSeleccionada?.id === config.id
                          ? "border-casal bg-casal/10"
                          : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h6 className="font-semibold text-gray-800 dark:text-white">
                            {config.nombre}
                          </h6>
                          {config.descripcion && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {config.descripcion}
                            </p>
                          )}
                          <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>📊 {config.totalMesas || 0} mesas</span>
                            <span>📐 {config.elementos?.length || 0} elementos</span>
                          </div>
                        </div>
                        {configuracionSeleccionada?.id === config.id && (
                          <div className="ml-3">
                            <div className="w-6 h-6 bg-casal rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleContinuar}
            disabled={!puedeEjecutar()}
            className="px-6 py-2 bg-casal hover:bg-casal/80 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
          >
            Continuar
          </button>
        </div>
      </div>

      {/* Modal de Configuración de Turnos */}
      {showConfiguracionTurnos && (
        <ModalConfiguracionTurnos
          isOpen={showConfiguracionTurnos}
          onClose={handleConfiguracionTurnosClose}
          eventoId={eventoId}
          configuracionExistente={configuracionTurnos}
        />
      )}

      {/* Modal de Orden Manual de Turnos */}
      {showOrdenManualTurnos && (
        <ModalOrdenManualTurnos
          isOpen={showOrdenManualTurnos}
          onClose={handleOrdenManualTurnosClose}
          eventoId={eventoId}
        />
      )}
    </div>
  );
}
