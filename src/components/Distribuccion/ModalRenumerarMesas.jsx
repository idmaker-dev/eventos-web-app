import React, { useState } from "react";
import { X, RefreshCw } from "lucide-react";

export default function ModalRenumerarMesas({ isOpen, onClose, onConfirm }) {
  const [direccion, setDireccion] = useState("horizontal-derecha-abajo");

  if (!isOpen) return null;

  const handleConfirmar = () => {
    onConfirm(direccion);
    onClose();
  };

  const opcionesDireccion = [
    {
      value: "horizontal-derecha-abajo",
      label: "→ Horizontal: Izquierda a Derecha, Arriba hacia Abajo",
      description: "Mesa 1 arriba-izquierda, avanza hacia la derecha, luego baja",
      ejemplo: "1→2→3\n4→5→6\n7→8→9"
    },
    {
      value: "horizontal-izquierda-abajo",
      label: "← Horizontal: Derecha a Izquierda, Arriba hacia Abajo",
      description: "Mesa 1 arriba-derecha, avanza hacia la izquierda, luego baja",
      ejemplo: "3→2→1\n6→5→4\n9→8→7"
    },
    {
      value: "horizontal-derecha-arriba",
      label: "↑→ Horizontal: Izquierda a Derecha, Abajo hacia Arriba",
      description: "Mesa 1 abajo-izquierda, avanza hacia la derecha, luego sube",
      ejemplo: "7→8→9\n4→5→6\n1→2→3"
    },
    {
      value: "horizontal-izquierda-arriba",
      label: "↑← Horizontal: Derecha a Izquierda, Abajo hacia Arriba",
      description: "Mesa 1 abajo-derecha, avanza hacia la izquierda, luego sube",
      ejemplo: "9→8→7\n6→5→4\n3→2→1"
    },
    {
      value: "vertical-abajo-derecha",
      label: "↓ Vertical: Arriba a Abajo, Izquierda hacia Derecha",
      description: "Mesa 1 arriba-izquierda, avanza hacia abajo, luego a la derecha",
      ejemplo: "1→4→7\n↓ ↓ ↓\n2→5→8\n↓ ↓ ↓\n3→6→9"
    },
    {
      value: "vertical-abajo-izquierda",
      label: "↓← Vertical: Arriba a Abajo, Derecha hacia Izquierda",
      description: "Mesa 1 arriba-derecha, avanza hacia abajo, luego a la izquierda",
      ejemplo: "7→4→1\n↓ ↓ ↓\n8→5→2\n↓ ↓ ↓\n9→6→3"
    },
    {
      value: "vertical-arriba-derecha",
      label: "↑ Vertical: Abajo a Arriba, Izquierda hacia Derecha",
      description: "Mesa 1 abajo-izquierda, avanza hacia arriba, luego a la derecha",
      ejemplo: "3→6→9\n↑ ↑ ↑\n2→5→8\n↑ ↑ ↑\n1→4→7"
    },
    {
      value: "vertical-arriba-izquierda",
      label: "↑← Vertical: Abajo a Arriba, Derecha hacia Izquierda",
      description: "Mesa 1 abajo-derecha, avanza hacia arriba, luego a la izquierda",
      ejemplo: "9→6→3\n↑ ↑ ↑\n8→5→2\n↑ ↑ ↑\n7→4→1"
    },
    {
      value: "zigzag-horizontal-derecha-abajo",
      label: "⚡ Zigzag Horizontal: Izquierda→Derecha (Arriba→Abajo)",
      description: "Empieza arriba-izquierda, alterna dirección en cada fila hacia abajo",
      ejemplo: "1→2→3\n6←5←4\n7→8→9"
    },
    {
      value: "zigzag-horizontal-izquierda-abajo",
      label: "⚡ Zigzag Horizontal: Derecha→Izquierda (Arriba→Abajo)",
      description: "Empieza arriba-derecha, alterna dirección en cada fila hacia abajo",
      ejemplo: "3→2→1\n4→5→6\n9→8→7"
    },
    {
      value: "zigzag-horizontal-derecha-arriba",
      label: "⚡ Zigzag Horizontal: Izquierda→Derecha (Abajo→Arriba)",
      description: "Empieza abajo-izquierda, alterna dirección en cada fila hacia arriba",
      ejemplo: "7→8→9\n6←5←4\n1→2→3"
    },
    {
      value: "zigzag-horizontal-izquierda-arriba",
      label: "⚡ Zigzag Horizontal: Derecha→Izquierda (Abajo→Arriba)",
      description: "Empieza abajo-derecha, alterna dirección en cada fila hacia arriba",
      ejemplo: "9→8→7\n4→5→6\n3→2→1"
    },
    {
      value: "zigzag-vertical-abajo-derecha",
      label: "⚡ Zigzag Vertical: Arriba→Abajo (Izquierda→Derecha)",
      description: "Empieza arriba-izquierda, alterna dirección en cada columna hacia derecha",
      ejemplo: "1 6 7\n↓ ↑ ↓\n2 5 8\n↓ ↑ ↓\n3→4 9"
    },
    {
      value: "zigzag-vertical-abajo-izquierda",
      label: "⚡ Zigzag Vertical: Arriba→Abajo (Derecha→Izquierda)",
      description: "Empieza arriba-derecha, alterna dirección en cada columna hacia izquierda",
      ejemplo: "7 6 1\n↓ ↑ ↓\n8 5 2\n↓ ↑ ↓\n9←4 3"
    },
    {
      value: "zigzag-vertical-arriba-derecha",
      label: "⚡ Zigzag Vertical: Abajo→Arriba (Izquierda→Derecha)",
      description: "Empieza abajo-izquierda, alterna dirección en cada columna hacia derecha",
      ejemplo: "3→4 9\n↑ ↓ ↑\n2 5 8\n↑ ↓ ↑\n1 6 7"
    },
    {
      value: "zigzag-vertical-arriba-izquierda",
      label: "⚡ Zigzag Vertical: Abajo→Arriba (Derecha→Izquierda)",
      description: "Empieza abajo-derecha, alterna dirección en cada columna hacia izquierda",
      ejemplo: "9←4 3\n↑ ↓ ↑\n8 5 2\n↑ ↓ ↑\n7 6 1"
    },
    {
      value: "espiral-horaria",
      label: "🌀 Espiral Horaria",
      description: "Mesa 1 en el centro, espiral hacia afuera en sentido horario",
      ejemplo: "7→8→9\n6 1→2\n5←4←3"
    },
    {
      value: "espiral-antihoraria",
      label: "🌀 Espiral Antihoraria",
      description: "Mesa 1 en el centro, espiral hacia afuera en sentido antihorario",
      ejemplo: "9→8→7\n2←1 6\n3→4→5"
    }
  ];

  const opcionSeleccionada = opcionesDireccion.find(op => op.value === direccion);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Renumerar Mesas
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cambia el orden de numeración manteniendo las posiciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ℹ️ ¿Cómo funciona?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Esta función renumerará todas las mesas existentes respetando sus posiciones físicas actuales.
              El orden de numeración cambiará según la dirección que elijas, pero las mesas permanecerán
              en sus ubicaciones actuales en el salón.
            </p>
          </div>

          {/* Selección de dirección */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Selecciona la dirección de numeración:
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {opcionesDireccion.map((opcion) => (
                <button
                  key={opcion.value}
                  onClick={() => setDireccion(opcion.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    direccion === opcion.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        {opcion.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {opcion.description}
                      </div>
                    </div>
                    {direccion === opcion.value && (
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs whitespace-pre text-gray-700 dark:text-gray-300">
                    {opcion.ejemplo}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Vista previa de la dirección seleccionada */}
          {opcionSeleccionada && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                📋 Dirección Seleccionada
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
                {opcionSeleccionada.description}
              </p>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-purple-200 dark:border-purple-700">
                <pre className="font-mono text-xs text-center text-gray-700 dark:text-gray-300">
                  {opcionSeleccionada.ejemplo}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Aplicar Renumeración
          </button>
        </div>
      </div>
    </div>
  );
}
