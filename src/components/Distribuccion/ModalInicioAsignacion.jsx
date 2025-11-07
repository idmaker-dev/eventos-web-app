import React, { useState } from "react";
import { X, Monitor, Paintbrush, RotateCw, Loader2 } from "lucide-react";

export default function ModalInicioAsignacion({
  isOpen,
  onClose,
  direccionEvento,
  configuraciones = [],
  tieneLayoutAsignado = false,
  layoutActual = null,
  isLoading = false,
  onIniciar,
}) {
  const [seleccion, setSeleccion] = useState(null);
  const [configuracionSeleccionada, setConfiguracionSeleccionada] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSeleccion(null);
    setConfiguracionSeleccionada(null);
    onClose();
  };

  const tieneConfiguraciones = configuraciones.length > 0;
  
  console.log("🎭 ModalInicioAsignacion - configuraciones recibidas:", configuraciones);
  console.log("📊 tieneConfiguraciones:", tieneConfiguraciones, "length:", configuraciones.length);

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
                            <span>📊 {config.total_mesas || 0} mesas</span>
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
    </div>
  );
}
