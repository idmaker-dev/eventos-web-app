import React, { useState } from "react";
import { Users, Check, X } from "lucide-react";
import axios from "axios";

/**
 * Componente para cambiar la capacidad de una mesa individual
 * Valida contra las cuotas definidas en distribucion_capacidades
 */
export default function SelectorCapacidadMesa({ 
  mesa, 
  eventoId, 
  onCapacidadCambiada,
  cuotas = [] // Array de { capacidad, cantidad, asignadas }
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
      setError(`La nueva capacidad (${selectedCapacidad}) no puede ser menor a los invitados actuales (${mesa.invitados})`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7071/api";

      const response = await axios.put(
        `${API_BASE_URL}/eventos/${eventoId}/mesas/${mesa.id}/capacidad`,
        { nueva_capacidad: selectedCapacidad },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Callback para actualizar el estado en el componente padre
      if (onCapacidadCambiada) {
        onCapacidadCambiada(response.data.data);
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

  // Calcular disponibilidad de cuotas
  const getCuotaInfo = (capacidad) => {
    const cuota = cuotas.find(c => c.capacidad === capacidad);
    if (!cuota) return { disponibles: "∞", color: "text-gray-500" };
    
    const disponibles = cuota.cantidad - cuota.asignadas;
    const color = disponibles > 0 ? "text-green-600" : "text-red-600";
    return { disponibles, color };
  };

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
          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-casal dark:bg-gray-700 dark:text-white"
        >
          {[...Array(12)].map((_, i) => {
            const capacidad = i + 1;
            const info = getCuotaInfo(capacidad);
            return (
              <option key={capacidad} value={capacidad}>
                {capacidad} asientos {cuotas.length > 0 ? `(${info.disponibles} disp.)` : ""}
              </option>
            );
          })}
        </select>

        <button
          onClick={handleCambiarCapacidad}
          disabled={loading}
          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition disabled:opacity-50"
          title="Confirmar"
        >
          <Check className="w-4 h-4" />
        </button>

        <button
          onClick={handleCancel}
          disabled={loading}
          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50"
          title="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Cambiando capacidad...
        </p>
      )}
    </div>
  );
}
