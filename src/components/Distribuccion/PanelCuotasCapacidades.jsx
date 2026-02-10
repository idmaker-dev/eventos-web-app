import React, { useState, useEffect } from "react";
import { Check, Edit2 } from "lucide-react";

/**
 * Panel simplificado para gestionar capacidad de mesas
 * Sistema: capacidad base + habilitar aumentos con límite
 */
export default function PanelCuotasCapacidades({ 
  elementos, 
  onConfiguracionActualizada,
  modoEdicion = true,
  configuracionInicial = null // 🆕 Recibir configuración guardada
}) {
  const [configuracion, setConfiguracion] = useState({
    capacidad_base: 10,
    permitir_aumento: false,
    capacidad_maxima: 12,
    mesas_pueden_aumentar: 0,
    mesas_aumentadas: 0
  });

  const [editando, setEditando] = useState(false);
  const [configEditada, setConfigEditada] = useState({...configuracion});

  // 🆕 Efecto para cargar configuración inicial guardada
  useEffect(() => {
    if (configuracionInicial) {
      console.log('📥 PanelCuotasCapacidades: Cargando configuración inicial:', configuracionInicial);
      setConfiguracion(configuracionInicial);
      setConfigEditada(configuracionInicial);
    }
  }, [configuracionInicial]);

  // Calcular estado actual basándose en las mesas existentes (solo si no hay configuración inicial)
  useEffect(() => {
    if (!configuracionInicial) {
      calcularEstadoActual();
    } else {
      // Actualizar solo el contador de mesas aumentadas
      actualizarContadorMesasAumentadas();
    }
  }, [elementos, configuracionInicial]);

  const calcularEstadoActual = () => {
    // Filtrar solo mesas (redondas y rectangulares)
    const mesas = elementos.filter(el => 
      el.type === "mesa" || el.type === "mesaRectangular"
    );

    if (mesas.length === 0) {
      return;
    }

    // Determinar capacidad base (la más común)
    const capacidades = mesas.map(m => m.capacidad || 10);
    const frecuencia = {};
    capacidades.forEach(cap => {
      frecuencia[cap] = (frecuencia[cap] || 0) + 1;
    });
    
    const capacidadBase = parseInt(
      Object.keys(frecuencia).reduce((a, b) => 
        frecuencia[a] > frecuencia[b] ? a : b
      )
    );

    // Contar cuántas mesas están por encima de la base
    const mesasAumentadas = mesas.filter(m => (m.capacidad || 10) > capacidadBase).length;
    
    // Determinar capacidad máxima
    const capacidadMaxima = Math.max(...capacidades);

    setConfiguracion({
      capacidad_base: capacidadBase,
      permitir_aumento: mesasAumentadas > 0,
      capacidad_maxima: capacidadMaxima,
      mesas_pueden_aumentar: mesasAumentadas, // Al menos las que ya están aumentadas
      mesas_aumentadas: mesasAumentadas
    });
  };

  // 🆕 Actualizar solo el contador de mesas aumentadas (cuando ya hay configuración guardada)
  const actualizarContadorMesasAumentadas = () => {
    const mesas = elementos.filter(el => 
      el.type === "mesa" || el.type === "mesaRectangular"
    );

    if (mesas.length === 0) {
      return;
    }

    // Contar cuántas mesas están por encima de la capacidad base guardada
    const mesasAumentadas = mesas.filter(m => 
      (m.capacidad || 10) > (configuracionInicial?.capacidad_base || configuracion.capacidad_base)
    ).length;

    setConfiguracion(prev => ({
      ...prev,
      mesas_aumentadas: mesasAumentadas
    }));
  };

  const iniciarEdicion = () => {
    setConfigEditada({...configuracion});
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setConfigEditada({...configuracion});
  };

  const guardarConfiguracion = () => {
    // Validar que capacidad máxima >= capacidad base
    if (configEditada.capacidad_maxima < configEditada.capacidad_base) {
      alert("La capacidad máxima debe ser mayor o igual a la capacidad base");
      return;
    }

    // Si no se permite aumento, ajustar valores
    if (!configEditada.permitir_aumento) {
      configEditada.mesas_pueden_aumentar = 0;
      configEditada.capacidad_maxima = configEditada.capacidad_base;
    }

    setConfiguracion(configEditada);
    setEditando(false);
    
    // Notificar al componente padre
    if (onConfiguracionActualizada) {
      onConfiguracionActualizada(configEditada);
    }
  };

  const totalMesas = elementos.filter(el => 
    el.type === "mesa" || el.type === "mesaRectangular"
  ).length;

  const disponiblesParaAumentar = configuracion.mesas_pueden_aumentar - configuracion.mesas_aumentadas;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📊 Capacidad de Mesas
        </h3>
        
        {modoEdicion && !editando && totalMesas > 0 && (
          <button
            onClick={iniciarEdicion}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      {totalMesas === 0 && !editando ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p className="text-xs">No hay mesas en el layout</p>
          <p className="text-xs mt-1">Agrega mesas para configurar capacidades</p>
        </div>
      ) : editando ? (
        // Modo edición
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Configura la capacidad base y si permites aumentar asientos en algunas mesas
            </p>
          </div>

          {/* Capacidad Base */}
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Capacidad Base (asientos por mesa)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={configEditada.capacidad_base}
              onChange={(e) => setConfigEditada({
                ...configEditada,
                capacidad_base: parseInt(e.target.value) || 10
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Todas las mesas empiezan con esta capacidad
            </p>
          </div>

          {/* Checkbox Permitir Aumento */}
          <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              id="permitir_aumento"
              checked={configEditada.permitir_aumento}
              onChange={(e) => setConfigEditada({
                ...configEditada,
                permitir_aumento: e.target.checked
              })}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <label 
                htmlFor="permitir_aumento"
                className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
              >
                Habilitar aumento de asientos
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Permite aumentar la capacidad en algunas mesas específicas
              </p>
            </div>
          </div>

          {/* Opciones de aumento (solo si está habilitado) */}
          {configEditada.permitir_aumento && (
            <div className="space-y-3 pl-7 border-l-2 border-blue-300 dark:border-blue-700">
              {/* Capacidad Máxima */}
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Capacidad Máxima (asientos por mesa)
                </label>
                <input
                  type="number"
                  min={configEditada.capacidad_base}
                  max="20"
                  value={configEditada.capacidad_maxima}
                  onChange={(e) => setConfigEditada({
                    ...configEditada,
                    capacidad_maxima: parseInt(e.target.value) || 12
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Máximo de asientos que puede tener una mesa
                </p>
              </div>

              {/* Límite de Mesas que pueden aumentar */}
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  Máximo de mesas que pueden aumentar
                </label>
                <input
                  type="number"
                  min={configuracion.mesas_aumentadas}
                  max={totalMesas}
                  value={configEditada.mesas_pueden_aumentar}
                  onChange={(e) => setConfigEditada({
                    ...configEditada,
                    mesas_pueden_aumentar: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  De {totalMesas} mesas totales, ¿cuántas podrán aumentarse?
                </p>
                {configuracion.mesas_aumentadas > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    ⚠️ Actualmente {configuracion.mesas_aumentadas} mesas ya están aumentadas
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={guardarConfiguracion}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition"
            >
              <Check className="w-4 h-4" />
              Guardar
            </button>
            <button
              onClick={cancelarEdicion}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        // Vista de solo lectura
        <div className="space-y-3">
          {/* Capacidad Base */}
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Capacidad base:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {configuracion.capacidad_base} asientos
              </span>
            </div>
          </div>

          {/* Total de Mesas */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Total de mesas:
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {totalMesas}
              </span>
            </div>
          </div>

          {/* Si están habilitados los aumentos */}
          {configuracion.permitir_aumento && (
            <>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Capacidad máxima:
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {configuracion.capacidad_maxima} asientos
                  </span>
                </div>
              </div>

              {/* Contador de Mesas Aumentadas */}
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Mesas aumentadas:
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {configuracion.mesas_aumentadas} / {configuracion.mesas_pueden_aumentar}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      disponiblesParaAumentar === 0 ? "bg-red-500" :
                      disponiblesParaAumentar <= 3 ? "bg-orange-500" :
                      "bg-green-500"
                    }`}
                    style={{ 
                      width: `${(configuracion.mesas_aumentadas / configuracion.mesas_pueden_aumentar) * 100}%` 
                    }}
                  />
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {disponiblesParaAumentar > 0 ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ✓ {disponiblesParaAumentar} mesas disponibles para aumentar
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      ⚠️ Límite alcanzado
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {!configuracion.permitir_aumento && (
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Aumentos de capacidad no habilitados
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
