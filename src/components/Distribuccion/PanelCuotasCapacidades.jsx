import React, { useState, useEffect } from "react";
import { Plus, X, RefreshCw, Edit2, Check } from "lucide-react";

/**
 * Panel para gestionar cuotas de capacidades de mesas
 * Muestra distribución actual y permite editarla
 */
export default function PanelCuotasCapacidades({ 
  elementos, 
  onCuotasActualizadas,
  modoEdicion = true 
}) {
  const [cuotas, setCuotas] = useState([]);
  const [editando, setEditando] = useState(false);
  const [cuotasEditadas, setCuotasEditadas] = useState([]);

  // Calcular cuotas actuales basándose en las mesas existentes
  useEffect(() => {
    calcularCuotasActuales();
  }, [elementos]);

  const calcularCuotasActuales = () => {
    // Filtrar solo mesas (redondas y rectangulares)
    const mesas = elementos.filter(el => 
      el.type === "mesa" || el.type === "mesaRectangular"
    );

    if (mesas.length === 0) {
      setCuotas([]);
      return;
    }

    // Agrupar por capacidad
    const agrupadas = mesas.reduce((acc, mesa) => {
      const cap = mesa.capacidad || 10;
      if (!acc[cap]) {
        acc[cap] = { capacidad: cap, cantidad: 0, asignadas: 0 };
      }
      acc[cap].cantidad++;
      acc[cap].asignadas++;
      return acc;
    }, {});

    // Convertir a array y ordenar por capacidad
    const cuotasCalculadas = Object.values(agrupadas)
      .sort((a, b) => a.capacidad - b.capacidad);

    setCuotas(cuotasCalculadas);
  };

  const iniciarEdicion = () => {
    setCuotasEditadas(JSON.parse(JSON.stringify(cuotas)));
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setCuotasEditadas([]);
  };

  const agregarCuota = () => {
    const nuevaCapacidad = cuotasEditadas.length > 0 
      ? Math.max(...cuotasEditadas.map(c => c.capacidad)) + 1 
      : 8;
    
    setCuotasEditadas([
      ...cuotasEditadas,
      { capacidad: nuevaCapacidad, cantidad: 0, asignadas: 0 }
    ]);
  };

  const eliminarCuota = (index) => {
    setCuotasEditadas(cuotasEditadas.filter((_, i) => i !== index));
  };

  const actualizarCuota = (index, campo, valor) => {
    const nuevasCuotas = [...cuotasEditadas];
    nuevasCuotas[index][campo] = parseInt(valor) || 0;
    setCuotasEditadas(nuevasCuotas);
  };

  const guardarCuotas = () => {
    // Validar que haya al menos una cuota
    if (cuotasEditadas.length === 0) {
      alert("Debe haber al menos una cuota de capacidad");
      return;
    }

    // Validar que no haya capacidades duplicadas
    const capacidades = cuotasEditadas.map(c => c.capacidad);
    const duplicadas = capacidades.filter((c, i) => capacidades.indexOf(c) !== i);
    if (duplicadas.length > 0) {
      alert(`Hay capacidades duplicadas: ${duplicadas.join(", ")}`);
      return;
    }

    setCuotas(cuotasEditadas);
    setEditando(false);
    
    // Notificar al componente padre
    if (onCuotasActualizadas) {
      onCuotasActualizadas(cuotasEditadas);
    }
  };

  const totalMesas = cuotas.reduce((sum, c) => sum + c.cantidad, 0);
  const totalMesasEditadas = cuotasEditadas.reduce((sum, c) => sum + c.cantidad, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📊 Distribución de Capacidades
        </h3>
        
        {modoEdicion && !editando && cuotas.length > 0 && (
          <button
            onClick={iniciarEdicion}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      {cuotas.length === 0 && !editando ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p className="text-xs">No hay mesas en el layout</p>
          <p className="text-xs mt-1">Agrega mesas para ver la distribución</p>
        </div>
      ) : editando ? (
        // Modo edición
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Define cuántas mesas de cada capacidad quieres en tu layout
            </p>
          </div>

          <div className="space-y-2">
            {cuotasEditadas.map((cuota, index) => (
              <div
                key={index}
                className="flex gap-2 items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Capacidad (asientos)
                  </label>
                  <select
                    value={cuota.capacidad}
                    onChange={(e) => actualizarCuota(index, 'capacidad', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} asientos
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                    Cantidad de mesas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cuota.cantidad}
                    onChange={(e) => actualizarCuota(index, 'cantidad', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <button
                  onClick={() => eliminarCuota(index)}
                  disabled={cuotasEditadas.length === 1}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-30 disabled:cursor-not-allowed mt-5"
                  title="Eliminar cuota"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={agregarCuota}
            className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar otra capacidad
          </button>

          <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Total de mesas:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {totalMesasEditadas}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={guardarCuotas}
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Guardar Cuotas
            </button>
            <button
              onClick={cancelarEdicion}
              className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        // Modo visualización
        <div className="space-y-2">
          {cuotas.map((cuota, index) => {
            const porcentaje = cuota.cantidad > 0 
              ? Math.round((cuota.asignadas / cuota.cantidad) * 100) 
              : 0;
            const disponibles = cuota.cantidad - cuota.asignadas;

            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {cuota.capacidad}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      asientos
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      disponibles === 0 ? "text-red-600" :
                      disponibles <= 3 ? "text-orange-600" :
                      "text-green-600"
                    }`}>
                      {cuota.asignadas} / {cuota.cantidad}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {disponibles} disp.
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      porcentaje === 100 ? "bg-red-500" :
                      porcentaje >= 80 ? "bg-orange-500" :
                      "bg-green-500"
                    }`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Total de mesas:
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {totalMesas}
              </span>
            </div>
          </div>

          <button
            onClick={calcularCuotasActuales}
            className="w-full py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded transition flex items-center justify-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Recalcular desde mesas actuales
          </button>
        </div>
      )}
    </div>
  );
}
