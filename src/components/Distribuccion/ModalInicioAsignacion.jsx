import React, { useState } from "react";
import { X, Monitor, Paintbrush } from "lucide-react";

export default function ModalInicioAsignacion({
  isOpen,
  onClose,
  direccionEvento,
  salonesExistentes = [],
  onIniciar,
}) {
  const [seleccion, setSeleccion] = useState(null);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);
  const [tipoCreacion, setTipoCreacion] = useState(null);

  const salonesConMesas = salonesExistentes.filter((s) => s.totalMesas > 0);

  if (!isOpen) return null;

  const handleClose = () => {
    setSeleccion(null);
    setSalonSeleccionado(null);
    setTipoCreacion(null);
    onClose();
  };

  const tieneSalones = salonesExistentes.length > 0;

  const handleContinuar = () => {
    if (seleccion === "ver-vivo" && salonSeleccionado) {
      onIniciar({
        modo: "monitor",
        salon: salonSeleccionado,
        isLiveMode: true,
      });
    } else if (seleccion === "crear-nuevo" && salonSeleccionado) {
      onIniciar({
        modo: "crear",
        tipoCreacion: "basado",
        salonBase: salonSeleccionado,
        isLiveMode: false,
      });
    }
  };

  const puedeEjecutar = () => {
    if (seleccion === "ver-vivo") return !!salonSeleccionado;
    if (seleccion === "crear-nuevo") return !!salonSeleccionado;
    return false;
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
              Dirección del evento
            </h3>
            <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {direccionEvento}
            </p>
          </div>

          {!tieneSalones ? (
            /* Sin salones existentes - Crear directo */
            <div className="text-center space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">
                  Primera vez en esta dirección
                </h4>
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  No hay salones creados para esta dirección. Se creará un nuevo
                  salón vacío para comenzar el diseño.
                </p>
              </div>
              <button
                onClick={() =>
                  onIniciar({
                    modo: "crear",
                    tipoCreacion: "vacio",
                    isLiveMode: false,
                  })
                }
                className="w-full bg-casal hover:bg-casal/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
              >
                <Paintbrush className="w-5 h-5 " />
                Crear Nuevo Salón
              </button>
            </div>
          ) : (
            /* Con salones existentes - Mostrar opciones */
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  ¿Qué deseas hacer?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setSeleccion("ver-vivo");
                      setTipoCreacion(null);
                      setSalonSeleccionado(null);
                    }}
                    disabled={salonesConMesas.length === 0}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      seleccion === "ver-vivo"
                        ? "border-casal bg-casal/10 text-casal"
                        : "border-gray-200 dark:border-gray-600 hover:border-casal/50 dark:text-gray-100"
                    }`}
                  >
                    <Monitor className="w-8 h-8 mx-auto mb-3" />
                    <h5 className="font-semibold mb-2">
                      Ver Movimientos en Vivo
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monitorear asignaciones existentes sin poder editar
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setSeleccion("crear-nuevo");
                      setSalonSeleccionado(null);
                    }}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      seleccion === "crear-nuevo"
                        ? "border-casal bg-casal/10 text-casal"
                        : "border-gray-200 dark:border-gray-600 hover:border-casal/50 dark:text-gray-100"
                    }`}
                  >
                    <Paintbrush className="w-8 h-8 mx-auto mb-3" />
                    <h5 className="font-semibold mb-2">
                      Seleccionar un Diseño
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Diseñar un nuevo salón o usar uno existente como base
                    </p>
                  </button>
                </div>
              </div>

              {seleccion === "ver-vivo" && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h5 className="font-semibold mb-3 text-gray-800 dark:text-white">
                    Selecciona el salón a monitorear:
                  </h5>
                  <div className="space-y-2">
                    {salonesExistentes.map((salon) => (
                      <button
                        key={salon.id}
                        onClick={() => setSalonSeleccionado(salon)}
                        className={`w-full text-left p-3 border rounded-lg transition-all duration-200 ${
                          salonSeleccionado?.id === salon.id
                            ? "border-casal bg-casal/10 text-casal"
                            : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                        }`}
                      >
                        <div className="font-medium dark:text-white">
                          {salon.nombre}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {salon.descripcion} • {salon.totalMesas} mesas
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {seleccion === "crear-nuevo" && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                  <h5 className="font-semibold text-gray-800 dark:text-white mb-2">
                    Selecciona el salón base:
                  </h5>
                  <div className="space-y-2">
                    {salonesExistentes.map((salon) => (
                      <button
                        key={salon.id}
                        onClick={() => setSalonSeleccionado(salon)}
                        className={`w-full text-left p-2 border rounded transition-all duration-200 ${
                          salonSeleccionado?.id === salon.id
                            ? "border-casal bg-casal/10 text-casal"
                            : "border-gray-200 dark:border-gray-600 hover:border-casal/50"
                        }`}
                      >
                        <div className="font-medium  dark:text-gray-100">
                          {salon.nombre}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {salon.totalMesas} mesas
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
