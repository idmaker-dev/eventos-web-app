import React, { useState } from "react";
import "./NuevoCuestionario.css";

export default function NuevoCuestionario() {
  const [formData, setFormData] = useState({
    nombre: "",
    carrera: "",
    escuela: "",
    boletos: 0,
    restricciones: {
      vegetariano: 0,
      vegano: 0,
      alergiaMariscos: 0,
      otros: "",
    },
    contactoEmergencia: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRestriccionChange = (tipo, value) => {
    setFormData({
      ...formData,
      restricciones: {
        ...formData.restricciones,
        [tipo]: value,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
  };

  return (
    <div className="cuestionario-container">
      <div className="form-wrapper">
        <h2 className="titulo-app">Planoría</h2>
        <h3 className="titulo-form">Cuestionario de Registro</h3>
        <p className="subtitulo">Instituto Villa Rica</p>
        <p className="descripcion">
          Ceremonia de Graduación - Generación 2025
        </p>
        <p className="detalle-evento">
          ¡Felicidades por tu próxima graduación! Por favor completa este
          formulario con tus datos y confirma tu asistencia para que podamos
          apoyarte en la organización de este evento tan importante.
        </p>
        <p className="fecha-evento">
          <strong>Fecha:</strong> 25 de junio de 2025 <br />
          <strong>Lugar:</strong> Auditorio Central, Universidad Nacional
        </p>

        <form className="formulario" onSubmit={handleSubmit}>
          <label>Nombre completo</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Tu respuesta"
          />

          <label>Carrera o estudios realizados</label>
          <input
            type="text"
            name="carrera"
            value={formData.carrera}
            onChange={handleChange}
            placeholder="Tu respuesta"
          />

          <label>Escuela o institución</label>
          <input
            type="text"
            name="escuela"
            value={formData.escuela}
            onChange={handleChange}
            placeholder="Tu respuesta"
          />

          <label>Cantidad de boletos requeridos</label>
          <input
            type="number"
            name="boletos"
            min="0"
            value={formData.boletos}
            onChange={handleChange}
          />

          <div className="restricciones">
            <h4>Restricciones alimenticias</h4>
            <div className="restriccion-item">
              <span>Vegetariano</span>
              <input
                type="number"
                min="0"
                value={formData.restricciones.vegetariano}
                onChange={(e) =>
                  handleRestriccionChange("vegetariano", e.target.value)
                }
              />
            </div>
            <div className="restriccion-item">
              <span>Vegano</span>
              <input
                type="number"
                min="0"
                value={formData.restricciones.vegano}
                onChange={(e) =>
                  handleRestriccionChange("vegano", e.target.value)
                }
              />
            </div>
            <div className="restriccion-item">
              <span>Alergia a mariscos</span>
              <input
                type="number"
                min="0"
                value={formData.restricciones.alergiaMariscos}
                onChange={(e) =>
                  handleRestriccionChange("alergiaMariscos", e.target.value)
                }
              />
            </div>
            <div className="restriccion-item">
              <span>Otros</span>
              <input
                type="text"
                value={formData.restricciones.otros}
                onChange={(e) =>
                  handleRestriccionChange("otros", e.target.value)
                }
                placeholder="Especifica"
              />
            </div>
          </div>

          <label>Contacto de emergencia</label>
          <input
            type="text"
            name="contactoEmergencia"
            value={formData.contactoEmergencia}
            onChange={handleChange}
            placeholder="Tu respuesta"
          />

          <button type="submit" className="btn-enviar">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
