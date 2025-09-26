import React, { useState } from "react";
import "../styles/pages/Finanzas.css"; // En esta parte ahora se importan los estilos

export default function Finanzas() {
  const [text, setText] = useState("");
  const [updated, setUpdated] = useState("");

  const textOnChange = (event) => {
    setText(event.target.value);
  };

  const buttonOnClick = () => {
    setUpdated(text);
  };

  return (
    <div className="container">
      <h2>Actualizador de Texto</h2>
      <input
        type="text"
        value={text}
        onChange={textOnChange}
        placeholder="Escribe algo..."
        className="input-text"
      />
      <button onClick={buttonOnClick} className="btn-update">
        Actualizar
      </button>
      <div className="text-display">
        <p>
          <strong>Texto de Prueba:</strong> {text}
        </p>
        <p>
          <strong>Texto Actualizado:</strong> {updated}
        </p>
      </div>
    </div>
  );
}

