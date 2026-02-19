import React, { useState, useEffect } from "react";
import { Save, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useBoletosCortesia } from "../../hooks/useBoletosCortesia";
import EnvConfig from "../../utils/config";

/**
 * Componente para configurar boletos de cortesía del evento
 * Permite al admin establecer la cantidad total de boletos de cortesía disponibles
 * 
 * @param {Object} props
 * @param {string} props.eventoId - ID del evento
 * @param {function} props.onConfigured - Callback cuando se configura exitosamente
 */
export default function ConfiguradorBoletosCortesia({ eventoId, onConfigured }) {
  // Hook de boletos de cortesía
  const {
    estado,
    isLoading,
    error,
    isConfiguring,
    fetchEstado,
    configurar,
    clearError,
  } = useBoletosCortesia(eventoId);

  // Estados locales del componente
  const [cantidad, setCantidad] = useState(0);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Cargar estado inicial cuando cambia el eventoId
  useEffect(() => {
    if (eventoId) {
      fetchEstado();
    }
  }, [eventoId, fetchEstado]);

  // Actualizar cantidad local cuando se carga el estado
  useEffect(() => {
    if (estado.boletos_cortesia > 0) {
      setCantidad(estado.boletos_cortesia);
    }
  }, [estado.boletos_cortesia]);

  /**
   * Manejar cambio en el input de cantidad
   */
  const handleCantidadChange = (e) => {
    const valor = parseInt(e.target.value, 10);
    if (!isNaN(valor) && valor >= 0) {
      setCantidad(valor);
      clearError();
      setMensajeExito("");
    }
  };

  /**
   * Manejar guardado de configuración
   */
  const handleGuardar = async () => {
    if (EnvConfig.DEBUG_MODE) {
      console.log("💾 Guardando configuración boletos cortesía:", { cantidad });
    }

    clearError();
    setMensajeExito("");

    const exito = await configurar(cantidad);

    if (exito) {
      setMensajeExito("Configuración guardada exitosamente");
      setMostrarFormulario(false);

      // Notificar al componente padre
      if (onConfigured) {
        onConfigured();
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setMensajeExito("");
      }, 3000);
    }
  };

  /**
   * Manejar cancelación de edición
   */
  const handleCancelar = () => {
    setCantidad(estado.boletos_cortesia);
    clearError();
    setMensajeExito("");
    setMostrarFormulario(false);
  };

  /**
   * Validar si se puede reducir la cantidad
   */
  const puedeReducir = cantidad >= estado.boletos_usados;
  const cambioValido = cantidad !== estado.boletos_cortesia && puedeReducir;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center space-x-2 py-4">
        <Loader2 className="w-5 h-5 animate-spin text-casal" />
        <span className="text-gray-600 dark:text-gray-400 text-sm">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Mensajes de error y éxito */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {mensajeExito && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800">{mensajeExito}</p>
            </div>
          </div>
        )}

        {/* Vista de solo lectura */}
        {!mostrarFormulario && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {estado.boletos_cortesia}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Usados</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {estado.boletos_usados}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Disponibles</p>
                <p className="text-xl font-bold text-casal">
                  {estado.boletos_disponibles}
                </p>
              </div>
            </div>

            <button
              onClick={() => setMostrarFormulario(true)}
              className="w-full py-2 px-4 bg-casal hover:bg-casal/90 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Configurar Cantidad
            </button>
          </div>
        )}

        {/* Formulario de edición */}
        {mostrarFormulario && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cantidad Total de Boletos de Cortesía
              </label>
              <input
                type="number"
                min="0"
                value={cantidad}
                onChange={handleCantidadChange}
                disabled={isConfiguring}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-casal focus:border-casal disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

          {/* Estado actual */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Boletos usados actualmente:</span>
              <span className="font-semibold text-gray-900">
                {estado.boletos_usados}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nueva cantidad disponible:</span>
              <span
                className={`font-semibold ${
                  puedeReducir ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.max(0, cantidad - estado.boletos_usados)}
              </span>
            </div>
          </div>

          {/* Advertencia si intenta reducir por debajo de los usados */}
          {!puedeReducir && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">
                  No puedes reducir la cantidad por debajo de los boletos ya
                  asignados ({estado.boletos_usados}). Primero debes liberar
                  algunas asignaciones.
                </p>
              </div>
            </div>
          )}

            {/* Botones de acción */}
            <div className="flex space-x-3">
              <button
                onClick={handleGuardar}
                disabled={isConfiguring || !cambioValido}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  cambioValido
                    ? "bg-casal hover:bg-casal/90 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isConfiguring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCancelar}
                disabled={isConfiguring}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
