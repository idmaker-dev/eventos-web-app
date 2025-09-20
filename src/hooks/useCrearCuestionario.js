import { useState } from "react";

export function useCrearCuestionario() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Crear estructura de cuestionario
  const crearEstructura = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:7071/api/estructuras/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Error al crear estructura");
      setResult(data.data);
      return data.data;
    } catch (err) {
      setError(err.message);
      setResult(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    result,
    crearEstructura,
  };
}
