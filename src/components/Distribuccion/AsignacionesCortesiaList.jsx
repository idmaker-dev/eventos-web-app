import React, { useState } from "react";
import { Trash2, Users, Utensils, AlertTriangle, X } from "lucide-react";
import { useBoletosCortesia } from "../../hooks/useBoletosCortesia";
import EnvConfig from "../../utils/config";

/**
 * Componente para mostrar y gestionar las asignaciones de boletos de cortesía
 * Muestra lista de mesas asignadas con opción de eliminar individualmente o todas
 * 
 * @param {Object} props
 * @param {string} props.eventoId - ID del evento
 * @param {Array} props.asignaciones - Array de asignaciones de cortesía
 * @param {function} props.onAsignacionesActualizadas - Callback cuando se eliminan asignaciones
 */
export default function AsignacionesCortesiaList({
  eventoId,
  asignaciones = [],
  onAsignacionesActualizadas,
}) {
  const { eliminarMesa, limpiarAsignaciones } = useBoletosCortesia(eventoId);
  
  const [mesaEliminando, setMesaEliminando] = useState(null);
  const [mostrarConfirmacionLimpiar, setMostrarConfirmacionLimpiar] = useState(false);
  const [eliminandoTodas, setEliminandoTodas] = useState(false);

  /**
   * Eliminar una mesa específica
   */
  const handleEliminarMesa = async (mesa) => {
    if (EnvConfig.DEBUG_MODE) {
      console.log("🗑️ Eliminando mesa:", mesa);
    }

    setMesaEliminando(mesa.mesa_id);

    try {
      const exito = await eliminarMesa(mesa.mesa_id);

      if (exito) {
        if (onAsignacionesActualizadas) {
          onAsignacionesActualizadas();
        }
      }
    } catch (error) {
      console.error("Error al eliminar mesa:", error);
    } finally {
      setMesaEliminando(null);
    }
  };

  /**
   * Limpiar todas las asignaciones
   */
  const handleLimpiarAsignaciones = async () => {
    if (EnvConfig.DEBUG_MODE) {
      console.log("🗑️ Limpiando todas las asignaciones de cortesía");
    }

    setEliminandoTodas(true);

    try {
      const exito = await limpiarAsignaciones();

      if (exito) {
        setMostrarConfirmacionLimpiar(false);
        if (onAsignacionesActualizadas) {
          onAsignacionesActualizadas();
        }
      }
    } catch (error) {
      console.error("Error al limpiar asignaciones:", error);
    } finally {
      setEliminandoTodas(false);
    }
  };

  // Si no hay asignaciones, no mostrar nada
  if (!asignaciones || asignaciones.length === 0) {
    return null;
  }

  // Calcular totales
  const totalBoletos = asignaciones.reduce(
    (sum, mesa) => sum + (mesa.asientos_seleccionados?.length || 0),
    0
  );

  const totalMesas = asignaciones.length;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Asignaciones de Cortesía
          </h3>
          <p className="text-sm text-gray-600">
            {totalBoletos} boletos en {totalMesas} mesa{totalMesas !== 1 ? "s" : ""}
          </p>
        </div>
        
        <button
          onClick={() => setMostrarConfirmacionLimpiar(true)}
          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
          <span className="text-sm font-medium">Limpiar Todo</span>
        </button>
      </div>

      {/* Lista de mesas asignadas */}
      <div className="space-y-2">
        {asignaciones.map((mesa) => {
          const numBoletos = mesa.asientos_seleccionados?.length || 0;
          const eliminando = mesaEliminando === mesa.mesa_id;

          return (
            <div
              key={mesa.mesa_id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-gray-900">
                    Mesa {mesa.numero_mesa || mesa.mesa_id}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{numBoletos} boleto{numBoletos !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Vista previa de menús */}
                {mesa.resumen_menus && Object.keys(mesa.resumen_menus).length > 0 && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Utensils size={14} />
                    <span>
                      {Object.entries(mesa.resumen_menus)
                        .map(([tipo, cantidad]) => `${tipo}: ${cantidad}`)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Botón eliminar */}
              <button
                onClick={() => handleEliminarMesa(mesa)}
                disabled={eliminando}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {eliminando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                    <span className="text-xs">Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span className="text-xs">Eliminar</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de confirmación para limpiar todo */}
      {mostrarConfirmacionLimpiar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Encabezado del modal */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Limpiar Todas las Asignaciones
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMostrarConfirmacionLimpiar(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={eliminandoTodas}
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del modal */}
            <div className="mb-6">
              <p className="text-gray-700">
                Estás a punto de eliminar <strong>{totalBoletos} boletos</strong> de{" "}
                <strong>{totalMesas} mesa{totalMesas !== 1 ? "s" : ""}</strong>.
              </p>
              <p className="text-gray-700 mt-2">
                ¿Deseas continuar?
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfirmacionLimpiar(false)}
                disabled={eliminandoTodas}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleLimpiarAsignaciones}
                disabled={eliminandoTodas}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {eliminandoTodas ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>Eliminar Todo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
