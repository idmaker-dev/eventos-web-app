import React, { useState } from "react";
import "../styles/pages/NuevoCuestionario.css";

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
    alert("Formulario enviado ✅");
  };

  return (
    <div className="preview-container">
      <div className="phone-frame">
        <div className="phone-screen">
          <header className="app-header">Planoría</header>

          <div className="form-header">
            <h3>Cuestionario de Registro</h3>
            <p>Instituto Villa Rica</p>
            <h4>Ceremonia de Graduación - Generación 2025</h4>
          </div>

          <div className="form-description">
            <p>
              ¡Felicidades por tu próxima graduación! Por favor completa este
              formulario con tus datos y confirma tu asistencia para que
              podamos apoyarte en la organización de este evento tan
              importante.
            </p>
            <p>
              <strong>Fecha:</strong> 25 de junio de 2025 <br />
              <strong>Lugar:</strong> Auditorio Central, Universidad Nacional
            </p>
          </div>

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
            <select
              name="boletos"
              value={formData.boletos}
              onChange={handleChange}
            >
              <option value="0">0 boletos</option>
              <option value="1">1 boleto</option>
              <option value="2">2 boletos</option>
              <option value="3">3 boletos</option>
              <option value="4">4 boletos</option>
            </select>

            <div className="restricciones">
              <h4>
                Restricciones alimenticias{" "}
                <span>(Especifica vegetarianos, veganos, alergias, etc.)</span>
              </h4>
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
    </div>
  );
}
