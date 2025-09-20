import React, { useState } from "react";
import "./NuevoCuestionario.css";

export default function NuevoCuestionario() {
  const [restricciones, setRestricciones] = useState({
    vegetariano: 0,
    vegano: 0,
  });

  // ✅ Ahora ya no sale en amarillo porque lo usamos en los inputs
  const handleRestriccionChange = (tipo, value) => {
    setRestricciones((prev) => ({
      ...prev,
      [tipo]: value,
    }));
  };

  return (
    <div className="nuevo-cuestionario">
      {/* Barra superior */}
      <div className="topbar">
        <button>Configurar respuestas</button>
        <button>Monitor de chats (6)</button>
        <button>Enlace cuestionario</button>
      </div>

      {/* Contenedor principal */}
      <div className="contenido">
        <div className="panel-blanco">
          <h2>Crear invitación de cuestionario</h2>

          {/* Restricciones alimenticias */}
          <div className="restricciones">
            <label>
              Vegetariano:
              <input
                type="number"
                min="0"
                value={restricciones.vegetariano}
                onChange={(e) =>
                  handleRestriccionChange("vegetariano", e.target.value)
                }
              />
            </label>

            <label>
              Vegano:
              <input
                type="number"
                min="0"
                value={restricciones.vegano}
                onChange={(e) =>
                  handleRestriccionChange("vegano", e.target.value)
                }
              />
            </label>
          </div>
        </div>

        {/* Simulación del celular */}
        <div className="mockup-celular">
          <div className="celular-pantalla">
            <div className="celular-header">Cuestionario</div>
            <div className="celular-body">
              <p>Vista previa de cómo verá el usuario su cuestionario.</p>
              <div className="celular-seccion">
                <strong>Restricciones alimenticias</strong>
                <p>Vegetariano: {restricciones.vegetariano}</p>
                <p>Vegano: {restricciones.vegano}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
