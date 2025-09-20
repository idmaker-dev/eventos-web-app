import React, { useState } from "react";
import "../styles/pages/NuevoCuestionario.css";

export default function NuevoCuestionario() {
  const [pregunta, setPregunta] = useState("");
  const [tipo, setTipo] = useState("texto");
  const [opciones, setOpciones] = useState([""]);
  const [restriccion, setRestriccion] = useState("");

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
    <div className="nuevo-cuestionario-wrapper">
      <div className="nuevo-cuestionario-card">
        <h2 className="titulo">📋 Crear invitación de cuestionario</h2>
        <p className="subtitulo">
          Completa los datos y envía el enlace de tu evento.
        </p>

        <form className="formulario" onSubmit={handleSubmit}>
          {/* Pregunta */}
          <div className="form-grupo">
            <label>Pregunta</label>
            <input
              type="text"
              placeholder="Escribe la pregunta aquí"
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
            />
          </div>

          {/* Tipo de respuesta */}
          <div className="form-grupo">
            <label>Tipo de respuesta</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="texto">Texto</option>
              <option value="multiple">Opción múltiple</option>
              <option value="numero">Número</option>
            </select>
          </div>

          {/* Opciones si es múltiple */}
          {tipo === "multiple" && (
            <div className="form-grupo">
              <label>Opciones</label>
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
                className="btn-secundario"
                onClick={handleAgregarOpcion}
              >
                ➕ Agregar opción
              </button>
            </div>
          )}

          {/* Restricción */}
          <div className="form-grupo">
            <label>Restricción</label>
            <input
              type="text"
              placeholder="Ej: máximo 200 caracteres"
              value={restriccion}
              onChange={(e) => handleRestriccionChange(tipo, e.target.value)}
            />
          </div>

          {/* Botones */}
          <div className="acciones">
            <button type="button" className="btn-secundario">
              ✏️ Editar
            </button>
            <button type="submit" className="btn-primario">
              💾 Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
