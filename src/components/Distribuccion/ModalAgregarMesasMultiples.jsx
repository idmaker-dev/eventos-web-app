import React, { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

export default function ModalAgregarMesasMultiples({ isOpen, onClose, onConfirm }) {
  const [cantidadMesas, setCantidadMesas] = useState(10);
  const [capacidadPorMesa, setCapacidadPorMesa] = useState(10);
  const [tipoMesa, setTipoMesa] = useState("mesa"); // "mesa" (redonda) o "mesaRectangular"
  const [distribucion, setDistribucion] = useState("automatica"); // "automatica" o "manual"
  const [direccionNumeracion, setDireccionNumeracion] = useState("horizontal-derecha-abajo");
  const [numeroVuelta, setNumeroVuelta] = useState(null); // Número de mesa donde se hace la vuelta
  
  // 🆕 Estado para configuración simplificada de capacidades
  const [usarConfiguracionCapacidades, setUsarConfiguracionCapacidades] = useState(false);
  const [capacidadBase, setCapacidadBase] = useState(10);
  const [permitirAumento, setPermitirAumento] = useState(false);
  const [capacidadMaxima, setCapacidadMaxima] = useState(12);
  const [mesasPuedenAumentar, setMesasPuedenAumentar] = useState(0);
  
  // Opciones de dirección:
  // horizontal-derecha-abajo: Izq→Der, luego siguiente fila (como leer)
  // horizontal-izquierda-abajo: Der→Izq, luego siguiente fila
  // horizontal-derecha-arriba: Izq→Der desde abajo hacia arriba
  // horizontal-izquierda-arriba: Der→Izq desde abajo hacia arriba
  // vertical-abajo-derecha: Arriba→Abajo, luego siguiente columna
  // vertical-arriba-derecha: Abajo→Arriba, luego siguiente columna
  // vertical-abajo-izquierda: Arriba→Abajo desde derecha hacia izquierda
  // vertical-arriba-izquierda: Abajo→Arriba desde derecha hacia izquierda
  // zigzag-horizontal: Izq→Der en fila 1, Der→Izq en fila 2, alternando (empezando arriba)
  // zigzag-horizontal-arriba: Izq→Der en última fila, Der→Izq en penúltima, alternando (empezando abajo)
  // zigzag-vertical: Arriba→Abajo en col 1, Abajo→Arriba en col 2, alternando

  if (!isOpen) return null;

  const handleConfirmar = () => {
    // Validar límite de mesas que pueden aumentar
    if (usarConfiguracionCapacidades && permitirAumento) {
      if (mesasPuedenAumentar > cantidadMesas) {
        alert(`El límite de mesas que pueden aumentar (${mesasPuedenAumentar}) no puede ser mayor al total de mesas (${cantidadMesas})`);
        return;
      }
      if (capacidadMaxima < capacidadBase) {
        alert(`La capacidad máxima (${capacidadMaxima}) no puede ser menor a la capacidad base (${capacidadBase})`);
        return;
      }
    }

    const config = {
      cantidad: cantidadMesas,
      capacidad: capacidadBase, // Usar capacidad base
      tipo: tipoMesa,
      distribucion: distribucion,
      direccionNumeracion: direccionNumeracion,
      numeroVuelta: numeroVuelta,
    };

    // 🆕 Agregar configuración simplificada de capacidades si está habilitada
    if (usarConfiguracionCapacidades) {
      config.distribucion_capacidades = {
        capacidad_base: capacidadBase,
        permitir_aumento: permitirAumento,
        capacidad_maxima: permitirAumento ? capacidadMaxima : capacidadBase,
        mesas_pueden_aumentar: permitirAumento ? mesasPuedenAumentar : 0,
        mesas_aumentadas: 0 // Inicialmente ninguna está aumentada
      };
    }

    onConfirm(config);
    onClose();
  };

  const incrementarMesas = () => {
    if (cantidadMesas < 500) setCantidadMesas(cantidadMesas + 1);
  };

  const decrementarMesas = () => {
    if (cantidadMesas > 1) setCantidadMesas(cantidadMesas - 1);
  };

  const incrementarCapacidadBase = () => {
    if (capacidadBase < 20) {
      setCapacidadBase(capacidadBase + 1);
      // Ajustar capacidad máxima si es necesaria
      if (permitirAumento && capacidadMaxima < capacidadBase + 1) {
        setCapacidadMaxima(capacidadBase + 1);
      }
    }
  };

  const decrementarCapacidadBase = () => {
    if (capacidadBase > 6) {
      setCapacidadBase(capacidadBase - 1);
    }
  };

  const incrementarCapacidad = () => {
    if (capacidadPorMesa < 20) setCapacidadPorMesa(capacidadPorMesa + 1);
  };

  const decrementarCapacidad = () => {
    if (capacidadPorMesa > 6) setCapacidadPorMesa(capacidadPorMesa - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Agregar Mesas Múltiples
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-5">
          {/* Cantidad de Mesas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Cantidad de Mesas
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={decrementarMesas}
                  className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                  disabled={cantidadMesas <= 1}
                >
                  <Minus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <div className="w-32 text-center">
                  <input
                    type="number"
                    value={cantidadMesas}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setCantidadMesas(Math.max(1, Math.min(500, val)));
                    }}
                    className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-casal focus:border-transparent dark:bg-gray-700 dark:text-white"
                    min="1"
                    max="500"
                  />
                </div>
                <button
                  onClick={incrementarMesas}
                  className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                  disabled={cantidadMesas >= 500}
                >
                  <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
              
              {/* Botones de incremento rápido */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCantidadMesas(Math.max(1, cantidadMesas - 10))}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                  disabled={cantidadMesas <= 1}
                >
                  -10
                </button>
                <button
                  onClick={() => setCantidadMesas(Math.min(500, cantidadMesas + 10))}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                  disabled={cantidadMesas >= 500}
                >
                  +10
                </button>
                <button
                  onClick={() => setCantidadMesas(Math.min(500, cantidadMesas + 50))}
                  className="px-3 py-1 text-xs bg-casal/20 dark:bg-casal/30 hover:bg-casal/30 dark:hover:bg-casal/40 text-casal dark:text-white rounded transition font-semibold"
                  disabled={cantidadMesas >= 500}
                >
                  +50
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Máximo 500 mesas por lote
            </p>
          </div>

          {/* Capacidad por Mesa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Capacidad por Mesa (asientos)
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={decrementarCapacidad}
                className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                disabled={capacidadPorMesa <= 6}
              >
                <Minus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="w-24 text-center">
                <input
                  type="number"
                  value={capacidadPorMesa}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 6;
                    setCapacidadPorMesa(Math.max(6, Math.min(12, val)));
                  }}
                  className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-casal focus:border-transparent dark:bg-gray-700 dark:text-white"
                  min="6"
                  max="12"
                />
              </div>
              <button
                onClick={incrementarCapacidad}
                className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                disabled={capacidadPorMesa >= 12}
              >
                <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Rango: 6 a 12 asientos
            </p>
          </div>

          {/* 🆕 Distribución Avanzada de Capacidades */}
          {/* Configuración de Capacidades */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="usarConfiguracion"
                checked={usarConfiguracionCapacidades}
                onChange={(e) => {
                  setUsarConfiguracionCapacidades(e.target.checked);
                  if (e.target.checked) {
                    // Inicializar con valores sensatos
                    setCapacidadBase(10);
                    setPermitirAumento(false);
                    setCapacidadMaxima(12);
                    setMesasPuedenAumentar(0);
                  }
                }}
                className="mt-1 w-4 h-4 text-casal border-gray-300 rounded focus:ring-casal"
              />
              <div className="flex-1">
                <label
                  htmlFor="usarConfiguracion"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Configurar Capacidad de Mesas
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Define la capacidad base y si permites aumentar asientos en algunas mesas
                </p>
              </div>
            </div>

            {usarConfiguracionCapacidades && (
              <div className="space-y-4 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                {/* Capacidad Base */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Capacidad Base (asientos por mesa)
                  </label>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={decrementarCapacidadBase}
                      className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-gray-300 dark:border-gray-600"
                      disabled={capacidadBase <= 6}
                    >
                      <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      value={capacidadBase}
                      onChange={(e) => setCapacidadBase(Math.max(6, Math.min(20, parseInt(e.target.value) || 6)))}
                      className="w-20 text-center text-lg font-bold px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-casal dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={incrementarCapacidadBase}
                      className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition border border-gray-300 dark:border-gray-600"
                      disabled={capacidadBase >= 20}
                    >
                      <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">
                    Todas las mesas empezarán con esta capacidad
                  </p>
                </div>

                {/* Habilitar Aumentos */}
                <div className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input
                    type="checkbox"
                    id="permitirAumento"
                    checked={permitirAumento}
                    onChange={(e) => setPermitirAumento(e.target.checked)}
                    className="mt-1 w-4 h-4 text-casal border-gray-300 rounded focus:ring-casal"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="permitirAumento"
                      className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                    >
                      Habilitar aumento de asientos
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Permite aumentar la capacidad en algunas mesas específicas
                    </p>
                  </div>
                </div>

                {/* Opciones de Aumento */}
                {permitirAumento && (
                  <div className="space-y-3 pl-4 border-l-2 border-casal">
                    {/* Capacidad Máxima */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Capacidad Máxima (asientos por mesa)
                      </label>
                      <input
                        type="number"
                        min={capacidadBase}
                        max="20"
                        value={capacidadMaxima}
                        onChange={(e) => setCapacidadMaxima(Math.max(capacidadBase, Math.min(20, parseInt(e.target.value) || capacidadBase)))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-casal dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Máximo de asientos que puede tener una mesa
                      </p>
                    </div>

                    {/* Límite de Mesas */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Máximo de mesas que pueden aumentar
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={cantidadMesas}
                        value={mesasPuedenAumentar}
                        onChange={(e) => setMesasPuedenAumentar(Math.max(0, Math.min(cantidadMesas, parseInt(e.target.value) || 0)))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-casal dark:bg-gray-700 dark:text-white"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        De {cantidadMesas} mesas totales, ¿cuántas podrán aumentarse?
                      </p>
                    </div>

                    {/* Resumen */}
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Resumen:</strong> {cantidadMesas} mesas de {capacidadBase} asientos.
                        {mesasPuedenAumentar > 0 && ` Hasta ${mesasPuedenAumentar} podrán aumentarse a ${capacidadMaxima} asientos.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tipo de Mesa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Mesa
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTipoMesa("mesa")}
                className={`p-4 border-2 rounded-lg transition ${
                  tipoMesa === "mesa"
                    ? "border-casal bg-casal/10 dark:bg-casal/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full border-4 border-current"></div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Redonda
                  </span>
                </div>
              </button>
              <button
                onClick={() => setTipoMesa("mesaRectangular")}
                className={`p-4 border-2 rounded-lg transition ${
                  tipoMesa === "mesaRectangular"
                    ? "border-casal bg-casal/10 dark:bg-casal/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-8 rounded border-4 border-current"></div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Rectangular
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Distribución */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Distribución
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setDistribucion("automatica")}
                className={`w-full p-3 border-2 rounded-lg text-left transition ${
                  distribucion === "automatica"
                    ? "border-casal bg-casal/10 dark:bg-casal/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  Automática
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Las mesas se distribuirán uniformemente en el espacio disponible
                </div>
              </button>
              <button
                onClick={() => setDistribucion("manual")}
                className={`w-full p-3 border-2 rounded-lg text-left transition ${
                  distribucion === "manual"
                    ? "border-casal bg-casal/10 dark:bg-casal/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  Manual
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Las mesas se agregarán en posiciones aleatorias para ajuste manual
                </div>
              </button>
            </div>
          </div>

          {/* Dirección de Numeración (solo para distribución automática) */}
          {distribucion === "automatica" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Dirección de Numeración
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDireccionNumeracion("horizontal-derecha-abajo")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "horizontal-derecha-abajo"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">→↓</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Horizontal Izq→Der
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        1→2→3, 4→5→6
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDireccionNumeracion("horizontal-izquierda-abajo")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "horizontal-izquierda-abajo"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">←↓</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Horizontal Der→Izq
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        3→2→1, 6→5→4
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDireccionNumeracion("vertical-abajo-derecha")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "vertical-abajo-derecha"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">↓→</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Vertical Arriba→Abajo
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        1↓2↓3, 4↓5↓6
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDireccionNumeracion("vertical-arriba-derecha")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "vertical-arriba-derecha"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">↑→</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Vertical Abajo→Arriba
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        3↑2↑1, 6↑5↑4
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDireccionNumeracion("zigzag-horizontal")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "zigzag-horizontal"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">⇄↓</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Zigzag Horizontal ↓
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        1→2→3, 6←5←4 (arriba)
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDireccionNumeracion("zigzag-horizontal-arriba")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "zigzag-horizontal-arriba"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">⇄↑</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Zigzag Horizontal ↑
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        4→5→6, 3←2←1 (abajo)
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDireccionNumeracion("zigzag-vertical")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "zigzag-vertical"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">⇵</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Zigzag Vertical
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        1↓2↓3, 6↑5↑4
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDireccionNumeracion("horizontal-derecha-arriba")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "horizontal-derecha-arriba"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">→↑</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Horizontal Izq→Der ↑
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        4→5→6, 1→2→3
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDireccionNumeracion("horizontal-izquierda-arriba")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "horizontal-izquierda-arriba"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">←↑</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Horizontal Der→Izq ↑
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        6→5→4, 3→2→1
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDireccionNumeracion("vertical-abajo-izquierda")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "vertical-abajo-izquierda"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">↓←</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Vertical Arriba→Abajo ←
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        4↓5↓6, 1↓2↓3
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDireccionNumeracion("vertical-arriba-izquierda")}
                  className={`p-2.5 border-2 rounded-lg text-left transition ${
                    direccionNumeracion === "vertical-arriba-izquierda"
                      ? "border-casal bg-casal/10 dark:bg-casal/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">↑←</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs leading-tight">
                        Vertical Abajo→Arriba ←
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 leading-tight">
                        6↑5↑4, 3↑2↑1
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Campo para número de vuelta (solo para distribución automática) */}
          {distribucion === "automatica" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Número de Mesa para la Vuelta (Opcional)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Indica en qué número de mesa se hará el cambio de dirección. Deja vacío para numeración continua.
              </p>
              <input
                type="number"
                min="1"
                max={cantidadMesas - 1}
                value={numeroVuelta || ""}
                onChange={(e) => setNumeroVuelta(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Ej: 20"
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:border-casal focus:outline-none transition"
              />
              {numeroVuelta && numeroVuelta >= cantidadMesas && (
                <p className="text-xs text-red-500 mt-1">
                  El número de vuelta debe ser menor que la cantidad total de mesas ({cantidadMesas})
                </p>
              )}
            </div>
          )}

          {/* Resumen */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Resumen:</strong> Se agregarán {cantidadMesas} mesa
              {cantidadMesas > 1 ? "s" : ""}{" "}
              {tipoMesa === "mesa" ? "redondas" : "rectangulares"} con capacidad de{" "}
              {capacidadPorMesa} asientos cada una.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Total de asientos: {cantidadMesas * capacidadPorMesa}
            </p>
            {distribucion === "automatica" && (
              <>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Numeración: {
                    direccionNumeracion === "horizontal-derecha-abajo" ? "Horizontal Izq→Der ↓" :
                    direccionNumeracion === "horizontal-izquierda-abajo" ? "Horizontal Der→Izq ↓" :
                    direccionNumeracion === "horizontal-derecha-arriba" ? "Horizontal Izq→Der ↑" :
                    direccionNumeracion === "horizontal-izquierda-arriba" ? "Horizontal Der→Izq ↑" :
                    direccionNumeracion === "vertical-abajo-derecha" ? "Vertical Arriba→Abajo →" :
                    direccionNumeracion === "vertical-arriba-derecha" ? "Vertical Abajo→Arriba →" :
                    direccionNumeracion === "vertical-abajo-izquierda" ? "Vertical Arriba→Abajo ←" :
                    direccionNumeracion === "vertical-arriba-izquierda" ? "Vertical Abajo→Arriba ←" :
                    direccionNumeracion === "zigzag-horizontal" ? "Zigzag Horizontal ↓" :
                    direccionNumeracion === "zigzag-horizontal-arriba" ? "Zigzag Horizontal ↑" :
                    "Zigzag Vertical"
                  }
                </p>
                {numeroVuelta && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Cambio de dirección en la mesa: {numeroVuelta}
                  </p>
                )}
              </>
            )}
          </div>
          </div>
        </div>

        {/* Footer con Botones */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            className="px-6 py-2 bg-casal hover:bg-casal/80 text-white font-semibold rounded-lg transition shadow-md"
          >
            Agregar Mesas
          </button>
        </div>
      </div>
    </div>
  );
}
