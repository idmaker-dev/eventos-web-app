import React, { useState } from "react";
import { Users, Check, X } from "lucide-react";
import httpService from "../../services/httpService";

/**
 * Componente para cambiar la capacidad de una mesa individual
 * Sistema simplificado: valida contra límite de mesas que pueden aumentar
 */
export default function SelectorCapacidadMesa({ 
  mesa, 
  eventoId, 
  onCapacidadCambiada,
  configuracion = null // { capacidad_base, permitir_aumento, capacidad_maxima, mesas_pueden_aumentar, mesas_aumentadas }
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCapacidad, setSelectedCapacidad] = useState(mesa.capacidad);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCambiarCapacidad = async () => {
    if (selectedCapacidad === mesa.capacidad) {
      setIsEditing(false);
      return;
    }

    // Validar que la nueva capacidad no exceda invitados actuales
    if (selectedCapacidad < mesa.invitados) {
      setError(`La nueva capacidad (${selectedCapacidad}) no puede ser menor a los graduados actuales (${mesa.invitados})`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await httpService.put(
        `/eventos/${eventoId}/mesas/${mesa.id}/capacidad`,
        { nueva_capacidad: selectedCapacidad }
      );

      console.log("✅ Response completa:", response);

      // Callback para actualizar el estado en el componente padre
      if (onCapacidadCambiada) {
        onCapacidadCambiada(response.data);
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Error al cambiar capacidad:", err);
      console.error("Response data:", err.response?.data);
      const errorMsg = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || "Error al cambiar capacidad";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedCapacidad(mesa.capacidad);
    setIsEditing(false);
    setError(null);
  };

  // Generar opciones de capacidad basadas en configuración
  const getOpcionesCapacidad = () => {
    if (!configuracion) {
      // Si no hay configuración, opciones por defecto 1-12
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }

    const { capacidad_base, permitir_aumento, capacidad_maxima } = configuracion;

    if (!permitir_aumento) {
      // Solo permitir capacidad base
      return [capacidad_base];
    }

    // Generar rango desde base hasta máxima
    const opciones = [];
    for (let i = capacidad_base; i <= capacidad_maxima; i++) {
      opciones.push(i);
    }
    return opciones;
  };

  // Calcular información de disponibilidad
  const getInfoDisponibilidad = () => {
    if (!configuracion || !configuracion.permitir_aumento) {
      return { texto: "", mostrar: false };
    }

    const { capacidad_base, mesas_pueden_aumentar, mesas_aumentadas } = configuracion;
    const disponibles = mesas_pueden_aumentar - mesas_aumentadas;

    // Si la mesa actual está por encima de la base, ya cuenta como aumentada
    const mesaEstaAumentada = mesa.capacidad > capacidad_base;
    // Si la selección nueva está por encima de la base, contaría como aumentada
    const nuevaEstaraAumentada = selectedCapacidad > capacidad_base;

    // Si intentamos aumentar una mesa que no estaba aumentada
    if (!mesaEstaAumentada && nuevaEstaraAumentada) {
      if (disponibles <= 0) {
        return {
          texto: `⚠️ No hay cupos disponibles (${mesas_aumentadas}/${mesas_pueden_aumentar} usados)`,
          mostrar: true,
          color: "text-red-600"
        };
      }
      return {
        texto: `✓ ${disponibles} cupos disponibles`,
        mostrar: true,
        color: "text-green-600"
      };
    }

    // Si estamos devolviendo una mesa aumentada a la base
    if (mesaEstaAumentada && !nuevaEstaraAumentada) {
      return {
        texto: `✓ Liberará 1 cupo (${disponibles + 1} disponibles)`,
        mostrar: true,
        color: "text-blue-600"
      };
    }

    return { texto: "", mostrar: false };
  };

  const opciones = getOpcionesCapacidad();
  const infoDisponibilidad = getInfoDisponibilidad();

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
        title="Cambiar capacidad"
      >
        <Users className="w-3 h-3" />
        <span className="font-semibold">{mesa.capacidad}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <select
          value={selectedCapacidad}
          onChange={(e) => {
            setSelectedCapacidad(parseInt(e.target.value));
            setError(null);
          }}
          disabled={loading}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
        >
          {opciones.map(cap => (
            <option key={cap} value={cap}>
              {cap} asientos
            </option>
          ))}
        </select>

        <button
          onClick={handleCambiarCapacidad}
          disabled={loading || selectedCapacidad === mesa.capacidad}
          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Confirmar"
        >
          <Check className="w-4 h-4" />
        </button>

        <button
          onClick={handleCancel}
          disabled={loading}
          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
          title="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Información de disponibilidad */}
      {infoDisponibilidad.mostrar && (
        <div className={`text-xs ${infoDisponibilidad.color} font-medium`}>
          {infoDisponibilidad.texto}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="text-xs text-red-600 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          Guardando...
        </div>
      )}
    </div>
  );
}
