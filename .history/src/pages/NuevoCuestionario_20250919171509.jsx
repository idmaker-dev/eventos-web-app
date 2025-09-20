import React, { useState } from "react";
import "./NuevoCuestionario.css";

export default function NuevoCuestionario() {
  const [pregunta, setPregunta] = useState("");
  const [tipo, setTipo] = useState("texto");
  const [opciones, setOpciones] = useState([""]);
  const [restriccion, setRestriccion] = useState("");

  // Manejar cambio en restricción
  const handleRestriccionChange = (tipo, value) => {
    setRestriccion(value);
  };

  const handleAgregarOpcion = () => {
    setOpciones([...opciones, ""]);
  };

  const handleOpcionChange = (index, value) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = value;
    setOpciones(nuevasOpciones);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      pregunta,
      tipo,
      opciones: tipo === "multiple" ? opciones : [],
      restriccion,
    });
  };

  return (
    <div className="nuevo-cuestionario-container">
      <h2 className="titulo">➕ Nuevo Cuestionario</h2>

      <form className="formulario" onSubmit={handleSubmit}>
        {/* Pregunta */}
        <div className="form-grupo">
          <label>Pregunta:</label>
          <input
            type="text"
            placeholder="Escribe la pregunta aquí"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
          />
        </div>

        {/* Tipo de respuesta */}
        <div className="form-grupo">
          <label>Tipo de respuesta:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="texto">Texto</option>
            <option value="multiple">Opción múltiple</option>
            <option value="numero">Número</option>
          </select>
        </div>

        {/* Opciones solo si es múltiple */}
        {tipo === "multiple" && (
          <div className="form-grupo">
            <label>Opciones:</label>
            {opciones.map((opcion, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Opción ${index + 1}`}
                value={opcion}
                onChange={(e) => handleOpcionChange(index, e.target.value)}
              />
            ))}
            <button
              type="button"
              className="btn-agregar"
              onClick={handleAgregarOpcion}
            >
              ➕ Agregar opción
            </button>
          </div>
        )}

        {/* Restricción */}
        <div className="form-grupo">
          <label>Restricción:</label>
          <input
            type="text"
            placeholder="Ej: máximo 200 caracteres"
            value={restriccion}
            onChange={(e) => handleRestriccionChange(tipo, e.target.value)}
          />
        </div>

        {/* Botón guardar */}
        <button type="submit" className="btn-guardar">
          💾 Guardar pregunta
        </button>
      </form>
    </div>
  );
}
