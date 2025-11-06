import React, { useState, useEffect } from "react";
import { X, Paintbrush, Loader2, AlertCircle, Pencil } from "lucide-react";
import { useLayouts } from "../../hooks/useLayouts";

/**
 * Modal para gestionar configuraciones de layouts de un lugar
 * Permite crear nuevas configuraciones o editar configuraciones existentes
 * NO incluye modo monitor (ese es solo para eventos)
 */
export default function ModalConfiguracionLugar({ 
  isOpen, 
  onClose, 
  lugar,
  onIniciar 
}) {
  const [tipoCreacion, setTipoCreacion] = useState(null);
  const [configuracionSeleccionada, setConfiguracionSeleccionada] = useState(null);

  // Hook para gestionar configuraciones del lugar
  const {
    configuraciones,
    isLoading,
    error,
    cargarConfiguraciones,
  } = useLayouts(lugar?.id);

  // Cargar configuraciones cuando se abre el modal
  useEffect(() => {
    if (isOpen && lugar?.id) {
      cargarConfiguraciones();
    }
  }, [isOpen, lugar?.id, cargarConfiguraciones]);

  // Resetear estado al abrir/cerrar modal
  useEffect(() => {
    if (!isOpen) {
      setTipoCreacion(null);
      setConfiguracionSeleccionada(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setTipoCreacion(null);
    setConfiguracionSeleccionada(null);
    onClose();
  };

  const tieneConfiguraciones = configuraciones.length > 0;

  const handleEditarConfiguracion = (config) => {
    onIniciar({
      modo: "editar",
      configuracion: config,
      lugar: lugar
    });
  };

  const handleCrearNuevo = () => {
    if (tipoCreacion === "desde-cero") {
      onIniciar({
        modo: "crear",
        tipoCreacion: "vacio",
        lugar: lugar
      });
    } else if (tipoCreacion === "usar-base" && configuracionSeleccionada) {
      onIniciar({
        modo: "crear",
        tipoCreacion: "basado",
        configuracionBase: configuracionSeleccionada,
        lugar: lugar
      });
    }
  };

  const puedeCrear = () => {
    if (tipoCreacion === "desde-cero") return true;
    if (tipoCreacion === "usar-base") return configuracionSeleccionada;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestionar Configuraciones de Layout
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del lugar */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              {lugar?.nombre}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {lugar?.direccion}
            </p>
          </div>

          {/* Estado de carga */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-casal" />
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Cargando configuraciones...
              </span>
            </div>
          )}

          {/* Error al cargar */}
          {error && !isLoading && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Error al cargar configuraciones</span>
              </div>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Contenido principal */}
          {!isLoading && !error && (
            <>
              {!tieneConfiguraciones ? (
                /* Sin configuraciones existentes - Crear directo */
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <h4 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">
                      Primera configuración para este lugar
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      No hay configuraciones creadas para este lugar. Se creará una nueva configuración vacía para comenzar el diseño.
                    </p>
                  </div>
                  <button
                    onClick={() => onIniciar({
                      modo: "crear",
                      tipoCreacion: "vacio",
                      lugar: lugar
                    })}
                    className="w-full bg-casal hover:bg-casal/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <Paintbrush className="w-5 h-5" />
                    Crear Nueva Configuración
                  </button>
                </div>
              ) : (
                /* Con configuraciones existentes */
                <div className="space-y-6">
                  {/* Lista de configuraciones existentes */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Configuraciones Existentes
                    </h4>
                    <div className="space-y-2">
                      {configuraciones.map((config) => (
                        <div
                          key={config.id}
                          className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-casal/50 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {config.nombre}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {config.descripcion || "Sin descripción"} • {config.totalMesas} mesas
                              </div>
                            </div>
                            <button
                              onClick={() => handleEditarConfiguracion(config)}
                              className="px-4 py-2 bg-casal hover:bg-casal/80 text-white rounded-lg transition-all duration-200 flex items-center gap-2 ml-4"
                            >
                              <Pencil className="w-4 h-4" />
                              Editar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        O crear una nueva
                      </span>
                    </div>
                  </div>

                  {/* Opciones para crear nueva configuración */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Crear Nueva Configuración
                    </h4>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setTipoCreacion("desde-cero");
                          setConfiguracionSeleccionada(null);
                        }}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                          tipoCreacion === "desde-cero"
                            ? "border-casal bg-casal/10"
                            : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                        }`}
                      >
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Empezar desde cero
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Configuración vacía con solo la mesa principal
                        </div>
                      </button>

                      <button
                        onClick={() => setTipoCreacion("usar-base")}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-all duration-200 ${
                          tipoCreacion === "usar-base"
                            ? "border-casal bg-casal/10"
                            : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                        }`}
                      >
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Usar diseño existente como base
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Copiar una configuración existente y modificarla
                        </div>
                      </button>
                    </div>

                    {/* Selector de configuración base */}
                    {tipoCreacion === "usar-base" && (
                      <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h6 className="font-semibold mb-3 text-gray-800 dark:text-white">
                          Selecciona la configuración base:
                        </h6>
                        <div className="space-y-2">
                          {configuraciones.map((config) => (
                            <button
                              key={config.id}
                              onClick={() => setConfiguracionSeleccionada(config)}
                              className={`w-full text-left p-3 border-2 rounded-lg transition-all duration-200 ${
                                configuracionSeleccionada?.id === config.id
                                  ? "border-casal bg-casal/10"
                                  : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                              }`}
                            >
                              <div className="font-medium text-sm text-gray-900 dark:text-white">
                                {config.nombre}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {config.totalMesas} mesas
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          {tieneConfiguraciones && tipoCreacion && (
            <button
              onClick={handleCrearNuevo}
              disabled={!puedeCrear() || isLoading}
              className="px-6 py-2 bg-casal hover:bg-casal/80 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200"
            >
              Crear Configuración
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
