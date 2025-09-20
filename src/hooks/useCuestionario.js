import { useState } from "react";

// Genera el estado inicial dinámicamente según los campos
function getInitialState(fields) {
  const state = {};
  fields.forEach((f) => {
    if (f.inputType === "checkbox" && f.type === "array") {
      state[f.name] = [];
    } else if (f.inputType === "checkbox" && f.type === "boolean") {
      state[f.name] = false;
    } else {
      state[f.name] = "";
    }
  });
  return state;
}

export function useCuestionario(fields) {
  const [form, setForm] = useState(() => getInitialState(fields));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Maneja cambios para cualquier tipo de campo
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setForm((prev) => {
      // Checkbox múltiple (array)
      const fieldDef = fields.find((f) => f.name === name);
      if (fieldDef?.inputType === "checkbox" && fieldDef?.type === "array") {
        let arr = Array.isArray(prev[name]) ? [...prev[name]] : [];
        if (checked) {
          if (!arr.includes(value)) arr.push(value);
        } else {
          arr = arr.filter((v) => v !== value);
        }
        return { ...prev, [name]: arr };
      }
      // Checkbox simple (booleano)
      if (fieldDef?.inputType === "checkbox" && fieldDef?.type === "boolean") {
        return { ...prev, [name]: checked };
      }
      // Radio
      if (fieldDef?.inputType === "radio") {
        return { ...prev, [name]: value };
      }
      // Otros
      return { ...prev, [name]: value };
    });
  };

  const resetForm = () => setForm(getInitialState(fields));

  // Obtener estructura de cuestionario por ID
  const fetchCuestionario = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:7071/api/cuestionarios/${id}`);
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Error al obtener cuestionario");
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

  // Crear nuevo cuestionario
  const crearCuestionario = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:7071/api/cuestionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Error al crear cuestionario");
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

  // Enviar registro de respuestas
  const submitRegistro = async (eventoId, cuestionarioId, respuestas) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:7071/api/registros/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventoId,
          idEstructura: cuestionarioId,
          data: respuestas,
        }),
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Error al enviar registro");
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

  // Permitir exponer setters para control externo (como workaround)
  return {
    form,
    setForm,
    handleChange,
    resetForm,
    loading,
    error,
    result,
    fetchCuestionario,
    crearCuestionario,
    submitRegistro,
    setResult,
    setLoading,
  };
}
